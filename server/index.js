const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const authRoute = require('./routes/authRoutes');
const productRoute = require('./routes/productRoutes');
const categoryRoute = require('./routes/categoryRoutes');
const orderRoute = require('./routes/orderRoutes');
const sellerRoute = require('./routes/SellerRoutes');

const app = express();

app.use(cors({
    origin: ['http://localhost:3001', 'http://localhost:3002'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const makeMongoUri = () => {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        return '';
    }

    if (!uri.startsWith('mongodb+srv://')) {
        return uri;
    }

    if (!uri.includes('cluster0.gqbrbxi.mongodb.net')) {
        return uri;
    }

    const oldUrl = new URL(uri);
    const username = encodeURIComponent(decodeURIComponent(oldUrl.username));
    const password = encodeURIComponent(decodeURIComponent(oldUrl.password));
    const dbName = oldUrl.pathname.replace('/', '') || 'IP_Project_DB';
    const hosts = [
        'ac-ivyqvvm-shard-00-00.gqbrbxi.mongodb.net:27017',
        'ac-ivyqvvm-shard-00-01.gqbrbxi.mongodb.net:27017',
        'ac-ivyqvvm-shard-00-02.gqbrbxi.mongodb.net:27017'
    ].join(',');

    return `mongodb://${username}:${password}@${hosts}/${dbName}?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;
};

const connectDB = async () => {
    try {
        const uri = makeMongoUri();
        await mongoose.connect(uri);
        console.log('connected to DB successfully');
    } catch (err) {
        console.log('MongoDB connection error:', err.message);
    }
};

connectDB();

app.use('/auth', authRoute);
app.use('/products', productRoute);
app.use('/categories', categoryRoute);
app.use('/orders', orderRoute);
app.use('/seller', sellerRoute);

app.get('/', (req, res) => {
    res.send('Seller server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});
