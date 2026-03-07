const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// routes :
const authRoute = require('./routes/authRoutes');
const authMiddleWare = require('./middlewares/authMiddleware');
const { userInfo } = require('os');

const uri = 'mongodb+srv://obitoelfeel_db_user:ObitoTheGoat@ipcluster.zr6ifys.mongodb.net/?appName=IPCluster'; 

mongoose.connect(uri)
.then(() => console.log(' MongoDB Connected'))
.catch(err => console.error(' MongoDB connection error:', err));


app.use(authRoute);


app.get('/',authMiddleWare.authMiddleWare, (req, res) => {
    
    console.log("/ fetched");
    res.send("Welcome to the GOAT "); 
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});