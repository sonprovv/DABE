const { failResponse, successDataResponse } = require('../utils/response');

const upload = async (req, res) => {
    try {
        if (!req.file) {
            return failResponse(res, 500, 'Không có file ảnh');
        }

        return successDataResponse(res, 200, req.file.path, "url");

    } catch (err) {
        return failResponse(res, 500, 'Cập nhật thất bại')
    }
}

module.exports = { upload };