// Import multer
const multer = require("multer");

const storage = multer.diskStorage({
  // Melakukan callback tempat penyimpanan terhadap file image
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  // melakukan callback terhadap nama file yang dibuat
  filename: function (req, file, cb) {
    cb(null, Math.floor(Math.random() * 99999999) + "-" + file.originalname);
  },
});

// Melakukan filter terhadap file image yang di upload harus sesuai format yang diberikan
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    // Jika file image yang di upload sesuai format, maka akan berhasil upload
    cb(null, true);
  } else {
    // Jika fila image yang di upload tidak sesuai format, maka akan ditolak dengan message "Unsupported file format"
    cb(
      {
        message: "Unsupported file format",
      },
      false
    );
  }
};

const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 3000000,
  },
  fileFilter: fileFilter,
});

module.exports = uploadMiddleware;
