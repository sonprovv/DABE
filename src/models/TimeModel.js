class TimeModel {
    constructor(data) {
        this.uid = data.uid;
        this.workingHour = data.workingHour;
        this.fee = data.fee;
    }

    getInfo() {
        return {
            uid: this.uid,
            workingHour: this.workingHour,
            fee: this.fee,
        }
    }
}

class ShiftModel extends TimeModel {
    constructor(data) {
        super(data);
    }

    getInfo() { 
        return { ...super.getInfo() }
    }
}

class DurationModel extends TimeModel {
    constructor(data) {
        super(data);
        this.description = data.description;
    }

    getInfo() {
        return {
            ...super.getInfo(),
            description: this.description
        }
    }
}

module.exports = { ShiftModel, DurationModel };