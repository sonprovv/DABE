class AccountModel {
    constructor(data) {
        this.uid = data.uid;
        this.email = data.email;
        this.role = data.role;
        this.provider = data.provider;
    }

    getInfo() {
        return {
            uid: this.uid,
            email: this.email,
            role: this.role,
            provider: this.provider
        }
    }
}

module.exports = AccountModel;