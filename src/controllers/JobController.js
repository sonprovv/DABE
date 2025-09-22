const dayjs = require('dayjs');
const JobService = require("../services/JobService");
const { formatDate, getStartAndEndTime } = require("../utils/formatDate");
const { failResponse, successDataResponse } = require("../utils/response");
const { CleaningJobCreateValid, HealthcareJobCreateValid } = require("../utils/validator/JobValid");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const { Timestamp } = require('../config/firebase');
const redis = require('../config/redis');

dayjs.extend(customParseFormat);

const createJob = async (req, res) => {
    try {
        const { serviceType } = req.params;
        const rawData = req.body;

        if (serviceType.toUpperCase()==="CLEANING") {
            const validated = await CleaningJobCreateValid.validateAsync(rawData, { stripUnknown: true });
            
            const { startTime, endTime } = getStartAndEndTime(
                validated.startTime,
                validated.dayOfWeek,
                validated.duration.workingHour
            );

            const serviceIDs = [];
            for (const service of validated.services) {
                serviceIDs.push(service.uid)
            }
            const newJob = {
                userID: validated.user.uid,
                serviceType: serviceType.toUpperCase(),
                startTime: Timestamp.fromDate(dayjs(startTime, 'HH:mm DD/MM/YYYY').toDate()),
                endTime: Timestamp.fromDate(dayjs(endTime, 'HH:mm DD/MM/YYYY').toDate()),
                workerQuantity: validated.workerQuantity,
                price: validated.price,
                isWeek: validated.isWeek,
                dayOfWeek: validated.dayOfWeek,
                createdAt: new Date(),
                status: validated.status,
                durationID: validated.duration.uid,
                // option: 
                services: serviceIDs,
                isCooking: validated.isCooking,
                isIroning: validated.isIroning,
            }
            const uidNewJob = await JobService.createCleaningJob(newJob);
            console.log('knj')
            validated['uid'] = uidNewJob;
            validated['startTime'] = startTime;
            validated['endTime'] = endTime;
            validated['createdAt'] = formatDate(newJob.createdAt);
            await redis.set(`/jobs/${serviceType}/${uidNewJob}`, validated);
            return successDataResponse(res, 200, validated, 'newJob');
        }
        else if (serviceType.toUpperCase()==="HEALTHCARE") {
            const validated = await HealthcareJobCreateValid.validateAsync(rawData, { stripUnknown: true });
            const newHealthcareDetails = [];

             const { startTime, endTime } = getStartAndEndTime(
                validated.startTime,
                validated.dayOfWeek,
                validated.shift.workingHour
            );

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
                startTime: Timestamp.fromDate(dayjs(startTime, 'HH:mm DD/MM/YYYY').toDate()),
                endTime: Timestamp.fromDate(dayjs(endTime, 'HH:mm DD/MM/YYYY').toDate()),
                workerQuantity: validated.workerQuantity,
                price: validated.price,
                isWeek: validated.isWeek,
                dayOfWeek: validated.dayOfWeek,
                createdAt: new Date(), 
                status: validated.status,
                shiftID: validated.shift.uid,
                services: healthcareDetailIDs
            }

            const uidNewJob = await JobService.createHealthcareJob(newJob);
            validated['uid'] = uidNewJob;
            validated['startTime'] = startTime;
            validated['endTime'] = endTime;
            validated['createdAt'] = formatDate(newJob.createdAt);
            await redis.set(`/jobs/${serviceType}/${uidNewJob}`, validated);
            return successDataResponse(res, 200, validated, 'newJob');
        }
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 400, err.message);
    }
}

const getByUID = async (req, res) => {
    try {
        const { jobID, serviceType } = req.params;

        const exists = await redis.exists(`/jobs/${serviceType.toLowerCase()}/${jobID}`);

        if (exists) {
            const data = await redis.get(`/jobs/${serviceType.toLowerCase()}/${jobID}`);
            return successDataResponse(res, 200, data, 'job');
        }

        const job = await JobService.getByUID(jobID, serviceType.toUpperCase());
        await redis.set(`/jobs/${serviceType.toLowerCase()}/${jobID}`, job);
        return successDataResponse(res, 200, job, 'job');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 400, err.message);
    }
}

const getJobsByUserID = async (req, res) => {
    try {
        const { userID } = req.params;

        const jobs = await JobService.getJobsByUserID(userID);

        return successDataResponse(res, 200, jobs, 'jobs');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 400, err.message);
    }
}

const getJobsByServiceType = async (req, res) => {
    try {
        const { serviceType } = req.params;

        if (serviceType.toUpperCase()==='CLEANING') {
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
    getByUID,
    getJobsByUserID,
    getJobsByServiceType,
}