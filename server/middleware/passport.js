const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');

const config = require('../config/index')
const User = require('../models/users')

// JWT passport (apply for secret route)
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.secretOrPrivateKey

    //secretOrKey: 'nvbAuthentication'
        }, async (payload, done) => {
            try {
                console.log("payload: ", payload);
                // find user following payload.sub
                const findUser = await User.findOne({_id:payload.sub})
                console.log("[JWT passport] findUser: ", findUser);
                // if not, handle 
                if(!findUser) 
                   return done(null, false)
                // if yes
                done(null,findUser)
            } catch (error) {
                done(error,false)
            }
}))

// Google passport
passport.use(new GoogleTokenStrategy({
    clientID: "809857162407-ln9r35b6ak4q0o52kdav5458fvur0o4d.apps.googleusercontent.com",
    clientSecret: "Z166F3LWXudNAdTGmtXY3dBd"
    // clientID: config.google.clientID,
    // clientSecret: config.google.clientSecret
}, async (accessToken, refreshToken, profile, next) => {
    try {
        console.log("[Google passport] profile", profile)
        
        // check user whether exist in GoogleUser
        let foundUser = await User.findOne({
            "google.email": profile.emails[0].value
        })
        if(foundUser) {
            console.log("[Google-passport] User is already exist in GoogleUser");
            return next(null,foundUser)
        }

        // check user whether exist in LocalUser or FacebookUser
        foundUser = await User.findOne({
            $or: [
                {"local.email": profile.emails[0].value},
                {"facebook.email": profile.emails[0].value}
            ]
        })
        if(foundUser) {
            console.log("[Google-passport] User is already exist in LocalUser or FacebookUser");
            // Add google property to localUser
            foundUser.methods.push('google');
            foundUser.isActivated = true;
            foundUser.google = {
                id : profile.id,
                email : profile.emails[0].value 
            };
            await foundUser.save();
            return next(null,foundUser);
        }
        
        // If user is not exist, create new GoogleUser
        const newUser = new User({
            isActivated: true,
            methods: ["google"],
            "google.id" : profile.id,
            "google.email" : profile.emails[0].value
        })
        await newUser.save();
        next(null,newUser)
    } catch (error) {
        next(error, false)
    }
}));

// Facebook passport
passport.use(new FacebookTokenStrategy({
    // clientID: "357177895809731",
    // clientSecret: "a38359a0cfbb243de637ad56d23e64e6"
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("[Facebook passport] accessToken : ", accessToken)
        console.log("[Facebook passport] refreshToken : ", refreshToken)
        console.log("[Facebook passport] profile : ", profile)

        // check user whether exist in FacebookUser
        let foundUser = await User.findOne({
            "facebook.email": profile.emails[0].value
        })
        if(foundUser) {
            console.log("[facebook-passport] User is already exist in FacebookUser");
            return done(null,foundUser)
        }

        // check user whether exist in LocalUser or GoogleUser
        foundUser = await User.findOne({
            $or: [
                {"local.email": profile.emails[0].value},
                {"google.email": profile.emails[0].value}
            ]
        })
        if(foundUser) {
            console.log("[Facebook-passport] User is already exist in LocalUser or GoogleUser");
            foundUser.methods.push("facebook");
            foundUser.isActivated = true;
            foundUser.facebook = {
                id : profile.id,
                email : profile.emails[0].value
            };
            await foundUser.save();
            return done(null,foundUser);
        }
        
        // If user is not exist, then create new GoogleUser
        const newUser = new User({
            isActivated : true,
            methods: "facebook",
            "facebook.id" : profile.id,
            "facebook.email" : profile.emails[0].value
        })
        await newUser.save();
        done(null,newUser)
    } catch (error) {
        done(error, false)
    }
}))

// Local passport (apply for checking password in sign-in route)
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        console.log("[Local passport] email : ", email)
        console.log("[Local passport] Password : ", password)
        const findUser = await User.findOne({
            "local.email": email
        })
        if(!findUser)
            return done(null, false)
        if(findUser.isActivated == false)
            return done(null, false)
        const isMatch = await findUser.comparePassword(password);
        console.log("check: ", isMatch)
        if(!isMatch) 
            return done(null, false)
        done(null, findUser) 
    } catch (error) {
        done(error,false)
    }
}))

