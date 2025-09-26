const UserModel = require("./UserModel");

class WorkerModel extends UserModel {
    constructor(uid, username, gender, dob, avatar, tel, location, email, role, provider, bankName, bankNumber, description) {
        super(uid, username, gender, dob, avatar, tel, location, email, role, provider);
        this.bankName = bankName;
        this.bankNumber = bankNumber;
        this.description = description;
    }

    getInfo = () => {
        return {
            uid: this.uid,
            username: this.username,
            gender: this.gender,
            dob: this.dob,
            avatar: this.avatar,
            email: this.email,
            tel: this.tel,
            location: this.location,
            role: this.role,
            provider: this.provider,
            bankName: this.bankName,
            bankNumber: this.bankNumber,
            description: this.description
        }
    }
}

module.exports = WorkerModel;