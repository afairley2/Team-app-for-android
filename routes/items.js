const express = require('express');


const router = express.Router();


const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');


//Connect database
const db = require('../config/keys').mongoURI;
const assert = require('assert');






const {
    ensureAuthenticated,
    forwardAuthenticated
} = require('../config/auth');





router.get('/addNewItem',ensureAuthenticated, function (req, res, next) {

    gfs.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
          res.render('addNewItem', { files: false, name: req.user.name });
        } else {
          files.map(file => {
            if (
              file.contentType === 'image/jpeg' ||
              file.contentType === 'image/png'
            ) {
              file.isImage = true;
            } else {
              file.isImage = false;
            }
          });
         
          res.render('addNewItem', { files: files , name: req.user.name});
        }
      });
    
   
});

// Get added item from the database
router.get('/get-items2', function (req, res, next) {

    var resultArray = []
    mongoose.connect(db, function (err, db) {

        assert.equal(null, err);
        var cursor = db.collection('items').find();
        cursor.forEach(function (doc, err) {
            assert.equal(null, err);
            resultArray.push(doc);
        }, function () {

            console.log(resultArray);
            console.log("Printed Results")

        });
    });
});

// Get itmes assosiated with the logged in account
router.get('/get-items', function (req, res, next) {

    var resultArray = []
    mongoose.connect(db, function (err, db) {

        assert.equal(null, err);
        var cursor = db.collection('items').find({
            ownerID: req.user.id
        });
        cursor.forEach(function (doc, err) {
            assert.equal(null, err);
            resultArray.push(doc);
        }, function () {


            console.log(resultArray);
            console.log("Printed Resutls")

        });
    });
});



// Add new item to the database
router.post('/insert-item', function (req, res) {

    var item = {
        brand: req.body.brand,
        type: req.body.type,
        colour: req.body.colour,
        ownerID: req.user.id
    };
    let errors = [];

    if (!req.body.brand || !req.body.type || !req.body.colour) {

        errors.push({
            msg: 'Please enter all fields'
        });

    } else {

        mongoose.connect(db, function (err, db) {

            assert.equal(null, err);

            db.collection('items').insertOne(item, function (err, result) {

                assert.equal(null, err);
                console.log('Item inserted');
                req.flash('success_msg', 'Item added successfully');
                res.redirect("/dashboard")
            });
        });
    }
});


// Delete the item from the database
router.get('/delete-item', function (req, res, next) {
});




 // Create mongo connection
 const mongoURI = 'mongodb+srv://smyo:smyo@smyoaccounts-zliwe.mongodb.net/files?retryWrites=true';

 const conn = mongoose.createConnection(mongoURI);
 // Init gfs
 let gfs;
 
 conn.once('open', () => {
   // Init stream
   gfs = Grid(conn.db, mongoose.mongo);
   gfs.collection('uploads');
 });
 
 
 
 // Create storage engine
 const storage = new GridFsStorage({
   url: mongoURI,
   file: (req, file) => {
     return new Promise((resolve, reject) => {
       crypto.randomBytes(16, (err, buf) => {
         if (err) {
           return reject(err);
         }
         const filename = buf.toString('hex') + path.extname(file.originalname);
         const fileOwner = req.user.id;
         const fileInfo = {
           filename: filename,
           metadata: fileOwner,
           bucketName: 'uploads'
         };
         resolve(fileInfo);
       });
     });
   }
 });
 
 const upload = multer({ storage });
 
 
 
  
 // @route POST /upload
 // @desc  Uploads file to DB
 router.post('/upload', upload.single('file'), (req, res) => {
   // res.json({ file: req.file });
   res.redirect('/dashboard');
   console.log("Added to database")
 });
 
 // @route GET /files
 // @desc  Display all files in JSON
 router.get('/files', (req, res) => {
   gfs.files.find().toArray((err, files) => {
     // Check if files
     if (!files || files.length === 0) {
       return res.status(404).json({
         err: 'No files exist'
       });
     }
 
     // Files exist
     return res.json(files);
   });
 });
 
 // @route GET /files/:filename
 // @desc  Display single file object
 router.get('/files/:filename', (req, res) => {
 
 
   
   gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
     // Check if file
     if (!file || file.length === 0) {
       return res.status(404).json({
         err: 'No file exists'
       });
     }
     // File exists
     return res.json(file);
   });
 });
 
 // @route GET /image/:filename
 // @desc Display Image
 router.get('/image/:filename', (req, res) => {
   gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
     // Check if file
     if (!file || file.length === 0) {
       return res.status(404).json({
         err: 'No file exists'
       });
     }
 
     // Check if image
     if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
       // Read output to browser
       const readstream = gfs.createReadStream(file.filename);
       readstream.pipe(res);
     } else {
       res.status(404).json({
         err: 'Not an image'
       });
     }
   });
 });
 
 // @route DELETE /files/:id
 // @desc  Delete file
 router.delete('/files/:id', (req, res) => {
   gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
     if (err) {
       return res.status(404).json({ err: err });
     }
 
     res.redirect('/');
   });
 });

module.exports = router;