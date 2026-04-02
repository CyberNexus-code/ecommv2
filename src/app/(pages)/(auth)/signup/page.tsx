'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PasswordStrengthHint from '@/components/auth/PasswordStrengthHint';
import { rememberPendingGuestMerge } from '@/lib/auth/pendingGuestMerge';

export default function SignupPage(){
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOAuthLoading] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const next = searchParams.get('next') ?? '/';

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data: current } = await supabase.auth.getSession();

        if(current.session?.user?.is_anonymous){
            rememberPendingGuestMerge(current.session.user.id)
            await supabase.auth.signOut()
        }

        const { data, error: signupError } = await supabase.auth.signUp({
            email, 
            password,
            options: {
                data: {
                    username,
                    display_name: username
                },
                emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
            }
        });
        if(signupError){
            if(signupError.message.toLowerCase().includes('already')){
                setError('An account already exists for this email. Sign in to merge your guest basket.')
            } else {
                setError(signupError.message)
            }
        }else{
            if(data.session?.user && !data.session.user.is_anonymous){
                router.replace(next)
                router.refresh()
                return
            }

            setSuccess(true)
            setEmail('')
            setPassword('')
        }

        setLoading(false)
    }

    const handleOAuthSignup = async (provider: 'google' | 'facebook') => {
        setOAuthLoading(provider);
        setError(null);

        try {
            const { data: current } = await supabase.auth.getSession();
            if(current.session?.user?.is_anonymous){
                rememberPendingGuestMerge(current.session.user.id);
                await supabase.auth.signOut();
            }

            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
                    queryParams: {
                        prompt: 'login',
                    },
                },
            });

            if(oauthError){
                setError(oauthError.message);
            }
        } catch {
            setError(`Unable to sign up with ${provider}. Please try again.`);
        } finally {
            setOAuthLoading(null);
        }
    }

    return ( 
        <div className='h-screen p-2 md:p-20'>
            <form onSubmit={handleSignup} className='h-2/3 min-h-130 bg-white p-6 rounded-2xl shadow-sm text-center space-y-4 m-auto md:max-w-100 md:max-h-140'>
            <div className='flex flex-col h-full justify-between'>
                <div className='flex flex-col gap-10'>
                    <h1 className='text-2xl text-rose-700 font-bold'>Create account</h1>
                    
                    <div className='flex flex-col gap-2'>
                        <button
                            type="button"
                            onClick={() => handleOAuthSignup('google')}
                            disabled={oauthLoading !== null}
                            className='border border-gray-300 text-gray-700 px-4 py-2 w-full rounded-md hover:bg-gray-50 disabled:bg-gray-100 flex items-center justify-center gap-2'
                        >
                            <svg className='w-5 h-5' viewBox='0 0 24 24'>
                                <path fill='currentColor' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/>
                                <path fill='currentColor' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/>
                                <path fill='currentColor' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/>
                                <path fill='currentColor' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/>
                            </svg>
                            {oauthLoading === 'google' ? 'Signing up...' : 'Continue with Google'}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleOAuthSignup('facebook')}
                            disabled={oauthLoading !== null}
                            className='border border-gray-300 bg-blue-600 text-white px-4 py-2 w-full rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2'
                        >
                            <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
                                <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'/>
                            </svg>
                            {oauthLoading === 'facebook' ? 'Signing up...' : 'Continue with Facebook'}
                        </button>
                    </div>

                    <div className='relative'>
                        <div className='absolute inset-0 flex items-center'>
                            <div className='w-full border-t border-gray-300'></div>
                        </div>
                        <div className='relative flex justify-center text-sm'>
                            <span className='px-2 bg-white text-gray-500'>Or with email</span>
                        </div>
                    </div>

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
                        <PasswordStrengthHint password={password} />
                    </div>

                </div>
                
                <div>
                    <p className='text-gray-400 text-sm'>Already have an account? <span className='text-rose-700 font-bold'><Link href={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}>Login</Link></span></p>
                                    {success ? <p className='mt-2 text-sm text-green-700'>Check your email to complete sign up.</p> : null}
                    {error ? <p className='mt-2 text-sm text-red-600'>{error}</p> : null}
                    <button type="submit" disabled={loading} className='bg-rose-700 text-white px-4 py-2 w-full rounded-md disabled:bg-gray-400'>
                        {loading ? 'Creating account...' : 'Sign up'}
                    </button>
                </div>
            </div>
            </form>
        </div>
    )
}
