const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');


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


// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {

  var posts = [];

  mongoose.connect(db, async function(err, db){
    assert.equal(null,err);

    var cursor = db.collection('posts').find().sort({_id : -1});

    cursor.forEach(function(doc, err){
      assert.equal(null, err);
      posts.push(doc);  
      
    }, function(){
      
      gfs.files.find().sort({_id : -1}).toArray((err, files) => {
        //Checking if fiels exist
        if(!files || files.length === 0){
          res.render('dashboard', {
            photos: files, 
            posts: posts,
            name : req.user.name,
            userID: req.user.id,
          });
        } 

        else{
          files.map(file => {

            if(
              file.contentType === 'image/jpeg' ||
              file.contentType === 'image/png'
            ){
              file.isImage = true;
            } 

            else {
              file.isImage = false;
            }
          });

          res.render('dashboard', {
            photos: files, 
            posts: posts,
            name : req.user.name,
            userID: req.user.id,
          });
        }
      });
    });
  });
});
  
router.get('/image/:filename', (req, res) =>{
  gfs.files.findOne({filename : req.params.filename}, (err, file)=>{

    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
      const readstream = gfs.createReadStream(file.filename);
      return readstream.pipe(res);  
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

module.exports = router;