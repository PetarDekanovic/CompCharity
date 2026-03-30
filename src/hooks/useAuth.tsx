import { useState, useEffect, createContext, useContext } from "react";
import { auth, db, doc, getDoc, onAuthStateChanged, setDoc, serverTimestamp } from "../lib/firebase";
import { User as FirebaseUser } from "firebase/auth";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for backend token first
    const backendToken = localStorage.getItem('token');
    const backendUserStr = localStorage.getItem('user');
    
    if (backendToken && backendUserStr) {
      try {
        const backendUser = JSON.parse(backendUserStr);
        setUser(backendUser);
        setLoading(false);
      } catch (e) {
        console.error("Failed to parse backend user", e);
      }
    }

    // 2. Check Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user exists in Firestore, if not create them
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        let role = "user";
        if (userDoc.exists()) {
          role = userDoc.data().role;
        } else {
          // Create user document
          await setDoc(userDocRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: "user",
            createdAt: serverTimestamp(),
          });
        }

        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "User",
          role: role,
          photoURL: firebaseUser.photoURL || undefined,
        });
      } else if (!backendToken) {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
