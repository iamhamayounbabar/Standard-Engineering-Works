import './index.css'
import Navbar from './components/Navbar'
import Inventory from './components/Inventory'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Users from './components/Users';
import Login from './components/Login';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from './firebase/firebase';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { collection, getDocs, getFirestore } from "firebase/firestore";


export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [routeLoading, setrouteLoading] = useState(true);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      setrouteLoading(true);
      if (user) {
        if (user.email != 'admin@siftowhiz.com' && await fetchUserList(user.email)) {
          await signOut(auth);
          if (window.location.href !== window.location.origin + '/') {
            window.location.href = window.origin;
          }
        }
        setLoggedIn(true)
        if (user.email == 'admin@siftowhiz.com') {
          setAdmin(true)
        }
        else {
          setAdmin(false);
          if (window.location.href === (window.location.origin + '/users')) {
            window.location.href = window.origin + '/inventory';
          }
        }
        if (window.location.href === (window.location.origin + '/')) {
          window.location.href = window.origin + '/inventory';
        }
      } else {
        setLoggedIn(false)
        if (window.location.href !== window.location.origin + '/') {
          window.location.href = window.origin;
        }
      }
      setrouteLoading(false);
    });
  }, [])

  async function fetchUserList(email) {
    const db = getFirestore();
    const usersCollection = collection(db, 'users');

    try {
      const querySnapshot = await getDocs(usersCollection);
      let userList = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        userList.push(userData);
      });

      let user = userList.filter(f => f.email == email);
      if (user.length == 0) {
        return true;
      }
      return false;

    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  return (
    <div className='container mx-auto'>
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

        {!routeLoading &&
          <>
            {loggedIn &&
              <Navbar admin={admin} />
            }
            <Routes>
              {loggedIn &&
                <>
                  <Route exact path='inventory' element={<Inventory admin={admin} />} />
                  <Route path='users' element={<Users />} />
                </>}
              {!loggedIn &&
                <Route path='/' element={<Login />} />
              }
            </Routes>
          </>
        }
      </BrowserRouter>
    </div>
  )
}
