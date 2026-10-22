import { openDB } from 'idb';

export type Category = 'Positioning' | 'Technique' | 'Decision making' | 'Great execution';
export type Status = 'pending' | 'kept' | 'skipped' | 'published';
export type Drawing = { type: 'arrow' | 'circle'; x1: number; y1: number; x2: number; y2: number };
export type Player = { id: string; name: string; number: number; position: string; goal: string };
export type Match = { id: string; opponent: string; date: string; competition: string; venue: string; score: string; duration: number; sample: boolean; mediaId?: string; fileName?: string; size?: number; createdAt: number; videoSrc?: string; sourceUrl?: string; poster?: string };
export type Moment = { id: string; matchId: string; playerId: string; title: string; start: number; end: number; category: Category; note: string; cue: string; drill: string; status: Status; watched: boolean; completed: boolean; drawings: Drawing[] };
export type Workspace = { version: 1; demoVersion?: number; team: { name: string; age: string; coach: string; season: string }; players: Player[]; matches: Match[]; moments: Moment[] };
export const categories: Category[] = ['Positioning', 'Technique', 'Decision making', 'Great execution'];
export const uid = () => crypto.randomUUID();
export const clock = (s: number) => `${Math.floor(Math.max(0,s)/60)}:${String(Math.floor(Math.max(0,s)%60)).padStart(2,'0')}`;
export const shortDate = (s: string) => new Date(s+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'});
export const initials = (name: string) => name.trim().split(/\s+/).map(s=>s[0]).slice(0,2).join('');
export function parseClock(s: string): number { const parts=s.split(':'); return parts.length===2 ? Number(parts[0])*60+Number(parts[1]) : Number(s); }
export function validRange(start: number,end: number,duration: number) { return Number.isFinite(start)&&Number.isFinite(end)&&start>=0&&end>start&&end<=duration; }
export function csvCell(value: unknown) { let s=String(value??''); if (/^[=+@\-\t\r]/.test(s)) s="'"+s; return '"'+s.replaceAll('"','""')+'"'; }

export function seedWorkspace(): Workspace {
  const players: Player[] = [
    {id:'maya',name:'Maya Torres',number:4,position:'Left back',goal:'Arrive side-on and show the line.'},
    {id:'jordan',name:'Jordan Ellis',number:8,position:'Central midfield',goal:'Scan before receiving under pressure.'},
    {id:'alex',name:'Alex Morgan',number:9,position:'Striker',goal:'Take the first touch toward goal.'},
    {id:'sam',name:'Sam Okafor',number:6,position:'Defensive midfield',goal:'Track the late runner.'},
    {id:'riley',name:'Riley Chen',number:5,position:'Centre back',goal:'Communicate before stepping up.'},
    {id:'avery',name:'Avery Brooks',number:1,position:'Goalkeeper',goal:'Set early for shots from distance.'},
    {id:'leo',name:'Leo Santos',number:7,position:'Right wing',goal:'Create width in the final third.'},
    {id:'casey',name:'Casey Williams',number:10,position:'Attacking midfield',goal:'Find space between the lines.'}
  ];
  const rows: [string,string,string,number,number,Category,string,string,string,Status][] = [
    ['demo-1','maya','Before the restart: find your player.',120,132,'Positioning','Film-study prompt: pause before the restart. Identify the nearest opponent and the space a defender needs to protect. This is a training assignment, not an identification of Maya in the footage.','Check the ball. Check your shoulder.','Set up a corner with three attackers and three defenders. Each defender calls out their mark before the delivery. 6 repetitions.','pending'],
    ['demo-2','jordan','Scan the shape before the pass.',150,162,'Decision making','Study the players away from the ball. Pause the clip and name two possible passing options. Watch again to see which spaces open or close.','Look early. Know your next option.','Three-player passing triangle: check your shoulder before receiving, then play to the free teammate. 8 minutes.','pending'],
    ['demo-3','maya','Defend the space, not just the ball.',165,177,'Technique','Watch the near-side players as the ball moves. Notice their distance from the touchline and their body shape. Ask where you would stand to see both ball and opponent.','Stay side-on. Keep both in view.','Channel 1v1s in a 10 × 8 m space. Steer your partner toward the line. 3 sets of 6.','published'],
    ['demo-4','sam','Read the play beyond the first action.',195,207,'Positioning','Use this sequence to practise looking beyond the ball. Pause and identify the next runner or available space before continuing.','Ball, space, next runner.','Two attackers against one defender: alternate attention between the passer and the runner. 10 minutes.','pending'],
    ['demo-5','maya','Stay available as the play develops.',240,252,'Great execution','Follow the off-ball movement in this sequence. Find a player who offers support, and explain why that position helps the team. This is a guided observation exercise.','Move again after the pass.','Pass-and-move triangle: follow each pass with a run into a new supporting angle. 8 minutes.','published'],
    ['demo-6','maya','Turn the clip into one training habit.',270,282,'Decision making','Watch this sequence twice: first follow the ball, then follow one off-ball player. What changes when you pay attention to the supporting movement?','Scan before the ball arrives.','Partner passing: look over your shoulder, call a cone colour, then receive on the half-turn. 3 sets of 8.','published']
  ];
  return {version:1,demoVersion:2,team:{name:'Riverside FC',age:'U17',coach:'Coach Ramirez',season:'Fall 2026'},players,
    matches:[{id:'utrecht-demo',opponent:'Ajax · Utrecht film study',date:'2018-12-23',competition:'Eredivisie · Curated film study',venue:'Utrecht',score:'1–3',duration:300,sample:true,videoSrc:'/demo-match.mp4',poster:'/demo-poster.jpg',sourceUrl:'https://commons.wikimedia.org/wiki/File:Utrecht_v_Ajax_Dec_2018.webm',createdAt:1}],
    moments:rows.map(([id,playerId,title,start,end,category,note,cue,drill,status])=>({id,matchId:'utrecht-demo',playerId,title,start,end,category,note,cue,drill,status,watched:false,completed:false,drawings:[]}))};
}

const dbPromise = openDB('filmiq-workspace',1,{upgrade(db){db.createObjectStore('workspace');db.createObjectStore('media');}});
export async function loadWorkspace(): Promise<Workspace> { const db=await dbPromise; const saved=await db.get('workspace','current'); if(saved) { if(!saved.demoVersion){const seed=seedWorkspace();const next={...saved,demoVersion:2,matches:[...seed.matches,...saved.matches.filter((m:Match)=>!m.sample)],moments:[...seed.moments,...saved.moments.filter((m:Moment)=>saved.matches.some((x:Match)=>x.id===m.matchId&&!x.sample))]};await db.put('workspace',next,'current');return next;} return saved; } const seed=seedWorkspace(); await db.put('workspace',seed,'current'); return seed; }
export async function saveWorkspace(data: Workspace) { await (await dbPromise).put('workspace',data,'current'); }
export async function saveMedia(id: string,file: Blob) { await (await dbPromise).put('media',file,id); }
export async function getMedia(id: string): Promise<Blob|undefined> { return (await dbPromise).get('media',id); }
export async function deleteMedia(id: string) { await (await dbPromise).delete('media',id); }
export async function removeMatch(data: Workspace,id: string) { const match=data.matches.find(m=>m.id===id); const next={...data,matches:data.matches.filter(m=>m.id!==id),moments:data.moments.filter(m=>m.matchId!==id)}; await saveWorkspace(next); if(match?.mediaId) await deleteMedia(match.mediaId); return next; }
export function download(name: string,text: string,type='text/plain') { const url=URL.createObjectURL(new Blob([text],{type})); const a=document.createElement('a'); a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }
export function reportCSV(data: Workspace,matchId?: string) { const rows=data.moments.filter(m=>(!matchId||m.matchId===matchId)&&m.status!=='skipped'); return [['Match','Player','Start','End','Category','Moment','Coach note','Cue','Drill','Status'],...rows.map(m=>[data.matches.find(x=>x.id===m.matchId)?.opponent,data.players.find(x=>x.id===m.playerId)?.name,clock(m.start),clock(m.end),m.category,m.title,m.note,m.cue,m.drill,m.status])].map(row=>row.map(csvCell).join(',')).join('\r\n'); }

export function demoClipURL(moment: Moment) {
 const ranges: Record<string,[number,number]>={'demo-1':[120,132],'demo-2':[150,162],'demo-3':[165,177],'demo-4':[195,207],'demo-5':[240,252],'demo-6':[270,282]};
 const r=ranges[moment.id];return moment.matchId==='utrecht-demo'&&r&&moment.start===r[0]&&moment.end===r[1]?`/demo-clips/${moment.id}.mp4`:undefined;
}
