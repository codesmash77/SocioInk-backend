/* eslint-disable */
const {isEmail,isEmpty} = require('../util/stringcheck');

exports.validateSignupData = (newUser) => {
    let errors = {};

    if(isEmpty(newUser.email)){
        errors.email = 'Must not be empty!';
    }
    else if(!isEmail(newUser.email)){
        errors.email = 'must be a valid email address!';
    }

    if(isEmpty(newUser.password)){
        errors.password = 'Must not be empty!';
    }
    
    if(newUser.password !== newUser.confirmPassword){
        errors.confirmPassword = 'Passwords must match!';
    }

    if(isEmpty(newUser.handle)){
        errors.handle = 'Must not be empty!';
    }    

    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    return {
        errors,
        valid : Object.keys(errors).length === 0 ? true : false
    }
};

exports.validateLoginData = (user) =>{
    let errors ={};
    if(isEmpty(user.email)){
        errors.email = 'Must not be empty!';
    }
    else if(!isEmail(user.email)){
        errors.email = 'must be a valid email address!';
    }
    if(isEmpty(user.password)){
        errors.password = 'Must not be empty!';
    }
    
    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    return{
        errors,
        valid : Object.keys(errors).length === 0 ? true : false
    }
};
