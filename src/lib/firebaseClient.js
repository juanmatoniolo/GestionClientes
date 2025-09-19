import { initializeApp, getApps } from "firebase/app";
import {
	getDatabase,
	ref,
	get,
	set,
	update,
	remove,
	push,
} from "firebase/database";

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export function rtdb() {
	const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
	return getDatabase(app);
}

export const dbRef = ref;
export const dbGet = get;
export const dbSet = set;
export const dbPush = push;
export const dbUpdate = update;
export const dbRemove = remove;
