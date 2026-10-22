import { openDB } from 'idb';
import { matchdayRoster, legacyRosterIds, clipPlayerIds } from './roster';

export type Category = 'Positioning' | 'Technique' | 'Decision making' | 'Great execution';
export type Status = 'pending' | 'kept' | 'skipped' | 'published';
export type Drawing = { type: 'arrow' | 'circle'; x1: number; y1: number; x2: number; y2: number };
export type Player = { id: string; name: string; number: number; position: string; goal: string; club?: string; squadRole?: 'Starter' | 'Bench' };
export type Match = { id: string; opponent: string; date: string; competition: string; venue: string; score: string; duration: number; sample: boolean; mediaId?: string; fileName?: string; size?: number; createdAt: number; videoSrc?: string; sourceUrl?: string; sourceCredit?: string; poster?: string };
export type Moment = { id: string; matchId: string; playerId: string; title: string; start: number; end: number; category: Category; note: string; cue: string; drill: string; status: Status; watched: boolean; completed: boolean; drawings: Drawing[]; poster?: string };
export type Workspace = { version: 1; demoVersion?: number; rosterVersion?: number; team: { name: string; age: string; coach: string; season: string }; players: Player[]; matches: Match[]; moments: Moment[] };
export const categories: Category[] = ['Positioning', 'Technique', 'Decision making', 'Great execution'];
export const uid = () => crypto.randomUUID();
export const clock = (s: number) => `${Math.floor(Math.max(0,s)/60)}:${String(Math.floor(Math.max(0,s)%60)).padStart(2,'0')}`;
export const shortDate = (s: string) => new Date(s+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'});
export const initials = (name: string) => name.trim().split(/\s+/).map(s=>s[0]).slice(0,2).join('');
export function parseClock(s: string): number { const parts=s.split(':'); return parts.length===2 ? Number(parts[0])*60+Number(parts[1]) : Number(s); }
export function validRange(start: number,end: number,duration: number) { return Number.isFinite(start)&&Number.isFinite(end)&&start>=0&&end>start&&end<=duration; }
export function csvCell(value: unknown) { let s=String(value??''); if (/^[=+@\-\t\r]/.test(s)) s="'"+s; return '"'+s.replaceAll('"','""')+'"'; }

export function seedWorkspace(): Workspace {
  const players: Player[] = matchdayRoster();
  const rows: [string,string,string,number,number,Category,string,string,string,Status][] = [
    ['psg-1','maya','Stay connected as the ball moves wide.',37,50,'Positioning','Barcelona move the ball toward the right side while PSG keep players between the ball and goal. Pause as the pass travels: who presses, who covers, and which runner needs a shoulder check?','Move with the pass. Keep your cover.','Three defenders against three attackers in a wide channel. The nearest defender presses; the next two provide cover. Rotate after 6 attacks.','pending'],
    ['psg-2','alex','Find the finish without rushing the touch.',93,114,'Technique','This first-half chance ends with the goalkeeper making the save. Watch the attacker’s preparation in the box, then use the replay to study the contact. Where is the space before the shot?','Set your body. Pick your corner.','Receive a cutback from a partner and finish through a cone gate. Use one preparation touch when needed. 3 sets of 6.','pending'],
    ['psg-3','maya','Win it. Play forward. Finish the move.',230,244,'Great execution','PSG break forward and finish the move for the opening goal. Watch the supporting runs as the ball travels into the final third. The useful lesson is how quickly the team turns a forward opportunity into a shot.','First look forward. Support the next pass.','Three attackers against two defenders from halfway. Attack immediately after a turnover and finish within 10 seconds. 6 repetitions.','published'],
    ['psg-4','jordan','Give the ball carrier a second option.',380,398,'Decision making','Study the shape around midfield in these second-half sequences. Pick one player away from the ball and follow their movement. How do they change the passing angle without standing next to a teammate?','Scan. Move off the line. Offer an angle.','Four-player passing diamond with one passive defender. Move out of the defender’s cover shadow before receiving. 8 minutes.','pending'],
    ['psg-5','maya','Meet the cross. Track the runner.',508,524,'Positioning','This corner sequence ends with PSG taking the lead again. Watch the delivery and the movement in the box. As a defender, find a position where you can see both the ball and your runner before attacking the cross.','Ball and runner. Stay connected.','Corner-kick practice with three attackers and three defenders. Call your runner, make a shoulder check, and attack the delivery. 6 corners from each side.','published'],
    ['psg-6','sam','Arrive for the cutback.',702,722,'Great execution','PSG attack down the right and work the ball across the penalty area for the late finish. Follow the supporting runner rather than the ball. Notice the timing of the arrival into the scoring space.','Arrive with the pass. Don’t wait in the space.','Two wide players deliver cutbacks for a midfielder arriving from outside the box. Alternate sides and time the run to meet the pass. 3 sets of 6.','published']
  ];
  return {version:1,demoVersion:4,rosterVersion:1,team:{name:'Paris Saint-Germain',age:'First team',coach:'Match analyst',season:'2026/27'},players,
    matches:[{id:'psg-barcelona-demo',opponent:'Barcelona · PSG film study',date:'2026-10-20',competition:'UEFA Champions League · League phase MD 3',venue:'Paris',score:'4–2',duration:791.73,sample:true,videoSrc:'/psg-barcelona-demo.mp4',poster:'/psg-demo-poster.jpg',sourceCredit:'PSG–Barcelona extended highlights · CBS Sports Golazo · User-supplied footage',createdAt:1}],
    moments:rows.map(([id,playerId,title,start,end,category,note,cue,drill,status])=>({id,matchId:'psg-barcelona-demo',playerId:clipPlayerIds[id]??playerId,title,start,end,category,note,cue,drill,status,watched:false,completed:false,drawings:[],poster:`/psg-clips/${id}.jpg`}))};
}

const dbPromise = openDB('filmiq-workspace',1,{upgrade(db){db.createObjectStore('workspace');db.createObjectStore('media');}});
export function migrateDemo(saved: Workspace): Workspace {
 const seed=seedWorkspace();let next=saved;
 if((saved.demoVersion??0)<4){
  const ownMatches=saved.matches.filter(m=>!m.sample);const ownIds=new Set(ownMatches.map(m=>m.id));
  next={...saved,demoVersion:4,matches:[...ownMatches,...seed.matches],moments:[...saved.moments.filter(m=>ownIds.has(m.matchId)),...seed.moments]};
 }
 if((next.rosterVersion??0)<1){
  const uploadedIds=new Set(next.matches.filter(m=>!m.sample).map(m=>m.id));
  const referenced=new Set(next.moments.filter(m=>uploadedIds.has(m.matchId)).map(m=>m.playerId));
  const retained=next.players.filter(p=>!legacyRosterIds.has(p.id)||referenced.has(p.id)).map(p=>legacyRosterIds.has(p.id)?{...p,club:'Custom'}:p);
  const imported=seed.players.map(p=>retained.find(x=>x.id===p.id)??p);
  const importedIds=new Set(imported.map(p=>p.id));
  next={...next,rosterVersion:1,team:next.team.name==='Riverside FC'?seed.team:next.team,players:[...imported,...retained.filter(p=>!importedIds.has(p.id))],moments:next.moments.map(m=>m.matchId==='psg-barcelona-demo'&&clipPlayerIds[m.id]?{...m,playerId:clipPlayerIds[m.id]}:m)};
 }
 return next;
}
export async function loadWorkspace(): Promise<Workspace> {
 const db=await dbPromise; const saved=await db.get('workspace','current');
 const next=saved?migrateDemo(saved):seedWorkspace();
 if(!saved||next!==saved)await db.put('workspace',next,'current');
 return next;
}
export async function saveWorkspace(data: Workspace) { await (await dbPromise).put('workspace',data,'current'); }
export async function saveMedia(id: string,file: Blob) { await (await dbPromise).put('media',file,id); }
export async function getMedia(id: string): Promise<Blob|undefined> { return (await dbPromise).get('media',id); }
export async function deleteMedia(id: string) { await (await dbPromise).delete('media',id); }
export async function removeMatch(data: Workspace,id: string) { const match=data.matches.find(m=>m.id===id); const next={...data,matches:data.matches.filter(m=>m.id!==id),moments:data.moments.filter(m=>m.matchId!==id)}; await saveWorkspace(next); if(match?.mediaId) await deleteMedia(match.mediaId); return next; }
export function download(name: string,text: string,type='text/plain') { const url=URL.createObjectURL(new Blob([text],{type})); const a=document.createElement('a'); a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }
export function reportCSV(data: Workspace,matchId?: string) { const rows=data.moments.filter(m=>(!matchId||m.matchId===matchId)&&m.status!=='skipped'); return [['Match','Player','Club','Start','End','Category','Moment','Coach note','Cue','Drill','Status'],...rows.map(m=>[data.matches.find(x=>x.id===m.matchId)?.opponent,data.players.find(x=>x.id===m.playerId)?.name,data.players.find(x=>x.id===m.playerId)?.club??'',clock(m.start),clock(m.end),m.category,m.title,m.note,m.cue,m.drill,m.status])].map(row=>row.map(csvCell).join(',')).join('\r\n'); }

export function demoClipURL(moment: Moment) {
 const ranges: Record<string,[number,number]>={'psg-1':[37,50],'psg-2':[93,114],'psg-3':[230,244],'psg-4':[380,398],'psg-5':[508,524],'psg-6':[702,722]};
 const r=ranges[moment.id];return moment.matchId==='psg-barcelona-demo'&&r&&moment.start===r[0]&&moment.end===r[1]?`/psg-clips/${moment.id}.mp4`:undefined;
}
