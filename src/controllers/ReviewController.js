const ReviewService = require('../services/ReviewService');
const { failResponse, successResponse, successDataResponse } = require("../utils/response");
const { ReviewCreateValid } = require("../utils/validator/ReviewValid");

const createReview = async (req, res) => {
    try {
        const rawData = req.body;
        const validated = await ReviewCreateValid.validateAsync(rawData, { stripUnknown: true });

        await ReviewService.createReview(validated);

        return successResponse(res, 200, 'Thành công');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message);
    }
}

const getExperienceOfWorker = async (req, res) => {
    try {
        const { workerID } = req.params;

        const experiences = await ReviewService.getExperienceOfWorker(workerID);

        return successDataResponse(res, 200, experiences, 'experiences');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message);
    }
}


module.exports = {
    createReview,
    getExperienceOfWorker,
}