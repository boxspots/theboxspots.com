import Head from 'next/head';
import { useEffect, useState } from 'react';
import SiteContext from '../lib/site-context';
import '../styles/globals.css';
import { getAuth } from "firebase/auth";
import { firebaseApp } from '../lib/firebase';
import 'leaflet-geosearch/dist/geosearch.css';
import axios from 'axios';

export default function MyApp({ Component, pageProps }) {
    let [place, setPlace] = useState(undefined);
    let [maps, setMaps] = useState(undefined);
    let [events, setEvents] = useState(undefined);
    let [pageTitle, setPageTitle] = useState("Box Spots");

    useEffect(() => {
        let p = localStorage.getItem("place");
        if (p) setPlace(JSON.parse(p));

        let fauth = getAuth(firebaseApp);
        let unsub = fauth.onAuthStateChanged(fb => fb ? onLogin(fb) : undefined);

        return () => unsub();
    }, []);

    const onLogin = async (fb) => {
        let token = await fb.getIdToken(true);
        let { data: p } = await axios.post(`/api/auth/place`, undefined, { headers: { authorization: `bearer ${token}` } });
        let { data: l } = await axios.get(`/api/place`, { headers: { authorization: `bearer ${token}` } });

        setMaps(l.maps);
        setEvents(l.events);

        localStorage.setItem("place", JSON.stringify(p));
        setPlace(p);
    }

    return (
        <SiteContext.Provider value={{ place, setPlace, maps, setMaps, events, setEvents, setPageTitle }}>
            <Head>
                <title>{pageTitle}</title>
            </Head>

            <Component {...pageProps} />
        </SiteContext.Provider>
    );
}