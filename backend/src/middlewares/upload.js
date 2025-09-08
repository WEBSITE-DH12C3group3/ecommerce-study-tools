const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Cấu hình nơi lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Đi ra ngoài src -> backend -> rồi vào frontend/public/upload
    const uploadPath = path.join(__dirname, "../../../frontend/public/uploads");

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, base + ext);
  },
});

const upload = multer({ storage });

module.exports = upload;
