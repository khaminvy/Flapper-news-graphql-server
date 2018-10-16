const express = require("express");
const mongoose = require('mongoose');
const graphqlHTTP = require("express-graphql");
const schema = require("./schemas/schema");

const app = express();
//Connect to Local MongoDB
mongoose.connect('mongodb://thanhp:khavydang10@ds233323.mlab.com:33323/graphql-post-list');
mongoose.connection.once('open',() =>{
    console.log("Connect to Database");
}); 
app.use("/graphql", graphqlHTTP({
    schema,
    graphiql: true
}))
app.listen(4000, () => {
    console.log("Now listening for requests on port 4000");
})