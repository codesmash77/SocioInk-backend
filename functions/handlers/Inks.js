/* eslint-disable */
const {db} = require('../util/admin');

exports.getAllInks = (req,res) => {
    db.collection('Inks').orderBy('createdAt', 'desc').get()
        .then(data => {
            let inks = [];
            data.forEach((doc) => {
                inks.push({
                    inkId : doc.id,
                    body : doc.data().body,
                    userHandle : doc.data().userHandle,
                    createdAt : doc.data().createdAt,
                    commentCount : doc.data().commentCount,
                    likeCount : doc.data().likeCount,
                    userImage : doc.data().userImage,
                    inkImage : doc.data().inkImage
                    });
            });
            return res.json(inks);
        })
        .catch(err => console.error(err));
};

exports.postOneInk = (req, res,next) => {
    if(req.body.body.trim()===''){
        return res.status(400).json({ body : 'Body must not be empty!'});
    }

    const newInk = {
        body : req.body.body,
        userHandle : req.user.handle,
        userImage : req.user.imageUrl,
        createdAt : new Date().toISOString(),
        likeCount : 0,
        commentCount : 0
    };
    db.collection('Inks').add(newInk)
    .then((doc) => {
        const resInk = newInk;
        resInk.inkId = doc.id;
        res.json(resInk);
        return next();
    })
    .catch((err) => {
        res.status(500).json({ error: 'something went wrong!'});
        console.error(err);
    });
};

exports.getInk = (req,res) => {
    let inkData = {};
    db.doc(`/Inks/${req.params.inkId}`).get()
    .then(doc =>{
        if(!doc.exists){
            return res.status(404).json({error: 'Ink not found!'});
        }
        inkData = doc.data();
        inkData.inkId = doc.id;
        return db.collection('comments').orderBy('createdAt','desc').where('inkId','==',req.params.inkId).get();
    })
    .then(data => {
        inkData.comments = [];
        data.forEach(doc =>{
            inkData.comments.push(doc.data());
        });
        return res.json(inkData);
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({error : err});
    })
};


exports.deleteInk = (req,res) => {
    const document = db.doc(`/Inks/${req.params.inkId}`);
    document.get()
    .then(doc =>{
        if(!doc.exists){
            return res.status(404).json({error : 'Ink Not found!'});
        }
        if(doc.data().userHandle !== req.user.handle){
            return res.status(403).json({error: 'Unauthorized!'});
        }
        else return document.delete();
    })
    .then(() =>{
        res.json({message: 'Ink deleted successfully!'});
    })
    .then(() =>{
        const likeDocument = db.collection('likes').where('inkId','==',req.params.inkId).get()
            .then(data =>{
                    if(data.empty){
                        return res.json({message: 'Deleted Ink didnt have likes!'});
                    }
                    else{
                        return db.doc(`/likes/${data.docs[0].id}`).delete();
                    }
            })
    })
    .then(() =>{
        const commentDocument = db.collection('comments').where('inkId','==',req.params.inkId).get()
            .then(data =>{
                    if(data.empty){
                        return res.json({message: 'Deleted Ink didnt have comments!'});
                    }
                    else{
                        return db.doc(`/comments/${data.docs[0].id}`).delete();
                    }
            })
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({error : err});
    })
};
