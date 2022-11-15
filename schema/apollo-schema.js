const { gql } = require("apollo-server-express");

const typeDefs = gql`
  scalar DateTime
  type Query {
    notes: [Note]
    note(id: ID!): Note
    noteFeed(cursor: String): NoteFeed
  }

  type Mutation {
    newNote(content: String, author: String): Note!
    signUp(username: String!, email: String!, password: String!): String!
    signIn(username: String!, email: String!, password: String!): String!
    favoriteNote(id: ID!): Note
  }

  type Note {
    id: ID!
    content: String!
    author: User!
    createdAt: DateTime!
    updatedAt: DateTime!
    favoriteCount: Int,
    favoritedBy: [User!]
  }

  type User {
    id: ID!
    username: String!
    email: String!
    password: String!
    avatar: String
    notes: [Note!]!
    favorites: [Note!]!
  }

  type NoteFeed {
    notes: [Note!]!
    cursor: String!
    hasNextValue: Boolean!
  }
`;

module.exports = typeDefs;
