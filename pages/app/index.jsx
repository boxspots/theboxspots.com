import { useContext, useState } from 'react';
import AuthPage from '../../components/auth-page';
import Navigator from '../../components/app/navigator';
import Dashboard from '../../components/app/dashboard';
import Map from '../../components/app/map';
import Settings from '../../components/app/settings';
import SiteContext from '../../lib/site-context';

const tabs = [<Dashboard />, <Map />, <Settings />];

export default function App() {
    let [tab, setTab] = useState(0);
    let { maps } = useContext(SiteContext);

    // TODO - loading screen
    return (
        <AuthPage authed redirect="/login">
            <Navigator tab={tab} setTab={setTab} />

            {maps ? tabs[tab] : undefined}
        </AuthPage>
    );
}