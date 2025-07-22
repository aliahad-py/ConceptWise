
"use server";

import { generateConceptMap } from "@/ai/flows/generate-concept-map";
import { improveConceptMap } from "@/ai/flows/improve-concept-map";
import type { Node, Edge } from "@/types";
import { z } from "zod";

const NodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  note: z.string().optional(),
});

const EdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
});

const ConceptMapDataSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

function layoutNodes(nodes: Omit<Node, "position" | "data">[]): Node[] {
  if (nodes.length === 0) return [];
  
  const canvasWidth = 1000;
  const canvasHeight = 800;
  const radius = Math.min(canvasWidth, canvasHeight) / 2 - 100;

  return nodes.map((node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI;
    const x = canvasWidth / 2 + radius * Math.cos(angle);
    const y = canvasHeight / 2 + radius * Math.sin(angle);
    return {
      ...node,
      data: { 
        label: node.label as string,
        note: (node as any).note,
       },
      position: { x, y },
    };
  });
}

export async function generateMapAction(
  text: string
): Promise<{ nodes: Node[]; edges: Edge[] } | { error: string }> {
  if (!text.trim()) {
    return { error: "Input text cannot be empty." };
  }

  try {
    const output = await generateConceptMap({ notes: text });
    
    const mapData = output.conceptMapData;

    const validation = ConceptMapDataSchema.safeParse(mapData);
    if (!validation.success) {
      console.error("AI output validation failed:", validation.error);
      return { error: "The AI returned an unexpected data format. Please try again." };
    }

    const laidOutNodes = layoutNodes(validation.data.nodes);
    const edges = validation.data.edges.map((edge, index) => ({
      ...edge,
      id: `e-${index}`,
    }));

    const nodeIds = new Set(laidOutNodes.map(n => n.id));
    const validEdges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    return { nodes: laidOutNodes, edges: validEdges };
  } catch (e) {
    console.error(e);
    return { error: "An unexpected error occurred while generating the map." };
  }
}

export async function improveMapAction(
  conceptMap: string,
  sourceText: string,
  query: string
): Promise<{ nodes: Node[]; edges: Edge[] } | { error: string }> {
  try {
    const output = await improveConceptMap({ conceptMap, sourceText, query });
    
    const mapData = output.improvedConceptMap;
    
    const validation = ConceptMapDataSchema.safeParse(mapData);

    if (!validation.success) {
      console.error("AI output validation failed for improvement:", validation.error);
      return { error: "The AI returned an unexpected data format for the improved map. Please try again." };
    }

    const currentMap = JSON.parse(conceptMap);
    const currentNodes = currentMap.nodes as Node[];
    const currentPositions = new Map(currentNodes.map(n => [n.id, n.position]));
    
    const laidOutNodes: Node[] = validation.data.nodes.map((newNode, index) => {
      const existingPosition = currentPositions.get(newNode.id);
      if (existingPosition) {
        return {
          ...newNode,
          data: { label: newNode.label, note: newNode.note },
          position: existingPosition,
        };
      }
      // Position new nodes in a predictable circle to avoid randomness
      const angle = (index / validation.data.nodes.length) * 2 * Math.PI;
      const x = 400 + 100 * Math.cos(angle);
      const y = 300 + 100 * Math.sin(angle);
      return {
        ...newNode,
        data: { label: newNode.label, note: newNode.note },
        position: { x, y },
      };
    });

    const edges = validation.data.edges.map((edge, index) => ({
      ...edge,
      id: `e-improved-${index}-${Date.now()}`,
    }));

    const nodeIds = new Set(laidOutNodes.map(n => n.id));
    const validEdges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    return { nodes: laidOutNodes, edges: validEdges };
  } catch (e) {
    console.error(e);
    return { error: "An unexpected error occurred while improving the map." };
  }
}
