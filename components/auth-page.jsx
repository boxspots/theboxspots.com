import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import SiteContext from '../lib/site-context';

export default function AuthPage({ unauthed, authed, redirect, ...props }) {
    let { place } = useContext(SiteContext);
    let router = useRouter();

    useEffect(() => {
        if (authed && Boolean(place) && (!place.name || !place.location)) router.replace("/signup/info");
        else if ((unauthed && Boolean(place)) || (authed && !Boolean(place))) router.replace(redirect);
    }, [place]);

    // TODO - loading screen
    if ((unauthed && Boolean(place)) || (authed && !Boolean(place)))
        return <></>

    return <div {...props} />
}