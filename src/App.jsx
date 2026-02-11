import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Plus, Minus, Play, Pause, ChevronRight, Skull, Zap, Shield, Wind, Heart, Eye, X, Check, Trophy, Home, BookOpen, ArrowLeft, RotateCcw, Menu } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

class V{constructor(x=0,y=0){this.x=x;this.y=y}add(v){this.x+=v.x;this.y+=v.y;return this}sub(v){return new V(this.x-v.x,this.y-v.y)}mul(n){this.x*=n;this.y*=n;return this}mag(){return Math.sqrt(this.x*this.x+this.y*this.y)}norm(){const m=this.mag();if(m>0)this.mul(1/m);return this}lim(mx){if(this.mag()>mx)this.norm().mul(mx);return this}cl(){return new V(this.x,this.y)}static d(a,b){return Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2)}static r(){return new V(Math.random()*2-1,Math.random()*2-1)}}
class Blt{constructor(x,y,a,t,d){this.p=new V(x,y);this.v=new V(Math.cos(a)*5,Math.sin(a)*5);this.team=t;this.dmg=d;this.life=45}update(){this.p.add(this.v);this.life--}dead(){return this.life<=0}}
class Fx{constructor(x,y,c='#fff',l=20){this.p=new V(x,y);this.v=V.r().mul(Math.random()*2+.5);this.life=l;this.mxL=l;this.col=c;this.r=1+Math.random()*3}update(){this.p.add(this.v);this.v.mul(.93);this.life--}dead(){return this.life<=0}}

const BEH=[{id:'random',name:'隨機遊蕩',icon:'🎲',d:'隨機移動，餓了找食物'},{id:'aggressive',name:'主動進攻',icon:'⚔️',d:'積極尋敵攻擊'},{id:'forage',name:'優先覓食',icon:'🍀',d:'專注覓食，遇敵迴避'},{id:'flock',name:'靠近友方',icon:'🤝',d:'向友方聚集移動'},{id:'defensive',name:'陣形防守',icon:'🏰',d:'結陣防守，近敵反擊'},{id:'evasive',name:'迴避敵方',icon:'🏃',d:'遠離敵人，安全覓食'},{id:'predator',name:'獵殺弱敵',icon:'🎯',d:'鎖定血量最低敵人'},{id:'protector',name:'保護友方',icon:'👑',d:'守護最弱的友方'}];
const CLS=[{id:'warrior',name:'戰士',icon:'⚔️'},{id:'hunter',name:'獵手',icon:'🏹'},{id:'guardian',name:'守衛',icon:'🛡️'},{id:'mage',name:'法師',icon:'💫'},{id:'healer',name:'治療',icon:'💚'},{id:'scout',name:'斥候',icon:'🦅'}];
const SD=[{key:'speed',label:'速度',icon:Wind,color:'text-cyan-400'},{key:'attack',label:'攻擊',icon:Zap,color:'text-red-400'},{key:'armor',label:'護甲',icon:Shield,color:'text-yellow-400'},{key:'perception',label:'感知',icon:Eye,color:'text-purple-400'},{key:'vitality',label:'生命',icon:Heart,color:'text-green-400'}];
const FC=[{h:210,n:'藍',bg:'#3b82f6'},{h:0,n:'紅',bg:'#ef4444'},{h:142,n:'綠',bg:'#22c55e'},{h:30,n:'橙',bg:'#f97316'},{h:270,n:'紫',bg:'#a855f7'},{h:187,n:'青',bg:'#06b6d4'},{h:330,n:'粉',bg:'#ec4899'},{h:50,n:'黃',bg:'#eab308'},{h:239,n:'靛',bg:'#6366f1'},{h:100,n:'萊',bg:'#84cc16'}];
const TPR=[{id:'nearest',n:'最近',i:'📍'},{id:'weakest',n:'最弱',i:'💔'},{id:'strongest',n:'最強',i:'💪'}];
const MXP=15,DST={speed:3,attack:3,armor:3,perception:3,vitality:3};
const PRE=[
{n:'均衡',s:{speed:3,attack:3,armor:3,perception:3,vitality:3}},
{n:'狂戰',s:{speed:4,attack:5,armor:2,perception:1,vitality:3}},
{n:'重甲',s:{speed:1,attack:2,armor:5,perception:2,vitality:5}},
{n:'敏捷',s:{speed:5,attack:3,armor:1,perception:4,vitality:2}},
{n:'刺客',s:{speed:5,attack:5,armor:1,perception:3,vitality:1}},
{n:'坦克',s:{speed:1,attack:1,armor:5,perception:1,vitality:7}},
{n:'遊俠',s:{speed:4,attack:2,armor:2,perception:5,vitality:2}},
{n:'聖騎',s:{speed:2,attack:3,armor:4,perception:2,vitality:4}},
{n:'狙擊',s:{speed:2,attack:6,armor:1,perception:5,vitality:1}},
{n:'鬥士',s:{speed:3,attack:4,armor:3,perception:1,vitality:4}},
{n:'術士',s:{speed:2,attack:5,armor:1,perception:4,vitality:3}},
{n:'守望',s:{speed:3,attack:1,armor:3,perception:5,vitality:3}},
];
const rSt=t=>{const k=Object.keys(DST),s={};k.forEach(x=>s[x]=1);let r=t-5;while(r>0){const x=k[Math.floor(Math.random()*k.length)];if(s[x]<10){s[x]++;r--}}return s};
const rP=a=>a[Math.floor(Math.random()*a.length)];
const drawShape=(ctx,cid,sz)=>{ctx.beginPath();switch(cid){case'warrior':ctx.moveTo(sz*1.7,0);ctx.lineTo(-sz,-sz*1.1);ctx.lineTo(-sz*.3,0);ctx.lineTo(-sz,sz*1.1);break;case'hunter':ctx.moveTo(sz*2,0);ctx.lineTo(0,-sz*.7);ctx.lineTo(-sz*.7,0);ctx.lineTo(0,sz*.7);break;case'guardian':for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2-Math.PI/2;ctx[i?'lineTo':'moveTo'](Math.cos(a)*sz*1.2,Math.sin(a)*sz*1.2)}break;case'mage':for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2-Math.PI/4;const r2=i%2?sz*.55:sz*1.3;ctx[i?'lineTo':'moveTo'](Math.cos(a)*r2,Math.sin(a)*r2)}break;case'healer':ctx.arc(0,0,sz*.9,0,Math.PI*2);break;case'scout':ctx.moveTo(sz*2.2,0);ctx.lineTo(-sz*.3,-sz*.5);ctx.lineTo(sz*.1,0);ctx.lineTo(-sz*.3,sz*.5);break;default:ctx.moveTo(sz,0);ctx.lineTo(-sz,-sz);ctx.lineTo(-sz,sz)}ctx.closePath();ctx.fill()};

