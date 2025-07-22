
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Loader, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
  <li className={cn("flex items-center text-sm", met ? "text-green-500" : "text-muted-foreground")}>
    {met ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
    {text}
  </li>
);

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const passwordReqs = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }, [password]);

  const allReqsMet = useMemo(() => Object.values(passwordReqs).every(Boolean), [passwordReqs]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allReqsMet) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: 'Password does not meet all requirements.',
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: 'Passwords do not match.',
      });
      return;
    }
    setIsLoading(true);
    try {
      await signUp(email, password, firstName, lastName);
      router.push('/studio');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message || 'An unexpected error occurred.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input 
                    id="first-name" 
                    placeholder="Max" 
                    required 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input 
                    id="last-name" 
                    placeholder="Robinson" 
                    required 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                />
              </div>
              <ul className="grid gap-1 pl-2">
                <PasswordRequirement met={passwordReqs.length} text="At least 8 characters" />
                <PasswordRequirement met={passwordReqs.lowercase} text="A lowercase letter" />
                <PasswordRequirement met={passwordReqs.uppercase} text="An uppercase letter" />
                <PasswordRequirement met={passwordReqs.number} text="A number" />
                <PasswordRequirement met={passwordReqs.special} text="A special character" />
              </ul>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading || !allReqsMet}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || !allReqsMet || password !== confirmPassword}>
                {isLoading ? <Loader className="animate-spin" /> : 'Create an account'}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
