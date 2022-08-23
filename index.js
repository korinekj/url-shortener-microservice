require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

//zajistí že můžu využít payload (form data), respektive req.body níže...nevím nerozumím tomu pořádně zatímpičo
app.use(express.urlencoded());

app.post("/api/shorturl", function (req, res) {
  const validUrlRegex =
    /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

  const isValidUrl = validUrlRegex.test(req.body.url);

  if (isValidUrl) {
    res.json({
      original_url: req.body.url,
      short_url: "zde short url",
    });
  } else {
    res.json({
      error: "invalid url",
    });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
