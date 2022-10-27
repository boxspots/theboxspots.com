import { initializeApp, getApp, getApps, cert as firebaseCredential } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const firebaseAdmin = getApps().length
    ? getApp()
    : initializeApp({
        credential: firebaseCredential({
            projectId: process.env.FB_PROJECT_ID,
            clientEmail: process.env.FB_CLIENT_EMAIL,
            privateKey: process.env.FB_PRIVATE_KEY.replace(/\\n/gm, "\n")
        })
    });

const firebaseAuth = getAuth(firebaseAdmin);

export default firebaseAuth;