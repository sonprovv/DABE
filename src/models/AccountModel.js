class AccountModel {
    constructor(uid, email, role, provider) {
        this.uid = uid;
        this.email = email;
        this.role = role;
        this.provider = provider;
    }
}

module.exports = AccountModel;