const Joi = require('joi');

const signupSchema = Joi.object({
	email:Joi.string().min(6).max(60).required().email(
		{tlds:{allow:["net","com"]}}
	),
	password:Joi.string().min(8).max(60).required()
})


module.exports = {signupSchema}