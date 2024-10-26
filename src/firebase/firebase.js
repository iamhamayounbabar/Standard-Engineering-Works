import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; 
import 'firebase/firestore';


// for production 

// const firebaseConfig = {
//   apiKey: "AIzaSyABiTdyG_xeHhPhF7KmafGm4mVv0gSE6y4",
//   authDomain: "standard-engineering-work.firebaseapp.com",
//   projectId: "standard-engineering-work",
//   storageBucket: "standard-engineering-work.appspot.com",
//   messagingSenderId: "912299241443",
//   appId: "1:912299241443:web:cbe3870d89d21ad24dfad6",
//   measurementId: "G-VNKH9D98BX"
// };



// for testing 

const firebaseConfig = {
  apiKey: "AIzaSyCDa0NlHmlVNLG-5rJu-CyuGe_rBh-y7G4",
  authDomain: "standard-engineering-works-dev.firebaseapp.com",
  projectId: "standard-engineering-works-dev",
  storageBucket: "standard-engineering-works-dev.appspot.com",
  messagingSenderId: "168919922912",
  appId: "1:168919922912:web:752ef96afddc14921d3885",
  measurementId: "G-6RDQYF7QY2"
};


export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);