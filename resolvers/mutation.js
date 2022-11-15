// const models = require("../models/models");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  AuthenticationError,
  ForbiddenError,
} = require("apollo-server-express");
require("dotenv").config();
const MD5 = require("../hasher");
const { default: mongoose } = require("mongoose");

module.exports = {

  signUp: async (parent, { username, email, password }, { models }) => {
    email = email.trim().toLowerCase();
    const hashed = await bcrypt.hash(password, 10);

    avatar = getAvatar(email);

    try {
      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashed,
      });

      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error("Error creating account");
    }
  },
  signIn: async (parent, { password, email, username }, { models }) => {
    if (email) {
      email = email.trim().toLowerCase();
    }

    const user = await models.User.findOne({
      $or: [{ email }, { username }],
    });

    if (!user) throw new AuthenticationError("Error verifying email/username");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AuthenticationError("Error verifying password");

    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  },

  newNote: async (parent, { content }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError("You must be signed in to create a note");
    }

    return await models.Note.create({
      content,
      author: mongoose.Types.ObjectId(user.id),
    });
  },

  favoriteNote: async (parent, { id }, { models, user }) => {
    if (!user) throw new AuthenticationError("Not authorized");

    let note = await models.Note.findOne({ _id: id });
    const hasUser = note.favoritedBy.indexOf(user.id);

    if (hasUser >= 0) {
      return await models.Note.findOneAndUpdate(
        { _id: id },
        {
          $pull: {
            favoritedBy: mongoose.Types.ObjectId(user.id),
          },
          $inc: {
            favoriteCount: -1,
          },
        },
        {
          new: true,
        }
      );
    } else {
      return await models.Note.findOneAndUpdate(
        {
          _id: id,
        },
        {
          $push: {
            favoritedBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: 1,
          },
        },
        { new: true }
      );
    }
  },
};

const getAvatar = (email) => {
  const encryptedDefaultGravatar = encodeURIComponent(
    "https://i.imgur.com/6NGAJiS.png"
  );
  const avatarHash = MD5(email);
  return `https://www.gravatar.com/avatar/${avatarHash}?s=200&d=${encryptedDefaultGravatar}`;
};
