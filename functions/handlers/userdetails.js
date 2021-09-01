/* eslint-disable */
const {db} = require('../util/admin');
const {reduceUserDetails} = require('../util/reduceuserdetails');

exports.addUserDetails = (req,res) => {
    let userDetails = reduceUserDetails(req.body);
    db.doc(`/users/${req.user.handle}`).update(userDetails)
    .then(() => {
        return res.json({ message : 'Details added successfully!'})
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({error : err});
    })
};

exports.getUserDetails = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.params.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.user = doc.data();
        return db
          .collection("Inks")
          .where("userHandle", "==", req.params.handle)
          .orderBy("createdAt", "desc")
          .get();
      } else {
        return res.status(404).json({ errror: "User not found!" });
      }
    })
    .then((data) => {
      userData.inks = [];
      data.forEach((doc) => {
        userData.inks.push({
          body: doc.data().body,
          createdAt: doc.data().createdAt,
          userHandle: doc.data().userHandle,
          userImage: doc.data().userImage,
          likeCount: doc.data().likeCount,
          commentCount: doc.data().commentCount,
          inkId: doc.id,
        });
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};