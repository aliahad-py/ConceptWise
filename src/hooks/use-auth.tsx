
"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  UserCredential,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, pass: string, firstName: string, lastName: string) => Promise<UserCredential>;
  signIn: (email: string, pass: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => { throw new Error("SignUp not implemented"); },
  signIn: async () => { throw new Error("SignIn not implemented"); },
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const token = await user.getIdToken();
        document.cookie = `firebaseIdToken=${token}; path=/; max-age=3600`;
      } else {
        document.cookie = 'firebaseIdToken=; path=/; max-age=-1';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const refreshUser = async () => {
    await user?.reload();
    const refreshedUser = auth.currentUser;
    setUser(refreshedUser);
  };

  const createUserDocument = async (user: User, data: Omit<UserProfile, 'email' | 'createdAt'>) => {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      ...data,
      email: user.email,
      createdAt: Timestamp.now(),
    }, { merge: true });
  };

  const signUp = async (email: string, pass: string, firstName: string, lastName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    if (user) {
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`.trim(),
      });
      await createUserDocument(user, { firstName, lastName });
    }
    return userCredential;
  };

  const signIn = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push("/");
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
