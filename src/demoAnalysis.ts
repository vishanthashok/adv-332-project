import { uid, type Moment, type Player } from './data';
export const demoMatchId='psg-barcelona-demo';
export const dimensions=['Positioning','Passing','Awareness','Decision-making','Defensive discipline'];
export const strengths=[
 {title:'Turn recoveries into forward attacks',body:'The opening-goal sequence offers a useful example of quick forward support after possession changes.',moment:'psg-3'},
 {title:'Arrive into scoring space',body:'Use the late cutback to discuss the timing of a supporting run, rather than waiting inside the box.',moment:'psg-6'},
 {title:'Stretch the recovering defense',body:'The open-play attack offers a discussion about width, central runs and the space between recovering defenders.',moment:'psg-5'},
];
export const weaknesses=[
 {id:'cover',title:'Wide-channel defensive cover',body:'A coaching question: can the covering defender see the ball and the next runner as play moves wide?',moment:'psg-1',player:'psg-hakimi',cue:'Move with the pass. Check your shoulder. Keep your cover.'},
 {id:'angles',title:'Support outside the cover shadow',body:'Use the midfield passage to discuss earlier scanning and a clearer second passing option.',moment:'psg-4',player:'psg-vitinha',cue:'Scan before the pass. Step off the line. Offer an angle.'},
 {id:'finish',title:'Prepare the first touch to finish',body:'The saved chance is a prompt to rehearse body position and choosing a target before contact.',moment:'psg-2',player:'barca-raphinha',cue:'Open your body. Set the touch. Pick your corner.'},
];
export type Drill={id:string;weakness:string;title:string;duration:string;setup:string;instructions:string[];cues:string[]};
export const drillTemplates:Drill[]=[
 {id:'cover-1',weakness:'cover',title:'Slide, cover, recover',duration:'12 minutes',setup:'24 × 20 m channel; 3 attackers, 3 defenders, 2 mini goals, 8 cones and balls.',instructions:['Attackers switch the ball between wide channels.','Nearest defender presses; the second provides cover and the third tracks the runner.','Play 6 attacks, rotate roles, then repeat from the other side.'],cues:['Travel while the ball travels.','See the ball and your runner.','Protect the inside first.']},
 {id:'cover-2',weakness:'cover',title:'Recover the far-side runner',duration:'10 minutes',setup:'30 × 25 m area; 4 attackers, 3 defenders and a goalkeeper.',instructions:['Start each repetition with a pass to a wide attacker.','Defenders recover together as the far-side attacker runs toward goal.','Reset after a shot or recovery; rotate the recovering defender every 3 repetitions.'],cues:['Shoulder check before you turn.','Recover inside the runner.','Talk early.']},
 {id:'angles-1',weakness:'angles',title:'Escape the cover shadow',duration:'10 minutes',setup:'15 × 15 m diamond; 4 outside players, 1 defender, 4 cones and a ball.',instructions:['Pass around the diamond with a two-touch limit.','Receivers move sideways before the ball arrives to open a passing lane.','After 90 seconds rotate the defender; complete 4 rounds.'],cues:['Scan while the ball travels.','Move off the defender’s line.','Receive on the back foot.']},
 {id:'angles-2',weakness:'angles',title:'Third-player connection',duration:'12 minutes',setup:'20 × 20 m square; 4 possession players, 2 defenders, 4 cones.',instructions:['Keep possession with two touches.','Score a point when a layoff finds a third player through a new angle.','Play 4 rounds of 2 minutes with a minute to discuss and reset.'],cues:['Support at a different height.','Check both shoulders.','Pass and move again.']},
 {id:'finish-1',weakness:'finish',title:'Cutback, set, finish',duration:'12 minutes',setup:'Penalty area; 2 wide servers, 2 finishers, goalkeeper, balls and target gates.',instructions:['A wide server delivers a cutback to an arriving finisher.','Finisher takes one preparation touch if needed and aims through a target gate.','Alternate sides for 3 sets of 6 finishes; rotate the server each set.'],cues:['Look at the target before receiving.','Open your hips.','Place the finish.']},
 {id:'finish-2',weakness:'finish',title:'Scan the target gate',duration:'10 minutes',setup:'18 × 20 m area; partner server, finisher, 2 colored target gates and balls.',instructions:['Server calls a gate color just before passing.','Finisher scans, receives across the body and finishes through the called gate.','Complete 3 sets of 6 and exchange roles between sets.'],cues:['Eyes up before the touch.','Keep the ball within striking distance.','Accuracy before power.']},
];
export function heatPoints(player:Player,half:number){
 let seed=[...player.id].reduce((n,c)=>n*31+c.charCodeAt(0),7)>>>0;seed=(seed+half*104729)>>>0;
 const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 const role=player.position.toLowerCase();let x=52,y=50,sx=25,sy=25;
 if(/goalkeeper|^gk$/.test(role)){x=10;sx=9;sy=17;}else if(/centre.back|center.back|^cb$/.test(role)){x=29;sx=18;sy=20;}else if(/right.back|^rb$/.test(role)){x=47;y=83;sx=30;sy=15;}else if(/left.back|^lb$/.test(role)){x=47;y=17;sx=30;sy=15;}else if(/right.wing|^rw$/.test(role)){x=73;y=82;sx=24;sy=15;}else if(/left.wing|^lw$/.test(role)){x=73;y=18;sx=24;sy=15;}else if(/striker|forward/.test(role)){x=79;sx=19;sy=25;}else if(/defensive|^dm$/.test(role)){x=42;sx=23;}else if(/attacking|^am$/.test(role)){x=66;sx=24;}
 return Array.from({length:90},()=>({x:Math.max(3,Math.min(97,x+(half===2?4:0)+(random()+random()+random()-1.5)*sx)),y:Math.max(4,Math.min(96,y+(random()+random()+random()-1.5)*sy))}));
}
export function radarProfile(player:Player){const seed=[...player.id].reduce((n,c)=>n+c.charCodeAt(0),0);return dimensions.map((name,i)=>{const previous=48+(seed+i*13)%25;return {name,previous,current:Math.min(92,previous+4+(seed+i*7)%12)};});}
export function drillText(drill:Drill){return `${drill.title} · ${drill.duration}\nSetup: ${drill.setup}\n${drill.instructions.map((s,i)=>`${i+1}. ${s}`).join('\n')}\nCoaching cues: ${drill.cues.join(' ')}`;}
export function feedbackMoment(source:Moment,playerId:string,cue:string,note:string,drill:Drill):Moment{
 if(!playerId||!cue.trim())throw new Error('Choose a player and add a coaching cue.');
 return {...source,id:uid(),playerId,title:`Training focus: ${drill.title}`,cue:cue.trim(),note:`DEMO DATA · Coach-edited feedback from the curated PSG–Barcelona film study.\n${note.trim()}`,drill:drillText(drill),status:'published',watched:false,completed:false,drawings:source.drawings.map(d=>({...d}))};
}
