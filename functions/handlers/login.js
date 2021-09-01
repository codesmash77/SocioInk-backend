/* eslint-disable */
const {firebase} = require('../util/admin');
const {validateLoginData} = require('../util/validate');

exports.login = (req,res) =>{
    const user = {
        email : req.body.email,
        password : req.body.password
    };
    const {valid, errors} = validateLoginData(user);
    if(!valid) return res.status(400).json(errors);

    firebase.auth().signInWithEmailAndPassword(user.email,user.password)
    .then(data => {
        return data.user.getIdToken();
    })
    .then(token => {
        return res.json(token);
    })
    .catch(err => {
        console.error(err);
        if(err.code === 'auth/wrong-password') return res.status(403).json({ general: 'Wrong Credentials, please try again!'});
        else return res.status(500).json({ error: err});
    })
};