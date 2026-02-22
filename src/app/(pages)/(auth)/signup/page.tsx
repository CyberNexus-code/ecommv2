'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
            console.log(error)
        }else{
            router.push('/');
        }

        setLoading(false)
    }

    return ( 
        <div className='h-screen p-2 md:p-20'>
            <form onSubmit={handleSignup} className='h-2/3 min-h-130 bg-white p-6 rounded-2xl shadow-sm text-center space-y-4 m-auto md:max-w-100 md:max-h-140'>
            <div className='flex flex-col h-full justify-between'>
                <div className='flex flex-col gap-10'>
                    <h1 className='text-2xl text-rose-700 font-bold'>Create account</h1>
                    <div className='flex flex-col items-start'>
                        <label className="block mb-1 text-sm font-medium">Name</label>
                        <input type="text" placeholder='e.g: John' name="name" value={username} onChange={e => setUsername(e.target.value)} className='border p-2 w-full rounded-md'/>
                    </div>

                    <div className='flex flex-col items-start'>
                        <label className="block mb-1 text-sm font-medium">Email</label>
                        <input type="email" placeholder='e.g: johnd@mail.com' value={email} name="email" onChange={e => setEmail(e.target.value)} required className='border p-2 w-full rounded-md' />
                    </div>

                    <div className='flex flex-col items-start'>
                        <label className="block mb-1 text-sm font-medium">Password</label>
                        <input type="password" placeholder='e.g: P@s$w0rD --Minimum 6 characters' value={password} name="passsword" onChange={e => setPassword(e.target.value)} required className='border p-2 w-full rounded-md' />
                    </div>

                </div>
                
                <div>
                    <p className='text-gray-400 text-sm'>Already have an account? <span className='text-rose-700 font-bold'><Link href="/login">Login</Link></span></p>
                    <button type="submit" disabled={loading} className='bg-rose-700 text-white px-4 py-2 w-full rounded-md'>
                        {loading ? 'Creating account...' : 'Sign up'}
                    </button>
                </div>
            </div>
            </form>
        </div>
    )
}