export const db = null as any;
export const auth = {
    currentUser: null,
    signOut: async () => {},
} as any;
export const googleProvider = null as any;
export const signInWithGoogle = async () => {};
export const logout = async () => {};
export const OperationType = { CREATE: 'create', UPDATE: 'update', DELETE: 'delete' };
export function handleFirestoreError(e: any) { console.error(e); }
export const Timestamp = { now: () => Date.now() } as any;
export const serverTimestamp = () => Date.now();
export const collection = () => ({}) as any;
export const doc = () => ({}) as any;
export const setDoc = async () => {};
export const getDoc = async () => ({ exists: () => false, data: () => ({}) }) as any;
export const getDocs = async () => ({ docs: [] }) as any;
export const query = () => ({}) as any;
export const where = () => ({}) as any;
export const onSnapshot = () => () => {};
export const addDoc = async () => {};
export const updateDoc = async () => {};
export const deleteDoc = async () => {};
export const onAuthStateChanged = (_auth: any, cb: any) => { cb(null); return () => {}; };
