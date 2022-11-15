const express = require("express");
require("dotenv").config();

const cors = require("cors");
const helmet = require("helmet");

///////////////////////////////

const { default: mongoose } = require("mongoose");
const db = require("./db");
const DB_ADDRESS = process.env.DB_URL.replace(
  "<password>",
  process.env.DB_PASSWORD
);

const connect = async () => {
  try {
    const pasta = await mongoose.connect(DB_ADDRESS);
    console.log("Connected");
  } catch (err) {
    console.log(err);
  }
};

connect();
//////////////////////////////

const { ApolloServer } = require("apollo-server-express");
const models = require("./models/models");
const typeDefs = require("./schema/apollo-schema");
const resolvers = require("./resolvers/resolvers");

const depthLimit = require("graphql-depth-limit");
const { createComplexityLimitRule } = require("graphql-validation-complexity");

//////////////////////////////
const jwt = require("jsonwebtoken");

const getUser = (token) => {
  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error("Session invalid");
    }
  }
};

//////////////////////////////

const port = process.env.PORT;

const app = express();

app.use(helmet());
app.use(cors());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization;
    const user = getUser(token);
    return { models, user };
  },
  validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
  persistedQueries: false,
});
server.start().then((c) => server.applyMiddleware({ app, path: "/api" }));

app.listen(port, () => {
  console.log(`listening at localhost:${port}`);
});
