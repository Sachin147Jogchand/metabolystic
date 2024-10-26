const express = require("express");
const multer = require("multer");
const ai = require("../controllers/ai.controller");
const router = express.Router();
const auth = require("../middlewares/authentication");

// Set up Multer for handling file uploads
const upload = multer({ dest: 'uploads/' });

router.post('/process-data', 
  // auth.verifyJwtToken,  
  upload.array('files', 5),
  ai.processData
);

module.exports = router;
