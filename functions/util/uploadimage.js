/* eslint-disable */
const {admin,db} = require('../util/admin');
const {config} = require('../util/config');


exports.uploadImage = (req,res) => {
    const Busboy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new Busboy({ headers: req.headers});

    let imageFilename,imageToBeUploaded;

    busboy.on('file',(fieldname, file, filename, encoding, mimetype) =>{
        if(mimetype !== 'image/jpeg' && mimetype !=='image/png' && mimetype!== 'image/gif'){
            return res.status(400).json({error : 'Wrong file type submitted!'});
        }
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        imageFilename = `${Math.round(Math.random()*1000000000)}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFilename);
        imageToBeUploaded = {filepath,mimetype};
        file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on('finish', () =>{
            admin.storage().bucket().upload(imageToBeUploaded.filepath, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype
                    }
                }
            })
            .then(() => {
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFilename}?alt=media`;
                return db.doc(`/users/${req.user.handle}`).update({imageUrl});
            })
            .then(() =>{
                return res.json({ message: 'Image uploaded successfully!'});
            })
            .catch(err =>{
                console.error(err);
                return res.status(500).json({ error: err});
            });
    });
    busboy.end(req.rawBody);
};


exports.uploadInkImage = (req,res) => {
    const Busboy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new Busboy({ headers: req.headers});

    let imageFilename,imageToBeUploaded;

    busboy.on('file',(fieldname, file, filename, encoding, mimetype) =>{
        if(mimetype !== 'image/jpeg' && mimetype !=='image/png' && mimetype!== 'image/gif'){
            return res.status(400).json({error : 'Wrong file type submitted!'});
        }
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        imageFilename = `${Math.round(Math.random()*1000000000)}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFilename);
        imageToBeUploaded = {filepath,mimetype};
        file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on('finish', () =>{
            admin.storage().bucket().upload(imageToBeUploaded.filepath, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype
                    }
                }
            })
            .then(() => {
                const inkImage = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFilename}?alt=media`;
                return db.doc(`/Inks/${req.user.handle}`).add({inkImage});
            })
            .then(() =>{
                return res.json({ message: 'Image uploaded successfully!'});
            })
            .catch(err =>{
                console.error(err);
                return res.status(500).json({ error: err});
            });
    });
    busboy.end(req.rawBody);
};