let uid=0;
class Cr{
constructor(x,y,team,st,cls,beh='aggressive',tPri='nearest'){
this.id=uid++;this.team=team;this.cls=cls;this.beh=beh;this.tPri=tPri;
this.pos=new V(x,y);this.vel=V.r().mul(.5);this.acc=new V();this.age=0;this.kills=0;this.st={...st};this.wasHit=0;
let sm=1,am=1,dm=1,hm=1;if(cls.id==='warrior')am=1.3;if(cls.id==='scout'){sm=1.3;hm=.85}if(cls.id==='healer')am=.7;if(cls.id==='guardian'){sm=.92;dm=1.2}
this.mxSpd=(1+st.speed*.35)*sm;this.sense=40+st.perception*18;this.sz=4+st.armor*.7;this.atk=(3+st.attack*2.5)*am;this.dm=dm;this.mxE=(60+st.vitality*28)*hm;this.energy=this.mxE*.55;
this.trail=[];this.df=0;this.eat=0;this.aCD=0;this.abCD=0;this.spR=false;this.spQ=false;this.spCD=0;this.glow=0;this.ring=0;this.splitCnt=0}
pickT(l){if(!l.length)return null;if(this.tPri==='weakest')return l.reduce((a,b)=>a.energy<b.energy?a:b);if(this.tPri==='strongest')return l.reduce((a,b)=>a.energy>b.energy?a:b);return l.reduce((a,b)=>V.d(this.pos,a.pos)<V.d(this.pos,b.pos)?a:b)}
think(food,ts,mt,w,h){const sn=this.sense,als=[],ens=[];
if(ts[mt])for(const c of ts[mt])if(c.id!==this.id&&c.energy>0&&V.d(this.pos,c.pos)<sn)als.push(c);
for(let t=0;t<ts.length;t++){if(t===mt)continue;if(ts[t])for(const c of ts[t])if(c.energy>0&&V.d(this.pos,c.pos)<sn*1.2)ens.push(c)}
const nf=food.filter(f=>V.d(this.pos,f)<sn);const nr=nf.length?nf.reduce((a,b)=>V.d(this.pos,a)<V.d(this.pos,b)?a:b):null;
let dx=0,dy=0;
switch(this.beh){
case'random':dx=this.vel.x+(Math.random()-.5)*.4;dy=this.vel.y+(Math.random()-.5)*.4;if(this.energy<this.mxE*.7&&nr){const d=nr.sub(this.pos).norm();dx+=d.x*this.mxSpd*.5;dy+=d.y*this.mxSpd*.5}break;
case'aggressive':{const tg=this.pickT(ens);if(tg){const d=tg.pos.sub(this.pos).norm();dx=d.x*this.mxSpd;dy=d.y*this.mxSpd}else if(nr){const d=nr.sub(this.pos).norm();dx=d.x*this.mxSpd*.6;dy=d.y*this.mxSpd*.6}else{dx=this.vel.x+(Math.random()-.5)*.2;dy=this.vel.y+(Math.random()-.5)*.2}break}
case'forage':if(nr){const d=nr.sub(this.pos).norm();dx=d.x*this.mxSpd*.9;dy=d.y*this.mxSpd*.9}if(ens.length){const ne=ens.reduce((a,b)=>V.d(this.pos,a.pos)<V.d(this.pos,b.pos)?a:b);if(V.d(this.pos,ne.pos)<sn*.5){const d=this.pos.sub(ne.pos).norm();dx+=d.x*this.mxSpd*.5;dy+=d.y*this.mxSpd*.5}}if(!nr&&!ens.length){dx=this.vel.x+(Math.random()-.5)*.3;dy=this.vel.y+(Math.random()-.5)*.3}break;
case'flock':if(als.length){let cx=0,cy=0;for(const a of als){cx+=a.pos.x;cy+=a.pos.y}cx/=als.length;cy/=als.length;const d=new V(cx-this.pos.x,cy-this.pos.y).norm();dx=d.x*this.mxSpd*.7;dy=d.y*this.mxSpd*.7}if(nr&&this.energy<this.mxE*.8){const d=nr.sub(this.pos).norm();dx+=d.x*this.mxSpd*.3;dy+=d.y*this.mxSpd*.3}dx+=(Math.random()-.5)*.2;dy+=(Math.random()-.5)*.2;break;
case'defensive':{const ce=ens.filter(e=>V.d(this.pos,e.pos)<sn*.4);if(ce.length){const tg=this.pickT(ce);if(tg){const d=tg.pos.sub(this.pos).norm();dx=d.x*this.mxSpd*.8;dy=d.y*this.mxSpd*.8}}else if(als.length){let cx=0,cy=0;for(const a of als){cx+=a.pos.x;cy+=a.pos.y}cx/=als.length;cy/=als.length;const d=new V(cx-this.pos.x,cy-this.pos.y).norm();dx=d.x*this.mxSpd*.5;dy=d.y*this.mxSpd*.5}if(nr){const d=nr.sub(this.pos).norm();dx+=d.x*this.mxSpd*.2;dy+=d.y*this.mxSpd*.2}break}
case'evasive':if(ens.length){const ne=ens.reduce((a,b)=>V.d(this.pos,a.pos)<V.d(this.pos,b.pos)?a:b);const d=this.pos.sub(ne.pos).norm();dx=d.x*this.mxSpd;dy=d.y*this.mxSpd}else if(nr){const d=nr.sub(this.pos).norm();dx=d.x*this.mxSpd*.7;dy=d.y*this.mxSpd*.7}else{dx=this.vel.x+(Math.random()-.5)*.2;dy=this.vel.y+(Math.random()-.5)*.2}break;
case'predator':{const wk=ens.length?ens.reduce((a,b)=>(a.energy/a.mxE)<(b.energy/b.mxE)?a:b):null;if(wk){const d=wk.pos.sub(this.pos).norm();dx=d.x*this.mxSpd;dy=d.y*this.mxSpd}else if(nr){const d=nr.sub(this.pos).norm();dx=d.x*this.mxSpd*.6;dy=d.y*this.mxSpd*.6}else{dx=this.vel.x+(Math.random()-.5)*.2;dy=this.vel.y+(Math.random()-.5)*.2}break}
case'protector':{const wa=als.length?als.reduce((a,b)=>(a.energy/a.mxE)<(b.energy/b.mxE)?a:b):null;if(wa){if(V.d(this.pos,wa.pos)>25){const d=wa.pos.sub(this.pos).norm();dx=d.x*this.mxSpd*.7;dy=d.y*this.mxSpd*.7}const ne=ens.filter(e=>V.d(wa.pos,e.pos)<sn*.6);if(ne.length){const tg=this.pickT(ne);if(tg){const d=tg.pos.sub(this.pos).norm();dx+=d.x*this.mxSpd*.5;dy+=d.y*this.mxSpd*.5}}}else if(nr){const d=nr.sub(this.pos).norm();dx=d.x*this.mxSpd*.5;dy=d.y*this.mxSpd*.5}break}}
const des=new V(dx,dy).lim(this.mxSpd);this.acc.add(des.sub(this.vel).lim(.35));
const margin=40;
if(this.pos.x<margin)this.acc.x+=.3;if(this.pos.x>w-margin)this.acc.x-=.3;
if(this.pos.y<margin)this.acc.y+=.3;if(this.pos.y>h-margin)this.acc.y-=.3}
ability(als,ens,bls){if(this.abCD>0)return;
if(this.cls.id==='hunter'){let n=null,nd=1e9;for(const e of ens){if(e.energy<=0)continue;const d=V.d(this.pos,e.pos);if(d<this.sense*1.5&&d<nd){nd=d;n=e}}if(n){bls.push(new Blt(this.pos.x,this.pos.y,Math.atan2(n.pos.y-this.pos.y,n.pos.x-this.pos.x),this.team,this.atk*.45));this.abCD=75}}
else if(this.cls.id==='healer'){let tg=null,lo=1;for(const a of als){if(a.id===this.id||a.energy<=0)continue;const d=V.d(this.pos,a.pos);const r2=a.energy/a.mxE;if(d<65&&r2<lo){lo=r2;tg=a}}if(tg&&lo<.85){tg.energy=Math.min(tg.energy+7+this.st.vitality,tg.mxE);tg.glow=10;this.abCD=50}}
else if(this.cls.id==='mage'){let hit=false;for(const e of ens){if(e.energy<=0)continue;if(V.d(this.pos,e.pos)<55){e.energy-=this.atk*.45;e.df=8;hit=true}}if(hit){this.abCD=95;this.ring=12}}}
update(){this.vel.add(this.acc).lim(this.mxSpd);this.pos.add(this.vel);this.acc=new V();this.energy-=.04+this.vel.mag()*.012;this.age++;
if(this.df>0)this.df--;if(this.eat>0)this.eat--;if(this.aCD>0)this.aCD--;if(this.abCD>0)this.abCD--;if(this.spCD>0)this.spCD--;if(this.glow>0)this.glow--;if(this.ring>0)this.ring--;if(this.wasHit>0)this.wasHit--;
this.trail.push({x:this.pos.x,y:this.pos.y});if(this.trail.length>6)this.trail.shift()}
edges(w,h){this.pos.x=Math.max(2,Math.min(w-2,this.pos.x));this.pos.y=Math.max(2,Math.min(h-2,this.pos.y));
if(this.pos.x<=2||this.pos.x>=w-2)this.vel.x*=-.7;
if(this.pos.y<=2||this.pos.y>=h-2)this.vel.y*=-.7}
canSplit(teamPop){return this.spCD<=0&&this.energy>this.mxE*.92&&this.age>500&&this.splitCnt<3&&teamPop<30}
split(s2,c2,b2,t2){const ch=new Cr(this.pos.x+Math.random()*20-10,this.pos.y+Math.random()*20-10,this.team,s2,c2,b2,t2);ch.energy=this.energy*.3;this.energy*=.3;this.spR=false;this.spQ=false;this.spCD=900;ch.spCD=900;this.splitCnt++;return ch}}

