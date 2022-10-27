import { useRouter } from "next/router";
import { useContext, useState } from "react";
import AuthPage from "../../components/auth-page";
import SiteContext from "../../lib/site-context";
import styles from '../../styles/Info.module.scss';
import http from "../../lib/http";

export default function Info() {
    let { place, setPlace } = useContext(SiteContext);
    let [error, setError] = useState(undefined);
    let router = useRouter();
    let client = new http(router);

    // TODO - loading
    if (place?.name && place?.location) {
        router.replace("/app");
        return <></>;
    }

    const submitForm = async (e) => {
        e.preventDefault();

        let address = e.target.address.value;
        let name = e.target.name.value;

        if (address.length === 0 || name.length === 0) return setError("Please fill up the form.");

        try {
            await client.axios({ method: "post", url: "/api/place", data: { column: "name", value: name } });
            await client.axios({ method: "post", url: "/api/place", data: { column: "location", value: address } });

            setPlace({ ...place, name, location: address });
            localStorage.setItem(JSON.stringify({ ...place, name, location: address }));
        } catch (error) { return setError("Unknown error occured.") }
    }

    // TODO - highlight red if empty or address not confirmed
    return (
        <AuthPage authed redirect="/signup" className={styles.page}>
            <form onSubmit={submitForm} className={styles.form}>
                <h1>Organization Info</h1>
                <p>Design your journey with Box Spots</p>

                <h3>{error}</h3>

                <div className={styles.line} />

                <input id="address" placeholder='Address' autoCapitalize='none' autoCorrect='none' />

                <input id="name" placeholder='Name of organization' autoCapitalize='none' autoCorrect='none' />

                <button>Get Started!</button>
            </form>
        </AuthPage>
    );
}