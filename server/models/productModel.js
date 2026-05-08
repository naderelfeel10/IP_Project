const mongoose = require('mongoose');

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
    imageUrl:{
        type:String
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:String
    },
    quantity:{
        type:Number,
        default:0
    },
    avgRating:{
        type:Number,
        default:0,
        min:0,
        max:5
    },
    available:{
        type:Boolean,
        default:true
    },
    deliveryTimeEstimate: {
        type: String,
        required: true
    }
},{timestamps:true});

module.exports = mongoose.model('Product',ProductSchema);
