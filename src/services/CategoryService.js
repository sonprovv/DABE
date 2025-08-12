const { db } = require('../config/firebase');
const { CategoryModelWithUID, CategoryModel } = require("../models/CategoryModel");

class CategoryService {
    constructor() {}

    async createCategory(data) {
        try {
            const categoryRef = await db.collection('categories').add(data);

            return {
                uid: categoryRef.id,
                ...data
            }
        } catch (err) {
            throw new Error(err.message);
        }
    }

    async getCategories() {
        try {
            const snapshot = await db.collection('categories').get();

            const categories = [];

            for (const doc of snapshot.docs) {
                try {
                    const validated = await CategoryModelWithUID.validateAsync({ uid: doc.id, ...doc.data() }, { stripUnknown: true });
                    categories.push(validated);
                } catch (err) {
                    continue;
                }
            }

            return categories;
        } catch (err) {
            throw new Error(err.message);
        }
    }

    async getByUID(uid) {
        try {
            const categoryDoc = await db.collection('categories').doc(uid).get();

            if (!categoryDoc.exists) {
                throw new Error('Not found category');
            }

            const categoryData = categoryDoc.data();
            const validated = await CategoryModelWithUID.validateAsync(
                { uid, ...categoryData }, 
                { stripUnknown: true }
            );

            return { uid: uid, ...validated }
        } catch (err) {
            throw new Error(err.message);
        }
    }

    async updateCategory(validated) {
        try {
            const { uid, ...data } = validated;

            const categoryRef = db.collection('categories').doc(uid);
            await categoryRef.update(data);

            const updatedCategory = await categoryRef.get();

            if (!updatedCategory.exists) {
                throw new Error('Not found user');
            }

            const categoryData = updatedCategory.data();

            return { uid: uid, ...categoryData }
        } catch (err) {
            throw new Error(err.message);
        }
    }

    async deleteCategory(categoryUID) {
        try {
            const categoryRef = db.collection('categories').doc(categoryUID);

            await categoryRef.delete();
        } catch (err) {
            throw new Error(err.message);
        }
    }
}

module.exports = new CategoryService();