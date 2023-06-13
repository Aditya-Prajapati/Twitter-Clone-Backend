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
const authRoute = require("./routes/auth");
const tweetRoute = require("./routes/tweet");

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
app.use("/tweet", tweetRoute);

app.get("/getusers", (req, res) => {

    if (req.isAuthenticated()){
        User.aggregate([
            { $match: { "username": { $ne: req.user.username} }},
            { $sample: { size: 2 }}
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
                message:"Internal server error"
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
