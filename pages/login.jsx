import Image from 'next/image';
import styles from '../styles/Login.module.scss';
import { useState } from 'react';
import Link from 'next/link';
import { signInWithEmailAndPassword, browserLocalPersistence, setPersistence, getAuth } from 'firebase/auth';
import { firebaseApp } from '../lib/firebase';
import AuthPage from '../components/auth-page';

export default function Login() {
    let [err, setErr] = useState(false);
    let auth = getAuth(firebaseApp);

    const formSubmitted = async (e) => {
        e.preventDefault();

        let email = e.target.email.value;
        let password = e.target.password.value;

        try {
            await setPersistence(auth, browserLocalPersistence);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setErr(true);
        }
    }

    // TODO - highlight red if empty
    return (
        <AuthPage className={styles.page} unauthed redirect="/app">
            <div className={styles.logo}>
                <Link href="/"><a><Image src="/logo1.png" alt="" width={60} height={60} /></a></Link>
            </div>

            <div className={styles.login}>
                <h1>Attraction Management</h1>

                <p className={err ? styles.error : undefined} >{err ? "Invalid credentials" : "Please ask your attraction owner for credentials"}</p>

                <div className={styles.border} />

                <form onSubmit={formSubmitted}>
                    <input id='email' autoCapitalize='none' autoCorrect='none' placeholder='Email' />
                    <input id='password' autoCapitalize='none' autoCorrect='none' type="password" placeholder='Password' />

                    <button>Login</button>
                </form>
            </div>

            <div className={styles.signup}>
                <h1>First Time Here?</h1>
                <p>Create your organization account to start setting up spots!</p>
                <Link href="/signup"><a>Sign Up</a></Link>
            </div>
        </AuthPage >
    );
}