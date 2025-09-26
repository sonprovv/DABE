class UserModel {

    constructor(data) {
        this.uid = data.uid;
        this.username = data.username;
        this.gender = data.gender;
        this.dob = data.dob
        this.avatar = data.avatar;
        this.email = data.email;
        this.tel = data.tel;
        this.location = data.location;
        this.role = data.role;
        this.provider = data.provider;
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

module.exports = UserModel;