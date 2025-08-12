const admin = require('firebase-admin');

const serviceAccount = require('./jobs-4c9e3-firebase-adminsdk-fbsvc-1605124f51.json');

const storageBucket = 'jobs-4c9e3.appspot.com';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: storageBucket
    })
}

const auth = admin.auth();
const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { db, auth, admin, bucket };