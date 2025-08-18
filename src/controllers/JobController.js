const JobService = require("../services/JobService");
const { formatDate } = require("../utils/formatDate");
const { failResponse, successDataResponse } = require("../utils/response");
const { CleaningJobCreateValid, HealthcareJobCreateValid } = require("../utils/validator/JobValid");

const createJob = async (req, res) => {
    try {
        const { serviceType } = req.params;
        const rawData = req.body;

        if (serviceType.toUpperCase()==="CLEANING") {
            const validated = await CleaningJobCreateValid.validateAsync(rawData, { stripUnknown: true });
            
            const serviceIDs = [];
            for (const service of validated.services) {
                serviceIDs.push(service.uid)
            }
            const newJob = {
                userID: validated.user.uid,
                serviceType: serviceType.toUpperCase(),
                startTime: validated.startTime,
                workerQuantity: validated.workerQuantity,
                status: validated.status,
                price: validated.price,
                isWeek: validated.isWeek,
                dayOfWeek: validated.dayOfWeek,
                createdAt: new Date(),
                durationID: validated.duration.uid,
                // option: 
                services: serviceIDs,
                isCooking: validated.isCooking,
                isIroning: validated.isIroning,
            }
            const uidNewJob = await JobService.createCleaningJob(newJob);
            validated['uid'] = uidNewJob;
            validated['createdAt'] = formatDate(newJob.createdAt);

            return successDataResponse(res, 200, validated, 'newJob');
        }
        else if (serviceType.toUpperCase()==="HEALTHCARE") {
            const validated = await HealthcareJobCreateValid.validateAsync(rawData, { stripUnknown: true });
            const newHealthcareDetails = [];

            for (const healthcareDetails of validated.services) {
                newHealthcareDetails.push({
                    healthcareServiceID: healthcareDetails.healthcareService.uid,
                    quantity: healthcareDetails.quantity,
                })
            }

            const healthcareDetailIDs = await JobService.createHealthcareDetails(newHealthcareDetails);

            const newJob = {
                userID: validated.user.uid,
                serviceType: serviceType.toUpperCase(),
                startTime: validated.startTime,
                workerQuantity: validated.workerQuantity,
                status: validated.status,
                price: validated.price,
                isWeek: validated.isWeek,
                dayOfWeek: validated.dayOfWeek,
                createdAt: new Date(), 
                shiftID: validated.shift.uid,
                services: healthcareDetailIDs
            }

            const uidNewJob = await JobService.createHealthcareJob(newJob);
            validated['uid'] = uidNewJob;
            validated['createdAt'] = formatDate(newJob.createdAt);

            return successDataResponse(res, 200, validated, 'newJob');
        }
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 400, err.message);
    }
}

const getJobsByServiceType = async (req, res) => {
    try {
        const { serviceType } = req.params;

        if (serviceType.toUpperCase()==="CLEANING") {
            const jobs = await JobService.getCleaningJobs(); 
            return successDataResponse(res, 200, jobs, 'jobs');
        }
        else if (serviceType.toUpperCase()==='HEALTHCARE') {
            const jobs = await JobService.getHealthcareJobs();
            return successDataResponse(res, 200, jobs, 'jobs');
        }
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 400, err.message);
    }
}

module.exports = {
    createJob,
    getJobsByServiceType
}