const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const tweetSchema = new mongoose.Schema({
    name: String,
    username: String,
    content: String,
    likes: Number,
    comments: Number,
    date: String,
    time: String,
    likedBy: [String],
    commentedBy: [{
        name: String,
        username: String,
        content: String,
        likes: Number,
        comments: Number,
        date: String,
        time: String
    }]
});

tweetSchema.plugin(passportLocalMongoose);
tweetSchema.plugin(findOrCreate);

module.exports = new mongoose.model("Tweet", tweetSchema);