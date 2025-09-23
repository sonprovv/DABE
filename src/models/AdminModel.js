class AdminModel {
    constructor(uid, username, gender, dob, avatar, tel, location, email, role, provider) {
        this.uid = uid;
        this.username = username;
        this.gender = gender;
        this.dob = this.formatDate(
            typeof dob?.toDate === 'function' ? dob.toDate() : dob
        );
        this.avatar = avatar;
        this.email = email;
        this.tel = tel;
        this.location = location;
        this.role = role;
        this.provider = provider;
    }

    formatDate = (date) => {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear().toString();

        return `${day}/${month}/${year}`;
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