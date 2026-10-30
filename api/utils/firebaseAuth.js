import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export async function verifyFirebaseToken(token) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) throw new Error('Firebase project ID missing');
    const app = getApps().find(item => item.name === 'rl-auth') || initializeApp({ projectId }, 'rl-auth');
    // Admin SDK valida firma, expiración, issuer y audience del proyecto.
    return getAuth(app).verifyIdToken(token);
}
