
/*const { Timestamp } = require('bson');
const { bool } = require('joi');*/
const mongoose = require('mongoose');


const userSchema = mongoose.Schema({

	email: {
		type: String,
		required: [true, 'Email is required!'],
		trim: true,
		unique: [true, 'Email must be unique!'],
		minLength: [5, 'Email must have 5 characters!'],
		lowercase: true,
	},
	password: {
		type: String,
		required: [true, 'Password must be provided!'],
		trim: true,
		select: false,
	},
    username:{
        type:String,
        required:[true,'username is required'],
        trim:true,
		select: true,
    },
	storeName:{
		type:String,
		trim:true
	},
	phone:{
		type:String,
		trim:true
	},
	address:{
		type:String,
		trim:true
	},
    type:{
        type:String,
        enum:['buyerAccount', 'sellerAccount', 'admin'],
        required:[true,'user type is required'],
    },
	isActive:{
		type:Boolean,
		default:false
	},
	shippingAddress:{
		type:String
	},
	flagCount:{
		type:Number,
		default:0,
	},
	verificationCode: {
    type: String,
    select: false,
	},
	verificationCodeExpires: {
    	type: Date,
    	select: false,
	}
},
    {
        timestamps:true,
    }


)

module.exports = mongoose.model('User', userSchema);
