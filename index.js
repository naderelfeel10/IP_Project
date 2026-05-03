const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')



app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const User = require('./models/usersModel');
const Order = require('./models/orderModel');
const Product = require('./models/productModel');
const cart = require('./models/cartModel');
const Review = require('./models/reviewModel');



// routes :
const authRoute = require('./routes/authRoutes');
const productRoute = require('./routes/productRoutes');
const reviewRoute = require('./routes/reviewRoutes');
const orderRoute = require('./routes/orderRoutes');
const cartRoute = require('./routes/cartRoutes');
const buyerRoutes = require('./routes/BuyerRoutes');
const sellerRoutes = require('./routes/SellerRoutes');



const {authMiddleWare} = require('./middlewares/authMiddleware');

const { userInfo } = require('os');


const uri = 'mongodb+srv://obitoelfeel_db_user:ObitoTheGoat@cluster0.sx6c2nh.mongodb.net/?appName=Cluster0'; 

const ConnectedDB = async() =>{
        try {
        await mongoose.connect(uri);


    }catch(err){
        console.error(`Error: ${err.message}`);
    }
}


ConnectedDB();


app.use("/auth",authRoute);
app.use("/products",productRoute);
app.use("/orders",reviewRoute,orderRoute);
app.use("/cart",cartRoute);


app.use("/buyer",buyerRoutes);
app.use("/seller",sellerRoutes);



app.get('/',authMiddleWare, (req, res) => {
    console.log("/ fetched");
    res.send("Welcome to the GOAT "); 
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});