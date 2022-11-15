const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    favoriteCount: {
      type: Number,
      default: 0,
    },
    favoritedBy: {
      type: Array,
      ref: "User", 
      default: []
    },
  },
  {
    timestamps: true,
  }
);
const Note = mongoose.model("Note", noteSchema);
module.exports = Note;
