const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../public/material_uploads');
    },
    filename: function (req, file, cb) {
        const uniquePrefix = Date.now();
        cb(null, uniquePrefix+" "+file.originalname);
    }
})

const upload = multer({ storage: storage })

module.exports = upload;