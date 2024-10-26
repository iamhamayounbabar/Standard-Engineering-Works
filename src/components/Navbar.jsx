/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { redirect } from "react-router-dom";
import { auth } from '../firebase/firebase';

export default function Navbar({ admin }) {

    const handleLogout = async () => {

        try {
            await auth.signOut()
            return redirect('/');
        } catch (error) {
            console.error("Logout error:", error);
        }
    }

    return (
        <>
            <nav className="navbar navbar-expand-lg ">
                <div className="container-fluid">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
                        <h2 className="navbar-brand m-0 me-3 text-center">Standard Engineering Works</h2>
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0 d-flex gap-3 align-items-center">
                            <li className="nav-item pointer">
                                <Link to={'inventory'} className="nav-link active" aria-current="page">Inventory</Link>
                            </li>
                            {admin &&
                                <li className="nav-item pointer">
                                    <Link className="nav-link active" to={'users'} aria-current="page">Users</Link>
                                </li>
                            }
                        </ul>
                        <div className="ms-auto pointer">
                            <Link className="btn btn-warning" to={'/'} onClick={handleLogout}>Logout</Link>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}

