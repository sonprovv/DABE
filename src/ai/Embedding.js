const { default: axios } = require("axios");

const host = 'http://127.0.0.1:5000/api';

const jobEmbedding = async (job) => {
    try {
        const response = await axios.post(`${host}/job-embedding`, job)

        return true;
    } catch (err) {
        console.log(err.message);
        return false;
    }
}

const updateMetadataStatus = async (jobID, status) => {
    try {
        const response = await axios.put(`${host}/update-metadata/status`,
            {
                uid: jobID,
                status: status
            }
        )

        return true;
    } catch (err) {
        console.log(err.message);
        return false;
    }
}

module.exports = {
    jobEmbedding,
    updateMetadataStatus
}