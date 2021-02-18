require('dotenv').config();
module.exports = {
    'secretKey': process.env.SECRET_KEY,
    'mongoUrl': 'mongodb://localhost:27017/nucampsite',
    'facebook': {
        clientId: process.env.APP_ID,
        clientSecret: process.env.APP_SECRET
    }
};