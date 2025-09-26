const UserModel = require("./UserModel");

class AdminModel extends UserModel {
    constructor(uid, username, gender, dob, avatar, tel, location, email, role, provider) {
        super(uid, username, gender, dob, avatar, tel, location, email, role, provider);
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
            provider: this.provider
        }
    }
}

module.exports = AdminModel;