'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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

        const {error} = await supabase.auth.signInWithPassword({email, password});
        console.log("Logging in");
        
        if(error){
            console.log(error.message)
            setError(error.message)
        }else{
            router.push('/')
        }

        console.log("Logging in");

        setLoading(false)
    }

    return (
         <div className='h-screen p-2 md:p-20'>
            <form onSubmit={handleLogin} className='h-2/3 min-h-100 bg-white p-6 rounded-2xl shadow-sm text-center space-y-4 m-auto md:max-w-100 md:max-h-120'>
            <div className='flex flex-col h-full justify-between'>
                <div className='flex flex-col gap-10'>
                    <h1 className='text-2xl text-rose-700 font-bold'>Login</h1>
                    <div className='flex flex-col items-start'>
                        <label className="block mb-1 text-sm font-medium">Email</label>
                        <input type="email" placeholder='johnd@mail.com' name="email" value={email} onChange={e => setEmail(e.target.value)} required className='border p-2 w-full rounded-md'></input>
                    </div>
                    <div className='flex flex-col items-start'>
                        <label className="block mb-1 text-sm font-medium">Password</label>
                        <input type="password" placeholder='P@s$w0rd' name="password" value={password} onChange={e => setPassword(e.target.value)} required className='border p-2 w-full rounded-md'></input>
                    </div>
                </div>
                <div className='flex flex-col justify-center items-center'>
                    <p className='text-gray-400 text-sm'>Dont't have an account? <span className='text-rose-700 font-bold'><Link href="/signup">Sign Up</Link></span></p>
                    <button type="submit" disabled={loading} className='bg-rose-700 text-white px-4 py-2 w-full rounded-md'>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </div>
            </div>
            </form>
        </div>
    )
}