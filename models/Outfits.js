const mongoose = require('mongoose');

const OutfitSchema = new mongoose.Schema({
    outfitName:{
        type: String,
        required: true
    },
    ownerID:{
        type: String,
        required: true
    },
    hatID:{
        type: String,
        required: false
    },
    scarfID:{
        type: String,
        required: false
    },
    tshirtID:{
        type: String,
        required: false
    },
    shirtID:{
        type: String,
        required: false
    },
    trousersID:{
        type: String,
        required: false
    },
    dressID:{
        type: String,
        required: false
    },
    shortsID:{
        type: String,
        required: false
    },
    skirtID:{
        type: String,
        required: false
    },
    shoesID:{
        type: String,
        required: false
    },
});

const outfit = mongoose.model('Outfit', OutfitSchema);
module.exports = outfit;