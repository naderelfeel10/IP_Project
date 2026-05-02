const { Timestamp } = require('bson');
const { bool } = require('joi');
const mongoose = require('mongoose')

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

module.exports = mongoose.model('Product',ProductSchema);