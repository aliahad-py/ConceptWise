
"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { ConceptMap } from "@/components/concept-map";
import type { Node, Edge } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Loader, Share2, BrainCircuit } from "lucide-react";
import { getConceptMap } from "@/lib/firestore-client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

function ViewHeader({ title }: { title: string }) {
  const { toast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied!", description: "The share link has been copied to your clipboard." });
  };

  return (
    <header className="p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold font-headline text-foreground truncate">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">
              A concept map shared with ConceptWise
            </p>
          </div>
        </div>
        <Button onClick={handleCopyLink}>
          <Share2 /> Share
        </Button>
      </div>
    </header>
  );
}

export default function ViewMapPage() {
  const params = useParams();
  const router = useRouter();
  const mapId = Array.isArray(params.mapId) ? params.mapId[0] : params.mapId;

  const [title, setTitle] = useState("Untitled Map");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (mapId) {
      setIsFetching(true);
      const unsubscribe = getConceptMap(mapId, (mapData) => {
        if (mapData) {
          setTitle(mapData.title);
          setNodes(mapData.nodes || []);
          setEdges(mapData.edges || []);
          setIsFetching(false);
        } else {
            toast({
                variant: "destructive",
                title: "Map not found",
                description: "This concept map could not be loaded or may not exist."
            });
            router.push('/');
        }
      });
      return () => unsubscribe();
    }
  }, [mapId, toast, router]);


  if (isFetching) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader className="w-12 h-12 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Loading concept map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <ViewHeader title={title} />
      <main className="flex-grow h-full">
         <ConceptMap
            nodes={nodes}
            setNodes={setNodes}
            edges={edges}
            setEdges={setEdges}
            isPanningEnabled={true}
            readOnly={true}
        />
      </main>
    </div>
  );
}


    

    