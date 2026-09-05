import {NextResponse} from 'next/server';
export function middleware(){const r=NextResponse.next();r.headers.set('Referrer-Policy','no-referrer');r.headers.set('X-Content-Type-Options','nosniff');r.headers.set('X-Robots-Tag','noindex, nofollow');r.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');r.headers.set('Cache-Control','no-store');return r}
