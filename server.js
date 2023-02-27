const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./Schemas");
const Uploader = require("./code/utils/uploader");
const path = require("path");

const app = express();

//enable cross origin request
const corsConfig = {
  origin: true,
  credentials: true,
};

app.use(cors());
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));
app.use(cookieParser());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,UPDATE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  next();
});

//Parses Request Body - TO DO LOOK INTO TWO BODY PARSER EFFECT
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/upload", Uploader.upload.single("image"), (req, res) => {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789_";
  let imageId = "";

  for (let i = 0; i < 16; i++) {
    imageId += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  const image = req.file;
  const typeName = req.body.typeName;
  const isIncludedCompressed = req.body.isCompressed;

  const imageName = imageId + "_" + Date.now();

  const compressedImageName = imageId + "_" + Date.now() + "_comp";

  const params = {
    image: image,
    imageName: imageName,
    uploadPath: "uploads/" + typeName,
  };

  if (isIncludedCompressed) {
    params.compressed = { name: compressedImageName };
  }

  const result = Uploader.logic(params);

  res.send(result);
});

app.get("/download/*", (req, res) => {
  const filePath = req.params[0];
  var absolutePath = path.join(__dirname, filePath);

  absolutePath = absolutePath.replace(/(\.\w+)$/, "_comp$1");

  res.download(`${absolutePath}`, (err) => {
    if (err) {
      console.log("Error in download: ", err);
      console.log(absolutePath);
      return res.status(500).send("Error downloading image");
    } else {
      console.log("image downloaded successfully");
    }
  });
});

app.get("/", (req, res) => {
  console.log("Welcome to the Akhlaqana server");

  res.send("Welcome to the Akhlaqana server");
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true, //graphql gui to visualize
  })
);

const PORT = process.env.PORT || 2000;

app.listen(PORT, (_) => {
  console.log("server running on port " + PORT);
});
