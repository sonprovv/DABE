const { db } = require("../config/firebase");
const AccountService = require('../services/AccountService');
const UserService = require('../services/UserService');

class ReviewService {
    constructor() {}

    async createReview(data) {
        try {
            const docRef = await db.collection('reviews').add(data);

            return { uid: docRef.id, ...data };
        } catch (err) {
            console.log(err.message);
            throw new Error("Tạo đánh giá không thành công")
        }
    }

    async getExperienceOfWorker(workerID) {
        try {
            const experiences = {
                'CLEANING': {
                    stars: [],
                    reviews: []
                },
                'HEALTHCARE': {
                    stars: [],
                    reviews: []
                },
            };

            const snapshot = await db.collection('reviews').where('workerID', '==', workerID).get();

            for (const doc of snapshot.docs) {
                const accountDoc = await AccountService.getByUID(doc.data().userID);
                const userDoc = await UserService.getByUID(doc.data().userID);
                userDoc['email'] = accountDoc.email;
                userDoc['role'] = accountDoc.role;

                const review = {
                    uid: doc.id,
                    user: userDoc,
                    workerID: doc.data().workerID,
                    isReview: doc.data().isReview,
                    rating: doc.data().rating,
                    comment: doc.data().comment,
                    servicetype: doc.data().serviceType
                }

                experiences[doc.data().serviceType]['stars'].push(doc.data().rating);
                experiences[doc.data().serviceType]['reviews'].push(review);
            }

            const result = {};
            for (const key of Object.keys(experiences)) {
                if (experiences[key]['reviews'].length===0) {
                    continue;
                }

                const avgOfStars = experiences[key]['stars'].reduce((sum, num) => sum + num, 0) / experiences[key]['stars'].length;
                const info = {
                    rating: parseFloat(avgOfStars.toFixed(1)),
                    reviews: experiences[key]['reviews']
                }
                result[key] = info
            }

            return result;
        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy thông tin")
        }
    }

    async getReviewOfWorker(workerID, serviceType) {
        try {

        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy thông tin")
        }
    }
}

module.exports = new ReviewService();