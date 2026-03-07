const jwt = require("jsonwebtoken")
const {signupSchema} = require('../middlewares/validator');
const userModel = require('../models/usersModel');
const {doHash,doPassValidation} = require("../utils/hashing");




exports.signup = async (req,res)=>{
	const {email,password,username} = req.body;
     
     console.log(req.body)

		const {error,value} = signupSchema.validate({email,password});

		if(error){
		return res.status(401).json({success:false, message:"error in validating signing up",error:error.details[0].message});
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
            username:username

		})

		const result = await newUser.save();
		console.log(newUser)

		return res.status(200).json({succuss:true,message:"done signing up"})
	 }


}
exports.signup_get = (req,res)=>{
    res.send("singup get");
}


exports.signin = async (req,res)=>{
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
				expiresIn:"8h"
			}
		);
		console.log(token)

		return res.cookie("Authorization", "Bearer " + token, {
			expires: new Date(Date.now() + 8 * 3600000),
			httpOnly: true,
			secure: true
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


exports.signin_get = (req,res)=>{
     res.send('signin page')
}
