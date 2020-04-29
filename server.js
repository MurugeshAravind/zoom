var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongo = require("mongoose");
var multer = require("multer");
var upload = multer();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const dotenv = require("dotenv");
dotenv.config();
var jimp = require("jimp");

// Using multer for storing the image files
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});

var upload = multer({ storage: storage }); // Using the multer for storing our image files inside a folder

var db = mongo.connect(
  process.env.CONNECTIONSTRING,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  function (err, response) {
    if (err) {
      console.log(err);
    } else {
      console.log(`Connected to ${response.name} db`);
    }
  }
);

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

var Schema = mongo.Schema;

var UsersSchema = new Schema({
  social_id: { type: String },
  name: { type: String },
  file: { fileName: String, fileType: String },
  isApproved: { type: Boolean },
});

var model = mongo.model("users", UsersSchema, "users");

app.post("/api/SaveUser", function (req, res) {
  console.log("req inside the save user-->", req.body);
  var mod = new model(req.body);
  if (req.body.mode == "save") {
    mod.save(function (err, data) {
      if (err) {
        res.send(err);
      } else {
        res.send({ data: "Record has been Inserted..!!" });
      }
    });
  }
});

app.post("/api/updateUser", function (req, res) {
  console.log("req.body id-->", req.body._id);
  model.findByIdAndUpdate(
    req.body._id,
    {
      $set: {
        social_id: req.body.social_id,
        name: req.body.name,
        file: {
          fileName: req.body.file.fileName,
          fileType: req.body.file.fileType,
        },
        isApproved: req.body.isApproved,
      },
    },
    { new: true },
    function (err, data) {
      if (err) {
        res.send(err);
      } else {
        res.send({ data: "Approved..!!" });
      }
    }
  );
});

app.post("/api/deleteUser", function (req, res) {
  console.log(req.body.id);
  model.findByIdAndDelete({ _id: req.body.id }, function (err) {
    if (err) {
      res.send(err);
    } else {
      res.send({ data: "Deleted..!!" });
    }
  });
});

app.get("/api/getUser", function (req, res) {
  model.find({}, function (err, data) {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
});

// Resizing our original image to a thumbnail image
function getThumbnail(filename) {
  console.log(filename);
  jimp
    .read(`uploads/${filename}`, async (err, lenna) => {
      if (err) throw err;
      await lenna
        .resize(250, 250) // resize
        .quality(100) // set JPEG quality
        .writeAsync(`thumbnail/${filename}`); // save
    })
    .then(() => {
      console.log("done");
    })
    .catch((e) => {
      console.log(e);
    });
}

app.post("/api/imageUpload", upload.single("file"), (req, res, next) => {
  var file = req.file;
  console.log(file.filename);
  if (!file) {
    const error = new Error("Please upload an image file");
    error.httpStatusCode = 400;
    return next(error);
  } else {
    res.send(file);
    getThumbnail(file.filename);
    next();
  }
});

// Passport configuration
passport.use(
  new LocalStrategy(function (username, password, done) {
    if (username === "admin" && password === "admin") {
      return done(null, username);
    } else {
      return done("unauthorized access", false);
    }
  })
);

passport.serializeUser(function (user, done) {
  if (user) done(null, user);
});

passport.deserializeUser(function (id, done) {
  done(null, id);
});

app.use(passport.initialize());
app.use(passport.session());

const auth = () => {
  return (req, res, next) => {
    passport.authenticate("local", (error, user, info) => {
      if (error)
        res.status(401).json({
          statusCode: 401,
          message: "You are not authorized to login!",
        });
      req.login(user, function (error) {
        if (error) return next(error);
        next();
      });
    })(req, res, next);
  };
};

app.post("/api/login", auth(), (req, res) => {
  res.status(200).json({ statusCode: 200, message: "Logged in successfully!" });
});

app.listen(process.env.PORT, function () {
  console.log("Example app listening on port 3000!");
});
