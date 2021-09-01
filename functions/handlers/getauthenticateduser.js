/* eslint-disable */
const {db} = require('../util/admin');

exports.getAuthenticatedUser = (req,res) => {
    let userData = {};
    db.doc(`/users/${req.user.handle}`).get()
    .then(doc =>{
        if(doc.exists){
            userData.credentials = doc.data();
            return db.collection('likes').where('userhandle','==',req.user.handle).get()
        }
    })
    .then(data => {
        userData.likes = [];
        data.forEach(doc => {
            userData.likes.push(doc.data());
        });
        return db
        .collection("notifications")
        .where("recipient", "==", req.user.handle)
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();
    })
    .then((data) => {
      userData.notifications = [];
      data.forEach((doc) => {
        userData.notifications.push({
          recipient: doc.data().recipient,
          sender: doc.data().sender,
          createdAt: doc.data().createdAt,
          inkId: doc.data().inkId,
          type: doc.data().type,
          read: doc.data().read,
          notificationId: doc.id,
        });
      });
      return res.json(userData);
    })
    .catch(err =>{
        console.error(err);
        return res.status(500).json({error : err});
    })
};

