const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');

const User = require('../models/users');
const config = require('../config/index');
const sendEmail = require('./mailer');

// encode token function
const encodeToken = (userID) => {
    return jwt.sign({
        sub: userID,
        iss: "NVB",
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() + 3) 
    },"nvbAuthentication")
}

const decodeToken = (token) => {
    const decode = jwt.verify(token, 'nvbAuthentication');
    return decode.sub;
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
    let foundUser = await User.findOne({
        "local.email": email
    }); 
    if(foundUser) {
        console.log(" [Controller] Check whether user is exist before create for signup: ", foundUser);
        return res.status(403).json({message: "User is already exist in LocalUser, You need to sign-in instead of sign-up"});
    }
    
    // Check user whether it is already exist in GoogleUser or FacebookUser
    foundUser = await User.findOne({
        $or: [
            {"google.email" : email},
            {"facebook.email" : email}
        ]
    });
    if(foundUser) {
        console.log("[Controller] User that you sign-up is already exist in GoogleUser or Facebook", foundUser)
        foundUser.methods.push('local');
        foundUser.local = {
            email: email,
            password: password
        }
        await foundUser.save();
        const token = encodeToken(foundUser._id);
        res.setHeader("authentication", token);
        return res.status(200).json({message: "User is already exist in GoogleUser of Facebook, System return this user in client"})
    }  

    // If user is not exist, then create new user
    const newUser = new User({
        methods: ['local'],
        "local.email": email,
        "local.password": password
    })
    await newUser.save();
    console.log("User is created when sign-up: ", newUser);
    // encode token 
    const token = encodeToken(newUser._id);
    res.setHeader("authentication", token);

    const url = `https://be-nvb-login.herokuapp.com/users/activate/${token}`

    sendEmail(email, url, "Verify your email address");

    return res.status(201).json({success: "user is createdRegister Success! Please activate your email to start.", token});
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

const confirmEmail = async (req, res, next) => {
    const { tokenID } = req.params;
    console.log("tokenID: ", tokenID)

    // decode token to get User
    // findByID(userID)
    // change isActivated: true
    // return status 200 (verify success)

    const userID = decodeToken(tokenID);
    const foundUser = await User.findById(userID);
    foundUser.isActivated = true;
    await foundUser.save();
    return res.status(200).json({success: "Activate account successfully"});
}

module.exports = {
    authFacebook,
    authGoogle,
    signUp,
    signIn,
    secret,
    confirmEmail
}