
const { Timestamp } = require('bson');
const { bool } = require('joi');
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
    type:{
        type:String,
        enum:['buyerAccount', 'sellerAccount'],
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
	}
},
    {
        Timestamps:true,
    }

)

module.exports = mongoose.model('User', userSchema);