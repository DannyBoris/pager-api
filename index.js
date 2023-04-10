const express = require("express");
const app = express();
require("dotenv").config();
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const main_routes = require("./routes");
const https = require("https");
const options = {
  key: fs.readFileSync(path.resolve(__dirname, "./private.key")),
  cert: fs.readFileSync(path.resolve(__dirname, "./certificate.crt")),
};



app.use(express.static("./frontend/dist"));

app.use(cors());
app.use(bodyParser({ extended: true }));
app.use(main_routes);
console.log(process.env.PORT);
app.listen(8080)