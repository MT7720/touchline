import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
const path=new URL('../.local-access.json',import.meta.url);
const values=existsSync(path)?JSON.parse(readFileSync(path,'utf8')):{DTR_LINK:randomBytes(32).toString('hex'),VORTEX_LINK:randomBytes(32).toString('hex'),DTR_ADMIN:randomBytes(18).toString('base64url'),VORTEX_ADMIN:randomBytes(18).toString('base64url'),COLLECTOR_KEY:randomBytes(32).toString('hex')};
if(!existsSync(path))writeFileSync(path,JSON.stringify(values,null,2));
const content=Object.entries(values).map(([k,v])=>`${k}=${v}`).join('\n')+'\n';
writeFileSync(new URL('../.dev.vars',import.meta.url),content);
writeFileSync(new URL('../.env',import.meta.url),content);
console.log('Credenciais locais preparadas em arquivos ignorados pelo Git.');
