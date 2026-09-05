import {notFound} from 'next/navigation';
import {isTeam,TEAMS} from '@/lib/domain';
import Workspace from '@/components/workspace';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{team:string}>}){const {team}=await params;return isTeam(team)?{title:`${TEAMS[team].name} • Touchline`,icons:{icon:TEAMS[team].logo}}:{title:'Equipe não encontrada'}}
export default async function Team({params}:{params:Promise<{team:string}>}){const {team}=await params;if(!isTeam(team))notFound();return <Workspace team={team}/>}
