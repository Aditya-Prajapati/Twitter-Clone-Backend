require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const passport = require("passport");
const findOrCreate = require("mongoose-findorcreate");
const cors = require("cors");
const path = require("path");

const passportSetup = require("./passport");
const User = require("./models/user");
const Tweet = require("./models/tweet");
const Comment = require("./models/comment");
const authRoute = require("./routes/auth");
const tweetRoute = require("./routes/tweet");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('trust proxy', 1);
app.use(cors({
    origin: "https://twitterclonev1.vercel.app",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"]
}));
// app.use(express.static(path.join(__dirname, "../Frontend/build")));

mongoose.connect(`mongodb+srv://${process.env.MONGO_ATLAS_USERNAME}:${process.env.MONGO_ATLAS_PASSWORD}@cluster0.kbryens.mongodb.net/twitterDatabase`);

const store = new MongoDBSession({
    uri: `mongodb+srv://${process.env.MONGO_ATLAS_USERNAME}:${process.env.MONGO_ATLAS_PASSWORD}@cluster0.kbryens.mongodb.net/twitterDatabase`,
    collection: "sessions"
})

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    secure: true,
    sameSite: 'none'
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());

app.use("/auth", authRoute);
app.use("/tweet", tweetRoute);

const getUser = (req, res) => {
    if (req.isAuthenticated){
        User.findOne({ username: req.user.username })
            .then((doc) => {
                res.status(200).send({
                    message: "User is successfully fetched.",
                    user: doc
                })
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({
                    message: "Internal server error"
                })
            })
    }
    else {
        res.status(401).send({
            message: "Unauthorized."
        });
    }
}

app.get("/getuser", getUser);

app.get("/getusers", (req, res) => {

    if (req.isAuthenticated()) {
        if (req.query.users === "random"){
            User.aggregate([
                { $match: { "username": { $ne: req.user.username }, "followedBy": { $not: {
                    $elemMatch: {
                      username: req.user.username,
                      name: req.user.name,
                      picture: req.user.picture
                    }
                }}}},
                { $sample: { size: 4 } }
            ])
                .then((docs) => {
                    res.status(200).send({
                        message: "Users are successfully fetched.",
                        randomUsers: docs
                    })
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).send({
                        message: "Internal server error"
                    })
                })
        }
        else if (req.query.users === "current"){
            getUser(req, res);
        }
    }
    else {
        res.status(401).send({
            message: "Unauthorized."
        });
    }
})

app.post("/follow", (req, res) => {

    if (req.isAuthenticated) {
        let currUser = {
            name: req.user.name,
            username: req.user.username,
            picture: req.user.picture
        }
        let userToFollow = {
            name: req.body.userToMap.name,
            username: req.body.userToMap.username,
            picture: req.body.userToMap.picture
        }

        User.findOne({ username: userToFollow.username })
            .then((doc) => {
                const exists = (doc.followedBy.filter((followedBy) => {
                    return (followedBy.username === currUser.username);
                }))

                if (exists.length === 0){ // not following userToFollow 
                    User.findOneAndUpdate(
                        { username: userToFollow.username }, 
                        { $push: {followedBy: currUser} },
                        { new: true }
                    ).exec()
                    User.findOneAndUpdate(
                        { username: currUser.username },
                        { $push: { follows: userToFollow} },
                        { new: true }
                    )
                        .then((doc) => {
                            res.status(200).send({
                                message: "Follows Incremented",
                                updatedFollows: doc.follows.length
                            })
                        })
                }
                else { // following userToFollow already
                    User.findOneAndUpdate(
                        { username: userToFollow.username }, 
                        { $pull: {followedBy: currUser} },
                        { new: true }
                    ).exec()
                    User.findOneAndUpdate(
                        { username: currUser.username },
                        { $pull: { follows: userToFollow} },
                        { new: true }
                    )
                        .then((doc) => {
                            res.status(200).send({
                                message: "Follows Decremented",
                                updatedFollows: doc.follows.length
                            })
                        })
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({
                    message: "Internal server error."
                })
            })
    }
    else {
        res.status(401).send({
            message: "Unauthorized."
        });
    }
})

app.get("/getfollows", (req, res) => {

    // console.log(req.user);
    if (req.isAuthenticated()){
        User.findOne({ username: req.user.username })
            .then((doc) => {
                console.log(doc);
                res.status(200).send({
                    message: "Followers and following are succesfully sent.",
                    follows: doc.follows,
                    followedBy: doc.followedBy
                })
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({
                    message: "Internal server error."
                })
            })
    }
    else {
        res.status(401).send({
            message: "Unauthorized."
        });
    }
})

app.get("*", (req, res) => {
    res.status(404).send({
        message: "Not Found"
    });
});

app.listen(8000, () => {
    console.log("App listening on port 8000");
});
