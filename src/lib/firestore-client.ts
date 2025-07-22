
"use client";

import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  type Unsubscribe,
  type Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import type { ConceptMapData, ConceptMapSummary } from "@/types";

const mapsCollection = collection(db, "conceptMaps");

// Helper to safely convert Firestore Timestamps to JS Dates
const toDate = (timestamp: Timestamp | Date): Date => {
    return timestamp instanceof Date ? timestamp : timestamp.toDate();
}

// Get a real-time stream of a user's concept maps (summary)
export function getUserConceptMaps(
  userId: string,
  callback: (maps: ConceptMapSummary[]) => void
): Unsubscribe {
  const q = query(
    mapsCollection,
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const maps: ConceptMapSummary[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      maps.push({
        id: doc.id,
        title: data.title || "Untitled Map",
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      });
    });
    callback(maps);
  });

  return unsubscribe;
}

// Get a real-time stream for a single concept map
export function getConceptMap(
  mapId: string,
  callback: (map: ConceptMapData | null) => void
): Unsubscribe {
  const docRef = doc(db, "conceptMaps", mapId);
  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const mapData: ConceptMapData = {
        title: data.title,
        sourceText: data.sourceText,
        nodes: data.nodes,
        edges: data.edges,
        userId: data.userId,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      };
      callback(mapData);
    } else {
      callback(null);
    }
  });
  return unsubscribe;
}
