const express = require("express");
const Tweet = require("../models/tweet");

const app = express();

let DATE = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
let TIME = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;

app.post("/posttweets", (req, res) => {

    if (req.isAuthenticated()) {
        console.log(req.body);
        const tweet = {
            name: req.body.name,
            username: req.body.username,
            content: req.body.tweetContent,
            likes: 0,
            comments: 0,
            date: DATE,
            time: TIME,
            likedBy: [],
            commentedBy: []
        }

        Tweet.create(tweet)
            .then((response) => {
                res.status(200).send({
                    message: "Tweet has been posted."
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

app.get("/gettweets", (req, res) => {

    if (req.isAuthenticated()) {
        Tweet.find((req.query.all === "true") ? {username : { $ne: req.user.username }} : {username: req.user.username })
            .then((response) => {
                res.status(200).send({
                    message: "Tweets are successfully send.",
                    tweets: (response == null) ? [] : response
                })
            })
            .catch (
                (err) => {
                    console.log(err);
                    res.status(500).send({
                        message: "Internal server error."
                    })
                }
            )
    }
    else {
        console.log("Unauthorized fetching tweet request.");
        res.status(401).send({
            message: "Unauthorized."
        });
    }
})

app.post("/deletetweet", (req, res) => {

    console.log(req.user);
    if (req.isAuthenticated()) {
        Tweet.deleteOne({ _id: req.body.tweetId })
            .then(() => {
                res.status(200).send({
                    message: "Tweet has been deleted."
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

app.post("/liketweet", (req, res) => {

    if (req.isAuthenticated()) {
        Tweet.findOne({ _id: req.body.tweetId })
            .then((doc) => {

                const userExists = (doc.likedBy.filter((username) => {
                    return (username === req.user.username);
                }))

                if (userExists.length === 0) {
                    Tweet.updateOne(
                        { _id: req.body.tweetId },
                        {
                            likes: doc.likes + 1,
                            $push: { likedBy: req.user.username }
                        }
                    )
                        .then((response) => {
                            res.status(200).send({
                                message: "Likes incremented.",
                                updatedLikes: doc.likes + 1
                            })
                        })
                }
                else {

                    Tweet.updateOne(
                        { _id: req.body.tweetId },
                        {
                            likes: doc.likes - 1,
                            $pull: { likedBy: req.user.username }
                        }
                    )
                        .then((response) => {
                            res.status(200).send({
                                message: "Likes decremented.",
                                updatedLikes: doc.likes - 1
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

app.post("/comment", (req, res) => {
    if (req.isAuthenticated()){
        Tweet.findById( {_id: req.body.tweetId} )
            .then((doc) => {

                let user = {
                    name: req.user.name,
                    username: req.user.username,
                    content: req.body.tweetContent,
                    likes: 0,
                    comments: 0,
                    date: DATE,
                    time: TIME
                }
                
                Tweet.updateOne( 
                    {_id: req.body.tweetId}, 
                    {
                        $push: { commentedBy: user }
                    }
                )
                .then(() => {
                    res.status(200).send({
                        message: "Comment is successfully posted"
                    })
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).send({
                        message: "Internal server error."
                    })
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

app.post("/getcomments", (req, res) => {
    if (req.isAuthenticated()){
        Tweet.findOne({ _id: req.body.tweetId })
            .then((doc) => {
                res.status(200).send({
                    message: "Commments are fetched successfully",
                    commentedBy: doc.commentedBy
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

module.exports = app;