const StatA=({stats,onChange})=>{const used=Object.values(stats).reduce((a,b)=>a+b,0);
const set=(k,v)=>{if(v<0||v>10)return;if(used-stats[k]+v>MXP)return;onChange({...stats,[k]:v})};
return(<div className="space-y-1.5">
<div className="flex justify-between text-sm"><span className="text-gray-500">技能點</span><span className={used>=MXP?'text-amber-400 font-bold':'text-gray-400'}>{used}/{MXP}</span></div>
<div className="flex flex-wrap gap-1.5 mb-1.5">{PRE.map((p,i)=><button key={i} onClick={()=>onChange({...p.s})} className="px-2.5 py-1.5 text-xs sm:text-sm bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 transition-colors">{p.n}</button>)}</div>
{SD.map(sd=>{const I=sd.icon;return(<div key={sd.key} className="flex items-center gap-2"><div className="flex items-center gap-1.5 w-14 sm:w-16 shrink-0"><I size={16} className={sd.color}/><span className="text-sm text-gray-300">{sd.label}</span></div>
<button onClick={()=>set(sd.key,stats[sd.key]-1)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 active:bg-gray-600"><Minus size={16}/></button>
<div className="flex-1 flex gap-1">{Array.from({length:10}).map((_,i)=>(<div key={i} onClick={()=>set(sd.key,i+1)} className={`h-5 flex-1 rounded-sm cursor-pointer transition-colors ${i<stats[sd.key]?'bg-blue-500':'bg-gray-700 opacity-30'}`}/>))}</div>
<button onClick={()=>set(sd.key,stats[sd.key]+1)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 active:bg-gray-600"><Plus size={16}/></button>
<span className="w-6 sm:w-7 text-center text-sm font-bold text-gray-300">{stats[sd.key]}</span></div>)})}</div>)};

const HomeParticles = () => {
  const cvRef = useRef(null);
  const boxRef = useRef(null);
  useEffect(() => {
    const cv = cvRef.current, bx = boxRef.current;
    if (!cv || !bx) return;
    const rc = bx.getBoundingClientRect();
    cv.width = rc.width; cv.height = rc.height;
    const w = rc.width, h = rc.height;
    const ps = [];
    for (let i = 0; i < 60; i++) ps.push({ x: Math.random()*w, y: Math.random()*h, vx: (Math.random()-.5)*1.2, vy: (Math.random()-.5)*1.2, r: 2+Math.random()*4, hue: [210,0,142,30,270,187][Math.floor(Math.random()*6)], life: Math.random() });
    let raf;
    const loop = () => {
      const ctx = cv.getContext('2d');
      ctx.fillStyle = 'rgba(8,10,18,0.15)'; ctx.fillRect(0,0,w,h);
      for (const p of ps) {
        p.x += p.vx; p.y += p.vy; p.life += 0.005;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const a = 0.3 + Math.sin(p.life * 3) * 0.2;
        ctx.globalAlpha = a;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `hsl(${p.hue},70%,55%)`; ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(() => { const r2 = bx.getBoundingClientRect(); cv.width = r2.width; cv.height = r2.height; });
    ro.observe(bx);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <div ref={boxRef} className="absolute inset-0 overflow-hidden"><canvas ref={cvRef} className="w-full h-full" /></div>;
};

export default function Game(){
const[phase,setPhase]=useState('home');const[fCnt,setFCnt]=useState(2);
const[roster,setRoster]=useState([]);const[selCls,setSelCls]=useState(CLS[0]);const[selBeh,setSelBeh]=useState(BEH[1]);
const[selTP,setSelTP]=useState('nearest');const[dSt,setDSt]=useState({...DST});
const[speed,setSpeed]=useState(1);const[paused,setPaused]=useState(false);
const[pauseMenu,setPauseMenu]=useState(false);
const[info,setInfo]=useState({fc:[],wave:0,f:0,kills:0,elim:[]});
const[sMod,setSMod]=useState(null);const[sSt,setSSt]=useState({...DST});const[sCls,setSCls]=useState(CLS[0]);
const[sBeh,setSBeh]=useState(BEH[1]);const[sTP,setSTP]=useState('nearest');
const[result,setResult]=useState(null);
const simR=useRef(null),cvR=useRef(null),boxR=useRef(null);
const wR=useRef(800),hR=useRef(500),pR=useRef(false),spR=useRef(1),rafR=useRef(null),endR=useRef(false),smR=useRef(null),fcR=useRef(2),rCntR=useRef(3);
useEffect(()=>{spR.current=speed},[speed]);
useEffect(()=>{pR.current=paused||sMod!==null;smR.current=sMod},[paused,sMod]);
const addR=()=>{if(roster.length>=8||Object.values(dSt).reduce((a,b)=>a+b,0)>MXP)return;setRoster(p=>[...p,{st:{...dSt},cls:selCls,beh:selBeh.id,tPri:selTP}]);};
const rmR=i=>setRoster(p=>p.filter((_,j)=>j!==i));
const handleEnd=useCallback(d=>{setResult(d);setTimeout(()=>setPhase('result'),500)},[]);
const onEndR=useRef(handleEnd);onEndR.current=handleEnd;

const goHome=()=>{if(rafR.current)cancelAnimationFrame(rafR.current);setPaused(false);setPauseMenu(false);setSMod(null);setResult(null);setPhase('home')};

const initBattle=useCallback(()=>{uid=0;fcR.current=fCnt;rCntR.current=roster.length;
const w=wR.current,h=hR.current,cr=[],fd=[],fx=[],bl=[];
const pCount=roster.length;
roster.forEach((r,i)=>{const y=(h/(pCount+1))*(i+1);cr.push(new Cr(60+Math.random()*30,y,0,r.st,r.cls,r.beh,r.tPri))});
for(let t=1;t<fCnt;t++){const sx=w*((t)/(fCnt-0.5));for(let i=0;i<pCount;i++){const st=rSt(11);cr.push(new Cr(Math.min(w-60,sx)+(Math.random()-.5)*30,(h/(pCount+1))*(i+1),t,st,rP(CLS),rP(BEH).id,rP(TPR).id))}}
for(let i=0;i<80;i++)fd.push(new V(Math.random()*w,Math.random()*h));
simR.current={cr,fd,fx,bl,f:0,wave:0,nextW:700,kills:0,wAnn:0,elim:new Set(),eAnn:null};endR.current=false},[roster,fCnt]);

const startB=()=>{if(roster.length<1)return;setResult(null);setSMod(null);setPaused(false);setPauseMenu(false);setSpeed(1);setPhase('battle')};
const confirmS=()=>{const sm=smR.current;if(!sm||!simR.current)return;const c=simR.current.cr.find(x=>x.id===sm.id);
if(c&&c.energy>0){const ch=c.split(sSt,sCls,sBeh.id,sTP);simR.current.cr.push(ch);for(let i=0;i<6;i++)simR.current.fx.push(new Fx(c.pos.x,c.pos.y,FC[0].bg,20))}
smR.current=null;setSMod(null)};
const skipS=()=>{const sm=smR.current;if(!sm||!simR.current)return;const c=simR.current.cr.find(x=>x.id===sm.id);if(c){c.spR=false;c.spQ=false;c.spCD=900}smR.current=null;setSMod(null)};

useEffect(()=>{if(phase!=='battle')return;const cv=cvR.current,bx=boxR.current;if(!cv||!bx)return;
const rz=()=>{const r=bx.getBoundingClientRect();wR.current=r.width;hR.current=r.height;cv.width=r.width;cv.height=r.height};
rz();initBattle();const ro=new ResizeObserver(rz);ro.observe(bx);return()=>ro.disconnect()},[phase,initBattle]);

useEffect(()=>{if(phase!=='battle')return;
const loop=()=>{const cv=cvR.current;if(!cv||!simR.current){rafR.current=requestAnimationFrame(loop);return}
const ctx=cv.getContext('2d'),sim=simR.current,w=wR.current,h=hR.current,fc=fcR.current;
if(!pR.current&&!endR.current){for(let step=0;step<spR.current;step++){
if(endR.current||pR.current)break;sim.f++;
if(sim.f%12===0&&sim.fd.length<120)sim.fd.push(new V(Math.random()*w,Math.random()*h));
if(sim.f>=sim.nextW){sim.wave++;sim.wAnn=180;const al=[];
for(let t=0;t<fc;t++)if(!sim.elim.has(t)&&sim.cr.some(c=>c.team===t&&c.energy>0))al.push(t);
if(al.length>0){const bgt=Math.min(1+Math.floor(sim.wave*.4),5),stT=Math.min(11+sim.wave,22);
for(const t of al){if(t===0)continue;const ec=sim.cr.filter(c=>c.team===t&&c.energy>0).length;const cap=Math.min(bgt,30-ec);
for(let i=0;i<cap;i++){const sx=w*((t)/(fc-.5));const c=new Cr(Math.min(w-40,sx)+(Math.random()-.5)*50,Math.random()*(h-60)+30,t,rSt(stT),rP(CLS),rP(BEH).id,rP(TPR).id);c.energy=c.mxE*.65;sim.cr.push(c)}}}
sim.nextW=sim.f+Math.max(400,900-sim.wave*25)}
const ts=Array.from({length:fc},()=>[]);for(const c of sim.cr)if(c.energy>0)ts[c.team].push(c);
for(let i=sim.cr.length-1;i>=0;i--){const c=sim.cr[i];if(c.energy<=0)continue;
c.think(sim.fd,ts,c.team,w,h);
if(c.abCD<=0){const als2=ts[c.team]||[],ens2=[];for(let t=0;t<fc;t++)if(t!==c.team)for(const e of(ts[t]||[]))if(e.energy>0)ens2.push(e);c.ability(als2,ens2,sim.bl)}
c.update();c.edges(w,h);
for(let j=sim.fd.length-1;j>=0;j--)if(V.d(c.pos,sim.fd[j])<c.sz+3){c.energy=Math.min(c.energy+14,c.mxE);c.eat=8;sim.fd.splice(j,1);break}
if(c.aCD<=0){for(const e of sim.cr){if(e.energy<=0||e.team===c.team)continue;if(V.d(c.pos,e.pos)<c.sz+e.sz+4){let dmg=c.atk,red=1;
for(const a of(ts[e.team]||[]))if(a.cls.id==='guardian'&&a.energy>0&&V.d(a.pos,e.pos)<55){red=.7;break}
if(e.cls.id==='scout'&&Math.random()<.2){red=0;for(let k=0;k<3;k++)sim.fx.push(new Fx(e.pos.x,e.pos.y,'#22d3ee',10))}
if(red>0){const fin=Math.max(.5,dmg*red/e.dm-e.st.armor*.5);e.energy-=fin;e.df=6;e.wasHit=120;c.energy=Math.min(c.energy+fin*.12,c.mxE);c.aCD=12;
if(e.energy<=0){c.kills++;sim.kills++;for(let k=0;k<6;k++)sim.fx.push(new Fx(e.pos.x,e.pos.y,FC[c.team]?.bg||'#fff',25))}
else for(let k=0;k<2;k++)sim.fx.push(new Fx(e.pos.x,e.pos.y,'#fff',10))}break}}}
if(c.team===0&&c.canSplit((ts[0]||[]).length)&&!c.spQ)c.spR=true;
if(c.energy<=0){sim.fd.push(new V(c.pos.x,c.pos.y));for(let k=0;k<8;k++)sim.fx.push(new Fx(c.pos.x,c.pos.y,FC[c.team]?.bg||'#888',25));sim.cr.splice(i,1)}}
for(let t=1;t<fc;t++){if(sim.elim.has(t))continue;const pool=sim.cr.filter(c=>c.team===t&&c.energy>0);const tPop=pool.length;
for(const c of pool){if(c.canSplit(tPop)){
const ch=c.split(rSt(Math.min(10+Math.floor(sim.wave*.4),18)),rP(CLS),rP(BEH).id,rP(TPR).id);sim.cr.push(ch);
for(let k=0;k<4;k++)sim.fx.push(new Fx(c.pos.x,c.pos.y,FC[t]?.bg||'#888',15));break}}}
for(const c of sim.cr)if(c.team===0&&c.spR&&!c.spQ&&c.energy>0){c.spQ=true;pR.current=true;
setSMod({id:c.id,cls:c.cls,beh:c.beh,tPri:c.tPri,ps:{...c.st},e:Math.round(c.energy),me:Math.round(c.mxE)});
setSBeh(BEH.find(b=>b.id===c.beh)||BEH[0]);setSTP(c.tPri);setSCls(c.cls);setSSt({...c.st});break}
for(let i=sim.bl.length-1;i>=0;i--){const b=sim.bl[i];b.update();if(b.dead()||b.p.x<0||b.p.x>w||b.p.y<0||b.p.y>h){sim.bl.splice(i,1);continue}
for(const c of sim.cr){if(c.energy<=0||c.team===b.team)continue;if(V.d(b.p,c.pos)<c.sz+3){let red=1;
for(const a of sim.cr)if(a.cls.id==='guardian'&&a.energy>0&&a.team===c.team&&V.d(a.pos,c.pos)<55){red=.7;break}
if(c.cls.id==='scout'&&Math.random()<.2)red=0;if(red>0){c.energy-=Math.max(.5,b.dmg*red/c.dm-c.st.armor*.3);c.df=6;c.wasHit=120;if(c.energy<=0)sim.kills++}
for(let k=0;k<3;k++)sim.fx.push(new Fx(c.pos.x,c.pos.y,FC[b.team]?.bg||'#fff',12));sim.bl.splice(i,1);break}}}
for(let i=sim.fx.length-1;i>=0;i--){sim.fx[i].update();if(sim.fx[i].dead())sim.fx.splice(i,1)}if(sim.fx.length>500)sim.fx.splice(0,sim.fx.length-500);
for(let t=1;t<fc;t++)if(!sim.elim.has(t)&&sim.f>300&&!sim.cr.some(c=>c.team===t&&c.energy>0)){sim.elim.add(t);sim.eAnn={t,f:150}}
const pc=(ts[0]||[]).length;if(sim.f>200&&!endR.current){if(pc===0){endR.current=true;onEndR.current({wave:sim.wave,kills:sim.kills,time:sim.f,win:false})}
else if(sim.elim.size>=fc-1){endR.current=true;onEndR.current({wave:sim.wave,kills:sim.kills,time:sim.f,win:true})}}}}
ctx.fillStyle='rgba(8,10,18,0.45)';ctx.fillRect(0,0,w,h);
ctx.strokeStyle='rgba(100,120,160,0.15)';ctx.lineWidth=2;ctx.strokeRect(1,1,w-2,h-2);
for(const f of sim.fd){ctx.beginPath();ctx.arc(f.x,f.y,2.5,0,Math.PI*2);ctx.fillStyle='#4ade80';ctx.fill()}
for(const p of sim.fx){const a=p.life/p.mxL;ctx.globalAlpha=a;ctx.beginPath();ctx.arc(p.p.x,p.p.y,p.r*a,0,Math.PI*2);ctx.fillStyle=p.col;ctx.fill()}ctx.globalAlpha=1;
for(const b of sim.bl){const col=FC[b.team]?.bg||'#fff';ctx.beginPath();ctx.arc(b.p.x,b.p.y,2.5,0,Math.PI*2);ctx.fillStyle=col;ctx.fill();ctx.globalAlpha=.3;ctx.beginPath();ctx.moveTo(b.p.x,b.p.y);ctx.lineTo(b.p.x-b.v.x*3,b.p.y-b.v.y*3);ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.stroke();ctx.globalAlpha=1}
const smId=smR.current?.id;
for(const c of sim.cr){if(c.energy<=0)continue;const ang=c.vel.mag()>.1?Math.atan2(c.vel.y,c.vel.x):0,sz=c.sz*(.8+c.energy/c.mxE*.4),hue=FC[c.team]?.h??0;
for(let t=0;t<c.trail.length-1;t++){const dx2=c.trail[t+1].x-c.trail[t].x,dy2=c.trail[t+1].y-c.trail[t].y;if(Math.abs(dx2)>w/2||Math.abs(dy2)>h/2)continue;
ctx.strokeStyle=`hsla(${hue},70%,60%,${(t/c.trail.length)*.2})`;ctx.lineWidth=sz*.3*(t/c.trail.length);ctx.beginPath();ctx.moveTo(c.trail[t].x,c.trail[t].y);ctx.lineTo(c.trail[t+1].x,c.trail[t+1].y);ctx.stroke()}
ctx.save();ctx.translate(c.pos.x,c.pos.y);ctx.rotate(ang);
if(c.spR){const pu=.4+Math.sin(sim.f*.12)*.3;ctx.fillStyle=`hsla(120,80%,70%,${pu*.25})`;ctx.beginPath();ctx.arc(0,0,sz*3,0,Math.PI*2);ctx.fill()}
if(c.id===smId){ctx.strokeStyle='#fbbf24';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(0,0,sz*4,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])}
if(c.glow>0){ctx.fillStyle=`rgba(74,222,128,${c.glow/10*.3})`;ctx.beginPath();ctx.arc(0,0,sz*2.5,0,Math.PI*2);ctx.fill()}
if(c.ring>0){ctx.strokeStyle=`rgba(167,139,250,${c.ring/12*.6})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,55*(1-c.ring/12*.3),0,Math.PI*2);ctx.stroke()}
if(c.cls.id==='guardian'){ctx.strokeStyle=`rgba(250,204,21,${.08+Math.sin(sim.f*.05)*.04})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,55,0,Math.PI*2);ctx.stroke()}
ctx.fillStyle=c.df>0?'#fff':`hsl(${hue},75%,50%)`;drawShape(ctx,c.cls.id,sz);ctx.restore();
const bw=sz*2.2,bh2=3.5,barY=c.pos.y-c.sz-8;ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(c.pos.x-bw/2,barY,bw,bh2);
const er=Math.max(0,c.energy/c.mxE);ctx.fillStyle=er>.3?`hsl(${hue},75%,50%)`:'#ef4444';ctx.fillRect(c.pos.x-bw/2,barY,bw*er,bh2);
if(sz>4){ctx.fillStyle='rgba(255,255,255,.45)';ctx.font='9px sans-serif';ctx.textAlign='center';ctx.fillText(c.cls.icon,c.pos.x,barY-3)}}
if(sim.wAnn>0){const a=Math.min(1,sim.wAnn/90);ctx.globalAlpha=a;ctx.fillStyle='#ef4444';ctx.font='bold 18px sans-serif';ctx.textAlign='center';ctx.fillText(`第 ${sim.wave} 波`,w/2,h*.15);ctx.globalAlpha=1;sim.wAnn--}
if(sim.eAnn&&sim.eAnn.f>0){const a=Math.min(1,sim.eAnn.f/60);ctx.globalAlpha=a;ctx.fillStyle=FC[sim.eAnn.t]?.bg||'#fff';ctx.font='bold 16px sans-serif';ctx.textAlign='center';ctx.fillText(`${FC[sim.eAnn.t]?.n}陣營已被消滅！`,w/2,h*.28);ctx.globalAlpha=1;sim.eAnn.f--}
if(sim.f%12===0){const fcs=[];for(let t=0;t<fc;t++)fcs.push(sim.cr.filter(c=>c.team===t&&c.energy>0).length);
setInfo({fc:fcs,wave:sim.wave,f:sim.f,kills:sim.kills,elim:[...sim.elim]})}
rafR.current=requestAnimationFrame(loop)};
rafR.current=requestAnimationFrame(loop);return()=>{if(rafR.current)cancelAnimationFrame(rafR.current)}},[phase]);

if(phase==='home')return(
<div className="w-full h-screen bg-gray-950 text-white flex flex-col items-center justify-center relative overflow-hidden">
<HomeParticles />
<div className="relative z-10 flex flex-col items-center gap-8 px-4">
<Motion.div initial={{opacity:0,y:-30}} animate={{opacity:1,y:0}} transition={{duration:0.8}} className="text-center">
<div className="text-7xl sm:text-8xl mb-4">🧬</div>
<h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">數位生態缸</h1>
<p className="text-gray-400 mt-4 text-base sm:text-lg tracking-wide">多陣營 · 多職業 · 自訂行為 · 即時戰鬥模擬</p>
</Motion.div>
<Motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4,duration:0.6}} className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-lg">
<button onClick={()=>setPhase('setup')} className="flex-1 py-5 rounded-2xl font-black text-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:scale-105 flex items-center justify-center gap-3">
<Play size={24}/> 開始遊戲</button>
<button onClick={()=>setPhase('rules')} className="flex-1 py-5 rounded-2xl font-bold text-xl bg-gray-800/80 border border-gray-700 hover:border-gray-500 hover:bg-gray-700/80 transition-all hover:scale-105 flex items-center justify-center gap-3">
<BookOpen size={24}/> 遊戲規則</button>
</Motion.div>
<Motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.8}} className="flex gap-4 mt-2">
{['⚔️','🏹','🛡️','💫','💚','🦅'].map((e,i)=>(
<Motion.span key={i} animate={{y:[0,-8,0]}} transition={{repeat:Infinity,duration:2,delay:i*0.2}} className="text-3xl sm:text-4xl">{e}</Motion.span>))}
</Motion.div>
</div>
</div>);

if(phase==='rules')return(
<div className="w-full h-screen bg-gray-950 text-white flex flex-col relative overflow-hidden">
<HomeParticles />
<div className="relative z-10 flex flex-col h-full">
<div className="flex items-center gap-3 px-5 py-4 bg-gray-900/70 backdrop-blur-md border-b border-gray-700/50">
<button onClick={()=>setPhase('home')} className="flex items-center gap-2 text-base text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-800/50"><ArrowLeft size={20}/> 返回主頁</button>
<h2 className="text-xl font-bold flex items-center gap-2"><BookOpen size={22}/> 遊戲規則</h2>
</div>
<div className="flex-1 overflow-y-auto px-4 py-5 max-w-2xl mx-auto w-full space-y-5">
<section className="bg-gray-900/70 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5">
<h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">🎯 遊戲目標</h3>
<p className="text-base text-gray-300 leading-relaxed">你控制<span className="text-blue-400 font-bold">藍色</span>陣營，目標是消滅所有其他陣營的生物。選擇 2～10 個陣營進行混戰，你的陣營需自行編制軍團，電腦陣營則自動生成。消滅所有敵方陣營即為勝利，己方全滅則為敗北。</p>
</section>
<section className="bg-gray-900/70 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5">
<h3 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">⚙️ 軍團編制</h3>
<p className="text-base text-gray-300 leading-relaxed mb-3">開戰前你可以編制最多 <span className="font-bold text-white">8 隻</span>生物。每隻生物需要設定：</p>
<div className="space-y-3 text-base text-gray-300">
<div className="flex gap-3"><span className="text-xl">📌</span><div><span className="font-bold text-white">職業</span> — 6 種職業各有獨特外型與被動/主動能力。戰士（攻擊+30%）、獵手（遠程射擊）、守衛（護甲光環-30%傷害）、法師（範圍AOE）、治療（回復友方血量）、斥候（移速+30%，20%閃避）。</div></div>
<div className="flex gap-3"><span className="text-xl">📌</span><div><span className="font-bold text-white">行動傾向</span> — 8 種 AI 行為：隨機遊蕩、主動進攻、優先覓食、靠近友方、陣形防守、迴避敵方、獵殺弱敵、保護友方。</div></div>
<div className="flex gap-3"><span className="text-xl">📌</span><div><span className="font-bold text-white">目標優先</span> — 攻擊目標的選擇偏好：最近、最弱、最強。</div></div>
<div className="flex gap-3"><span className="text-xl">📌</span><div><span className="font-bold text-white">技能配點</span> — 共 <span className="text-amber-400 font-bold">15 點</span>分配到 5 項屬性。可使用 12 種快速配點模板或手動調整。</div></div>
</div>
</section>
<section className="bg-gray-900/70 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5">
<h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">📊 五大屬性</h3>
<div className="space-y-2.5 text-base text-gray-300">
<div className="flex items-center gap-3"><Wind size={20} className="text-cyan-400 shrink-0"/><span><span className="font-bold text-white">速度</span> — 影響移動速度與加速度。高速可追擊或逃跑。</span></div>
<div className="flex items-center gap-3"><Zap size={20} className="text-red-400 shrink-0"/><span><span className="font-bold text-white">攻擊</span> — 影響近戰與技能傷害。擊殺敵人可回復少量能量。</span></div>
<div className="flex items-center gap-3"><Shield size={20} className="text-yellow-400 shrink-0"/><span><span className="font-bold text-white">護甲</span> — 減少受到的傷害，同時增大體型（碰撞判定）。</span></div>
<div className="flex items-center gap-3"><Eye size={20} className="text-purple-400 shrink-0"/><span><span className="font-bold text-white">感知</span> — 擴大偵測範圍，影響搜尋敵人、食物與友方的能力。</span></div>
<div className="flex items-center gap-3"><Heart size={20} className="text-green-400 shrink-0"/><span><span className="font-bold text-white">生命</span> — 增加最大能量值。能量歸零即死亡。</span></div>
</div>
</section>
<section className="bg-gray-900/70 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5">
<h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">🔄 戰場機制</h3>
<div className="space-y-2.5 text-base text-gray-300">
<div className="flex gap-3"><span className="text-xl">🌊</span><div><span className="font-bold text-white">波次系統</span> — 隨時間推進，電腦陣營會定期獲得增援，且增援數量和強度會逐波提升。</div></div>
<div className="flex gap-3"><span className="text-xl">🍀</span><div><span className="font-bold text-white">食物</span> — 場上持續刷新綠色食物，吃到可回復 14 點能量。移動和存活會持續消耗能量。</div></div>
<div className="flex gap-3"><span className="text-xl">🧬</span><div><span className="font-bold text-white">分裂繁殖</span> — 當己方生物能量超過 92%、存活夠久、且分裂次數未達上限（3次）時可分裂。分裂後親代與子代各獲得 30% 能量。你可以為子代自訂全新的職業、行為與配點。</div></div>
<div className="flex gap-3"><span className="text-xl">💀</span><div><span className="font-bold text-white">死亡</span> — 能量歸零即死亡，會在原地掉落食物。</div></div>
<div className="flex gap-3"><span className="text-xl">🏰</span><div><span className="font-bold text-white">硬牆邊界</span> — 場地四周為硬牆，生物碰牆會反彈。</div></div>
</div>
</section>
<section className="bg-gray-900/70 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5">
<h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">💡 策略提示</h3>
<p className="text-base text-gray-300 leading-relaxed">搭配不同職業形成互補陣容（例如守衛+治療+戰士）效果很好。前期可以用覓食型生物先存能量再分裂擴軍，中後期用攻擊型去壓制弱勢陣營。善用分裂系統來調整軍團組成是致勝關鍵。</p>
</section>
<div className="flex justify-center pb-8 pt-2">
<button onClick={()=>setPhase('setup')} className="px-10 py-4 rounded-2xl font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 flex items-center gap-3">
<Play size={24}/> 開始遊戲</button>
</div>
</div>
</div>
</div>);

if(phase==='setup')return(
<div className="w-full h-screen bg-gray-950 text-white flex flex-col">
<div className="flex items-center gap-3 px-5 py-3 bg-gray-900/90 border-b border-gray-800">
<button onClick={()=>setPhase('home')} className="flex items-center gap-2 text-base text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-800/50"><Home size={20}/> 主頁</button>
<span className="text-gray-700">|</span>
<h2 className="text-xl font-bold">軍團編制</h2>
</div>
<div className="flex items-center justify-center gap-3 py-3 flex-wrap"><span className="text-base text-gray-400">對戰陣營數：</span><div className="flex gap-1.5">
{Array.from({length:9},(_,i)=>i+2).map(n=><button key={n} onClick={()=>setFCnt(n)} className={`w-11 h-11 rounded-lg text-base font-bold transition-all ${fCnt===n?'ring-2 ring-white/50 scale-110':'opacity-50 hover:opacity-90'}`} style={{backgroundColor:FC[n-1]?.bg+'70',color:'#fff'}}>{n}</button>)}</div></div>
<div className="flex justify-center gap-2 pb-2 flex-wrap px-4">{Array.from({length:fCnt},(_,i)=><span key={i} className="text-sm px-2.5 py-1 rounded-full" style={{border:`1px solid ${FC[i]?.bg}60`,color:FC[i]?.bg}}>●{i===0?'你':`電腦${i}`}</span>)}</div>
<div className="flex-1 flex flex-col lg:flex-row gap-3 px-3 pb-3 max-w-5xl mx-auto w-full overflow-y-auto">
<div className="lg:w-60 shrink-0 bg-gray-900 rounded-xl border border-gray-800 p-3">
<h3 className="text-base font-bold text-blue-400 mb-2">我的軍團 ({roster.length}/8)</h3>
{roster.length===0&&<p className="text-sm text-gray-600 italic py-4 text-center">尚未添加生物</p>}
<div className="space-y-1.5">{roster.map((r,i)=><div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-800/60 border border-blue-500/20 group">
<span className="text-xl">{r.cls.icon}</span><div className="flex-1 min-w-0"><div className="text-sm text-gray-400 flex items-center gap-1 flex-wrap">{r.cls.name}<span>{BEH.find(b=>b.id===r.beh)?.icon}</span><span className="text-gray-600">{TPR.find(t=>t.id===r.tPri)?.i}</span></div>
<div className="flex gap-1.5 text-sm">{SD.map(sd=><span key={sd.key} className={sd.color}>{r.st[sd.key]}</span>)}</div></div>
<button onClick={()=>rmR(i)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-red-600 text-gray-500 hover:text-white transition-colors"><X size={16}/></button></div>)}</div>
{roster.length>0&&<button onClick={()=>setRoster([])} className="w-full mt-2.5 py-2.5 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-gray-800 border border-gray-800 transition-colors">清空全部</button>}
</div>
<div className="flex-1 bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3 overflow-y-auto">
<div><div className="text-base font-semibold text-gray-400 mb-1.5">職業</div><div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">{CLS.map(c=><button key={c.id} onClick={()=>setSelCls(c)}
className={`p-3 rounded-lg border text-center transition-all ${selCls.id===c.id?'border-blue-500 bg-blue-500/10':'border-gray-700 bg-gray-800/50 hover:bg-gray-800'}`}>
<div className="text-2xl leading-none">{c.icon}</div><div className="text-sm text-gray-300 mt-1">{c.name}</div></button>)}</div></div>
<div><div className="text-base font-semibold text-gray-400 mb-1.5">行動傾向</div>
<div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">{BEH.map(b=><button key={b.id} onClick={()=>setSelBeh(b)}
className={`p-3 rounded-lg border text-left transition-all ${selBeh.id===b.id?'border-green-500 bg-green-500/10':'border-gray-700 bg-gray-800/50 hover:bg-gray-800'}`}>
<div className="flex items-center gap-1.5"><span className="text-lg">{b.icon}</span><span className="text-sm font-bold text-gray-300">{b.name}</span></div>
<div className="text-xs text-gray-500 mt-1 leading-tight">{b.d}</div></button>)}</div></div>
<div><div className="text-base font-semibold text-gray-400 mb-1.5">目標優先</div><div className="flex gap-2">{TPR.map(t=><button key={t.id} onClick={()=>setSelTP(t.id)}
className={`px-4 py-2.5 rounded-lg border text-sm transition-all ${selTP===t.id?'border-amber-500 bg-amber-500/10 text-amber-300':'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{t.i} {t.n}</button>)}</div></div>
<StatA stats={dSt} onChange={setDSt}/>
<button onClick={addR} disabled={roster.length>=8} className={`w-full py-3 rounded-lg font-bold text-base flex items-center justify-center gap-2 transition-all ${roster.length>=8?'bg-gray-700 text-gray-500 cursor-not-allowed':'bg-blue-600 hover:bg-blue-500 text-white'}`}>
<Plus size={20}/> 加入 {selCls.name} / {selBeh.name}</button></div></div>
<div className="sticky bottom-0 flex justify-center pb-4 pt-2 bg-gray-950/90 backdrop-blur-sm"><button onClick={startB} disabled={roster.length<1}
className={`px-8 py-4 rounded-2xl font-black text-xl flex items-center gap-2 transition-all ${roster.length>=1?'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20 hover:scale-105':'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
{fCnt} 陣營混戰 <ChevronRight size={24}/></button></div></div>);

if(phase==='battle')return(
<div className="flex flex-col w-full h-screen bg-gray-950 text-white">
<div className="flex items-center justify-between px-3 py-2 bg-gray-900/95 border-b border-gray-800 shrink-0 flex-wrap gap-2 text-xs sm:text-sm">
<div className="flex items-center gap-2 flex-wrap">
{info.fc.map((cnt,i)=><span key={i} className="font-bold flex items-center gap-0.5" style={{color:FC[i]?.bg,opacity:info.elim.includes(i)?.3:1}}>●{cnt}{info.elim.includes(i)&&<span className="text-gray-500">✗</span>}</span>)}
<span className="text-gray-600">|</span><span className="text-gray-400">波{info.wave}</span>
<span className="text-gray-400">⏱{Math.floor(info.f/3600)}:{String(Math.floor(info.f/60%60)).padStart(2,'0')}</span>
<span className="text-gray-500">擊殺{info.kills}</span></div>
<div className="flex items-center gap-1.5">{[1,2,4,8].map(sp=><button key={sp} onClick={()=>setSpeed(sp)} className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg transition-colors text-sm font-medium ${speed===sp?'bg-blue-600 text-white':'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>{sp}x</button>)}
<div className="relative">
<button onClick={()=>{setPaused(true);setPauseMenu(!pauseMenu)}} className="px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-1"><Menu size={18}/></button>
</div></div></div>
<div ref={boxR} className="flex-1 relative overflow-hidden"><canvas ref={cvR} className="block w-full h-full"/>
<AnimatePresence>{pauseMenu&&(
<Motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 flex items-center justify-center z-20" style={{backgroundColor:'rgba(0,0,0,.6)'}}>
<Motion.div initial={{scale:.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.9,opacity:0}} className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl flex flex-col items-center gap-5">
<h3 className="text-2xl font-black text-gray-200">暫停</h3>
<div className="text-base text-gray-500">波次 {info.wave} · 擊殺 {info.kills}</div>
<button onClick={()=>{setPauseMenu(false);setPaused(false)}} className="w-full py-4 rounded-xl font-bold text-lg bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"><Play size={22}/> 繼續遊戲</button>
<button onClick={goHome} className="w-full py-4 rounded-xl font-bold text-lg bg-gray-800 border border-gray-700 hover:border-gray-500 hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"><Home size={22}/> 返回主頁</button>
</Motion.div>
</Motion.div>)}</AnimatePresence>
{sMod&&(<div className="absolute inset-0 flex items-end sm:items-center justify-center z-10 p-3" style={{backgroundColor:'rgba(0,0,0,.5)'}}>
<Motion.div initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} className="bg-gray-900 border border-gray-700 rounded-2xl p-5 w-full max-w-md shadow-2xl overflow-y-auto" style={{maxHeight:'90vh'}}>
<div className="flex items-center gap-3 mb-3"><div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl">🧬</div>
<div><h3 className="font-bold text-lg text-blue-400">{sMod.cls.icon} {sMod.cls.name} 準備分裂</h3><p className="text-sm text-gray-500">能量 {sMod.e}/{sMod.me} · 分裂後各得30%</p></div></div>
<div className="space-y-3">
<div><div className="text-base font-semibold text-gray-400 mb-1">後代職業</div><div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">{CLS.map(c=><button key={c.id} onClick={()=>setSCls(c)}
className={`p-2.5 rounded-lg border text-center transition-all ${sCls.id===c.id?'border-blue-500 bg-blue-500/10':'border-gray-700 bg-gray-800/50 hover:bg-gray-700'}`}><div className="text-xl">{c.icon}</div><div className="text-xs text-gray-500 mt-0.5">{c.name}</div></button>)}</div></div>
<div><div className="text-base font-semibold text-gray-400 mb-1">行動傾向</div><div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">{BEH.map(b=><button key={b.id} onClick={()=>setSBeh(b)}
className={`p-2.5 rounded-lg border text-center transition-all ${sBeh.id===b.id?'border-green-500 bg-green-500/10':'border-gray-700 bg-gray-800/50 hover:bg-gray-700'}`}><span className="text-lg">{b.icon}</span><div className="text-xs text-gray-500 leading-tight mt-0.5">{b.name}</div></button>)}</div></div>
<div><div className="text-base font-semibold text-gray-400 mb-1">目標優先</div><div className="flex gap-2">{TPR.map(t=><button key={t.id} onClick={()=>setSTP(t.id)}
className={`px-3 py-2 rounded-lg border text-sm transition-colors ${sTP===t.id?'border-amber-500 bg-amber-500/10 text-amber-300':'border-gray-700 text-gray-400'}`}>{t.i} {t.n}</button>)}</div></div>
<StatA stats={sSt} onChange={setSSt}/>
<div className="flex gap-3 pt-2"><button onClick={confirmS} className="flex-1 py-3 rounded-xl font-bold text-base bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2"><Check size={18}/>確認分裂</button>
<button onClick={skipS} className="flex-1 py-3 rounded-xl font-bold text-base bg-gray-700 hover:bg-gray-600 text-gray-300 flex items-center justify-center gap-2"><X size={18}/>跳過</button></div></div>
</Motion.div></div>)}</div></div>);

if(phase==='result')return(
<div className="w-full h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-5 px-4 relative overflow-hidden">
<HomeParticles />
<div className="relative z-10 flex flex-col items-center gap-5">
<Motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring'}}>{result?.win?<Trophy size={72} className="text-amber-400"/>:<Skull size={72} className="text-gray-400"/>}</Motion.div>
<Motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-4xl sm:text-5xl font-black">{result?.win?'勝利！':'敗北'}</Motion.h1>
{result&&<Motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.3}} className="text-center space-y-2 text-xl sm:text-2xl">
<p className="text-gray-400">時間 {Math.floor(result.time/3600)}:{String(Math.floor(result.time/60%60)).padStart(2,'0')}</p>
<p className="text-gray-400">抵擋 {result.wave} 波</p><p className="text-gray-400">擊殺 {result.kills}</p></Motion.div>}
<Motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.5}} className="flex flex-col sm:flex-row gap-4 mt-4">
<button onClick={()=>setPhase('setup')} className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 flex items-center justify-center gap-3"><RotateCcw size={24}/> 再來一局</button>
<button onClick={()=>setPhase('home')} className="px-10 py-4 bg-gray-800 border border-gray-700 rounded-2xl font-bold text-xl transition-all hover:scale-105 hover:border-gray-500 flex items-center justify-center gap-3"><Home size={24}/> 返回主頁</button>
</Motion.div>
</div></div>);
return null}
