const { failResponse, successDataResponse } = require('../utils/response');

const upload = async (req, res) => {
    try {
        if (!req.file) {
            return failResponse(res, 400, 'No file uploaded');
        }

        return successDataResponse(res, 200, req.file.path, "url");

    } catch (err) {
        return failResponse(res, 500, 'Upload failed')
    }
}

module.exports = { upload };