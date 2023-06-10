const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const tweetSchema = new mongoose.Schema({
    username: String,
    tweets: [
        {
            date: String,
            time: String,
            content: String
        }
    ]
});

tweetSchema.plugin(passportLocalMongoose);
tweetSchema.plugin(findOrCreate);

module.exports = new mongoose.model("Tweet", tweetSchema);