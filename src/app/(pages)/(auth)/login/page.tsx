'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client';
import { getOAuthProviderLabel, startOAuthSignIn } from '@/lib/auth/oauth';
import { rememberPendingGuestMerge } from '@/lib/auth/pendingGuestMerge';
import Link from 'next/link';

type AccountMethod = 'google' | 'password' | 'unknown'

function normalizeEmail(value: string) {
    return value.trim().toLowerCase()
}

export default function Login(){

    const supabase = useMemo(() => createClient(), []);
    const hasRedirectedRef = useRef(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('')
    const [password, setPassword ] = useState('')
    const [error, setError ]= useState<string | null>(null)  
    const [loading, setLoading] = useState(false)
    const [oauthLoading, setOAuthLoading] = useState<string | null>(null)
    const [accountMethod, setAccountMethod] = useState<AccountMethod>('unknown')
    const [methodLoading, setMethodLoading] = useState(false)
    const next = searchParams.get('next') ?? '/'
    const showResetSuccess = searchParams.get('reset') === 'success'
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

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if(event === "SIGNED_IN" && session?.user && !session.user.is_anonymous){
                setLoading(false);
                setError(null);
                if (!hasRedirectedRef.current) {
                    hasRedirectedRef.current = true;
                    router.replace(next);
                    router.refresh();
                }
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [next, router, supabase]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try{
            const detectedMethod = await fetchAccountMethod(email)

            if(detectedMethod === 'google'){
                setError(`This email is already configured for ${googleLabel} sign-in. Use "Continue with ${googleLabel}" instead of a password.`)
                return;
            }

            const { data: current } = await supabase.auth.getSession();
            const currentUser = current.session?.user;

            if(currentUser?.is_anonymous){
                rememberPendingGuestMerge(currentUser.id);
            }

            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if(error){
                setError(error.message);
                return;
            }

            if(data.user && !data.user.is_anonymous){
                if (!hasRedirectedRef.current) {
                    hasRedirectedRef.current = true;
                    router.replace(next);
                    router.refresh();
                }
                return;
            }
        } catch {
            setError("Unable to login right now. Please try again.");
        } finally{
            setLoading(false);
        }
    }

    const handleOAuthLogin = async () => {
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
            setError(`Unable to sign in with ${googleLabel}. Please try again.`);
        } finally {
            setOAuthLoading(null);
        }
    }

    return (
            <div className='flex min-h-dvh items-start justify-center overflow-y-auto p-3 md:px-6 md:py-10'>
                <form onSubmit={handleLogin} className='w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm space-y-4'>
                <div className='flex flex-col gap-8'>
                <div className='flex flex-col gap-10'>
                    <h1 className='text-2xl text-rose-700 font-bold'>Login</h1>
                    {showResetSuccess ? (
                        <p className='rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800'>
                            Password updated successfully. Sign in with your new password.
                        </p>
                    ) : null}
                    <p className='rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-800'>
                        Use one sign-in method per email. If you created the account with {googleLabel}, continue with {googleLabel} here instead of using a password.
                    </p>
                    
                    <div className='flex flex-col gap-2'>
                        <button
                            type="button"
                            onClick={handleOAuthLogin}
                            disabled={oauthLoading !== null}
                            className='border border-gray-300 text-gray-700 px-4 py-2 w-full rounded-md hover:bg-gray-50 disabled:bg-gray-100 flex items-center justify-center gap-2'
                        >
                            <svg className='w-5 h-5' viewBox='0 0 24 24'>
                                <path fill='currentColor' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/>
                                <path fill='currentColor' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/>
                                <path fill='currentColor' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/>
                                <path fill='currentColor' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/>
                            </svg>
                            {oauthLoading === 'google' ? 'Signing in...' : `Continue with ${googleLabel}`}
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
                        <label className="block mb-1 text-sm font-medium">Email</label>
                        <input type="email" placeholder='johnd@mail.com' name="email" value={email} onChange={e => {
                            setEmail(e.target.value)
                            setAccountMethod('unknown')
                        }} onBlur={() => {
                            void fetchAccountMethod(email)
                        }} required className='border p-2 w-full rounded-md'></input>
                        {methodLoading && emailLooksValid ? <p className='mt-1 text-xs text-stone-500'>Checking sign-in method...</p> : null}
                        {accountMethod === 'google' ? <p className='mt-1 text-xs text-amber-700'>This email uses {googleLabel} sign-in. Continue with {googleLabel} instead of entering a password.</p> : null}
                    </div>
                    <div className='flex flex-col items-start'>
                        <label className="block mb-1 text-sm font-medium">Password</label>
                        <input type="password" placeholder='P@s$w0rd' name="password" value={password} onChange={e => setPassword(e.target.value)} required className='border p-2 w-full rounded-md'></input>
                        {accountMethod === 'google' ? <p className='mt-1 text-xs text-stone-500'>Password login is disabled for this email to avoid duplicate sign-in methods.</p> : null}
                    </div>
                </div>
                <div className='flex flex-col justify-center items-center gap-2'>
                    <p className='text-gray-400 text-sm'>Don&apos;t have an account? <span className='text-rose-700 font-bold'><Link href={`/signup${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`}>Sign Up</Link></span></p>
                    <p className='text-gray-400 text-sm'><Link href="/forgot-password" className='text-rose-700 font-bold'>Forgot password?</Link></p>
                    {error ? <p className='mt-2 text-sm text-red-600'>{error}</p> : null}
                    <button type="submit" disabled={loading || accountMethod === 'google'} className='bg-rose-700 text-white px-4 py-2 w-full rounded-md disabled:bg-gray-400'>
                        {loading ? 'Logging in...' : accountMethod === 'google' ? `Use ${googleLabel} Above` : 'Login'}
                    </button>
                </div>
            </div>
            </form>
        </div>
    )
}
