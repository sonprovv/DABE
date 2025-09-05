class UserModel {
    constructor(uid, username, gender = 'other', dob = null, avatar = '', tel = '', location = '', email = '', role = 'user', provider = 'email') {
        this.uid = uid;
        this.username = username || email.split('@')[0]; // Tạo username từ email nếu không có
        this.gender = gender;
        this.dob = this.formatDate(
            typeof dob?.toDate === 'function' ? dob.toDate() : dob
        );
        this.avatar = avatar;
        this.email = email;
        this.tel = tel;
        this.location = location;
        this.role = role;
        this.provider = provider; // Thêm trường provider
        this.emailVerified = provider !== 'email'; // Tự động xác thực email nếu đăng nhập bằng Google
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
        this.lastLogin = new Date().toISOString();
    }

    formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
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
            provider: this.provider,
            emailVerified: this.emailVerified,
            requiresProfileUpdate: !this.tel || !this.dob, // Kiểm tra thông tin còn thiếu
            lastLogin: this.lastLogin
        }
    }
}

module.exports = UserModel;