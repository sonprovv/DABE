const successDataResponse = (res, code, data, key="data") => {
    return res.status(code).json({
        success: true,
        message: "Thành công",
        [key]: data
    })
}

const successResponse = (res, code, message) => {
    return res.status(code).json({
        success: true,
        message: message
    })
}

const failResponse = (res, code, error) => {
    return res.status(code).json({
        success: false,
        error: error
    })
}

module.exports = { successDataResponse, successResponse, failResponse }