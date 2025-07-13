// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCfliXHpA85IPGUc1CPKitrMQFf2EmX1_8",
  authDomain: "taskbuddy-bytebros.firebaseapp.com",
  projectId: "taskbuddy-bytebros",
  storageBucket: "taskbuddy-bytebros.appspot.com", // Sửa lại địa chỉ storageBucket đúng cú pháp
  messagingSenderId: "367870534189",
  appId: "1:367870534189:web:d032eea48ddc816f408ea4",
  measurementId: "G-14DFT5Q565"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// const analytics = getAnalytics(app);