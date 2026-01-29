'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignupPage(){
    const supabase = createClient();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signUp({
            email, 
            password,
            options: {
                data: {
                    username,
                    display_name: username
                }
            }
        });
        if(error){
            setError(error.message)
        }else{
            router.push('/');
        }

        setLoading(false)
    }

    return ( 
        <div className='h-screen p-20'>
            <form onSubmit={handleSignup} className='h-2/3 rounded-2xl p-10 space-y-4 max-w-md border-1 border-rose-700 mx-auto'>
            <div className='flex flex-col h-full justify-between'>
                <div className='flex flex-col gap-10'>
                    <h1 className='text-2xl text-rose-700 font-bold'>Create account</h1>
                    <input type="text" placeholder='Username' value={username} onChange={e => setUsername(e.target.value)} className='border p-2 w-full'/>
                    <input type="email" placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} required className='border p-2 w-full' />
                    <input type="password" placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} required className='border p-2 w-full' />
                </div>

                <button type="submit" disabled={loading} className='bg-rose-700 text-white px-4 py-2 w-full'>
                    {loading ? 'Creating account...' : 'Sign up'}
                </button>
            </div>
            </form>
        </div>
    )
}