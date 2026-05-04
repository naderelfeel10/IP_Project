
const jwt = require("jsonwebtoken")
const {signupSchema} = require('../middlewares/validator');
const {doHash,doPassValidation} = require("../utils/hashing");

const orderModel = require('../models/orderModel');
const userModel = require('../models/usersModel');
const productModel = require("../models/productModel");

exports.getProfile = (req,res)=>{

}

exports.getPurchaseHistroy = (req,res)=>{

}

exports.flagSeller = (req,res)=>{

}
