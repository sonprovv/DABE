class ShiftModel {
    constructor(uid, workingHour, fee) {
        this.uid = uid;
        this.workingHour = workingHour;
        this.fee = fee;
    }
}

class DurationModel extends ShiftModel {
    constructor(uid, workingHour, fee, description) {
        super(uid, workingHour, fee);
        this.description = description;
    }
}

module.exports = { ShiftModel, DurationModel };