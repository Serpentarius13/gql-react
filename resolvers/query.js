const { AuthenticationError } = require("apollo-server-express");
const mongoose = require("mongoose");

module.exports = {
  notes: async (parent, args, { models, user }) => {
    if (!user) throw new AuthenticationError("You are not signed in");

    const notes = await models.Note.find({ author: user.id });
    if (!notes) throw new Error("Not found any notes for you");
    return notes;
  },

  note: async (parent, { id }, { models }) => {
    return await models.Note.findOne({ _id: id });
  },

  noteFeed: async (parent, { cursor }, { models }) => {
    const limit = 10;

    let hasNextPage = false;

    let cursorQuery = {};

    if (cursor) {
      cursorQuery = { _id: { $lt: cursor } };
    }

    let notes = await models.Note.find(cursorQuery)
      .sort({ _id: -1 })
      .limit(limit + 1);

    if (notes.length > limit) {
      hasNextPage = true;
      notes = notes.slice(0, 1);
    }

    const newCursor = notes[notes.length - 1]._id;

    return {
      notes,
      cursor: newCursor,
      hasNextPage,
    };
  },
};
