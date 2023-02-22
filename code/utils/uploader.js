const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const Uploader = {
  upload: multer({ storage: storage }),
  logic: (params) => {
    fs.rename(
      params.image.path,
      `${params.uploadPath}/${params.imageName}${path.extname(
        params.image.originalname
      )}`,
      (err) => {
        if (err) {
          return {
            success: false,
            message: "rename error",
            errors: [err],
          };
        } else {
          console.log("Rename complete!");
        }
      }
    );

    if (params.compressed) {
      sharp(
        `${params.uploadPath}/${params.imageName}${path.extname(
          params.image.originalname
        )}`
      )
        .resize(500)
        .jpeg({ quality: 50 })
        .toFile(
          `${params.uploadPath}/${params.compressed.name}${path.extname(
            params.image.originalname
          )}`,
          (err) => {
            if (err) {
              return {
                success: false,
                message: "resize error",
                errors: [err],
              };
            }
            console.log("Image compressed successfully");
          }
        );
    }

    return {
      success: true,
      path: `${params.uploadPath}/${params.imageName}${path.extname(
        params.image.originalname
      )}`,
      message: "Media uploaded successful",
    };
  },
};

module.exports = Uploader;
