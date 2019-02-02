const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const mongoose = require("mongoose");
require("dotenv").config({ path: "variables.env" });

const graphqlSchema = require("./src/graphql/schema/index");
const graphqlResolvers = require("./src/graphql/resolvers/index");
const isAuth = require("./src/middleware/is-auth");

const app = express();

app.use(bodyParser.json());

app.use(isAuth);

app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true
  })
);

const PORT = process.env.PORT || 8000;

// Database connection
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PASSWORD
    }@mahadevaya-s3h0d.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`,
    { useNewUrlParser: true }
  )
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Aum Namah Shivaya: Server started at port ${PORT}`)
    );
  })
  .catch(err => {
    console.log(err);
  });
