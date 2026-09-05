export const TEAMS = {dtr:{name:'DTR Esports',short:'DTR',accent:'#c3ef63',logo:'/teams/dtr.png'},vortex:{name:'Vortex EC',short:'VTX',accent:'#89b4ff',logo:'/teams/vortex.png'}};
export type TeamId = keyof typeof TEAMS;
export const isTeam=(value:string):value is TeamId=>Object.hasOwn(TEAMS,value);
export type Match = {id:string;playedAt:string;opponent:string;goalsFor:number;goalsAgainst:number;type:string;competition?:string;video?:string;excluded?:boolean;wo?:boolean;players:PlayerLine[];raw?:unknown};
export type PlayerLine = {id:string;name:string;position:string;own:boolean;clubId:string;goals:number|null;assists:number|null;rating:number|null;shots:number|null;passes:number|null;passAttempts:number|null;tackles:number|null;tackleAttempts:number|null;saves:number|null;redCards:number|null;motm:number|null;seconds:number|null;raw?:Record<string,unknown>};
export type RecordItem={id:string;kind:string;data:Record<string,any>;createdAt:string};
export const num=(x:unknown):number|null=>x===undefined||x===null||x===''||!Number.isFinite(Number(x))?null:Number(x);
export function parseEA(raw:any,clubId:string,type:string):Match|null{
 const us=raw.clubs?.[clubId];const opponentId=Object.keys(raw.clubs??{}).find(k=>k!==clubId);const opponent=raw.clubs?.[opponentId??''];
 if(!us||!opponent||!raw.matchId||!num(raw.timestamp)||num(us.goals)===null||num(opponent.goals)===null)return null;
 const players:PlayerLine[]=[];
 for(const [cid,rows] of Object.entries(raw.players??{}))for(const [pid,s] of Object.entries(rows as any)){const p=s as any;players.push({id:pid,clubId:cid,own:cid===clubId,name:p.playername??pid,position:String(p.pos??'—'),goals:num(p.goals),assists:num(p.assists),rating:num(p.rating),shots:num(p.shots),passes:num(p.passesmade),passAttempts:num(p.passattempts),tackles:num(p.tacklesmade),tackleAttempts:num(p.tackleattempts),saves:num(p.saves),redCards:num(p.redcards),motm:num(p.man_of_the_match),seconds:num(p.secondsPlayed??p.gameTime),raw:p})}
 return {id:String(raw.matchId),playedAt:new Date(Number(raw.timestamp)*1000).toISOString(),opponent:opponent.details?.name??opponent.name??opponentId,goalsFor:Number(us.goals),goalsAgainst:Number(opponent.goals),type,players,raw};
}
export const result=(m:Match)=>m.goalsFor>m.goalsAgainst?'V':m.goalsFor<m.goalsAgainst?'D':'E';
export function aggregate(matches:Match[]){
 const map=new Map<string,any>();
 for(const m of matches.filter(m=>!m.excluded))for(const p of m.players.filter(p=>p.own)){let a=map.get(p.id)??{id:p.id,name:p.name,position:p.position,games:0,wins:0,goals:0,assists:0,rating:0,ratings:0,passes:0,passAttempts:0,tackles:0,tackleAttempts:0,shots:0,saves:0,motm:0,redCards:0,available:{}};a.games++;a.wins+=result(m)==='V'?1:0;for(const k of ['goals','assists','passes','passAttempts','tackles','tackleAttempts','shots','saves','motm','redCards'])if((p as any)[k]!==null){a[k]+=(p as any)[k];a.available[k]=true}if(p.rating!==null){a.rating+=p.rating;a.ratings++}map.set(p.id,a)}
 return [...map.values()].map(p=>({...p,rating:p.ratings?p.rating/p.ratings:null,passAccuracy:p.passAttempts?100*p.passes/p.passAttempts:null,tackleRate:p.tackleAttempts?100*p.tackles/p.tackleAttempts:null,conversion:p.shots?100*p.goals/p.shots:null}));
}
