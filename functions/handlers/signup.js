/* eslint-disable */
const {firebase,admin,db} = require('../util/admin');
const {validateSignupData} = require('../util/validate');
const {config} = require('../util/config');

exports.signup = (req, res) => {
    const newUser = {
        email : req.body.email,
        password : req.body.password,
        confirmPassword : req.body.confirmPassword,
        handle : req.body.handle,
    };

    const {valid, errors} = validateSignupData(newUser);
    if(!valid) return res.status(400).json(errors);

    const noImage = 'no-image.png';
    
    let tokenid, userId;

    db.doc(`/users/${newUser.handle}`).get()
        .then( doc => {
            if(doc.exists){
                return res.status(400).json({ handle : 'This handle is already taken!'});
            }
            else{
                return admin.auth().createUser({
                        email : newUser.email, 
                        password : newUser.password,
                        displayName: newUser.handle,
                })
                .then(data =>{
                    userId= data.uid;
                    token = firebase.auth().signInWithEmailAndPassword(newUser.email,newUser.password).then(data => {
                    return data.user.getIdToken();
                    })
                    return token;
                })
                .then(token =>{
                    tokenid=token;
                    const userCredentials ={
                        handle : newUser.handle,
                        email : newUser.email,
                        createdAt : new Date().toISOString(),
                        imageUrl : `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImage}?alt=media`,
                        userId
                    };
                    return db.doc(`/users/${newUser.handle}`).set(userCredentials);
                })
                .then(() => {
                    return res.status(201).json({ tokenid });
                })
                .catch(err => {
                    console.error(err);
                    if(err.code==='auth/email-already-exists'){
                        return res.status(400).json({ email: 'Email is already in use!'});
                    }
                    else return res.status(500).json({ general: 'Something went wrong, please try again!' });
                })
        }})
};
