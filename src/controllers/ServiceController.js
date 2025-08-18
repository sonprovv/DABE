const { failResponse, successDataResponse } = require("../utils/response");
const TimeService = require("../services/TimeService");
const ServiceService = require("../services/ServiceService");

const getByServiceTye = async (req, res) => {
    try {
        const { serviceType } = req.params;

        if (serviceType.toUpperCase()==="CLEANING") {
            const services = await ServiceService.getCleaningService();

            const durations = await TimeService.getDuration();
            const result = {
                services: services,
                durations: durations
            }
            return successDataResponse(res, 200, result);
        }
        else if (serviceType.toUpperCase()==="HEALTHCARE") {
            const services = await ServiceService.getHealthcareService();

            const shifts = await TimeService.getShift();
            const result = {
                services: services,
                shifts: shifts
            }
            return successDataResponse(res, 200, result);
        }
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 400, err.message);
    }
}

module.exports = { getByServiceTye }