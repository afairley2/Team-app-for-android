const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  imageID: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  likes: {
      type: Number,
      required: true
  },
  ownerID: {
      type: String,
      required: true
  },
  uploadDate: {
      type: Date,
      required: true
  },
  outfitID: {
    type: String,
    required: false
  },
  ownerName: {
    type: String,
    required: true
  }
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;