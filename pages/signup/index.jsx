import { useRef, useState } from 'react';
import styles from '../../styles/Signup.module.scss';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { firebaseApp } from '../../lib/firebase';
import AuthPage from '../../components/auth-page';

export default function SignUp() {
    let [error, setError] = useState("");

    const submitForm = async (e) => {
        e.preventDefault();

        let email = e.target.email.value;
        let password = e.target.password.value;
        let rpassword = e.target.rpassword.value;

        if (password !== rpassword) return setError("Passwords do not match");

        try {
            let auth = getAuth(firebaseApp);
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setError(error.message);
        }
    }

    // TODO - highlight red if empty
    // TODO - animate arrow to move up and down
    return (
        <AuthPage unauthed redirect="/app">
            <form className={styles.page} onSubmit={submitForm}>
                <div />

                <div className={styles.form}>
                    <h1>Create an Organization</h1>
                    <p>Design your journey with Box Spots</p>

                    <h3>{error}</h3>

                    <div />

                    <input id="email" placeholder='Email' autoCapitalize='none' autoCorrect='none' />

                    <input id="password" placeholder='Password' autoCapitalize='none' autoCorrect='none' type="password" />

                    <input id="rpassword" placeholder='Retype Password' autoCapitalize='none' autoCorrect='none' type="password" />
                </div>

                <div className={styles.next}>
                    <button>
                        <i />
                    </button>
                </div>
            </form >
        </AuthPage >
    );
}