'use server';

/**
 * @fileOverview An AI agent for improving concept maps.
 *
 * - improveConceptMap - A function that suggests improvements to a concept map.
 * - ImproveConceptMapInput - The input type for the improveConceptMap function.
 * - ImproveConceptMapOutput - The return type for the improveConceptMap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveConceptMapInputSchema = z.object({
  conceptMap: z.string().describe('The concept map in JSON format.'),
  sourceText: z.string().describe('The original text used to generate the concept map.'),
  query: z.string().describe('The query to improve the concept map.'),
});
export type ImproveConceptMapInput = z.infer<typeof ImproveConceptMapInputSchema>;

const ImproveConceptMapOutputSchema = z.object({
  improvedConceptMap: z
    .object({
        nodes: z.array(z.object({ 
            id: z.string(), 
            label: z.string(),
            note: z.string().optional().describe('A brief, helpful summary for the concept based on the source text.')
        })),
        edges: z.array(z.object({ source: z.string(), target: z.string(), label: z.string().optional() })),
    })
    .describe('The improved concept map in JSON format, including notes for each node.'),
});
export type ImproveConceptMapOutput = z.infer<typeof ImproveConceptMapOutputSchema>;

export async function improveConceptMap(input: ImproveConceptMapInput): Promise<ImproveConceptMapOutput> {
  return improveConceptMapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveConceptMapPrompt',
  input: {schema: ImproveConceptMapInputSchema},
  output: {schema: ImproveConceptMapOutputSchema},
  prompt: `You are an expert at improving concept maps for students.

You will be given a concept map in JSON format and the original text used to generate it.
The student will ask you to improve the concept map in some way.

Based on the original text, the concept map, and the student's query, you will suggest improvements to the concept map.
- IMPORTANT: Preserve the 'note' for existing nodes unless the query specifically asks to change it.
- For any new nodes you add, you MUST generate a new, helpful summary 'note' based on the source text.

Concept Map:
{{conceptMap}}

Original Text:
{{sourceText}}

Student Query:
{{query}}

Return the improved concept map as a JSON object, ensuring every node has an 'id', 'label', and 'note'.
`,
});

const improveConceptMapFlow = ai.defineFlow(
  {
    name: 'improveConceptMapFlow',
    inputSchema: ImproveConceptMapInputSchema,
    outputSchema: ImproveConceptMapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
