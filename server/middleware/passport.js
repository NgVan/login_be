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
    secretOrKey: "nvbAuthentication"
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
}, async (accessToken, refreshToken, profile, next) => {
    try {
        console.log("[Google passport] profile", profile)
        
        // check user whether exist in GoogleUser
        const findGoogleUser = await User.findOne({
            "google.email": profile.emails[0].value
        })
        if(findGoogleUser) {
            console.log("[Google-passport] User is already exist in GoogleUser");
            return next(null,findGoogleUser)
        }

        // check user whether exist in LocalUser
        const findLocalUser = await User.findOne({
            "local.email": profile.emails[0].value
        })
        if(findLocalUser) {
            console.log("[Google-passport] User is already exist in LocalUser");
            return next(null,findLocalUser)
        }
        
        // Create new GoogleUser
        const user = new User({
            method: "google",
            "google.id" : profile.id,
            "google.email" : profile.emails[0].value
        })
        await user.save();
        next(null,user)
    } catch (error) {
        next(error, false)
    }
}));

// Facebook passport
passport.use(new FacebookTokenStrategy({
    clientID: "357177895809731",
    clientSecret: "a38359a0cfbb243de637ad56d23e64e6"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("[Facebook passport] accessToken : ", accessToken)
        console.log("[Facebook passport] refreshToken : ", refreshToken)
        console.log("[Facebook passport] profile : ", profile)

        // check user whether exist in FacebookUser
        const findFaceUser = await User.findOne({
            "facebook.email": profile.emails[0].value
        })
        if(findFaceUser) {
            console.log("[facebook-passport] User is already exist in FacebookUser");
            return done(null,findFaceUser)
        }

        // check user whether exist in LocalUser
        const findLocalUser = await User.findOne({
            "local.email": profile.emails[0].value
        })
        if(findLocalUser) {
            console.log("[Facebook-passport] User is already exist in LocalUser");
            return done(null,findLocalUser)
        }
        
        // Create new GoogleUser
        const user = new User({
            method: "facebook",
            "facebook.id" : profile.id,
            "facebook.email" : profile.emails[0].value
        })
        await user.save();
        done(null,user)
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
        const isMatch = await findUser.comparePassword(password);
        console.log("check: ", isMatch)
        if(!isMatch) 
            return done(null, false)
        done(null, findUser) 
    } catch (error) {
        done(error,false)
    }
}))

