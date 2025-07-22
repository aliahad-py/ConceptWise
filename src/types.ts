
import type { Timestamp } from "firebase/firestore";

export type Node = {
  id: string;
  position: { x: number; y: number };
  data: { 
    label: string;
    note?: string;
  };
  width?: number;
  height?: number;
  collapsed?: boolean;
};

export type Edge = {
  id: string;
  source: string;
  target: string;
  label?: string;
};

export type ConceptMapData = {
  title: string;
  sourceText: string;
  nodes: Node[];
  edges: Edge[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ConceptMapSummary = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date; // Changed from Timestamp to Date
}
