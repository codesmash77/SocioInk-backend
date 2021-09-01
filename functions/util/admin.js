/* eslint-disable */
const admin = require('firebase-admin');
const firebase = require("firebase");

const {config} = require('./config');

firebase.initializeApp(config);
admin.initializeApp(config);

const db= admin.firestore();

module.exports = {admin, firebase, db};