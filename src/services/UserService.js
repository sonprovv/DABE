const { db } = require('../config/firebase');
const UserModel = require("../models/UserModel");

class UserService {
    constructor() {}

    async createUser(rawData) {
        try {
            const validated = await UserModel.validateAsync(rawData, { stripUnknown: true });

            const { uid, ...data} = validated;

            await db.collection('users').doc(uid).set(data);
            return { uid: uid, ...data};
        } catch (err) {
            if (err.isJoi && err.details?.length > 0) {
                throw new Error(err.details[0].message);
            }
            throw new Error(err.message);
        }
    }

    async getByUID(uid) {
        try {
            const userDoc = await db.collection('users').doc(uid).get();

            if (!userDoc.exists) {
                throw new Error('Not found user');
            }

            const userData = userDoc.data();

            if (userData.role==='viewer') userData.dob = (userData.dob).toDate();
            else if (userData.role==='worker') userData.createdAt = (userData.createdAt).toDate();

            const validated = await UserModel.validateAsync(
                { uid, ...userData}, 
                { stripUnknown: true }
            );

            return { uid: uid, ...validated };
        } catch (err) {
            if (err.isJoi && err.details?.length > 0) {
                throw new Error(err.details[0].message);
            }
            throw new Error(err.message);
        }
    }

    async updateUser(rawData) {
        try {
            const validated = await UserModel.validateAsync(rawData, { stripUnknown: true });

            const {uid, ...data} = validated;

            const userRef = db.collection('users').doc(uid);
            await userRef.update(data);

            const updatedUser = await userRef.get();

            if (!updatedUser.exists) {
                throw new Error('Not found user');
            }

            const userData = updatedUser.data();

            if (userData.role==='viewer') userData.dob = (userData.dob).toDate();
            else if (userData.role==='worker') userData.createdAt = (userData.createdAt).toDate();

            return { uid: uid, ...userData}
        } catch (err) {
            if (err.isJoi && err.details?.length > 0) {
                throw new Error(err.details[0].message);
            }
            throw new Error(err.message);
        }
    }

    async deleteUser(userUID) {
        try {
            const userRef = db.collection('users').doc(userUID);

            await userRef.delete();
        } catch (err) {
            if (err.isJoi && err.details?.length > 0) {
                throw new Error(err.details[0].message);
            }
            throw new Error(err.message);
        }
    }
}

module.exports = new UserService();