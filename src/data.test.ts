import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { clock, csvCell, deleteMedia, demoClipURL, getMedia, loadWorkspace, migrateDemo, parseClock, removeMatch, reportCSV, saveMedia, saveWorkspace, seedWorkspace, validRange } from './data';

describe('coaching timeline',()=>{
 it('accepts only ranges inside the actual video',()=>{expect(validRange(12,24,30)).toBe(true);for(const range of [[-1,5],[8,8],[20,35],[NaN,5]])expect(validRange(range[0],range[1],30)).toBe(false);});
 it('converts timestamp input without losing a minute',()=>{expect(parseClock('2:09')).toBe(129);expect(clock(129)).toBe('2:09');expect(clock(0)).toBe('0:00');});
 it('never links a pre-rendered demo clip after its time range changes',()=>{const m=seedWorkspace().moments[0];expect(demoClipURL(m)).toBe('/psg-clips/psg-1.mp4');expect(demoClipURL({...m,start:130})).toBeUndefined();expect(demoClipURL({...m,matchId:'own-upload'})).toBeUndefined();});
});
describe('private workspace storage',()=>{
 it('persists a video blob independently of metadata and cleans up only the deleted match',async()=>{const seed=seedWorkspace();const match={...seed.matches[0],id:'uploaded-test',sample:false,mediaId:'test-video',videoSrc:undefined};const data={...seed,matches:[...seed.matches,match],moments:[...seed.moments,{...seed.moments[0],id:'uploaded-moment',matchId:match.id}]};await saveMedia('test-video',new Blob(['test-video-data'],{type:'video/mp4'}));await saveWorkspace(data);expect((await loadWorkspace()).matches).toHaveLength(2);expect((await getMedia('test-video'))?.size).toBe(15);const removed=await removeMatch(data,match.id);expect(removed.matches).toHaveLength(1);expect(removed.moments.some(m=>m.id==='uploaded-moment')).toBe(false);expect(removed.moments.length).toBe(seed.moments.length);expect(await getMedia('test-video')).toBeUndefined();expect((await loadWorkspace()).matches).toHaveLength(1);});
 it('retains review, publication, and training completion across a reload',async()=>{const data=seedWorkspace();data.moments[0]={...data.moments[0],status:'published',watched:true,completed:true};await saveWorkspace(data);const loaded=await loadWorkspace();expect(loaded.moments[0]).toMatchObject({status:'published',watched:true,completed:true});});
});
describe('spreadsheet export',()=>{
 it('escapes quotes and spreadsheet formulas',()=>{expect(csvCell('a"b')).toBe('"a""b"');expect(csvCell('=SUM(A1)')).toBe('"\'=SUM(A1)"');});
 it('excludes skipped moments and unrelated matches',()=>{const data=seedWorkspace();data.moments[0].status='skipped';const csv=reportCSV(data,'psg-barcelona-demo');expect(csv).not.toContain(data.moments[0].title);expect(csv).toContain(data.moments[1].title);expect(reportCSV(data,'missing').split('\r\n')).toHaveLength(1);});
});

describe('demo replacement',()=>{
 it('replaces the old sample while preserving uploaded videos and their feedback',()=>{
 const seed=seedWorkspace();const own={...seed.matches[0],id:'own-game',sample:false,mediaId:'private-video'};
 const old={...seed,demoVersion:2,matches:[{...seed.matches[0],id:'utrecht-demo'},own],moments:[{...seed.moments[0],id:'old-example',matchId:'utrecht-demo'},{...seed.moments[0],id:'my-coaching',matchId:'own-game',status:'published' as const,watched:true}]};
 const migrated=migrateDemo(old);expect(migrated.matches.map(m=>m.id)).toEqual(['own-game','psg-barcelona-demo']);expect(migrated.moments.find(m=>m.id==='my-coaching')).toMatchObject({watched:true,status:'published'});expect(migrated.moments.some(m=>m.id==='old-example')).toBe(false);expect(migrated.matches[0].mediaId).toBe('private-video');
 });
 it('does not restore a demo the user has removed after migration',()=>{const saved={...seedWorkspace(),matches:[],moments:[]};expect(migrateDemo(saved)).toBe(saved);});
});

describe('verified matchday roster',()=>{
 it('has both full squads, unambiguous identities, and valid clip assignments',()=>{
  const data=seedWorkspace();expect(data.players).toHaveLength(46);
  for(const club of ['PSG','Barcelona']){const squad=data.players.filter(p=>p.club===club);expect(squad).toHaveLength(23);expect(squad.filter(p=>p.squadRole==='Starter')).toHaveLength(11);expect(new Set(squad.map(p=>p.number)).size).toBe(23);}
  expect(new Set(data.players.map(p=>p.id)).size).toBe(46);
  for(const m of data.moments)expect(data.players.some(p=>p.id===m.playerId)).toBe(true);
  expect(data.moments.find(m=>m.id==='psg-3')?.playerId).toBe('psg-doue');
  expect(data.moments.find(m=>m.id==='psg-5')?.playerId).toBe('psg-hernandez');
  expect(data.moments.find(m=>m.id==='psg-6')?.playerId).toBe('psg-ruiz');
 });
 it('removes unused placeholder players but preserves identities referenced by uploaded footage',()=>{
  const seed=seedWorkspace();const old={...seed,rosterVersion:undefined,team:{name:'Riverside FC',age:'U17',coach:'Coach Ramirez',season:'Fall 2026'},players:[{id:'maya',name:'Maya Torres',number:4,position:'Left back',goal:''},{id:'jordan',name:'Jordan Ellis',number:8,position:'Central midfield',goal:''}],matches:[...seed.matches,{...seed.matches[0],id:'own-footage',sample:false,mediaId:'own-blob'}],moments:[{...seed.moments[0],playerId:'maya'},{...seed.moments[1],id:'my-note',matchId:'own-footage',playerId:'maya'}]};
  const next=migrateDemo(old);expect(next.players.some(p=>p.id==='jordan')).toBe(false);expect(next.players.find(p=>p.id==='maya')?.club).toBe('Custom');expect(next.moments.find(m=>m.id==='my-note')?.playerId).toBe('maya');expect(next.moments.find(m=>m.id==='psg-1')?.playerId).toBe('psg-hakimi');expect(next.team.name).toBe('Paris Saint-Germain');
 });
});
