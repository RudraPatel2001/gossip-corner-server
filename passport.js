const User = require('./models/users')
const bcrypt = require('bcryptjs')
const passportLocal = require('passport-local').Strategy

module.exports = function (passport) {
    passport.use(
        new passportLocal((username, password, done) => {
            User.findOne({ username: username }, (err, user) => {
                if (err) throw err
                if (!user) return done(null, false)
                bcrypt.compare(password, user.password, (err, res) => {
                    if (err) throw err
                    if (res === true) return done(null, user)
                    else return done(null, false)
                })
            })
        })
    )

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)
        })
    })

}