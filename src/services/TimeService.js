const { db } = require("../config/firebase");
const { DurationModel, ShiftModel } = require("../models/TimeModel");

class TimeService {
    constructor() {}

    async getDuration() {
        try {
            const snapshot = await db.collection('durations').get();
            const durations = [];

            snapshot.forEach(doc => {
                durations.push((new DurationModel({ uid: doc.id, ...doc.data() })).getInfo())
            })

            return durations.sort((a, b) => a.workingHour - b.workingHour);
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
                shifts.push((new ShiftModel({ uid: doc.uid, ...doc.data() })).getInfo())
            })
            return shifts.sort((a, b) => a.workingHour - b.workingHour);
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

            return (new DurationModel({ uid: uid, ...durationDoc.data() })).getInfo();
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

            return (new ShiftModel({ uid: uid, ...shiftDoc.data() })).getInfo();
        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy thông tin");
        }
    }
}

module.exports = new TimeService();