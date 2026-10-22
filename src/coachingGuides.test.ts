import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { migrateDemo, seedWorkspace } from './data';
import { coachingGuides, guideForMoment } from './coachingGuides';
import { drillTemplates, feedbackMoment } from './demoAnalysis';
describe('frame-specific video coaching',()=>{
 it('places each freeze inside its source clip with bounded video annotations',()=>{const data=seedWorkspace();expect(coachingGuides.length).toBe(6);for(const moment of data.moments){const guide=guideForMoment(moment)!;expect(guide).toBeDefined();expect(guide.freeze).toBeGreaterThan(moment.start);expect(guide.freeze).toBeLessThan(moment.end);for(const drawing of guide.drawings){for(const x of [drawing.x1,drawing.x2]){expect(x).toBeGreaterThanOrEqual(0);expect(x).toBeLessThanOrEqual(100);}for(const y of [drawing.y1,drawing.y2]){expect(y).toBeGreaterThanOrEqual(0);expect(y).toBeLessThanOrEqual(56.25);}}}});
 it('corrects the old corner caption without replacing coach edits or review progress',()=>{const data=seedWorkspace(),source=data.moments.find(m=>m.id==='psg-5')!;source.title='Meet the cross. Track the runner.';source.cue='My own coaching cue.';source.watched=true;const changed=migrateDemo(data).moments.find(m=>m.id==='psg-5')!;expect(changed.title).toBe('Keep the runner and goal in view.');expect(changed.cue).toBe('My own coaching cue.');expect(changed.watched).toBe(true);});
 it('reuses the source teaching frame in published feedback and refuses unrelated or retimed footage',()=>{const source=seedWorkspace().moments[0],feedback=feedbackMoment(source,'psg-hakimi','Cover inside.','Watch the runner.',drillTemplates[0]);expect(guideForMoment(feedback)).toEqual(guideForMoment(source));expect(guideForMoment({...source,start:41})).toBeUndefined();expect(guideForMoment({...source,matchId:'own-video'})).toBeUndefined();});
});
