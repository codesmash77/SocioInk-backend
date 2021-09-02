/* eslint-disable */
const functions = require("firebase-functions");
const express = require('express');

const app = express();

const {db} = require('./util/admin');
const { getAllInks, postOneInk, getInk, deleteInk } = require('./handlers/Inks');
const { commentOnInk, deleteComment } = require('./handlers/comments');
const { likeInk, unlikeInk } = require('./handlers/likes');
const { signup } = require('./handlers/signup');
const { login } = require('./handlers/login');
const { FBAuth } = require('./util/fbauth');
const { uploadImage,uploadInkImage } = require('./util/uploadimage');
const { addUserDetails,getUserDetails  } = require('./handlers/userdetails');
const { getAuthenticatedUser } = require('./handlers/getauthenticateduser');
const { markNotificationsRead } = require('./handlers/notifications');

//Signup Route
app.post('/signup', signup);

//Login Route
app.post('/login',login);

//User's Route
app.post('/user/image',FBAuth, uploadImage);
app.post('/user',FBAuth, addUserDetails);
app.get('/user',FBAuth, getAuthenticatedUser);
app.get('/user/:handle', getUserDetails);

//Notifications Route
app.post('/notifications', FBAuth, markNotificationsRead);

//Ink Routes 
app.get('/Inks', getAllInks);
app.post('/Ink',FBAuth, postOneInk, uploadInkImage);
app.get('/Ink/:inkId',getInk);
app.delete('/Ink/:inkId',FBAuth,deleteInk);

//Comments Routes
app.post('/Ink/:inkId/comment',FBAuth,commentOnInk);
app.delete('/Ink/:inkId/comment/:commentId',FBAuth,deleteComment);

//Likes Routes
app.get('/Ink/:inkId/like',FBAuth,likeInk);
app.get('/Ink/:inkId/unlike',FBAuth,unlikeInk);

//export the api http onrequest app function
exports.api = functions.https.onRequest(app);

//Notifications handlers
exports.createNotificationOnLike = functions.firestore.document('likes/{id}')
    .onCreate((snapshot) =>{
        db.doc(`/Inks/${snapshot.data().inkId}`).get()
        .then(doc =>{
            if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
                return db.doc(`/notifications/${snapshot.id}`).set({
                    createdAt : new Date().toISOString(),
                    recipient: doc.data().userHandle,
                    sender: snapshot.data().userHandle,
                    read: false,
                    screamId: doc.id,
                    type: 'like'
                });
            }
        })
        .then(() =>{
            return;
        })
        .catch((err) => {
            console.error(err);
            return;
        });   
    });


exports.createNotificationOnComment = functions.firestore.document('comments/{id}')
    .onCreate((snapshot) =>{
        db.doc(`/Inks/${snapshot.data().inkId}`).get()
        .then(doc =>{
            if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
                return db.doc(`/notifications/${snapshot.id}`).set({
                    createdAt : new Date().toISOString(),
                    recipient: doc.data().userHandle,
                    sender: snapshot.data().userHandle,
                    read: false,
                    screamId: doc.id,
                    type: 'comment'
                });
            }
        })
        .then(() =>{
            return;
        })
        .catch((err) => {
            console.error(err);
            return;
        });   
    });

exports.deleteNotificationOnUnLike = functions.firestore.document('likes/{id}')
    .onDelete((snapshot) =>{
        return db.doc(`/notifications/${snapshot.id}`).delete()
        .catch((err) => {
            console.error(err);
            return;
        });   
    });

exports.deleteNotificationOnCommentDeletion = functions.firestore.document('comments/{id}')
    .onDelete((snapshot) =>{
        return db.doc(`/notifications/${snapshot.id}`).delete()
        .catch((err) => {
            console.error(err);
            return;
        });   
    });

exports.onUserImageChange = functions.firestore.document('/users/{userId}')
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log('image has changed');
      const batch = db.batch();
      return db
        .collection('Inks')
        .where('userHandle', '==', change.before.data().handle)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const ink = db.doc(`/Inks/${doc.id}`);
            batch.update(ink, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

exports.onInkDelete = functions.firestore.document('/Inks/{inkId}')
  .onDelete((snapshot, context) => {
    const inkId = context.params.inkId;
    const batch = db.batch();
    return db
      .collection('comments')
      .where('inkId', '==', inkId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db
          .collection('likes')
          .where('inkId', '==', inkId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection('notifications')
          .where('inkId', '==', inkId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });
    