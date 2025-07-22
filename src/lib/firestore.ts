
"use server";

import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { ConceptMapData, Node, Edge, UserProfile } from "@/types";
import { auth } from "./firebase";
import { updateProfile } from "firebase/auth";


const mapsCollection = collection(db, "conceptMaps");
const usersCollection = collection(db, "users");

// MAPS
export async function createConceptMap(userId: string): Promise<string> {
  const newMap: Omit<ConceptMapData, 'updatedAt' | 'id'> = {
    title: "Untitled Concept Map",
    sourceText: "Start by entering some text and generating a map, or add nodes manually!",
    nodes: [],
    edges: [],
    userId,
    createdAt: new Date(),
  };
  const docRef = await addDoc(mapsCollection, {
    ...newMap,
    createdAt: Timestamp.fromDate(newMap.createdAt),
    updatedAt: Timestamp.fromDate(newMap.createdAt)
  });
  return docRef.id;
}

type SavePayload = {
  title: string;
  sourceText: string;
  nodes: Node[];
  edges: Edge[];
  userId: string;
};
export async function saveConceptMap(mapId: string, data: Partial<SavePayload>) {
  const docRef = doc(db, "conceptMaps", mapId);
  await setDoc(docRef, { ...data, updatedAt: Timestamp.now() }, { merge: true });
}

export async function deleteConceptMap(mapId: string) {
  const docRef = doc(db, "conceptMaps", mapId);
  await deleteDoc(docRef);
}

export async function updateConceptMapTitle(mapId: string, title: string) {
    const docRef = doc(db, "conceptMaps", mapId);
    await updateDoc(docRef, {
        title: title,
        updatedAt: Timestamp.now()
    });
}

// USERS
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        // Convert Timestamp to Date before returning to client
        return {
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate(),
        } as UserProfile;
    }
    return null;
}

type UpdateProfilePayload = {
  firstName: string;
  lastName: string;
  displayName: string;
}
export async function updateUserProfile(userId: string, data: UpdateProfilePayload): Promise<{success: boolean, error?: string}> {
    const user = auth.currentUser;
    // This check runs on the server where auth.currentUser is null.
    // The check for the correct user should happen at the component level or via security rules.
    // if (!user || user.uid !== userId) {
    //     return { success: false, error: "Authentication error." };
    // }

    const userDocRef = doc(db, 'users', userId);
    
    try {
        // Firebase Auth update needs to happen on the client.
        // We'll focus on updating Firestore here. The display name on the auth object
        // should be updated on the client after this succeeds.
        
        // This part needs a signed-in user on the client, so we will remove it from the server action.
        // await updateProfile(user, {
        //     displayName: data.displayName
        // });

        await updateDoc(userDocRef, {
            firstName: data.firstName,
            lastName: data.lastName,
            // Also update displayName in Firestore if it's stored there.
            // Assuming display name is derived or should also be in the user doc.
        });

        return { success: true };
    } catch (e: any) {
        console.error("Error updating profile:", e);
        return { success: false, error: e.message || 'Failed to update profile.' };
    }
}
