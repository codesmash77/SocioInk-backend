/* eslint-disable */
const {db} = require('../util/admin');

exports.commentOnInk = (req,res) => {
    if(req.body.body.trim() === '') return res.stasus(400).json({comment : 'Must not be empty!'});

    const newComment = {
        body : req.body.body,
        createdAt : new Date().toISOString(),
        inkId : req.params.inkId,
        userHandle : req.user.handle,
        userImage : req.user.imageUrl
    };

    db.doc(`/Inks/${req.params.inkId}`).get()
    .then(doc => {
        if(!doc.exists){
            return res.status(404).json({ error : 'Ink not found!'});
        }
        return doc.ref.update({ commentCount : doc.data().commentCount+1});
    })
    .then(() =>{
        return db.collection('comments').add(newComment);
    })
    .then(() => {
        res.json(newComment);
    })
    .catch((err) => {
        res.status(500).json({ error: 'something went wrong!'});
        console.error(err);
    });
};


exports.deleteComment = (req,res) => {
    const commentDocument = db.collection('comments').where('userHandle','==',req.user.handle)
    .where('inkId','==',req.params.inkId).limit(1);

    const inkDocument = db.doc(`/Inks/${req.params.inkId}`);
    let inkData = {};
    inkDocument.get().then(doc => {
        if(doc.exists){
            inkData = doc.data();
            inkData.inkId = doc.id;
            return commentDocument.get();
        }
        else return res.status(404).json({error: 'Ink not found!'});
    })
    .then(data =>{
        if(data.empty){
            return res.status(400).json({error: 'Ink not commented!'});
        }
        else{
             return db.doc(`/comments/${req.params.comment}`).delete()
             .then(() =>{
                 inkData.commentCount--;
                 return inkDocument.update({ commentCount: inkData.commentCount});
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



