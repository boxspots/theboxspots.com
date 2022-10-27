import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { getAuth, User } from "firebase/auth";
import { firebaseApp } from "./firebase";
import { NextRouter } from "next/router";

export default class http {
    // Private declaration
    #router;
    #fauth;

    /**
     * Summons a custom axios handler.
     * @param {NextRouter} router - Next.JS router component
     */
    constructor(router) {
        this.#fauth = getAuth(firebaseApp);
        this.#router = router;
    }

    /**
     * Internal axios client
     * @param {AxiosRequestConfig} config - Axios config
     * @returns {Promise<AxiosResponse>}
     */
    async axios(config) {
        try {
            // Is logged in?
            if (!this.#fauth?.currentUser) throw "logged out";

            // Append token
            let token = await this.#fauth.currentUser.getIdToken(true);
            config.headers = { ...config?.headers, authorization: `bearer ${token}` };

            let resp = await axios(config);
            return resp;
        } catch (error) {
            if (error === "logged out" || error?.response?.status === 403) {
                localStorage.removeItem("place");
                this.#fauth.signOut();
                this.#router.replace("/login");
            } else return error;
        }
    }
}