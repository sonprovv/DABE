const UserModel = require("./UserModel");

class WorkerModel extends UserModel {
    constructor(uid, username, gender, dob, avatar, tel, location, email, role, description) {
        super(uid, username, gender, dob, avatar, tel, location, email, role);
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
            description: this.description
        }
    }
}

module.exports = WorkerModel;