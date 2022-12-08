const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const passport = require('passport')
const bcrypt = require('bcryptjs')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const User = require('./models/users')
const Post = require('./models/post')
require('dotenv').config()

const app = express()
const uri = process.env.ATLAS_URI
const PORT = process.env.PORT || 5000

app.use(cors({ origin: 'https://gossip-corner.netlify.app', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(session({
    name: 'userId',
    secret: 'iamtheonlyop',
    resave: false,
    saveUninitialized: true,
    cookie: {
        sameSite: false,
    }
}))

app.use(passport.initialize())
app.use(passport.session())
require('./passport')(passport)

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoAtlas Success!'))
    .catch(e => console.log(e.message))

app.get('/', (_, res) => {
    res.send('Server Running!')
})

app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) throw err
        if (!user) res.json({ message: 'User doesn\'t exists' })
        else {
            req.logIn(user, (err) => {
                if (err) throw err
                res.json({ message: 'Login Success!', user: user })
            })
        }
    })(req, res, next)
})

app.post("/signup", (req, res) => {
    const { fname, lname, username, password, gender, email } = req.body
    User.findOne({ username: username }, async (err, doc) => {
        if (err) throw err
        if (doc) res.json({ message: 'User Already Exists' })
        if (!doc) {
            const hashPassword = await bcrypt.hash(password, 10)
            const newUser = new User({
                fname: fname,
                lname: lname,
                username: username,
                password: hashPassword,
                gender: gender,
                email: email
            })
            await newUser.save()
                .then(r => res.json(r))
                .catch(e => res.json(e.message))
        }
    })
})

app.get("/user", async (req, res) => {
    if (req.user)
        res.json({ loggedIn: true, user: req.user })
    else
        res.json({ loggedIn: false })
})

app.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/user');
    })
})

app.delete('/deluser/:id', async (req, res) => {
    const id = req.params.id
    await User.deleteOne({ _id: id })
        .then(r => res.json({ r: r, message: 'User deleted!' }))
        .catch(e => res.json({ message: e.message }))
})

app.delete('/deluserposts/:id', async (req, res) => {
    const id = req.params.id
    await Post.deleteMany({ userid: id })
        .then(r => res.json({ r: r, message: 'All posts deleted!' }))
        .catch(e => res.json({ message: e.message }))
})

app.post('/createpost', async (req, res) => {
    const { userid, fname, lname, username, gender, message } = req.body

    const newPost = new Post({
        userid, fname, lname, username, gender, message
    })

    await newPost.save()
        .then(r => res.json(r))
        .catch(e => res.json(e.message))
})

app.get('/getposts', async (req, res) => {
    await Post.find()
        .then(r => res.json(r))
        .catch(e => res.json(e.message))
})

app.get('/userposts/:id', async (req, res) => {
    await Post.find({ userid: req.params.id })
        .then(r => res.json(r))
        .catch(e => res.json(e.message))
})

app.delete('/delpost/:id', async (req, res) => {
    const id = req.params.id
    await Post.deleteOne({ _id: id })
        .then(r => res.json(r))
        .catch(e => res.json(e.message))
})

app.listen(PORT, () => console.log('App Running on PORT ' + PORT))