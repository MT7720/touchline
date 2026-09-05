import {secret,equal,json,fail,AppError} from '@/lib/server';
import {sync} from '@/lib/ea';
export async function POST(request:Request){try{const key=secret('COLLECTOR_KEY');if(!key||!await equal(request.headers.get('authorization')??'',`Bearer ${key}`))throw new AppError('Não autorizado.',401);const results=[];for(const t of ['dtr','vortex'] as const){try{results.push({team:t,...await sync(t)})}catch(e){results.push({team:t,error:e instanceof Error?e.message:'falha'})}}return json({results})}catch(e){return fail(e)}}
