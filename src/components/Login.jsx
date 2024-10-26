import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase/firebase';
import { toast } from 'react-toastify';


export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                navigate("/inventory");
            })
            .catch((error) => {
                toast.error(error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    return (
        <>
            <div className="row vh-100">
                <div className="col-md-5 mx-auto my-auto">
                    <main>
                        <section>
                            <div className='bg-light shadow p-5 rounded-3'>
                                <div>
                                    <h1 className='text-center'> Login </h1>
                                </div>
                                <form>
                                    <div>
                                        <label htmlFor="email-address" className='mt-3'>
                                            Email address
                                        </label>
                                        <input
                                            id="email-address"
                                            name="email"
                                            type="email"
                                            className='form-control mt-2'
                                            required
                                            placeholder="Email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="password" className='mt-3'>
                                            Password
                                        </label>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            className='form-control mt-2'
                                            required
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                    <button className="btn btn-success mt-3 w-100 p-2" onClick={onLogin} type="submit" disabled={isLoading || !email || !password}>
                                        {isLoading ? (
                                            <div className="spinner-grow spinner-grow-sm" role="status">
                                            </div>
                                        ) : (
                                            "Login"
                                        )}
                                    </button>
                                </form>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </>
    )
}