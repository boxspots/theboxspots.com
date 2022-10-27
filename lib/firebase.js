import { initializeApp, getApp, getApps } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyAneDX04pd0Te-RVOmsPfMgCzt7ir3QtnI",
    authDomain: "boxspots.firebaseapp.com",
    projectId: "boxspots",
    storageBucket: "boxspots.appspot.com",
    messagingSenderId: "741864563268",
    appId: "1:741864563268:web:f17e3b307b1ff997ab9211",
    measurementId: "G-NEJYRM4XL5",
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export { firebaseApp }