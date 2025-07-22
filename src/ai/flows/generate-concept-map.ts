'use server';

/**
 * @fileOverview A concept map generator AI agent.
 *
 * - generateConceptMap - A function that handles the concept map generation process.
 * - GenerateConceptMapInput - The input type for the generateConceptMap function.
 * - GenerateConceptMapOutput - The return type for the generateConceptMap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateConceptMapInputSchema = z.object({
  notes: z.string().describe('The lecture notes to generate a concept map from.'),
});
export type GenerateConceptMapInput = z.infer<typeof GenerateConceptMapInputSchema>;

const GenerateConceptMapOutputSchema = z.object({
  conceptMapData: z
    .object({
      nodes: z.array(z.object({ 
        id: z.string(), 
        label: z.string(),
        note: z.string().optional().describe('A brief, helpful summary for the concept based on the source text.')
      })),
      edges: z.array(z.object({ source: z.string(), target: z.string(), label: z.string().optional() })),
    })
    .describe(
      'A JSON object representing the concept map data, containing nodes (concepts) and edges (relationships).'
    ),
});
export type GenerateConceptMapOutput = z.infer<typeof GenerateConceptMapOutputSchema>;

export async function generateConceptMap(input: GenerateConceptMapInput): Promise<GenerateConceptMapOutput> {
  return generateConceptMapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConceptMapPrompt',
  input: {schema: GenerateConceptMapInputSchema},
  output: {schema: GenerateConceptMapOutputSchema},
  prompt: `You are an expert in creating clear and concise concept maps from text.

  Analyze the following lecture notes and identify the most important, core concepts and the primary relationships between them. Avoid creating nodes for minor details or tangential ideas. The goal is a simplified but accurate overview of the main topics.

  For each core concept (node) you identify, you must also generate a brief, helpful summary note based on the provided text.
  
  Generate a JSON object representing the concept map data. The JSON should contain 'nodes' and 'edges' fields.
  - Each node must have an 'id' (a unique identifier string), a 'label' (the concept name), and a 'note' (the summary).
  - Each edge must have a 'source' and 'target' (using the node ids) and an optional 'label' describing the relationship.

  Lecture Notes:
  {{{notes}}}`,
});

const generateConceptMapFlow = ai.defineFlow(
  {
    name: 'generateConceptMapFlow',
    inputSchema: GenerateConceptMapInputSchema,
    outputSchema: GenerateConceptMapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
