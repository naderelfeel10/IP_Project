
const userModel = require('../models/usersModel');


exports.getAllSellers = async(req,res)=>{
    try{
        const sellers = await userModel
            .find({type:'sellerAccount'})
            .select('email username type isActive shippingAddress flagCount');

        return res.status(200).json({success:true, result:sellers});
    }catch(err){
        return res.status(500).json({success:false, message:err.message});
    }
}

exports.getSellerStore = (req,res)=>{

}

exports.getProfile  = (req,res)=>{

}

exports.flagBuyer = (req,res)=>{

}
exports.changeProductStatus = (req,res)=>{

}
