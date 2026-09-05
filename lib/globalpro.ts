import {db,AppError} from './server';
import {TEAMS,type TeamId,type Match} from './domain';
export const GLOBALPRO={dtr:'40',vortex:'86'};
const clean=(s:string)=>s.replace(/\s+/g,' ').trim();
const normalize=(s:string)=>clean(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
export async function collectGlobalPro(team:TeamId){const url=`https://www.globalproesports.com/team-info/${GLOBALPRO[team]}`;const response=await fetch(url,{headers:{Accept:'text/html','User-Agent':'TouchlineClubStats/1.0'},signal:AbortSignal.timeout(20000)});if(!response.ok)throw new AppError(`GlobalPro indisponível (HTTP ${response.status}).`,502);
 let valid=false;const roster:{cells:string[]}[]=[];const games:{date:string;competition:string;teams:string[];score:string;url:string;status:string}[]=[];let cellIndex=-1;
 const parser=new HTMLRewriter().on('[data-team-info-page]',{element(){valid=true}})
 .on('table[data-team-squad] tbody tr',{element(){roster.push({cells:[]});cellIndex=-1}})
 .on('table[data-team-squad] tbody tr td',{element(){cellIndex++;roster.at(-1)!.cells[cellIndex]=''},text(t){if(roster.length)roster.at(-1)!.cells[cellIndex]+=t.text}})
 .on('#team-panel-matches [data-profile-match-row]',{element(){games.push({date:'',competition:'',teams:[],score:'',url:'',status:''})}})
 .on('#team-panel-matches [data-profile-match-row] header > span',{text(t){if(games.length)games.at(-1)!.competition+=t.text}})
 .on('#team-panel-matches [data-profile-match-row] time[datetime]',{element(e){if(games.length)games.at(-1)!.date=e.getAttribute('datetime')??''}})
 .on('#team-panel-matches [data-profile-match-row] strong',{element(){games.at(-1)?.teams.push('')},text(t){const game=games.at(-1);if(game?.teams.length)game.teams[game.teams.length-1]+=t.text}})
 .on('#team-panel-matches [data-profile-match-row] a[href*="/matches/"]',{element(e){if(games.length)games.at(-1)!.url=e.getAttribute('href')??''},text(t){if(games.length)games.at(-1)!.score+=t.text}})
 .on('#team-panel-matches [data-profile-match-row] footer',{text(t){if(games.length)games.at(-1)!.status+=t.text}});
 await parser.transform(response).text();if(!valid)throw new AppError('A estrutura do perfil GlobalPro mudou. Coleta interrompida para evitar dados incorretos.',502);
 const at=new Date().toISOString();const matches:Match[]=[];for(const g of games){const sides=g.teams.map(clean);const own=sides.findIndex(n=>normalize(n)===normalize(TEAMS[team].name));const score=clean(g.score).match(/^(\d+)\s*[:x×-]\s*(\d+)$/);const id=g.url.match(/\/matches\/(\d+)/)?.[1];if(own<0||sides.length!==2||!score||!id||!Number.isFinite(Date.parse(g.date)))continue;matches.push({id:`globalpro:${id}`,playedAt:new Date(g.date).toISOString(),opponent:sides[1-own],goalsFor:Number(score[own+1]),goalsAgainst:Number(score[2-own]),type:'globalpro',competition:clean(g.competition),players:[],raw:{source:'GlobalPro',url:g.url,status:clean(g.status),collectedAt:at}})}
 const payload={source:'GlobalPro',url,collectedAt:at,roster:roster.map(r=>({name:clean(r.cells[0]??''),gamertag:clean(r.cells[1]??''),country:clean(r.cells[2]??''),role:clean(r.cells[3]??''),joinedAt:clean(r.cells[4]??''),contractEndsAt:clean(r.cells[5]??'')})),matches};
 await db().prepare('INSERT INTO snapshots (team,source,data,at) VALUES (?,?,?,?) ON CONFLICT(team,source) DO UPDATE SET data=excluded.data,at=excluded.at').bind(team,'globalpro',JSON.stringify(payload),at).run();
 if(matches.length)await db().batch(matches.map(m=>db().prepare('INSERT INTO matches (team,id,data,playedAt,importedAt) VALUES (?,?,?,?,?) ON CONFLICT(team,id) DO UPDATE SET data=excluded.data,playedAt=excluded.playedAt,importedAt=excluded.importedAt').bind(team,m.id,JSON.stringify(m),m.playedAt,at)));
 return {count:matches.length,roster:payload.roster.length};
}
