// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCPZBtSCz2063rKsR7m5uDWU-u_jX4OZUQ",
  authDomain: "little-eye-fceb4.firebaseapp.com",
  projectId: "little-eye-fceb4",
  storageBucket: "little-eye-fceb4.appspot.com",
  messagingSenderId: "478365975437",
  appId: "1:478365975437:web:c1c13dbf6df1a0242533c4",
  measurementId: "G-MT21H62W8J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// 'file' comes from the Blob or File API
export const uploadImage = (file) => {
  const storageRef = ref(storage, "images/test.jpg");
  // ref(`/images`).putString(file, "base64", { contentType: "image/jpg" });

  uploadString(storageRef, file, "data_url").then((snapshot) => {
    console.log("Uploaded a data_url string!");
  });
};
