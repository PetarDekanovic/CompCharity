// Stub file for Firebase to allow build to succeed after switching to MySQL
export const db = null as any;
export const auth = {
    currentUser: null,
    signOut: async () => {},
    onAuthStateChanged: () => () => {},
} as any;
export const googleProvider = null as any;
export const signInWithGoogle = async () => {};
export const logout = async () => {};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: any) {
    console.error("Firestore error (stub):", error);
}
export const Timestamp = { now: () => Date.now() } as any;
export const serverTimestamp = () => Date.now();
export const collection = () => ({}) as any;
export const doc = () => ({}) as any;
export const setDoc = async () => {};
export const getDoc = async () => ({ exists: () => false, data: () => ({}) }) as any;
export const getDocs = async () => ({ docs: [] }) as any;
export const query = () => ({}) as any;
export const where = () => ({}) as any;
export const orderBy = () => ({}) as any;
export const onSnapshot = () => () => {};
export const addDoc = async () => {};
export const updateDoc = async () => {};
export const deleteDoc = async () => {};
export const arrayUnion = () => ({}) as any;
export const onAuthStateChanged = (_auth: any, cb: any) => { cb(null); return () => {}; };
export const getDocFromServer = async () => ({ exists: () => false }) as any;
