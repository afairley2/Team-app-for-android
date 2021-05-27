const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const objectId = require('mongodb').ObjectID;

// DB Config
const passport = require('passport');

//Connect database
const db = require('../config/keys').mongoURI;
const assert = require('assert');

//Creates a connection to the database
const conn = mongoose.createConnection(db);

const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

const {
    ensureAuthenticated,
    forwardAuthenticated
} = require('../config/auth');

conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

//Creates the storage engine
const storage = new GridFsStorage({
    url: db,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = file.originalname;
            const fileInfo = {
                filename: filename,
                bucketName: 'uploads'
            };
            resolve(fileInfo);
        });
    }
});

const upload = multer({storage});

router.get('/newPost', ensureAuthenticated, function(req, res){

    var outfits = [];

    mongoose.connect(db,function(err, db){
        assert.equal(null,err);
        var cursor = db.collection('outfits').find({ownerID : req.user.id});

        cursor.forEach(function(doc,err){
            assert.equal(null, err);
            outfits.push(doc);
        },function(){
            res.render('newPost', {
                name : req.user.name,
                outfits : outfits,
            });
        });
    });   
});

router.post('/upload', upload.single('file'), async (req, res) => {
    
    var lastFile = await gfs.files.find().sort({$natural:-1}).limit(1).toArray();
    console.log(lastFile);
    console.log(lastFile[0]._id.toString());

    var currentDate = new Date();
    currentDate.toLocaleDateString();

    var outfit;

    if(req.body.outfitPick != "None"){outfit = req.body.outfitPick}
    else{outfit="none"}
    console.log(outfit + "\n" + outfit._id);

    var post = {
        imageID : lastFile[0]._id.toString(),
        description : req.body.description,
        likes : 0,
        ownerID : req.user.id,
        ownerName : req.user.name,
        uploadDate : currentDate,
        outfitID : outfit._id,
    }

    mongoose.connect(db, function(err, db){
        assert.equal(null, err);
        db.collection('posts').insertOne(post, function(err, result){
            assert.equal(null, err);

            console.log("Post created");
            res.redirect("/dashboard");
        });
    });

});

router.post('/deletePost/', ensureAuthenticated, function(req, res, next) {


    
    var ownerId = req.body.ownerID
    var id = req.body.id
    var imageID = req.body.imageId


    if (ownerId == req.user.id)

    {


        mongoose.connect(db, function(err, db) {
            assert.equal(null, err);
            db.collection('posts').deleteOne({"_id": objectId(id)}, function(err, result) {
              assert.equal(null, err);
              console.log(id)
              console.log('Item deleted');
              db.collection('uploads.files').deleteOne({"imageID": imageID}, function(err, result) {
                assert.equal(null, err);
                console.log(imageID)
                console.log('Item deleted');
                
              });
        
            });
            
          });

    }

    if (ownerId != req.user.id )
    {
        console.log("Wrong User")

    }
  
    
  });


router.post('/deletePost', ensureAuthenticated, function(req, res){

   


});

router.post('/addLike', ensureAuthenticated, function(req, res){

   


});


module.exports = router;