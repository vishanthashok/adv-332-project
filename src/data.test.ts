import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { clock, csvCell, deleteMedia, demoClipURL, getMedia, loadWorkspace, parseClock, removeMatch, reportCSV, saveMedia, saveWorkspace, seedWorkspace, validRange } from './data';

describe('coaching timeline',()=>{
 it('accepts only ranges inside the actual video',()=>{expect(validRange(12,24,30)).toBe(true);for(const range of [[-1,5],[8,8],[20,35],[NaN,5]])expect(validRange(range[0],range[1],30)).toBe(false);});
 it('converts timestamp input without losing a minute',()=>{expect(parseClock('2:09')).toBe(129);expect(clock(129)).toBe('2:09');expect(clock(0)).toBe('0:00');});
 it('never links a pre-rendered demo clip after its time range changes',()=>{const m=seedWorkspace().moments[0];expect(demoClipURL(m)).toBe('/demo-clips/demo-1.mp4');expect(demoClipURL({...m,start:130})).toBeUndefined();expect(demoClipURL({...m,matchId:'own-upload'})).toBeUndefined();});
});
describe('private workspace storage',()=>{
 it('persists a video blob independently of metadata and cleans up only the deleted match',async()=>{const seed=seedWorkspace();const match={...seed.matches[0],id:'uploaded-test',sample:false,mediaId:'test-video',videoSrc:undefined};const data={...seed,matches:[...seed.matches,match],moments:[...seed.moments,{...seed.moments[0],id:'uploaded-moment',matchId:match.id}]};await saveMedia('test-video',new Blob(['test-video-data'],{type:'video/mp4'}));await saveWorkspace(data);expect((await loadWorkspace()).matches).toHaveLength(2);expect((await getMedia('test-video'))?.size).toBe(15);const removed=await removeMatch(data,match.id);expect(removed.matches).toHaveLength(1);expect(removed.moments.some(m=>m.id==='uploaded-moment')).toBe(false);expect(removed.moments.length).toBe(seed.moments.length);expect(await getMedia('test-video')).toBeUndefined();expect((await loadWorkspace()).matches).toHaveLength(1);});
 it('retains review, publication, and training completion across a reload',async()=>{const data=seedWorkspace();data.moments[0]={...data.moments[0],status:'published',watched:true,completed:true};await saveWorkspace(data);const loaded=await loadWorkspace();expect(loaded.moments[0]).toMatchObject({status:'published',watched:true,completed:true});});
});
describe('spreadsheet export',()=>{
 it('escapes quotes and spreadsheet formulas',()=>{expect(csvCell('a"b')).toBe('"a""b"');expect(csvCell('=SUM(A1)')).toBe('"\'=SUM(A1)"');});
 it('excludes skipped moments and unrelated matches',()=>{const data=seedWorkspace();data.moments[0].status='skipped';const csv=reportCSV(data,'utrecht-demo');expect(csv).not.toContain(data.moments[0].title);expect(csv).toContain(data.moments[1].title);expect(reportCSV(data,'missing').split('\r\n')).toHaveLength(1);});
});
