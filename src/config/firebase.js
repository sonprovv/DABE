const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

const serviceAccount = JSON.parse(process.env.FB);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    })
}

const auth = admin.auth();
const db = admin.firestore();

module.exports = { db, auth, admin };