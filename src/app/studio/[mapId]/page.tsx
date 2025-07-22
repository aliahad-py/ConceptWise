
"use client";

import React, { useState, useCallback, ChangeEvent, useRef, useEffect } from "react";
import { Header } from "@/components/header";
import { ConceptMap } from "@/components/concept-map";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { generateMapAction, improveMapAction } from "../../actions";
import type { Node, Edge } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Loader, Sparkles, Plus, FileText, Bot, Save, Share2, Home, Link as LinkIcon, Download, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { saveConceptMap } from "@/lib/firestore";
import { getConceptMap } from "@/lib/firestore-client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toPng } from 'html-to-image';


// Function to fetch and embed Google Fonts
async function getFontEmbedCss(fontUrl: string): Promise<string> {
    try {
        const response = await fetch(fontUrl);
        const cssText = await response.text();
        return `<style>${cssText}</style>`;
    } catch (e) {
        console.error('Failed to fetch font CSS:', e);
        return '';
    }
}


export default function StudioMapPage() {
  const params = useParams();
  const router = useRouter();
  const mapId = Array.isArray(params.mapId) ? params.mapId[0] : params.mapId;
  const { user } = useAuth();

  const [title, setTitle] = useState("Untitled Map");
  const [sourceText, setSourceText] = useState<string>("");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isImproving, setIsImproving] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [improveQuery, setImproveQuery] = useState<string>("");

  useEffect(() => {
    if (user && mapId) {
      setIsFetching(true);
      const unsubscribe = getConceptMap(mapId, (mapData) => {
        if (mapData) {
          setTitle(mapData.title);
          setSourceText(mapData.sourceText);
          setNodes(mapData.nodes || []);
          setEdges(mapData.edges || []);
          setIsFetching(false);
        } else {
            toast({
                variant: "destructive",
                title: "Map not found",
                description: "This concept map could not be loaded. Redirecting you to the dashboard."
            });
            router.push('/studio');
        }
      });
      return () => unsubscribe();
    }
  }, [user, mapId, toast, router]);


  const handleGenerateMap = useCallback(async () => {
    setIsLoading(true);
    const result = await generateMapAction(sourceText);
    setIsLoading(false);
    if ("error" in result) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: result.error,
      });
    } else {
      setNodes(result.nodes);
      setEdges(result.edges);
      toast({
        title: "Map Generated",
        description: "Your concept map has been created successfully. Don't forget to save!",
      });
    }
  }, [sourceText, toast]);

  const handleImproveMap = useCallback(async () => {
    if (!improveQuery.trim()) {
        toast({ variant: "destructive", title: "Improvement Failed", description: "Please enter a query to improve the map." });
        return;
    }
    if (nodes.length === 0) {
        toast({ variant: "destructive", title: "Improvement Failed", description: "Please generate a map before improving it." });
        return;
    }

    setIsImproving(true);
    const conceptMap = JSON.stringify({ nodes, edges });
    const result = await improveMapAction(conceptMap, sourceText, improveQuery);
    setIsImproving(false);

    if ("error" in result) {
        toast({ variant: "destructive", title: "Improvement Failed", description: result.error });
    } else {
        setNodes(result.nodes);
        setEdges(result.edges);
        toast({ title: "Map Improved", description: "The AI has updated your concept map." });
        setImproveQuery("");
    }
  }, [improveQuery, nodes, edges, sourceText, toast]);

  const handleSaveMap = async () => {
    if (!user || !mapId) {
      toast({ variant: "destructive", title: "Save Failed", description: "You must be logged in to save a map." });
      return;
    }
    setIsSaving(true);
    try {
      await saveConceptMap(mapId, {
        title,
        sourceText,
        nodes,
        edges,
        userId: user.uid,
      });
      toast({ title: "Map Saved!", description: "Your progress has been saved successfully." });
    } catch (error) {
      console.error("Save failed:", error);
      toast({ variant: "destructive", title: "Save Failed", description: "Could not save the map. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddNode = () => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      position: { x: 100, y: 100 },
      data: { label: "New Concept" },
    };
    setNodes((nds) => [...nds, newNode]);
  };
  
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => setSourceText(e.target?.result as string);
      reader.readAsText(file);
    } else {
      toast({ variant: "destructive", title: "Unsupported File Type", description: "Please upload a .txt file." });
    }
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/view/${mapId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Share Link Copied!", description: "Anyone with the link can now view your map." });
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify({ title, nodes, edges, sourceText }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${title.replace(/ /g, '_') || 'concept_map'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast({ title: "Exporting JSON", description: "Your map data is being downloaded." });
  };

  const handleExportPng = useCallback(async () => {
    const mapElement = mapContainerRef.current?.querySelector('.react-flow__viewport') as HTMLElement | null;
    if (!mapElement || nodes.length === 0) {
        toast({ variant: "destructive", title: "Export Failed", description: "Map is empty or not properly rendered." });
        return;
    }
    toast({ title: "Exporting PNG", description: "Generating image, this may take a moment..." });

    try {
        const [interCss, spaceGroteskCss] = await Promise.all([
            getFontEmbedCss('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'),
            getFontEmbedCss('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap'),
        ]);

        const padding = 50;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        nodes.forEach(node => {
            minX = Math.min(minX, node.position.x);
            minY = Math.min(minY, node.position.y);
            maxX = Math.max(maxX, node.position.x + (node.width || 150));
            maxY = Math.max(maxY, node.position.y + (node.height || 50));
        });

        const imageWidth = (maxX - minX) + 2 * padding;
        const imageHeight = (maxY - minY) + 2 * padding;
        
        const dataUrl = await toPng(mapElement, {
            cacheBust: true,
            pixelRatio: 1.5,
            fontEmbedCSS: `${interCss}${spaceGroteskCss}`,
            width: imageWidth,
            height: imageHeight,
            style: {
              transform: `translateX(-${minX - padding}px) translateY(-${minY - padding}px)`,
              // Ensure the background is not transparent
              background: 'hsl(var(--secondary))', 
            }
        });

        const link = document.createElement('a');
        link.download = `${title.replace(/ /g, '_') || 'concept_map'}.png`;
        link.href = dataUrl;
        link.click();
        toast({ title: "Image Downloaded", description: "Your map has been exported as a PNG." });
    } catch (err) {
        console.error(err);
        toast({ variant: "destructive", title: "Export Failed", description: "Could not export the map as an image." });
    }
  }, [title, nodes, mapContainerRef]);


  if (isFetching) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader className="w-12 h-12 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Loading your map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <main className="flex-grow grid md:grid-cols-[400px_1fr] overflow-hidden">
        <aside className="border-r h-full flex flex-col">
          <Card className="flex-grow flex flex-col border-0 rounded-none shadow-none">
             <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/studio"><Home size={16}/> Back to Dashboard</Link>
                </Button>
                <Button onClick={handleSaveMap} disabled={isSaving}>
                  {isSaving ? <Loader className="animate-spin" /> : <Save />}
                  Save
                </Button>
              </div>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-bold border-0 shadow-none focus-visible:ring-0 px-0"
              />
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-4">
              <div className="flex items-center gap-2 border-y py-2">
                 <FileText size={20} />
                 <h2 className="font-semibold">Input Source</h2>
              </div>
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste your lecture notes or text here..."
                className="flex-grow text-sm resize-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => fileInputRef.current?.click()} variant="secondary">Upload .txt</Button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt"/>
                <Button onClick={handleGenerateMap} disabled={isLoading}>
                  {isLoading ? <Loader className="animate-spin" /> : <Sparkles />}
                  Generate Map
                </Button>
                <Button onClick={handleAddNode} variant="secondary">
                  <Plus /> Add Node
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary">
                            <Share2 /> Share/Export
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={handleCopyShareLink}>
                            <LinkIcon className="mr-2 h-4 w-4" />
                            <span>Copy Share Link</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportJson}>
                            <Download className="mr-2 h-4 w-4" />
                            <span>Export as JSON</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportPng}>
                            <ImageIcon className="mr-2 h-4 w-4" />
                            <span>Export as PNG</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="border-t pt-4 mt-auto flex flex-col gap-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Bot size={18} /> Improve with AI
                </h3>
                <p className="text-sm text-muted-foreground">e.g., "Add more detail about photosynthesis"</p>
                <Input 
                  placeholder="Your request..."
                  value={improveQuery}
                  onChange={(e) => setImproveQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleImproveMap()}
                />
                <Button onClick={handleImproveMap} disabled={isImproving}>
                   {isImproving ? <Loader className="animate-spin" /> : <Sparkles size={16} />}
                  Improve Map
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
        <section ref={mapContainerRef} className="h-full relative bg-secondary/20">
            {(isLoading || isImproving) && (
              <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-20 gap-4">
                <Loader className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">{isLoading ? "Generating your concept map..." : "Improving your map..."}</p>
                <p className="text-sm text-muted-foreground/80 max-w-xs text-center">
                    {isLoading 
                        ? "The AI is analyzing your text... this might take a moment."
                        : "The AI is processing your request to improve the map."
                    }
                </p>
              </div>
            )}
            {nodes.length === 0 && !isLoading && !isFetching && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="text-center p-8 bg-background/50 backdrop-blur-sm rounded-xl">
                        <h2 className="text-2xl font-headline font-bold mb-2">This map is empty</h2>
                        <p className="text-muted-foreground max-w-md">
                            To get started, enter some text in the panel on the left and click 'Generate Map'.
                            Or, you can manually add nodes and connect them.
                        </p>
                    </div>
                </div>
            )}
            <ConceptMap
                nodes={nodes}
                setNodes={setNodes}
                edges={edges}
                setEdges={setEdges}
            />
        </section>
      </main>
    </div>
  );
}

    