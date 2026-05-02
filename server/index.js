const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
const cors = require('cors');


app.use(cors({
    origin: 'http://localhost:3001', 
    credentials: true
}));


app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const User = require('./models/usersModel');
// const Order = require('./models/orderModel');
// const Product = require('./models/productModel');
// const cart = require('./models/cartModel');
// const Review = require('./models/reviewModel');



// routes :
const authRoute = require('./routes/authRoutes');
// const productRoute = require('./routes/productRoutes');
// const reviewRoute = require('./routes/reviewRoutes');
// const orderRoute = require('./routes/orderRoutes');
// const cartRoute = require('./routes/cartRoutes');
// const buyerRoutes = require('./routes/BuyerRoutes');
// const sellerRoutes = require('./routes/SellerRoutes');



const authMiddleWare = require('./middlewares/authMiddleware');

// const { userInfo } = require('os');


const uri = "mongodb+srv://ahmedsomaya022_db_user:Pass@cluster0.4j8apfo.mongodb.net/CourseDB?appName=Cluster0";

const ConnectedDB = async() =>{
        try {
        await mongoose.connect(uri);
        console.log("connected to DB successfully");

    }catch(err){
        console.error(`Error: ${err.message}`);
    }
}


ConnectedDB();


app.use("/auth",authRoute);
// app.use("/products",productRoute);
// app.use("/orders",reviewRoute,orderRoute);
// app.use("/cart",cartRoute);


// app.use("/buyer",buyerRoutes);
// app.use("/seller",sellerRoutes);



app.get('/',authMiddleWare.authMiddleWare, (req, res) => {
    console.log("/ fetched");
    res.send("Welcome to the GOAT "); 
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});