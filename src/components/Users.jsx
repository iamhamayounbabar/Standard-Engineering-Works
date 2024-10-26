import React from "react";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { addDoc, collection, deleteDoc, getDocs, getFirestore, query, where } from "firebase/firestore";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { signInWithEmailAndPassword } from 'firebase/auth';


export default class Users extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            users: [],
            isLoading: false,
        }
    }

    addUser = async () => {
        this.setState({ isLoading: true });
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                this.state.email,
                this.state.password
            );
            const user = userCredential.user;
            const db = getFirestore();
            const usersCollection = collection(db, 'users');

            const userData = {
                email: user.email,
                created: new Date()
            };
            await addDoc(usersCollection, userData);
            this.setState({ email: "", password: "" });
            toast.success("Successfully Create User");
        } catch (error) {
            toast.error(error.message);
        } finally {
            this.setState({ isLoading: false }); // Set isLoading to false whether success or error
        }
    };

    deleteUser = async (email) => {
        const db = getFirestore();
        const usersCollection = collection(db, 'users');
        const userQuery = query(usersCollection, where('email', '==', email));

        try {
            const userQuerySnapshot = await getDocs(userQuery);

            if (userQuerySnapshot.size === 0) {
                toast.error('User not found in the database.');
                return;
            }

            // Delete the user data from Firestore
            await deleteDoc(userQuerySnapshot.docs[0].ref);
            toast.success('User data removed from Firestore.');
        } catch (error) {
            toast.error("Error deleting user data from Firestore: " + error.message);
        }
    }

    fetchUserList = async () => {
        const db = getFirestore();
        const usersCollection = collection(db, 'users');

        try {
            const querySnapshot = await getDocs(usersCollection);
            const userList = [];

            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                userList.push(userData);
            });
            userList.sort((a, b) => b.created - a.created);
            this.setState({ userList });
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }

    isButtonDisabled = () => {
        return !(this.state.email && this.state.password);
    }

    handleInputChange = (field, value) => {
        this.setState({ [field]: value });
    }

    componentDidMount() {
        this.fetchUserList();
    }

    handleDeleteAndFetch = async (email) => {
        try {
            await this.deleteUser(email);
            await this.fetchUserList();
        } catch (error) {
            // Handle any errors here
        }
    }

    render() {
        return (
            <>
                <button type="button" className="btn btn-success mt-2" data-bs-toggle="modal" data-bs-target="#AddUser">
                    Add User
                </button>
                <div className="modal fade" id="AddUser" tabIndex="-1" aria-labelledby="AddUserLabel" aria-hidden="true">
                    <div className="modal-dialog modal-md">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="AddUserLabel">Add User</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-12">
                                        <div className="form-group mt-3">
                                            <label className="control-label">Email</label>
                                            <input
                                                type="text"
                                                className="form-control populate mt-2"
                                                value={this.state.email}
                                                onChange={(e) => this.handleInputChange('email', e.target.value)} // Correctly call handleInputChange
                                                placeholder="Enter Your Email"
                                            />
                                        </div>
                                        <div className="form-group mt-3">
                                            <label className="control-label">Password</label>
                                            <input
                                                type="password"
                                                className="form-control populate mt-2"
                                                value={this.state.password}
                                                onChange={(e) => this.handleInputChange('password', e.target.value)} // Correctly call handleInputChange
                                                placeholder="Enter Password"
                                            />
                                        </div>
                                        <button className="btn btn-success mt-3 w-100 p-2" type="button" disabled={this.isButtonDisabled()} onClick={this.addUser}>
                                            {this.state.isLoading ? (
                                                <div className="spinner-border text-light" role="status">
                                                </div>
                                            ) : (
                                                "Add"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    <div className="">
                        <h4>Users List</h4>
                        <div className="p-2 d-flex gap-3 align-items-center">
                            <h5>#</h5>
                            <h5>User Email</h5>
                        </div>
                        <div>
                            {this.state.userList?.map((user, index) => (
                                <div className="p-2 d-flex gap-3 align-items-center" key={index}>
                                    <span>{index + 1}</span>
                                    <span className="ms-1">{user.email}</span>
                                    <button className="btn btn-warning" onClick={() => this.deleteUser(user.email)}>
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        )
    }

}