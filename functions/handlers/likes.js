/* eslint-disable */
const {db} = require('../util/admin');

exports.likeInk = (req,res) => {
    const likeDocument = db.collection('likes').where('userHandle','==',req.user.handle)
    .where('inkId','==',req.params.inkId).limit(1);

    const inkDocument = db.doc(`/Inks/${req.params.inkId}`);
    let inkData = {};
    inkDocument.get().then(doc => {
        if(doc.exists){
            inkData = doc.data();
            inkData.inkId = doc.id;
            return likeDocument.get();
        }
        else return res.status(404).json({error: 'Ink not found!'});
    })
    .then(data =>{
        if(data.empty){
            return db.collection('likes').add({
                inkId : req.params.inkId,
                userHandle : req.user.handle
            })
            .then(() =>{
                inkData.likeCount++;
                return inkDocument.update({ likeCount: inkData.likeCount});
            })
            .then(() =>{
                return res.json(inkData);
            })
        }
        else{
            return res.status(400).json({error: 'Ink already liked!'});
        }
    })
    .catch((err) => {
        res.status(500).json({ error: err});
        console.error(err);
    });
};

exports.unlikeInk = (req,res) => {
    const likeDocument = db.collection('likes').where('userHandle','==',req.user.handle)
    .where('inkId','==',req.params.inkId).limit(1);

    const inkDocument = db.doc(`/Inks/${req.params.inkId}`);
    let inkData = {};
    inkDocument.get().then(doc => {
        if(doc.exists){
            inkData = doc.data();
            inkData.inkId = doc.id;
            return likeDocument.get();
        }
        else return res.status(404).json({error: 'Ink not found!'});
    })
    .then(data =>{
        if(data.empty){
            return res.status(400).json({error: 'Ink not liked!'});
        }
        else{
             return db.doc(`/likes/${data.docs[0].id}`).delete()
             .then(() =>{
                 inkData.likeCount--;
                 return inkDocument.update({ likeCount: inkData.likeCount});
             })
             .then(() =>{
                 return res.json(inkData);
             })
        }
    })
    .catch((err) => {
        res.status(500).json({ error: err});
        console.error(err);
    });    
};
