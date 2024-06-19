const firebase = require("firebase/app");
require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyCqOxMr2ekHP59DXu1_ybpNiVdzSc7rp8o",
  authDomain: "investasi-catalogue.firebaseapp.com",
  projectId: "investasi-catalogue",
  storageBucket: "investasi-catalogue.appspot.com",
  messagingSenderId: "1072343972684",
  appId: "1:1072343972684:web:9263e156f5d6efdc48ede9",
  measurementId: "G-RQR20FZLKR",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const Users = db.collection("Users");
const Products = db.collection("Products");

module.exports = {
  Users,
  Products,
  jwtSecret: process.env.JWT_SECRET_KEY || "your_secret_key",
  jwtExpiration: process.env.JWT_EXPIRATION || "1h",
};
