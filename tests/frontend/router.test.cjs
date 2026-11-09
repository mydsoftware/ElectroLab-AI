"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {route}=require("../../docs/router.js");
function segments(points){return points.slice(1).map((p,i)=>[points[i],p])}
test("مسیریاب ابتدا و انتهای دقیق اتصال را حفظ می‌کند",()=>{
 const a={x:120,y:120},b={x:720,y:360};
 const points=route({a,b});
 assert.deepEqual(points[0],a);assert.deepEqual(points.at(-1),b);
});
test("تمام قطعه‌های مسیر فقط افقی یا عمودی هستند",()=>{
 const points=route({a:{x:120,y:120},b:{x:720,y:360}});
 for(const [a,b] of segments(points))assert.ok(a.x===b.x||a.y===b.y,"segment must be orthogonal");
});
test("مسیر از محدوده مانع قطعه عبور نمی‌کند",()=>{
 const a={x:120,y:240},b={x:780,y:240};
 const points=route({a,b,components:[{id:"R1",x:450,y:240}],sourceId:"V1",targetId:"C1"});
 for(const [p,q] of segments(points)){
  const steps=Math.max(1,Math.ceil(Math.hypot(q.x-p.x,q.y-p.y)/4));
  for(let i=0;i<=steps;i++){
   const x=p.x+(q.x-p.x)*i/steps,y=p.y+(q.y-p.y)*i/steps;
   assert.ok(!(x>=408&&x<=492&&y>=198&&y<=282),`route intersects obstacle at ${x},${y}`);
  }
 }
});
test("در مسیر مستقیم بدون مانع یک اتصال ساده تولید می‌شود",()=>{
 const points=route({a:{x:120,y:120},b:{x:360,y:120}});
 assert.deepEqual(points,[{x:120,y:120},{x:360,y:120}]);
});
