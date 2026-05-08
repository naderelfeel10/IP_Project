const jwt =require('jsonwebtoken');


const authMiddleWare = (req,res,next)=>{
    console.log("middleware is called")
    //console.log("all headers : ",req.headers)
    console.log("Cookies parsed:", req.cookies);
    const cookieAuth = req.cookies.Authorization;

    console.log(cookieAuth)


    if (!cookieAuth || !cookieAuth.startsWith('Bearer ')) {
      return res.status(401).json({"success":"false",message:"Unauthorized"});
    }
  
    const token = cookieAuth.split(' ')[1];
    if(!token){
        return res.status(401).json({"success":"false",message:"login first"});
    }

    console.log(token);  
    console.log("auth middleware is called");


    try{
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        let decodedTokenInfo

        decodedTokenInfo = jwt.verify(token,"elfeel")
        console.log(decodedTokenInfo)
        req.userInfo = decodedTokenInfo;
        console.log('done')
        next();

    }catch(e){
        return res.status(401).json({"success":false,message:"invalid jwt token"})
    }
}



module.exports = {authMiddleWare};