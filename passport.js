const passport = require("passport");
const findOrCreate = require("mongoose-findorcreate");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/user");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://twitterclonebackendv1/auth/google/callback"
},
    function (accessToken, refreshToken, profile, cb) {

        User.findOne({ username: profile.emails[0].value })
            .then((doc) => {
                const user = {
                    username: profile.emails[0].value,
                    name: profile.displayName, 
                    joined: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`, 
                    googleId: profile.id,
                    picture: profile._json.picture,
                    follows: [],
                    followedBy: []
                }

                if (doc === null){
                    User.create( user )
                    .then(() => {
                        return cb(null, user);
                    })
                }
                else {
                    return cb(null, doc);
                }
            })
            .catch((err) => {
                console.log("Error in registeration of user.")
                console.log(err);
            })
    }
));

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, { name: user.name, joined: user.joined, username: user.username, picture: user.picture, follows: [], followedBy: [] });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});
