
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import type { UserProfile } from '@/types';
import { getUserProfile, updateUserProfile } from '@/lib/firestore';
import { updateProfile } from 'firebase/auth';

export default function ProfilePage() {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const { toast } = useToast();
    
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [displayName, setDisplayName] = useState('');
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            if (user) {
                setIsLoading(true);
                const userProfile = await getUserProfile(user.uid);
                if (userProfile) {
                    setProfile(userProfile);
                    setFirstName(userProfile.firstName);
                    setLastName(userProfile.lastName);
                    setDisplayName(user.displayName || `${userProfile.firstName} ${userProfile.lastName}`);
                }
                setIsLoading(false);
            }
        }
        if (!authLoading) {
          fetchProfile();
        }
    }, [user, authLoading]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({ variant: 'destructive', title: 'Not Logged In', description: 'You must be logged in to update your profile.' });
            return;
        }

        setIsSaving(true);
        try {
            // First, update the Firebase Auth profile (client-side)
            await updateProfile(user, {
                displayName: displayName
            });

            // Then, update the Firestore document (server-side)
            const result = await updateUserProfile(user.uid, { 
              firstName, 
              lastName,
              displayName, // Pass it along just in case
            });

            if (result.success) {
                await refreshUser(); // This re-fetches the user data from auth
                toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
            } else {
                throw new Error(result.error || 'Failed to save to database.');
            }
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Update Failed', description: error.message || 'An unexpected error occurred.' });
        } finally {
            setIsSaving(false);
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
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Your Profile</CardTitle>
                        <CardDescription>Update your personal information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-6">
                           <div className="grid sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input 
                                        id="firstName" 
                                        value={firstName} 
                                        onChange={(e) => setFirstName(e.target.value)}
                                        disabled={isSaving}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input 
                                        id="lastName" 
                                        value={lastName} 
                                        onChange={(e) => setLastName(e.target.value)}
                                        disabled={isSaving}
                                    />
                                </div>
                           </div>
                            <div className="grid gap-2">
                                <Label htmlFor="displayName">Display Name</Label>
                                <Input 
                                    id="displayName" 
                                    value={displayName} 
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    disabled={isSaving}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    value={user?.email || ''} 
                                    disabled 
                                />
                                <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
                            </div>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Loader className="animate-spin" /> : 'Save Changes'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
