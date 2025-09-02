const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

// const serviceAccount = JSON.parse(process.env.FB);
const serviceAccount = require('./jobs-4c9e3-firebase-adminsdk-fbsvc-63b455713f.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    })
}

const auth = admin.auth();
const db = admin.firestore();
const Timestamp = admin.firestore.Timestamp;

module.exports = { db, auth, admin, Timestamp };