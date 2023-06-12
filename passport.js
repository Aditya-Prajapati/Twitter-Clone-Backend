const passport = require("passport");
const findOrCreate = require("mongoose-findorcreate");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/user");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/google/callback"
},
    function (accessToken, refreshToken, profile, cb) {

        User.findOrCreate(
            { 
                username: profile.emails[0].value,
                name: profile.displayName, 
                joined: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`, 
                googleId: profile.id 
            }, 
            function (err, user) {
                return cb(err, user);
        });
    }
));

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, { name: user.name, joined: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`, username: user.username });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});