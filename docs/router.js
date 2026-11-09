(function(root){
"use strict";
function route(options){
 const {a,b,components=[],sourceId=null,targetId=null,occupied=[],step=12,width=900,height=500}=options;
 const cols=Math.floor(width/step)+1,rows=Math.floor(height/step)+1;
 const inside=(x,y)=>x>=0&&y>=0&&x<cols&&y<rows;
 const sx=Math.round(a.x/step),sy=Math.round(a.y/step),tx=Math.round(b.x/step),ty=Math.round(b.y/step);
 const start=sy*cols+sx,goal=ty*cols+tx;
 if(!inside(sx,sy)||!inside(tx,ty))return [a,b];
 const blocked=new Set();
 for(const c of components){if(c.id===sourceId||c.id===targetId)continue;
  const minX=Math.floor((c.x-42)/step),maxX=Math.ceil((c.x+42)/step),minY=Math.floor((c.y-42)/step),maxY=Math.ceil((c.y+42)/step);
  for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++)if(inside(x,y))blocked.add(y*cols+x);
 }
 blocked.delete(start);blocked.delete(goal);
 const distance=(p,u,v)=>{const dx=v.x-u.x,dy=v.y-u.y,l=dx*dx+dy*dy;if(!l)return Math.hypot(p.x-u.x,p.y-u.y);const t=Math.max(0,Math.min(1,((p.x-u.x)*dx+(p.y-u.y)*dy)/l));return Math.hypot(p.x-u.x-t*dx,p.y-u.y-t*dy)};
 const heap=[],push=item=>{heap.push(item);let i=heap.length-1;while(i){const p=(i-1)>>1;if(heap[p].f<=item.f)break;heap[i]=heap[p];i=p}heap[i]=item};
 const pop=()=>{const first=heap[0],last=heap.pop();if(heap.length){let i=0;while(true){const l=i*2+1,r=l+1;if(l>=heap.length)break;const c=r<heap.length&&heap[r].f<heap[l].f?r:l;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c}heap[i]=last}return first};
 const g=new Map([[start,0]]),came=new Map(),closed=new Set(),heuristic=(x,y)=>Math.abs(x-tx)+Math.abs(y-ty);
 push({id:start,x:sx,y:sy,f:heuristic(sx,sy)});let found=false,iterations=0;
 while(heap.length&&iterations++<12000){
  const cur=pop();if(closed.has(cur.id))continue;if(cur.id===goal){found=true;break}closed.add(cur.id);
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const x=cur.x+dx,y=cur.y+dy;if(!inside(x,y))continue;const id=y*cols+x;if(blocked.has(id)||closed.has(id))continue;
   const p={x:x*step,y:y*step};let penalty=0;
   for(const [u,v] of occupied){const d=distance(p,u,v);if(d<9)penalty+=d<3?18:5}
   const next=g.get(cur.id)+1+penalty;if(next<(g.get(id)??Infinity)){g.set(id,next);came.set(id,cur.id);push({id,x,y,f:next+heuristic(x,y)})}
  }
 }
 if(!found)return [a,{x:a.x,y:b.y},b];
 const ids=[goal];while(ids[ids.length-1]!==start){const prev=came.get(ids[ids.length-1]);if(prev===undefined)return [a,{x:a.x,y:b.y},b];ids.push(prev)}ids.reverse();
 const points=[a];
 for(let i=1;i<ids.length-1;i++){const prev=ids[i-1],cur=ids[i],next=ids[i+1];
  const dir=[Math.sign(cur%cols-prev%cols),Math.sign(Math.floor(cur/cols)-Math.floor(prev/cols))].join(",");
  const nextDir=[Math.sign(next%cols-cur%cols),Math.sign(Math.floor(next/cols)-Math.floor(cur/cols))].join(",");
  if(dir!==nextDir)points.push({x:(cur%cols)*step,y:Math.floor(cur/cols)*step});
 }
 points.push(b);return points;
}
const api={route};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
root.ElectroLabRouter=api;
})(typeof globalThis!=="undefined"?globalThis:this);
