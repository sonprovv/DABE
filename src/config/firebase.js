const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

const serviceAccount = JSON.parse(process.env.FB);
// const serviceAccount = require('./jobs-4c9e3-firebase-adminsdk-fbsvc-63b455713f.json');

console.log('🔧 Đang khởi tạo Firebase Admin...');

// Kiểm tra thông tin cấu hình
console.log('⚙️ Cấu hình Firebase:', {
  projectId: serviceAccount.project_id,
  databaseURL: process.env.FIREBASE_REALTIME_URL || "https://jobs-4c9e3-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_REALTIME_URL || "https://jobs-4c9e3-default-rtdb.asia-southeast1.firebasedatabase.app/"
    });
    console.log('✅ Đã khởi tạo Firebase Admin thành công');
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo Firebase Admin:', error);
    process.exit(1);
  }
}

const auth = admin.auth();
const db = admin.firestore();
const realtimeDb = admin.database();
const Timestamp = admin.firestore.Timestamp;
const FieldValue = admin.firestore.FieldValue;
const messaging = admin.messaging();

// Kiểm tra kết nối Firestore
db.listCollections()
  .then(collections => {
    console.log(`📚 Kết nối Firestore thành công, có ${collections.length} collections`);
  })
  .catch(error => {
    console.error('❌ Lỗi kết nối Firestore:', error);
  });

// Kiểm tra kết nối Realtime Database
realtimeDb.ref('.info/connected').once('value')
  .then(snap => {
    console.log(`🔌 Kết nối Realtime Database: ${snap.val() ? 'Đã kết nối' : 'Mất kết nối'}`);
  })
  .catch(error => {
    console.error('❌ Lỗi kết nối Realtime Database:', error);
  });

module.exports = { db, auth, admin, Timestamp, FieldValue, realtimeDb, messaging };