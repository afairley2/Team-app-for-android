const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// DB Config
const passport = require('passport');

//Connect database
const db = require('../config/keys').mongoURI;
const assert = require('assert');

const {
    ensureAuthenticated,
    forwardAuthenticated
} = require('../config/auth');

//Render create outfit page. Takes all items associated to a user and displays them in drop down menus according to the item type.
router.get('/createOutfit', ensureAuthenticated, function(req, res){
    var items = [];
    var hats = [];
    var scarfs = [];
    var tshirts = [];
    var shirts = [];
    var trousers = [];
    var dresses = [];
    var shorts = [];
    var skirts = [];
    var shoes = [];

    mongoose.connect(db, function(err, db){

        assert.equal(null, err);

        var cursor = db.collection('items').find({
            ownerID: req.user.id
        });

        cursor.forEach(function(doc, err){

            assert.equal(null, err);
            items.push(doc);

        }, function(){

            items.forEach(function(item, index){
                if(item.type == "Hat"){hats.push(item);}
                else if(item.type == "Scarf"){scarfs.push(item);}
                else if(item.type == "T-Shirt"){tshirts.push(item);}
                else if(item.type == "Shirt"){shirts.push(item);}
                else if(item.type == "Trousers"){trousers.push(item);}
                else if(item.type == "Dress"){dresses.push(item);}
                else if(item.type == "Shorts"){shorts.push(item);}
                else if(item.type == "Skirt"){skirts.push(item);}
                else if(item.type == "Shoes"){shoes.push(item);}
            });

            //console.log(items);
            //console.log("Printed results");
            res.render('createOutfit', {
                name: req.user.name,
                hatList : hats, 
                scarfList : scarfs, 
                tshirtList : tshirts, 
                shirtList : shirts, 
                trouserList : trousers,
                dressList : dresses,
                shortList : shorts,
                skirtList : skirts,
                shoeList : shoes
            });

        });
    });    
});

//Handles the post functionality of create outfit. Checks if any of the inputs are "none" in that case it makes it null. Adds the outfit to database as ids of the different element ids.
router.post('/createOutfit', function(req, res){
    
    var outfitName;
    var hat;
    var scarf;
    var tshirt;
    var shirt;
    var trousers;
    var dress;
    var shorts;
    var skirt;
    var shoes;

    let errors = [];


    if(req.body.outfitName != ""){
        outfitName = req.body.outfitName
    }else{
        errors.push({
            msg: 'Please enter a name for the outfit'
        });
    }

    if(req.body.hats == "None"){
        hat = null;
    }else{
        hat = req.body.hats;
    }

    if(req.body.scarfs == "None"){
        scarf = null;
    }else{
        scarf = req.body.scarfs;
    }

    if(req.body.tShirts == "None"){
        tshirt = null;
    }else{
        tshirt = req.body.tShirts;
    }

    if(req.body.shirts == "None"){
        shirt = null;
    }else{
        shirt = req.body.shirts;
    }

    if(req.body.trousers == "None"){
        trousers = null;
    }else{
        trousers = req.body.trousers;
    }

    if(req.body.dress == "None"){
        dress = null;
    }else{
        dress = req.body.dress;
    }
    
    if(req.body.hats == "None"){
        hat = null;
    }else{
        hat = req.body.hats;
    }

    if(req.body.shorts == "None"){
        shorts = null;
    }else{
        shorts = req.body.shorts;
    }

    if(req.body.skirts == "None"){
        skirt = null;
    }else{
        skirt = req.body.skirts;
    }

    if(req.body.shoes == "None"){
        shoes = null;
    }else{
        shoes = req.body.shoes;
    }

    var outfit = {
        outfitName : outfitName,
        ownerID : req.user.id,
        hatID : hat,
        scarfID : scarf,
        tshirtID : tshirt,
        shirtID : shirt,
        trousersID : trousers,
        dressID : dress,
        shortsID : shorts,
        skirtID : skirt,
        shoesID : shoes
    }

    mongoose.connect(db, function(err, db){
        assert.equal(null, err);
        db.collection('outfits').insertOne(outfit, function (err, result){
            assert.equal(null, err);
            console.log('Outfit created');
            req.flash('success_msg', 'Outfit created successfully');
            res.redirect('/dashboard');
        });
    });

});

router.get('/seeOutfits', ensureAuthenticated ,function(req, res){
    //{outfitName, hat, scarf, tshirt, shirt, trousers, dress, shorts, skirt, shoes}
    mongoose.connect(db, function(err, db){

        assert.equal(null, err);
        var outfits = [];

        var cursorOutfits = db.collection('outfits').find({
            ownerID : req.user.id
        });

        cursorOutfits.forEach(function(outfit, err){
            assert.equal(null, err);
            //console.log(outfit);

             outfits.push(outfit);

        },function(){
            var items = [];

            var cursorItems = db.collection('items').find({
                ownerID : req.user.id
            });

            cursorItems.forEach(function(item, err){
                assert.equal(null, err);
                //console.log(item);

                items.push(item);
            },function(){
                //console.log(outfits);
                res.render('seeOutfits', { name: req.user.name, outfitList : outfits, itemList : items});
            });
        });
    });
});

module.exports = router;