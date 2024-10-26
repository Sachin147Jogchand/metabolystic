const anthropicService = require('../services/ai.service');

// Controller function to process files and text content
exports.processData = async (req, res) => {
  try {
    const files = req.files;  // Get uploaded files

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }

    // Call the service function to process the data
    const response = await anthropicService.processData(files);

    // Send the API response back to the client
    return res.status(200).json({
      error: null,
      data: response,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message,
      data: null,
    });
  }
};

