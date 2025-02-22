const express = require("express");
require("dotenv").config();
const http = require("http");
const cors = require("cors");

const serverless = require('serverless-http');
const port = process.env.PORT 

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
const server = http.createServer(app); 

module.exports = { app, server }; 

module.exports.handler = serverless(app, { callbackWaitsForEmptyEventLoop: false });