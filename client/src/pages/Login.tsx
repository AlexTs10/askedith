import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const params = new URLSearchParams(window.location.search);
  const next = params.get('next') || '/';
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate(next);
      } else {
        toast({ title: 'Error', description: data.message || 'Failed', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold text-center">{isRegister ? 'Create Account' : 'Login'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="username">Email</Label>
          <Input id="username" type="email" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full">{isRegister ? 'Register' : 'Login'}</Button>
      </form>
      <Button variant="secondary" className="w-full" onClick={() => { window.location.href = `/api/auth/google?next=${encodeURIComponent(next)}`; }}>Sign in with Google</Button>
      <p className="text-center text-sm">
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button className="underline" onClick={() => setIsRegister(!isRegister)}>{isRegister ? 'Login' : 'Create one'}</button>
      </p>
    </div>
  );
}
