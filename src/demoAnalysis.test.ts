import 'fake-indexeddb/auto';
import { describe, expect, it, vi } from 'vitest';
import { loadWorkspace, saveWorkspace, seedWorkspace } from './data';
import { drillTemplates, feedbackMoment, heatPoints, radarProfile, weaknesses } from './demoAnalysis';

describe('cohesive demo workflow',()=>{
 it('keeps positional samples stable, in bounds and different by half and role',()=>{
 const roster=seedWorkspace().players;const keeper=roster.find(p=>p.id==='psg-safonov')!;const wide=roster.find(p=>p.id==='psg-hakimi')!;
 expect(heatPoints(wide,1)).toEqual(heatPoints(wide,1));expect(heatPoints(wide,1)).not.toEqual(heatPoints(wide,2));
 for(const player of roster)for(const half of [1,2])for(const p of heatPoints(player,half)){expect(p.x).toBeGreaterThanOrEqual(0);expect(p.x).toBeLessThanOrEqual(100);expect(p.y).toBeGreaterThanOrEqual(0);expect(p.y).toBeLessThanOrEqual(100);}
 const mean=(p:typeof keeper)=>heatPoints(p,1).reduce((n,q)=>n+q.x,0)/90;expect(mean(keeper)).toBeLessThan(mean(wide));
 });
 it('provides a usable training plan and a valid video reference for every weakness',()=>{
 const data=seedWorkspace();for(const weakness of weaknesses){const moment=data.moments.find(m=>m.id===weakness.moment)!;expect(moment.end).toBeLessThan(data.matches[0].duration);expect(data.players.some(p=>p.id===weakness.player)).toBe(true);const options=drillTemplates.filter(d=>d.weakness===weakness.id);expect(options.length).toBeGreaterThanOrEqual(2);for(const d of options){expect(d.setup.length).toBeGreaterThan(20);expect(d.instructions.length).toBeGreaterThanOrEqual(3);expect(d.cues.length).toBeGreaterThanOrEqual(3);}}
 });
 it('publishes the edited cue and complete drill into the existing persisted inbox without changing the source',async()=>{
 const data=seedWorkspace(),source=data.moments[0];const published=feedbackMoment(source,'psg-vitinha','Check both shoulders.','Review the covering angle.',drillTemplates[0]);
 expect(published.id).not.toBe(source.id);expect(source.status).toBe('pending');expect(published).toMatchObject({playerId:'psg-vitinha',cue:'Check both shoulders.',start:source.start,end:source.end,matchId:source.matchId,status:'published',watched:false,completed:false});expect(published.drill).toContain('Setup:');expect(published.note).toContain('DEMO DATA');
 await saveWorkspace({...data,moments:[published,...data.moments]});const loaded=await loadWorkspace();expect(loaded.moments.filter(m=>m.playerId==='psg-vitinha'&&m.status==='published')).toContainEqual(published);
 expect(()=>feedbackMoment(source,'psg-vitinha','  ','',drillTemplates[0])).toThrow();
 });
 it('recovers published metadata from localStorage when IndexedDB is temporarily unavailable',async()=>{
 const data=seedWorkspace();await saveWorkspace(data);
 const items=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(key:string)=>items.get(key)??null,setItem:(key:string,value:string)=>items.set(key,value)});
 const failure=vi.spyOn(IDBDatabase.prototype,'transaction').mockImplementation(()=>{throw new Error('Storage unavailable');});
 try {const published=feedbackMoment(data.moments[0],'psg-hakimi','Keep cover.','Demo explanation.',drillTemplates[0]);await saveWorkspace({...data,moments:[published,...data.moments]});const recovered=await loadWorkspace();expect(recovered.moments[0]).toEqual(published);}
 finally {failure.mockRestore();vi.unstubAllGlobals();}
 });
 it('prefers a newer localStorage save when an IndexedDB write fails but reads still work',async()=>{
 const data=seedWorkspace();await saveWorkspace(data);
 const items=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(key:string)=>items.get(key)??null,setItem:(key:string,value:string)=>items.set(key,value)});
 const failure=vi.spyOn(IDBObjectStore.prototype,'put').mockImplementation(()=>{throw new Error('Quota exceeded');});
 try {const published=feedbackMoment(data.moments[0],'psg-hakimi','Newer cue.','Demo explanation.',drillTemplates[0]);await saveWorkspace({...data,moments:[published,...data.moments]});failure.mockRestore();expect((await loadWorkspace()).moments[0]).toEqual(published);}
 finally {failure.mockRestore();vi.unstubAllGlobals();}
 });
 it('keeps the five comparison dimensions complete and in range',()=>{const profile=radarProfile(seedWorkspace().players[0]);expect(profile.map(p=>p.name)).toEqual(['Positioning','Passing','Awareness','Decision-making','Defensive discipline']);for(const p of profile){expect(p.previous).toBeGreaterThanOrEqual(0);expect(p.current).toBeLessThanOrEqual(100);}});
});
