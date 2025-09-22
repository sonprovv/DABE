const { spawn } = require('child_process');
const path = require('path');
const { failResponse, successDataResponse } = require("../utils/response");

const askQuestion = async (req, res) => {
    try {
        const { question } = req.body;
        
        if (!question) {
            return failResponse(res, 400, "Câu hỏi không được để trống");
        }

        // Gọi trực tiếp Python script
        const pythonProcess = spawn('python', [
            path.join(__dirname, '../ai/chat.py'),
            question
        ]);

        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error('Python process error:', error);
                return failResponse(res, 500, "Không thể xử lý câu hỏi lúc này");
            }

            try {
                const { answer, sources } = JSON.parse(result);
                return successDataResponse(res, 200, { answer, sources });
            } catch (err) {
                console.error('Error parsing Python output:', err);
                return failResponse(res, 500, "Lỗi xử lý kết quả");
            }
        });
    } catch (err) {
        console.error('Error in askQuestion:', err);
        return failResponse(res, 500, "Không thể xử lý câu hỏi lúc này");
    }
};

module.exports = {
    askQuestion
};