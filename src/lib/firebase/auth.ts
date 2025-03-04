import { app } from "./firebase";
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { goto } from "$app/navigation";
import { addNewUser } from "./db";
import type { User } from "firebase/auth";

let auth = getAuth(app);
export let user = auth.currentUser;

export async function ensureAuth() {
    await auth.authStateReady();
    user = auth.currentUser;
}

export async function redirectIfNotLoggedIn() {
    await ensureAuth();
    if (!user) {
        goto("/");
    }
}

export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    await ensureAuth();
    addNewUser(user);

    goto("/home");
}

export async function logout() {
    await auth.signOut();
    goto("/");
}