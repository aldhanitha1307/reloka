// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBC93SMRfjJzhZyQz65MnW4YcYjEpbVe4Q",
  authDomain: "trackify-1672d.firebaseapp.com",
  projectId: "trackify-1672d",
  storageBucket: "trackify-1672d.firebasestorage.app",
  messagingSenderId: "691845221808",
  appId: "1:691845221808:web:5d8db9a0a0346789a95a75",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Export untuk digunakan di file lain
window.auth = auth;
window.db = db;
console.log("✅ Firebase loaded");
