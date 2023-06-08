require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const passport = require("passport");
const cors = require("cors");
const path = require("path");

const passportSetup = require("./passport");
const authRoute = require("./routes/auth.");
const User = require("./models/user");

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, "../Frontend/build")));

const mongoURL = "mongodb://127.0.0.1:27017/twitterDB";
mongoose.connect(mongoURL);

const store = new MongoDBSession({
    uri: mongoURL,
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

app.post("/signup", function (req, res) {

    User.register({ username: req.body.username }, req.body.password, function (err, user) {

        if (req.user){
            res.status(200).send({
                Registered: true,
                message: "Registration successful.",
                user: user,
                cookies: req.cookies
            })
        }
        else {
            res.status(401).send({
                registered: false,
                message: "Registration failed.",
                error: err
            })
        }
    })
})

app.post("/login", function (req, res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, function (err) {

        if (err){
            res.status(401).send({
                loggedIn: false,
                message: "Login failure.",
                error: err
            })
        }
        else {
            passport.authenticate("local")(req, res, () => {
                res.status(200).send({
                    loggedIn: true,
                    message: "Login Successful",
                    user: req.user,
                    cookies: req.cookies
                })
            })                
        }
    })
})

app.use("/auth", authRoute);

app.get("*", function (req, res) {
    res.status(404).send({
        message: "Not Found"
    });
});

app.listen(8000, () => {
    console.log("App listening on port 8000");
});
