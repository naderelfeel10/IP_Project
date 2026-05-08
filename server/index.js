const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')



const allowedOrigins = ["http://localhost:3001", "http://127.0.0.1:3001"];

app.use((req, res, next) => {
    const origin = req.headers.origin;

    if(allowedOrigins.includes(origin)){
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Credentials", "true");
    }

    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if(req.method === "OPTIONS"){
        return res.sendStatus(204);
    }

    next();
});

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
const openApiDocument = require('./docs/openapi');



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
app.use("/products",productRoute,reviewRoute);
app.use("/orders",orderRoute);
app.use("/cart",cartRoute);


app.use("/buyer",buyerRoutes);
app.use("/seller",sellerRoutes);

app.get("/swagger.json", (req, res) => {
    res.json(openApiDocument);
});

app.get("/api-docs", (req, res) => {
    res.send(`
<!doctype html>
<html>
  <head>
    <title>IP Project API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: "/swagger.json",
          dom_id: "#swagger-ui"
        });
      };
    </script>
  </body>
</html>
    `);
});



app.get('/',authMiddleWare, (req, res) => {
    console.log("/ fetched");
    res.send("Welcome to the GOAT "); 
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});
