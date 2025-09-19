// lib/firebaseClient.js
import { initializeApp, getApps, getApp } from "firebase/app";
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

function getFirebaseApp() {
	if (!firebaseConfig.apiKey) {
		throw new Error("Faltan variables de entorno de Firebase");
	}
	return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function rtdb() {
	const app = getFirebaseApp();
	return getDatabase(app);
}

// Helpers para uso en componentes/API
export const dbRef = ref;
export const dbGet = get;
export const dbSet = set;
export const dbUpdate = update;
export const dbRemove = remove;
export const dbPush = push;
