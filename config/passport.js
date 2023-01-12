const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const keys = require('./keys');

//Google Oauth
const GoogleStrategy = require('passport-google-oauth20');

//FB oauth
const FacebookStrategy = require('passport-facebook').Strategy;

//Load User Model
const User = require('./../models/user');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy( {usernameField: 'email'}, (email, password, done) => {
            //Match User
            User.findOne( { email: email} )
            .then(user => {
                if(!user){
                    return done(null, false, { message: 'That email is not registered!'});
                }

                //Match Password
                bcrypt.compare(password, user.password, (err, isMatch)=>{
                    if(err) throw err;

                    if(isMatch){
                        return done(null,user);
                    }
                    else{
                        return done(null, false, { message: 'Password incorrect.'});
                    }
                });
            })
            .catch( err => console.log(err));
        })
    );

    passport.use(
        new GoogleStrategy(
            {
                clientID: keys.googleClientID,
                clientSecret: keys.googleClientSecret,
                callbackURL: '/users/auth/google/callback'
            },
            (accessToken, refreshToken, profile, done) => {

            const email=profile.emails[0].value;
            
            User.findOne( { email: email} )
                .then(user => {

                if(user){
                    return done(null,user);
                }
                
                //New user
                const name=profile.displayName;
                
                const password=123456;
                const newUser = new User({
                    name,
                    email,
                    password
                });

                //Hash password
                bcrypt.genSalt(10, (err,salt) => 
                   bcrypt.hash(newUser.password, salt, (err,hash) => {
                        if(err) throw err;
                        //set password to hashed
                        newUser.password=hash;
                        //save user
                        newUser.save()
                        .then(user => {
                            return done(null,user);
                        })
                        .catch(err=>console.log(err));

                   }))

            })
            .catch( err => console.log(err));
                
        }));

    passport.use(
        new FacebookStrategy(
            {
                clientID: keys.faceBookID,
                clientSecret: keys.faceBookSecret,
                callbackURL: "/users/auth/facebook/callback"
            },
            (accessToken, refreshToken, profile, done) => {
                
                const name=profile.displayName;
                const email='abc@gmail.com';
                const password=123456;
                const newUser = new User({
                    name,
                    email,
                    password
                });


                //Hash password
                bcrypt.genSalt(10, (err,salt) => 
                   bcrypt.hash(newUser.password, salt, (err,hash) => {
                        if(err) throw err;
                        //set password to hashed
                        newUser.password=hash;
                        //save user
                        newUser.save()
                        .then(user => {
                            return done(null,user);
                        })
                        .catch(err=>console.log(err));

                   }))
            }
        ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
}