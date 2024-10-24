const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./Schemas");
const Uploader = require("./code/utils/uploader");
const path = require("path");
const { ChatMessage } = require("./code/chat");
const shared = require("./code/shared/shared");

const app = express();

const server = require("http").createServer(app);
const io = require("socket.io")(server);

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

io.on("connection", (socket) => {
  // get the user ID from the client-side
  const userId = socket.handshake.query.userId;

  socket.on("subscribe", (params) => {
    console.log("subscribe");
    socket.join(params.id);
  });

  socket.on("unsubscribe", (params) => {
    console.log("unsubscribe");
    socket.leave(params.id);
  });

  // listen for incoming messages
  socket.on("chat message", (params) => {
    console.log("chat message");
    io.to(params.roomId).emit("chat message", {
      userId: userId,
      message: params,
    });

    ChatMessage.Queries.create(params).then((result) => {
      // if (result.success) {
      //   io.to(params.roomId).emit("chat message", {
      //     userId: userId,
      //     message: params,
      //   });
      // } else {
      //   io.to(params.roomId).emit("chat message", {
      //     userId: userId,
      //     message: null,
      //   });
      // }
    });
  });
});

// app.post("/upload", Uploader.ftpUploadMiddleware, (req, res) => {
//   const characters = "abcdefghijklmnopqrstuvwxyz0123456789_";
//   let imageId = "";

//   for (let i = 0; i < 16; i++) {
//     imageId += characters.charAt(Math.floor(Math.random() * characters.length));
//   }

//   const image = req.file;
//   const typeName = req.body.typeName;
//   const isIncludedCompressed = req.body.isCompressed;

//   const imageName = imageId + "_" + Date.now();

//   const compressedImageName = imageId + "_" + Date.now() + "_comp";

//   const params = {
//     image: image,
//     imageName: imageName,
//     uploadPath: "uploads/" + typeName,
//   };

//   if (isIncludedCompressed) {
//     params.compressed = { name: compressedImageName };
//   }

//   const result = Uploader.logic(params);

//   res.send(result);
// });

app.post("/upload", Uploader.ftpUploadMiddleware, (req, res) => {
  console.log(req.uploadResult);
  res.send(req.uploadResult);
});

app.get("/download/*", (req, res) => {
  var filePath = req.params[0];
  filePath = filePath.replace(/(\.\w+)$/, "_comp$1");

  res.download(`./${filePath}`, (err) => {
    if (err) {
      console.log("Error in download: ", err);
      return res.status(500).send("Error downloading image");
    } else {
      console.log("image downloaded successfully");
    }
  });
});

app.get("/", (req, res) => {
  console.log("Welcome to the Amanti server V2.0");

  res.send("Welcome to the Amanti server");
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true, //graphql gui to visualize
  })
);

const PORT = process.env.PORT || 3000;

server.listen(PORT, (_) => {
  console.log("server running on port " + PORT);
  console.log(`database (${shared.dbName})`);
});
// tessss
//22222222
//2222
//2222
