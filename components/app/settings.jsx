import { getAuth, updateEmail } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { firebaseApp } from '../../lib/firebase';
import http from '../../lib/http';
import SiteContext from '../../lib/site-context';
import styles from '../../styles/App.module.scss';

export default function Settings() {
    let { place, setPlace } = useContext(SiteContext);
    let router = useRouter();
    let client = new http(router);
    let fauth = getAuth(firebaseApp);

    const applyChanges = async (e) => {
        let email = e.target.email.value.trim();
        let name = e.target.name.value.trim();
        let address = e.target.address.value.trim();

        if (email.length === 0 || name.length === 0 || address.length === 0) return alert("Empty fields");

        if (name !== place.name) await client.axios({ method: "post", data: { column: "name", value: name } });
        if (address !== place.location) await client.axios({ method: "post", data: { column: "location", value: address } });

        // Change email
        if (email !== place.email) {
            await updateEmail(fauth.currentUser, email);
            alert("Confirmation email sent. Please check your inbox.");
        }

        setPlace({ email, name, location: address });
    };

    return (
        <div className={styles.settings}>
            <form onSubmit={applyChanges}>
                <input defaultValue={fauth.currentUser.email} name="email" autoCapitalize='none' autoCorrect='none' placeholder='Email' />
                <input defaultValue={place.name} name="name" autoCapitalize='none' autoCorrect='none' placeholder='Name' />
                <input defaultValue={place.location} name="address" autoCapitalize='none' autoCorrect='none' placeholder='Address' />
                <button>Save Changes</button>
            </form>
        </div>
    );
}