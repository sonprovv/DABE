const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

const serviceAccount = JSON.parse(process.env.FB);
// const serviceAccount = require('./jobs-4c9e3-firebase-adminsdk-fbsvc-63b455713f.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_REALTIME_URL || "https://jobs-4c9e3-default-rtdb.asia-southeast1.firebasedatabase.app/"
    })
}

const auth = admin.auth();
const db = admin.firestore();
const realtimeDb = admin.database();
const Timestamp = admin.firestore.Timestamp;

module.exports = { db, auth, admin, Timestamp, realtimeDb };