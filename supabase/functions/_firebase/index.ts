import {
    type AppOptions,
    cert,
    getApp,
    getApps,
    initializeApp,
    type ServiceAccount,
} from "npm:firebase-admin/app";
import firebaseServiceAccount from "./firebase.json" with {
    type: "json",
};
import {
    getMessaging,
    type MulticastMessage,
} from "npm:firebase-admin/messaging";

const credentials = firebaseServiceAccount as ServiceAccount;

const firebaseConfig: AppOptions = {
    credential: cert(credentials),
};

export const firebaseAdminApp = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

export const sendNotification = async (message: MulticastMessage) => {
    const messaging = getMessaging(firebaseAdminApp);

    try {
        const response = await messaging.sendEachForMulticast(message);
        if (response.failureCount === 0) {
            return [];
        }

        const { tokens = [] } = message;

        const failedTokens: string[] = [];

        response.responses.forEach((response, index) => {
            if (!response.success) {
                failedTokens.push(tokens[index]);
            }
        });

        return failedTokens;
    } catch (error) {
        console.error(error);
    }

    return [];
};
