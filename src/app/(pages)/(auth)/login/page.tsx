'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';

export default function Login(){

    const supabase = createClient();

    const router = useRouter();
    const [email, setEmail] = useState('')
    const [password, setPassword ] = useState('')
    const [error, setError ]= useState<string | null>(null)  
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const {error} = await supabase.auth.signInWithPassword({email, password})
        if(error){
            console.log(error.message)
            setError(error.message)
        }else{
            router.push('/')
        }

        setLoading(false)
    }

    return (
         <div className='h-screen p-20'>
            <form onSubmit={handleLogin} className='h-2/3 rounded-2xl p-10 space-y-4 max-w-md border-1 border-rose-700 mx-auto'>
            <div className='flex flex-col h-full justify-between'>
                <div className='flex flex-col gap-10'>
                    <h1 className='text-2xl text-rose-700 font-bold'>Login</h1>

                    <input type="email" placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} required className='border p-2 w-full'></input>
                    <input type="password" placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} required className='border p-2 w-full'></input>
                </div>

                <button type="submit" disabled={loading} className='bg-rose-700 text-white px-4 py-2 w-full'>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </div>
            </form>
        </div>
    )
}