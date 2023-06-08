const express = require("express");
const passport = require("passport");

const app = express();

const CLIENT_URL = "http://localhost:3000";

app.get("/google", passport.authenticate("google", { scope:["profile"] }));

app.get("/google/callback", passport.authenticate("google", { 
    failureRedirect: CLIENT_URL,
    successRedirect: CLIENT_URL + "/home"
}))

app.get("/login/success", (req, res) => {

    if (req.user){
        res.status(200).json({
            loggedIn: true,
            message: "LoggedIn Successfully.",
            user: req.user,
        })
    }
    else {
        res.json({
            loggedIn: false,
            message: "Not Logged In."
        })
    }
})

app.get("/login/failure", (req, res) => {
    res.status(401).send({
        loggedIn: false,
        message: "Login failure."
    })
})

app.get("/logout", (req, res) => {

    req.logout(function(err){
        if (err){
            res.status(500).send({
                logout: false,
                message: "Logout failed."
            })
        }

        res.redirect(CLIENT_URL);
    });
})

module.exports = app;