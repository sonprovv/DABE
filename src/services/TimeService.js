const { db } = require("../config/firebase");
const { DurationModel, ShiftModel } = require("../models/TimeModel");

class TimeService {
    constructor() {}

    async getDuration() {
        try {
            const snapshot = await db.collection('durations').get();
            const durations = [];

            snapshot.forEach(doc => {
                durations.push(new DurationModel(
                    doc.id,
                    doc.data().workingHour,
                    doc.data().fee,
                    doc.data().description
                ))
            })

            return durations;
        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy thông tin");
        }
    }

    async getShift() {
        try {
            const snapshot = await db.collection('shifts').get();
            const shifts = [];

            snapshot.forEach(doc => {
                shifts.push(new ShiftModel(
                    doc.id,
                    doc.data().workingHour,
                    doc.data().fee
                ))
            })
            return shifts;
        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy thông tin");
        }
    }

    async getDurationByID(uid) {
        try {
            const durationDoc = await db.collection('durations').doc(uid).get();

            if (!durationDoc.exists) {
                throw new Error("Không tìm thấy thông tin");
            }

            return { uid, ...durationDoc.data() };
        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy thông tin");
        }
    }

    async getShiftByID(uid) {
        try {
            const shiftDoc = await db.collection('shifts').doc(uid).get();

            if (!shiftDoc.exists) {
                throw new Error("Không tìm thấy thông tin");
            }

            return { uid, ...shiftDoc.data() };
        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy thông tin");
        }
    }
}

module.exports = new TimeService();