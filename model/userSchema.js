const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    name: String,
    email: Text,
    title: String,
    body: String,
    imageFile: String,
    password: Number,
    loc: {
        type: { type: String },
        coordinates: [Number],
    },

    role: String,
})

mongoose.model("InterUser", userSchema);

module.exports = mongoose.model("InterUser");