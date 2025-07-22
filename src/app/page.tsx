
"use client";

import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { BrainCircuit, Loader, Zap, Lightbulb, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and we have a user, redirect to /studio
    if (!loading && user) {
      router.push('/studio');
    }
  }, [user, loading, router]);

  // If we are still checking for a user, or if we have a user (and are about to redirect), show a loader.
  if (loading || user) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Only show the landing page if loading is done and there's no user.
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        <section className="container mx-auto px-4 py-16 md:py-24 text-center">
          <div className="max-w-3xl mx-auto">
            <BrainCircuit className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">
              Unlock Your Understanding with Concept Maps
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              ConceptWise uses AI to transform your notes, lectures, and texts into clear, interactive concept maps. Visualize connections, grasp key ideas, and accelerate your learning.
            </p>
            <Button asChild size="lg">
              <Link href="/signup">
                Start Creating - It's Free
              </Link>
            </Button>
          </div>
        </section>

        <section className="bg-secondary/20 py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                       <h2 className="text-3xl font-bold font-headline mb-4">From Text to Tangible Insights</h2>
                        <p>
                            Stop drowning in walls of text. Simply paste your material, and let our AI do the heavy lifting. It identifies core concepts and maps their relationships, giving you a bird's-eye view of the subject matter in seconds.
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Generate maps from lecture notes, articles, or any text.</li>
                            <li>Upload .txt files for quick input.</li>
                            <li>Interactively refine your map with simple commands.</li>
                        </ul>
                    </div>
                    <div>
                        <Image 
                            src="/1.png" 
                            alt="A concept map visualizing connections between ideas" 
                            width={600} 
                            height={400} 
                            className="rounded-lg shadow-2xl"
                            data-ai-hint="concept map diagram"
                        />
                    </div>
                </div>
            </div>
        </section>

         <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                        <Image 
                            src="/2.png" 
                            alt="An AI chatbot interface helping to improve a concept map"
                            width={600} 
                            height={400} 
                            className="rounded-lg shadow-2xl"
                            data-ai-hint="AI chatbot interface"
                        />
                    </div>
                    <div className="prose prose-lg dark:prose-invert max-w-none order-1 md:order-2">
                       <h2 className="text-3xl font-bold font-headline mb-4">Refine and Deepen with AI</h2>
                        <p>
                            Your map is just the beginning. Use our AI assistant to expand on ideas, find missing links, or simplify complex topics. It's like having a knowledgeable study partner on-demand.
                        </p>
                         <ul className="list-disc pl-5 space-y-2">
                            <li>Ask the AI to "add more detail" or "simplify this section".</li>
                            <li>Interactively build upon your knowledge base.</li>
                            <li>Preserve your insights with automatically generated notes.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <section className="bg-background py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold font-headline mb-4">Why ConceptWise?</h2>
              <p className="text-muted-foreground">
                Go beyond simple note-taking. Understand the bigger picture and learn more effectively.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 border rounded-lg">
                <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Instant Clarity</h3>
                <p className="text-muted-foreground">Generate comprehensive maps from complex text in seconds, saving you hours of manual work.</p>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <Lightbulb className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Deeper Insights</h3>
                <p className="text-muted-foreground">Visualize connections you might have missed, leading to a richer understanding of any topic.</p>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <Share2 className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Flexible & Interactive</h3>
                <p className="text-muted-foreground">Manually edit, add nodes, and use the AI to continuously refine your map until it's perfect.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-24 bg-secondary/20">
            <div className="container mx-auto px-4 text-center">
                 <h2 className="text-3xl font-bold font-headline mb-6">See It in Action</h2>
                 <div className="max-w-4xl mx-auto rounded-lg shadow-2xl overflow-hidden">
                   <video 
                     src="/video.mp4" 
                     width="1200" 
                     height="600" 
                     autoPlay 
                     muted 
                     loop 
                     playsInline
                     className="w-full"
                   >
                     Your browser does not support the video tag.
                   </video>
                 </div>
            </div>
        </section>
        
        <section className="bg-primary/10 py-16 md:py-24 text-center">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold font-headline mb-4">Ready to Map Your Knowledge?</h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Jump in and experience a smarter way to study and organize information.
                </p>
                <Button asChild size="lg">
                    <Link href="/studio">
                        Go to the Studio
                    </Link>
                </Button>
            </div>
        </section>

      </main>
      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ConceptWise. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );

}
