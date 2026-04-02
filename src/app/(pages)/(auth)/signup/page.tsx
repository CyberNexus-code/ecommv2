'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client';
import { buildAuthCallbackUrl } from '@/lib/auth/paths';
import { getOAuthProviderLabel, startOAuthSignIn } from '@/lib/auth/oauth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PasswordStrengthHint from '@/components/auth/PasswordStrengthHint';
import { rememberPendingGuestMerge } from '@/lib/auth/pendingGuestMerge';

type AccountMethod = 'google' | 'password' | 'unknown'

function normalizeEmail(value: string) {
    return value.trim().toLowerCase()
}

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
    const [accountMethod, setAccountMethod] = useState<AccountMethod>('unknown');
    const [methodLoading, setMethodLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const next = searchParams.get('next') ?? '/';
    const googleLabel = getOAuthProviderLabel('google')
    const emailLooksValid = normalizeEmail(email).includes('@')

    async function fetchAccountMethod(targetEmail: string) {
        const normalizedEmail = normalizeEmail(targetEmail)

        if (!normalizedEmail || !normalizedEmail.includes('@')) {
            setAccountMethod('unknown')
            return 'unknown' as const
        }

        setMethodLoading(true)

        try {
            const response = await fetch('/api/auth/account-method', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: normalizedEmail }),
            })

            if (!response.ok) {
                setAccountMethod('unknown')
                return 'unknown' as const
            }

            const payload = (await response.json()) as { method?: AccountMethod }
            const method = payload.method ?? 'unknown'
            setAccountMethod(method)
            return method
        } catch {
            setAccountMethod('unknown')
            return 'unknown' as const
        } finally {
            setMethodLoading(false)
        }
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const detectedMethod = await fetchAccountMethod(email)

        if(detectedMethod === 'google'){
            setError(`This email is already configured for ${googleLabel} sign-in. Use "Continue with ${googleLabel}" instead of creating a password.`)
            setLoading(false)
            return
        }

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
                },
                emailRedirectTo: buildAuthCallbackUrl(window.location.origin, next)
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

    const handleOAuthSignup = async () => {
        setOAuthLoading('google');
        setError(null);

        try {
            const { error: oauthError } = await startOAuthSignIn({
                supabase,
                provider: 'google',
                next,
            });

            if(oauthError){
                setError(oauthError.message);
            }
        } catch {
            setError(`Unable to sign up with ${googleLabel}. Please try again.`);
        } finally {
            setOAuthLoading(null);
        }
    }

    return ( 
        <div className='flex min-h-dvh items-start justify-center overflow-y-auto p-3 md:px-6 md:py-10'>
            <form onSubmit={handleSignup} className='w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm space-y-4'>
            <div className='flex flex-col gap-8'>
                <div className='flex flex-col gap-10'>
                    <h1 className='text-2xl text-rose-700 font-bold'>Create account</h1>
                    <p className='rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-800'>
                        Use one sign-in method per email. If this email already uses {googleLabel}, continue with {googleLabel} instead of creating a password-based account.
                    </p>
                    
                    <div className='flex flex-col gap-2'>
                        <button
                            type="button"
                            onClick={handleOAuthSignup}
                            disabled={oauthLoading !== null}
                            className='border border-gray-300 text-gray-700 px-4 py-2 w-full rounded-md hover:bg-gray-50 disabled:bg-gray-100 flex items-center justify-center gap-2'
                        >
                            <svg className='w-5 h-5' viewBox='0 0 24 24'>
                                <path fill='currentColor' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/>
                                <path fill='currentColor' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/>
                                <path fill='currentColor' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/>
                                <path fill='currentColor' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/>
                            </svg>
                            {oauthLoading === 'google' ? 'Signing up...' : `Continue with ${googleLabel}`}
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
                        <label className="block mb-1 text-sm font-medium">Username</label>
                        <input type="text" placeholder='e.g: john' name="username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" className='border p-2 w-full rounded-md'/>
                    </div>

                    <div className='flex flex-col items-start'>
                        <label className="block mb-1 text-sm font-medium">Email</label>
                        <input type="email" placeholder='e.g: johnd@mail.com' value={email} name="email" onChange={e => {
                            setEmail(e.target.value)
                            setAccountMethod('unknown')
                        }} onBlur={() => {
                            void fetchAccountMethod(email)
                        }} required className='border p-2 w-full rounded-md' />
                        {methodLoading && emailLooksValid ? <p className='mt-1 text-xs text-stone-500'>Checking sign-in method...</p> : null}
                        {accountMethod === 'google' ? <p className='mt-1 text-xs text-amber-700'>This email already uses {googleLabel} sign-in. Use {googleLabel} above instead of creating a password.</p> : null}
                    </div>

                    <div className='flex flex-col items-start'>
                        <label className="block mb-1 text-sm font-medium">Password</label>
                        <input type="password" placeholder='e.g: P@s$w0rD --Minimum 6 characters' value={password} name="passsword" onChange={e => setPassword(e.target.value)} required className='border p-2 w-full rounded-md' />
                        <PasswordStrengthHint password={password} />
                    </div>

                </div>
                
                <div className='space-y-2'>
                    <p className='text-gray-400 text-sm'>Already have an account? <span className='text-rose-700 font-bold'><Link href={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}>Login</Link></span></p>
                                    {success ? <p className='mt-2 text-sm text-green-700'>Check your email to complete sign up.</p> : null}
                    {error ? <p className='mt-2 text-sm text-red-600'>{error}</p> : null}
                    <button type="submit" disabled={loading || accountMethod === 'google'} className='bg-rose-700 text-white px-4 py-2 w-full rounded-md disabled:bg-gray-400'>
                        {loading ? 'Creating account...' : accountMethod === 'google' ? `Use ${googleLabel} Above` : 'Sign up'}
                    </button>
                </div>
            </div>
            </form>
        </div>
    )
}
