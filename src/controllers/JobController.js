const dayjs = require('dayjs');
const JobService = require("../services/JobService");
const { formatDate } = require("../utils/formatDate");
const { failResponse, successDataResponse } = require("../utils/response");
const { CleaningJobCreateValid, HealthcareJobCreateValid, MaintenanceJobCreateValid } = require("../utils/validator/JobValid");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const AccountService = require('../services/AccountService');
const UserService = require('../services/UserService');
const UserModel = require('../models/UserModel');

dayjs.extend(customParseFormat);

const createJob = async (req, res) => {
    try {
        const { serviceType } = req.params;
        const rawData = req.body;

        if (serviceType.toUpperCase()==="CLEANING") {
            const validated = await CleaningJobCreateValid.validateAsync(rawData, { stripUnknown: true });

            const job = await JobService.createCleaningJob(validated);
            return successDataResponse(res, 200, job, 'newJob');
        }
        else if (serviceType.toUpperCase()==="HEALTHCARE") {
            const validated = await HealthcareJobCreateValid.validateAsync(rawData, { stripUnknown: true });

            const job = await JobService.createHealthcareJob(validated);
            return successDataResponse(res, 200, job, 'newJob');
        }
        else if (serviceType.toUpperCase()==="MAINTENANCE") {
            const validated = await MaintenanceJobCreateValid.validateAsync(rawData, { stripUnknown: true });

            const job = await JobService.createMaintenanceJob(validated);
            return successDataResponse(res, 200, job, 'newJob');
        }
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message);
    }
}

const getJobNew = async (req, res) => {
    try {
        const jobs = await JobService.getJobNew();

        return successDataResponse(res, 200, jobs, 'jobs');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message);
    }
}

const getByUID = async (req, res) => {
    try {
        const { jobID, serviceType } = req.params;


        if (exists) {
            const account = await AccountService.getByUID(data.userID);
            const user = await UserService.getByUID(data.userID);

            delete data['userID'];
            const currentUser = new UserModel(
                user.uid, 
                user.username, 
                user.gender,
                user.dob,
                user.avatar,
                user.tel,
                user.location,
                account.email,
                account.role,
                account.provider
            )
            data['user'] = currentUser.getInfo();
            return successDataResponse(res, 200, data, 'job');
        }

        const job = await JobService.getByUID(jobID, serviceType.toUpperCase());
        return successDataResponse(res, 200, job, 'job');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message);
    }
}

const getJobsByUserID = async (req, res) => {
    try {
        const { userID } = req.params;

        const jobs = await JobService.getJobsByUserID(userID);

        return successDataResponse(res, 200, jobs, 'jobs');
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message);
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
        else if (serviceType.toUpperCase()==='MAINTENANCE') {
            const jobs = await JobService.getMaintenanceJobs();
            return successDataResponse(res, 200, jobs, 'jobs');
        }
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, err.message);
    }
}

module.exports = {
    createJob,
    getJobNew,
    getByUID,
    getJobsByUserID,
    getJobsByServiceType,
}