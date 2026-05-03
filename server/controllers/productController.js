const jwt = require("jsonwebtoken")
const {signupSchema} = require('../middlewares/validator');

const {doHash,doPassValidation} = require("../utils/hashing");

const productModel = require('../models/productModel');
const userModel = require('../models/usersModel');



/*
const ProductSchema = mongoose.Schema({
    sellerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required : true
    },
    name:{
        type:String,
        required : true
    },
    description:{
        type:String
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        enum:['PC','Electronics','Health','Games','Tools']
    },
    deliveryTimeEstimate: { type: String, required: true } 
},{timestamps:true});
*/

exports.addProduct = async(req, res)=>{
    
    try{
        const existingUser = await userModel.findOne({_id: req.userInfo.userId});
        console.log("user : ",existingUser)
        console.log("username : ",existingUser.username)

        const sellerId = req.userInfo.userId;

        const{ name, description, price, category, deliveryTimeEstimate} = req.body;
        console.log(req.body)

        if(req.userInfo.type != "sellerAccount"){
            return res.status(401).json({success:false, message:"buyer can't add products"});
        }

        if(!name || !description ||!price || !category || !deliveryTimeEstimate){
            return res.status(401).json({success:false, message:"some fields are empty"});
        }

        if(price <=0)  return res.status(401).json({success:false, message:"price should be greater than 0"});

        const categoires =  ['PC','Electronics','Health','Games','Tools']

        if(!categoires.includes(category)){
            return res.status(401).json({success:false, message:"invalid cat type"});
        }

        await productModel.insertOne({sellerId:sellerId, name:name, description:description, price:price, category:category, deliveryTimeEstimate:deliveryTimeEstimate});



        return res.status(201).json({success:true, message:"new product is added"});



    }catch(err){
            return res.status(501).json({success:false, message:`server error${err}`});
    }


}

exports.removeProduct = async(req, res)=>{

    try{
        const existingUser = await userModel.findOne({_id: req.userInfo.userId});
        console.log("user : ",existingUser)
        console.log("username : ",existingUser.username)
        

        const sellerId = req.userInfo.userId;
        const product_id = req.params.id;

        //validate if seller owns this prodct :
        const Product =  await productModel.findOne({_id:product_id});

        if(Product.sellerId != sellerId){
            return res.status(401).json({success:false, message:"you are not the owner of this product"});
        }
        if(req.userInfo.type != "sellerAccount"){
            return res.status(401).json({success:false, message:"buyer can't remove products"});
        }


        await productModel.deleteOne({_id:product_id});
        return res.status(201).json({success:true, message:"this product is deleted"});


    }catch(err){
            return res.status(501).json({success:false, message:`server error${err}`});
    }


}

exports.updateProduct = async(req, res)=>{

    try{
        const existingUser = await userModel.findOne({_id: req.userInfo.userId});
        console.log("user : ",existingUser)
        console.log("username : ",existingUser.username)
        

        const sellerId = req.userInfo.userId;
        const product_id = req.params.id;

        //validate if seller owns this prodct :
        const Product =  await productModel.findOne({_id:product_id});

        if(Product.sellerId != sellerId){
            return res.status(401).json({success:false, message:"you are not the owner of this product"});
        }
        if(req.userInfo.type != "sellerAccount"){
            return res.status(401).json({success:false, message:"buyer can't remove products"});
        }

        const{ name, description, price, category, deliveryTimeEstimate} = req.body;
        console.log(name, description, price, category, deliveryTimeEstimate)

        updateData = {}
        const fields = ['name', 'description', 'price', 'category', 'deliveryTimeEstimate'];
        
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const result = await productModel.updateOne(
            { _id: product_id },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "product not found" });
        }

        res.status(200).json({ message: "Update successful", updateData });



    }catch(err){
            return res.status(501).json({success:false, message:`server error${err}`});
    }

}

exports.getProduct = async(req, res)=>{
    try{
    // fetch the prodct
    const product_id = req.params.id;
    const Product =  await productModel.findOne({_id:product_id});
    if(Product){
        res.status(200).json({success:true,result:Product})
    }

    }catch(err){
            return res.status(501).json({success:false, message:`server error${err}`});
    }


}


exports.browseCatalog = async(req, res)=>{
    try{
        const products_catalog = await productModel.find().select('name price category');
        res.status(200).json({success:true, result:products_catalog})
    }catch(err){
            return res.status(501).json({success:false, message:`server error${err}`});
    }

}

exports.searchProduct = (req, res)=>{

}


exports.changeProductStatus = (req, res)=>{

}


exports.getMyProducts = async(req, res)=>{

    try{
    const existingUser = await userModel.findOne({_id: req.userInfo.userId});
    const sellerId = req.userInfo.userId;

    if(req.userInfo.type != "sellerAccount"){
        return res.status(401).json({success:false, message:"you are not a seller"});
    }
    const prodcuts = await productModel.find({sellerId:sellerId});
    res.status(200).json({success:true, result:prodcuts});

    }catch(err){
            return res.status(501).json({success:false, message:`server error${err}`});
    }

}

exports.getSellerProducts = async(req, res)=>{

    try{
    const selllr_id = req.params.id;
    if(!selllr_id){
        res.status(401).json({success:false, msg:"seller not found"});
    }   
    const prodcuts = await productModel.find({sellerId:selllr_id});
    res.status(200).json({success:true, result:prodcuts});

    }catch(err){
            return res.status(501).json({success:false, message:`server error${err}`});
    }

}

exports.getAllCategories = async(req, res)=>{
    try{
        const cats = ['PC','Electronics','Health','Games','Tools'];
        res.status(200).json({success:true, result:cats})
    }catch(err){
            return res.status(501).json({success:false, message:`server error${err}`});
    }

}


exports.getCategory = async(req, res)=>{
    try{
    // fetch the prodct
    const cat_name = req.params.cat_name;
    const products =  await productModel.find({category:cat_name});
    if(products){
        res.status(200).json({success:true,result:products})
    }

    }catch(err){
            return res.status(501).json({success:false, message:`server error${err}`});
    }


}
