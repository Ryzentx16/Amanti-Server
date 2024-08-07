const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const formidable = require("formidable");
const fs = require("fs");
const FTP = require("ftp");

const ftpConfig = {
  host: "ftp.ryzentx.com",
  user: "u543580474.Amanti",
  password: "Ryzentx@12m",
};

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
  ftpUploadMiddleware: (req, res, next) => {
    const ftpClient = new FTP();
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
      const characters = "abcdefghijklmnopqrstuvwxyz0123456789_";
      let imageId = "";

      for (let i = 0; i < 16; i++) {
        imageId += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }

      const image = files.image;
      const typeName = fields.typeName;
      const isIncludedCompressed = fields.isCompressed;

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

      if (err) {
        req.uploadResult = {
          success: false,
          message: "Error parsing the form",
          errors: [err],
        };
        return next();
      }

      const remoteFilePath = `${params.uploadPath}/${params.imageName}`;

      ftpClient.on("ready", () => {
        ftpClient.mkdir(params.uploadPath, true, (err) => {
          if (err && err.code !== 550) {
            req.uploadResult = {
              success: false,
              message: "Error making a folder",
              errors: [err],
            };
            return next();
          }
          console.log("Folder Created successfully");
          ftpClient.put(
            fs.createReadStream(image.path),
            remoteFilePath,
            (err) => {
              if (err) {
                console.error("Error uploading file:", err);
                req.uploadResult = {
                  success: false,
                  message: "Error uploading file",
                  errors: [err],
                };
              } else {
                console.log("File uploaded successfully");
                req.uploadResult = {
                  success: true,
                  path: `${remoteFilePath}`,
                  message: "Media uploaded successfully",
                };
              }
              ftpClient.end(); // Close the connection
              return next();
            }
          );
        });
      });

      ftpClient.on("error", (err) => {
        console.error("FTP error:", err);
        req.uploadResult = {
          success: false,
          message: "FTP error",
          errors: [err],
        };
        return next();
      });

      // Connect to the FTP server
      ftpClient.connect({
        host: ftpConfig.host,
        user: ftpConfig.user,
        password: ftpConfig.password,
      });
    });
  },
};

module.exports = Uploader;
