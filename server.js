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
const authRoute = require("./routes/auth");

const User = require("./models/user");
const Tweet = require("./models/tweet");

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, "../Frontend/build")));

mongoose.connect("mongodb://127.0.0.1:27017/twitterDB");

const store = new MongoDBSession({
    uri: "mongodb://127.0.0.1:27017/twitterDB",
    collection: "sessions"
})

app.use(session({
    secret: "THISISTWITTERSECRET",
    resave: false,
    saveUninitialized: false,
    store: store
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());

app.use("/auth", authRoute);

app.use("/posttweets", (req, res) => {

    if (req.isAuthenticated()) {
        try{
            Tweet.findOrCreate({ username: req.body.username }, (err, user) => {{
                const tweet = {
                    date: `${new Date().getDate()}-${new Date().getMonth()+1}-${new Date().getFullYear()}`,
                    time: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`,
                    content: req.body.tweetContent
                }

                Tweet.updateOne(
                    { username: req.body.username },
                    { $push: { tweets: tweet } }
                )
                .then((response) => {
                    if (response.acknowledged){
                        res.status(200).send({
                            message: "Tweet has been posted."
                        })
                    }
                })
            }})
        }
        catch{(err) => {
            console.log(err);
            res.status(500).send({
                message: "Internal server error."
            })
        }} 
    } 
    else {
        res.status(401).send({
            message: "Unauthorized."
        });
    }
})

app.use("/gettweets", (req, res) => {

    if (req.isAuthenticated()) {
        
        try{
            Tweet.findOne(
                { username: req.user.username }
            )
            .then((response) => {
                res.status(200).send({
                    message: "Tweets are successfully send.",
                    tweets: (response == null) ? [] : response.tweets
                })
            })
        }
        catch{(err) => {
            console.log(err);
            res.status(500).send({
                message: "Internal server error."
            })
        }} 
    } 
    else {
        console.log("Unauthorized fetching tweet request.");
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
