const express = require("express");
const passport = require("passport");
const cookieParser = require('cookie-parser');
const User = require("../models/user");
const { passwordStrength } = require('check-password-strength')

const app = express();

app.get("/google", passport.authenticate("google", { scope:["profile", "email"] }));

app.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", (err, user) => {
    if (err) {
      return res.redirect("https://twitterclonebackendv1/login/failure");
    }
    if (!user) {
      return res.redirect("https://twitterclonebackendv1/login/failure");
    }
    req.login(user, (err) => {
      if (err) {
        return res.redirect("https://twitterclonebackendv1/login/failure");
      }
      req.session.cookie.sameSite = 'none';
      req.session.cookie.secure = true;
      return res.redirect("https://twitterclonev1.vercel.app/home");
    });
  })(req, res, next);
});


app.post("/signup", (req, res) => {

    User.find({ username: req.body.username })
        .then((response) => {

            if (response[0] === undefined){  

                if (passwordStrength(req.body.password).value === "Too weak"){
                    res.status(403).send({
                        registered: false,
                        message: "Too weak password"
                    })
                    return;
                }

                User.register(
                    {   username: req.body.username, 
                        name: req.body.name, 
                        joined: `${new Date().toLocaleString("default", { month: "long" })} ${new Date().getFullYear()}`,
                        follows: [],
                        followedBy: []
                    }, 
                    req.body.password, 
                    function (err, user) {

                        if (user){
                            res.status(200).send({
                                registered: true,
                                message: "Registration successful.",
                                user: user,
                                cookies: req.cookies
                            })
                        }
                        else {
                            console.log(err);
                            res.status(500).send({
                                registered: false,
                                message: "Registration failed.",
                                error: err
                            })
                        }
                    })
            }
            else {
                res.status(403).send({
                    registered: false,
                    message: "Email already in use",
                })
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({
                registered: false,
                message: "Registration failed.",
                error: err
            })
        })
})

app.post("/login", (req, res) => {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, (err) => {

        if (err){
            res.status(401).send({
                loggedIn: false,
                message: "Login failure.",
                error: err
            })
        }
        else {
            passport.authenticate("local")(req, res, () => {
                req.session.cookie.sameSite = 'none';
                req.session.cookie.secure = true;
                res.status(200).send({
                    loggedIn: true,
                    message: "Login Successful",
                    user: req.user
                })
            })
        }
    })
})

app.get("/login/success", (req, res) => {
    
    if (req.isAuthenticated()){
        res.status(200).send({
            loggedIn: true,
            message: "LoggedIn Successfully.",
            user: req.user
        })
    }
    else {
        res.send({
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

app.post("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            console.log(err);
            res.status(500).send({
                message: "There was an error logging out."
            })
        }
        res.status(200).send({
            message: "Successful logout"
        })
    });
});


module.exports = app;
