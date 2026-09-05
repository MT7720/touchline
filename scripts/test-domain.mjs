import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const code=ts.transpile(readFileSync(new URL('../lib/domain.ts',import.meta.url),'utf8'),{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022});
const {parseEA,aggregate}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const raw={matchId:'1',timestamp:1700000000,clubs:{'42':{goals:'2'},'99':{goals:'1',details:{name:'Opponent'}}},players:{'42':{'7':{playername:'Player',pos:'ST',goals:'2',passesmade:'8',passattempts:'10',rating:'8.5',saves:'3',ballDiveSaves:'2'}}}};
const m=parseEA(raw,'42','leagueMatch');assert.equal(m.goalsFor,2);assert.equal(m.goalsAgainst,1);assert.equal(m.players[0].assists,null);assert.equal(m.players[0].saves,3);assert.equal(m.raw,raw);assert.equal(aggregate([m])[0].passAccuracy,80);assert.equal(aggregate([{...m,excluded:true}]).length,0);assert.equal(parseEA({...raw,timestamp:undefined},'42','leagueMatch'),null);assert.equal(parseEA(raw,'nonexistent','leagueMatch'),null);console.log('PASS parsing: club identity, opponent, null handling, no double-counted saves, raw retention, weighted passes, excluded matches and invalid inputs.');
