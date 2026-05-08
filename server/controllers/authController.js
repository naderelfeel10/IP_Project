const jwt = require("jsonwebtoken")
const {signupSchema} = require('../middlewares/validator');

const {doHash,doPassValidation} = require("../utils/hashing");

const userModel = require('../models/usersModel');



exports.createAccount = async (req,res)=>{

	const email = req.body.email;
	const password = req.body.password;
	const username = req.body.username;
	const type = req.body.type;

    console.log(req.body)

	const {error,value} = signupSchema.validate({email,password});

	if(error){
		return res.status(401).json({success:false,
			 message:"error in validating signing up",error:error.details[0].message});
	}

	const existingUser = await userModel.findOne({email});

	if(existingUser){
		return res.status(401).json({success:false, message:"user already exists"});
	}

	else{

		const hashedPassword = await doHash(password,12);
		console.log(password);
		console.log(hashedPassword)

		const newUser= new userModel({
			email:email,
			password:hashedPassword,
            username:username,
			type:type
		})

		const result = await newUser.save();
		console.log(newUser)

		return res.status(200).json({succuss:true,message:"done signing up"})
	 }


}

exports.signin = async (req,res)=>{
	console.log(req.body);

	const {email,password} = req.body;
    
	const existingUser = await userModel.findOne({email}).select("+password");
     if(existingUser){

		const result = await doPassValidation(password,existingUser.password)
		console.log(result)

        if(result){
                const token = jwt.sign({
				userId :existingUser._id,
				email:existingUser.email,
				username:existingUser.username,
				type:existingUser.type,
				
				
			},"elfeel",
			{
				expiresIn:"80h"
			}
		);

		console.log(token)

		return res.cookie("Authorization", "Bearer " + token, {
			expires: new Date(Date.now() + 80 * 3600000),
			httpOnly: true,
			secure: false,
			sameSite: "lax"
		  }).json({
			success: true,
			token,
			message: "signed in successfully",
		  });
		  			
		}else{
			return res.status(401).json({message:"username or password is not correct"})
		}

	 }else{
     	return res.status(401).json({message:"user is not found"})
	 }
	 
	
}

exports.activateAccount = async (req, res)=>{

}
exports.changePassword = async (req, res)=>{

}
exports.updateEmail = async (req, res)=>{

}
exports.deleteAccount = async (req, res)=>{

}
