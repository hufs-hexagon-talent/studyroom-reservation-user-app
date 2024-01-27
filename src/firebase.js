import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBjrOFeptRQHt7MfX33cjFmNaXfcfAMSSI",
  authDomain: "studyroom-reservation.firebaseapp.com",
  projectId: "studyroom-reservation",
  storageBucket: "studyroom-reservation.appspot.com",
  messagingSenderId: "634587302048",
  appId: "1:634587302048:web:dfddff7b177a0c087be1c5",
  measurementId: "G-GRLMVH60L0"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const fs = getFirestore(app);