const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');

const User = require('../models/users');
const config = require('../config/index');

// encode token function
const encodeToken = (userID) => {
    return jwt.sign({
        sub: userID,
        iss: "NVB",
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() + 3) 
    },"nvbAuthentication")
}

const authFacebook = async (req, res, next) => {
    console.log("[Controller] User is created when register with Facebook: ", req.user);
    const token = encodeToken(req.user._id);
    res.setHeader("Authentication", token);
    return res.status(200).json({success: "Register with Facebook successfully", token});
}

const authGoogle = async (req, res, next) => {
    console.log("[Controller] User is created when register with Google: ", req.user);
    const token = encodeToken(req.user._id);
    res.setHeader("Authentication", token);
    return res.status(200).json({success: "Register with Google successfully", token});
}

const signUp = async (req, res, next) => {
    const {email, password} = req.value.body;
    console.log("email: ",email);
    console.log("pass: ", password);

    //Check user whether it is already exist in LocalUser
    const foundLocalUser = await User.findOne({
        "local.email": email
    }); 
    if(foundLocalUser) {
        console.log(" [Controller] Check whether user is exist before create for signup: ", foundLocalUser);
        return res.status(403).json({message: "User is already exist in LocalUser, You need to sign-in instead of sign-up"});
    }
    
    // Chec user whether it is already exist in GoogleUser
    const foundGoogleUser = await User.findOne({
        "google.email" : email
    });
    if(foundGoogleUser) {
        console.log("[Controller] User that you sign-up is already exist in GoogleUser", foundGoogleUser)
        const token = encodeToken(foundGoogleUser._id);
        res.setHeader("authentication", token);
        return res.status(200).json({message: "User is already exist in GoogleUser, System return this user in client"})
    }  

    // Create new user
    const user = new User({
        "local.email": email,
        "local.password": password
    })
    await user.save();
    console.log("User is created when sign-up: ", user);
    // encode token 
    const token = encodeToken(user._id);
    res.setHeader("authentication", token);
    return res.status(201).json({success: "user is created",token});
}

const signIn = async (req, res, next) => {
    console.log("[Controller] User is send when signin: ", req.user);
    const token = encodeToken(req.user._id);
    res.setHeader("Authentication", token);
    return res.status(200).json({success: "Login success", token});
}

const secret = async (req, res, next) => {
    console.log("Secret function", req.user);
    return res.status(200).json({recret: "resource"});
}

module.exports = {
    authFacebook,
    authGoogle,
    signUp,
    signIn,
    secret
}