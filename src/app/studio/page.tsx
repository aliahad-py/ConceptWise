
"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader, Plus, Map, Trash2, Edit } from "lucide-react";
import { 
  createConceptMap, 
  deleteConceptMap,
  updateConceptMapTitle
} from "@/lib/firestore";
import { getUserConceptMaps } from "@/lib/firestore-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ConceptMapSummary } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

export default function StudioPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [maps, setMaps] = useState<ConceptMapSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingMapId, setEditingMapId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    if (user) {
      const unsubscribe = getUserConceptMaps(user.uid, (data) => {
        setMaps(data);
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const handleCreateNewMap = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to create a map.",
      });
      return;
    }
    setIsCreating(true);
    try {
      const newMapId = await createConceptMap(user.uid);
      toast({
        title: "New Map Created",
        description: "Redirecting you to your new concept map.",
      });
      router.push(`/studio/${newMapId}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: "Could not create a new map. Please try again.",
      });
      setIsCreating(false);
    }
  };

  const handleDelete = async (mapId: string) => {
    try {
      await deleteConceptMap(mapId);
      toast({
        title: "Map Deleted",
        description: "The concept map has been successfully deleted.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete the map. Please try again.",
      });
    }
  };

  const handleStartEditing = (map: ConceptMapSummary) => {
    setEditingMapId(map.id);
    setNewTitle(map.title);
  };
  
  const handleCancelEditing = () => {
    setEditingMapId(null);
    setNewTitle("");
  };

  const handleUpdateTitle = async (mapId: string) => {
    if (!newTitle.trim()) {
      toast({ variant: "destructive", title: "Title cannot be empty." });
      return;
    }
    try {
      await updateConceptMapTitle(mapId, newTitle);
      toast({ title: "Title Updated" });
      handleCancelEditing();
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to update title." });
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-headline">Your Concept Maps</h1>
          <Button onClick={handleCreateNewMap} disabled={isCreating}>
            {isCreating ? <Loader className="animate-spin" /> : <Plus />}
            New Map
          </Button>
        </div>

        {maps.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {maps.map((map) => (
              <Card key={map.id} className="flex flex-col">
                <CardHeader>
                  {editingMapId === map.id ? (
                    <Input 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle(map.id)}
                      autoFocus
                    />
                  ) : (
                    <CardTitle className="text-xl hover:text-primary transition-colors">
                      <Link href={`/studio/${map.id}`}>
                        {map.title}
                      </Link>
                    </CardTitle>
                  )}
                  <CardDescription>
                    Last updated {formatDistanceToNow(map.updatedAt, { addSuffix: true })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-end justify-between">
                  {editingMapId === map.id ? (
                     <div className="flex gap-2">
                       <Button size="sm" onClick={() => handleUpdateTitle(map.id)}>Save</Button>
                       <Button size="sm" variant="ghost" onClick={handleCancelEditing}>Cancel</Button>
                     </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button asChild variant="default" size="sm">
                        <Link href={`/studio/${map.id}`}>Open</Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleStartEditing(map)}>
                        <Edit size={16} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:text-destructive-foreground hover:bg-destructive/90">
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your concept map.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(map.id)}>Continue</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Map className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">No Concept Maps Found</h2>
            <p className="mt-2 text-muted-foreground">Get started by creating your first map.</p>
            <Button className="mt-6" onClick={handleCreateNewMap} disabled={isCreating}>
               {isCreating ? <Loader className="animate-spin" /> : <Plus />}
                Create New Map
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
