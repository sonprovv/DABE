const { failResponse, successDataResponse } = require("../utils/response");
const TimeService = require("../services/TimeService");
const ServiceService = require("../services/ServiceService");
const redis = require('../config/redis');

const getByServiceTye = async (req, res) => {
    try {
        const { serviceType } = req.params;

        const exists = await redis.exists(`/services/${serviceType.toLowerCase()}`);

        if (exists) {
            const data = await redis.get(`/services/${serviceType.toLowerCase()}`);
            return successDataResponse(res, 200, data);
        }

        if (serviceType.toUpperCase()==="CLEANING") {
            
            const services = await ServiceService.getCleaningService();

            const durations = await TimeService.getDuration();
            const result = {
                services: services,
                durations: durations
            }
            await redis.set(`/services/${serviceType.toLowerCase()}`, result);
            return successDataResponse(res, 200, result);
        }
        else if (serviceType.toUpperCase()==="HEALTHCARE") {
            const services = await ServiceService.getHealthcareService();

            const shifts = await TimeService.getShift();
            const result = {
                services: services,
                shifts: shifts
            }
            await redis.set(`/services/${serviceType.toLowerCase()}`, result);
            return successDataResponse(res, 200, result);
        }
        else if (serviceType.toUpperCase()==="MAINTENANCE") {
            const services = await ServiceService.getMaintenanceService();

            await redis.set(`/services/${serviceType.toLowerCase()}`, services);
            return successDataResponse(res, 200, services);
        }
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message);
    }
}

module.exports = { getByServiceTye }