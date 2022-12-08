const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    userid: { type: String, required: true },
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    username: { type: String, required: true },
    gender: { type: String, required: true },
    message: { type: String, required: true }
}, { timestamps: true })

const Post = mongoose.model('Posts', postSchema)

module.exports = Post