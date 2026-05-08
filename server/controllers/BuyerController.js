const userModel = require('../models/usersModel');


exports.getAllBuyers = async(req,res)=>{
    try{
        const buyers = await userModel
            .find({type:'buyerAccount'})
            .select('email username type isActive shippingAddress flagCount');

        return res.status(200).json({success:true, result:buyers});
    }catch(err){
        return res.status(500).json({success:false, message:err.message});
    }
}

exports.getProfile = (req,res)=>{

}

exports.getPurchaseHistroy = (req,res)=>{

}

exports.flagSeller = (req,res)=>{

}
