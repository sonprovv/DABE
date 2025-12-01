const { default: axios } = require("axios");
const { failResponse, ressponseAI } = require("../utils/response");
const dotenv = require('dotenv');
const { ref } = require("joi");
const AccountService = require("../services/AccountService");
const UserService = require("../services/UserService");
const WorkerService = require("../services/WorkerService");
const ReviewService = require("../services/ReviewService");
dotenv.config();

const search = async (req, res ) => {
    try {
        const { query } = req.body;
        const clientID = req.client.uid;
        const role = req.client.role;

        // Build reference object
        let reference = {};
        
        // Get location based on role
        if (role === 'user') {
            const clientData = await UserService.getByUID(clientID);
            reference['location'] = clientData.location;
        }
        else if (role === 'worker') {
            const clientData = await WorkerService.getByUID(clientID);
            reference['location'] = clientData.location;
        }

        // Get experiences for worker
        if (role === 'worker') {
            const experiencesData = await ReviewService.getExperienceOfWorker(clientID);

            const experiences = {
                'CLEANING': 0,
                'HEALTHCARE': 0,
                'MAINTENANCE': 0
            };
            for (const type in experiencesData) {
                if (experiencesData[type]?.rating !== undefined) {
                    experiences[type] = experiencesData[type].rating;
                }
            }

            reference['experiences'] = experiences;
        }

        // Get applied jobs history (for collaborative filtering)
        // TODO: Implement getAppliedJobsByWorker in OrderService
        // For now, pass empty array
        reference['applied_jobs'] = [];

        // Prepare request payload
        const payload = {
            query: query,
            session_id: clientID,  // Use clientID as session_id for conversation memory
            reference: reference
        };

        console.log('[ChatBot] Calling AI API:', {
            query: query,
            session_id: clientID,
            role: role,
            has_location: !!reference.location,
            has_experiences: !!reference.experiences
        });

        // Call AI API
        const response = await axios.post(
            `${process.env.AI_URL}/api/chatbot`, 
            payload,
            {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
                timeout: 60000  // 60 seconds timeout
            }
        );

        console.log('[ChatBot] AI Response:', {
            status: response.status,
            intent: response.data?.intent,
            has_jobs: !!response.data?.jobs,
            jobs_count: response.data?.jobs?.length || 0
        });

        let result = response.data;

        // Handle legacy format
        if ("output" in result) {
            result = result.data;
        }

        return ressponseAI(res, 200, result);

    } catch (err) {
        console.error('[ChatBot] Error:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
        });

        // Return user-friendly error
        if (err.response?.status === 500) {
            return failResponse(res, 500, 'AI service temporarily unavailable. Please try again.');
        } else if (err.code === 'ECONNABORTED') {
            return failResponse(res, 504, 'Request timeout. Please try again.');
        } else {
            return failResponse(res, 500, err.message);
        }
    }
}

const clearSession = async (req, res) => {
    try {
        const clientID = req.client.uid;

        const response = await axios.post(
            `${process.env.AI_URL}/api/chatbot/session/clear`,
            { session_id: clientID },
            {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
                timeout: 10000
            }
        );

        console.log('[ChatBot] Session cleared:', clientID);

        return ressponseAI(res, 200, response.data);

    } catch (err) {
        console.error('[ChatBot] Clear session error:', err.message);
        return failResponse(res, 500, err.message);
    }
};

const getSessionInfo = async (req, res) => {
    try {
        const clientID = req.client.uid;

        const response = await axios.post(
            `${process.env.AI_URL}/api/chatbot/session/info`,
            { session_id: clientID },
            {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
                timeout: 10000
            }
        );

        console.log('[ChatBot] Session info:', {
            session_id: clientID,
            message_count: response.data?.summary?.total_messages || 0
        });

        return ressponseAI(res, 200, response.data);

    } catch (err) {
        console.error('[ChatBot] Get session info error:', err.message);
        return failResponse(res, 500, err.message);
    }
};

module.exports = { search, clearSession, getSessionInfo }