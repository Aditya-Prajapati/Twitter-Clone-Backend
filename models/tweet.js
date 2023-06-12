const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const tweetSchema = new mongoose.Schema({
    username: String,
    content: String,
    likes: Number,
    comments: Number,
    date: String,
    time: String,
    likedBy: [String]
});

tweetSchema.plugin(passportLocalMongoose);
tweetSchema.plugin(findOrCreate);

module.exports = new mongoose.model("Tweet", tweetSchema);