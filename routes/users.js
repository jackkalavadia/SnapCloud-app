const express=require('express');
const router=express.Router();
const bcrypt=require('bcryptjs');
const passport=require('passport');

//User Model
const User = require('./../models/user');

//Login Page
router.get('/login',(req,res)=>res.render('login'));

//Register Page
router.get('/register',(req,res)=>res.render('register'));

//Register Handle
router.post('/register', (req,res)=>{
    const { name, email, password, password2} = req.body;
    let errors = [];

    //check required fields
    if(!name || !email || !password ||!password2){
        errors.push({ msg:'Some Details are missing!!' });
    }

    //check password match
    if(password != password2){
        errors.push({msg: 'Wrong Password'});
    }

    //check pass length
    if(password.length < 8){
        errors.push({ msg: 'Password string has to be atleast 8 characters'});
    }


    if(errors.length > 0){
        res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        });
    }
    else{
        //Validation Passed
        User.findOne({ email:email })
        .then(user => {
            //user exists
            if(user){
                errors.push({ msg:'You have been here before' });
                res.render('register',{
                    errors,
                    name,
                    email,
                    password,
                    password2
            });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password,
                    level: 'U'
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
                            req.flash('success_msg','Congratulations for signing up');
                            res.redirect('/users/login');
                        })
                        .catch(err=>console.log(err));

                   }))
            }
        });
    }
});

//Login Handle
router.post('/login', (req,res, next) => {
    passport.authenticate('local',{
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

//logout handle
router.get('/logout',(req,res,next) => {
    req.logout();
    req.flash('success_msg','You are Logged out');
    res.redirect('/users/login');
});

//google oauth
router.get('/auth/google',
    passport.authenticate('google', {
    scope:['profile','email']
}));

router.get('/auth/google/callback',passport.authenticate('google'),(req,res,next) => {
    res.redirect('/dashboard');
});

//facebook oauth
router.get('/auth/facebook', 
    passport.authenticate('facebook'));

router.get('/auth/facebook/callback',passport.authenticate('facebook'), (req,res,next) => {
    res.redirect('/dashboard');
});

module.exports=router;