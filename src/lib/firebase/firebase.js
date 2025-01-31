// Import the functions you need from the SDKs you need
import { browser } from '$app/environment';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAyJx8fgQcvu-fRfoDoRvJL1qFSGuKJIT4",
  authDomain: "gopher-hours.firebaseapp.com",
  projectId: "gopher-hours",
  storageBucket: "gopher-hours.firebasestorage.app",
  messagingSenderId: "877547582450",
  appId: "1:877547582450:web:c216a2c100a89e165d716b",
  measurementId: "G-LJGZ8ZNQH2"
};

export const app = initializeApp(firebaseConfig);