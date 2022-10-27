import Image from "next/image";
import { useContext, useEffect } from "react";
import SiteContext from "../../lib/site-context";
import styles from '../../styles/App.module.scss';
import { getAuth, signOut } from 'firebase/auth'
import { firebaseApp } from "../../lib/firebase";

const tabs = ["Dashboard", "Map", "Events", "Settings"];

export default function Navigator({ tab, setTab }) {
    let { place, setPlace, setPageTitle } = useContext(SiteContext);
    let fauth = getAuth(firebaseApp);

    const logout = () => {
        signOut(fauth);
        localStorage.removeItem("place");
        setPlace(undefined);
    }

    useEffect(() => {
        setPageTitle(place.name + " Admin");
    }, []);

    return (
        <div className={styles.nav}>
            <div className={styles.up}>
                <Image src="/logo1.png" width={70} height={70} />
                <h1 title={place.name}>{place.name}</h1>
                <button title="Logout" onClick={logout}><Image src="/door-open.svg" width={30} height={30} /></button>
            </div>

            <div className={styles.down}>
                {tabs.map((v, i) => <button onClick={() => setTab(i)} style={i === tab ? { opacity: 1 } : undefined} key={i}>{v}</button>)}
            </div>
        </div>
    );
}