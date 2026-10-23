import {Component,ElementRef,OnInit,ViewChild,inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute,Router} from '@angular/router';
import {Api} from '../services/api.service';
import {ColorItem,Wall} from '../models/models';
@Component({standalone:true,imports:[CommonModule,FormsModule],template:`
<div class="warn">Use an original image that you own or have permission to use. Final appearance may vary depending on lighting, screen calibration, wall texture and surface condition.</div><br>
<div class="card row"><input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" (change)="pick($event)"><input [(ngModel)]="name" placeholder="Design name">
<button (click)="save()" [disabled]="!img">Save</button><button class="alt" (click)="download()" [disabled]="!img">Download</button>
<span class="err">{{err}}</span><span class="ok">{{msg}}</span></div>
<div class="empty card" *ngIf="!img">Upload a JPG/PNG room photo (max 8 MB) to begin.</div>
<div *ngIf="img"><div class="row card"><button [class.on]="view==='edit'" (click)="view='edit'">Edit</button><button [class.on]="view==='slider'" (click)="ba('slider')">Before/After slider</button><button [class.on]="view==='side'" (click)="ba('side')">Side by side</button></div>
<div class="row" style="align-items:flex-start"><div class="card" style="flex:1 1 560px">
<div [hidden]="view!=='edit'"><div class="row" style="margin-bottom:8px"><button [class.on]="mode==='poly'" (click)="mode='poly'">Polygon</button><button [class.on]="mode==='brush'" (click)="mode='brush'">Brush</button>
<label>Size <input type="range" min="5" max="120" [(ngModel)]="brush"></label><button class="alt" (click)="undo()">Undo</button><button class="alt" (click)="clearWall()">Clear wall</button><button class="danger" (click)="resetAll()">Reset</button></div>
<canvas #cv (mousedown)="down($event)" (mousemove)="move($event)" (mouseup)="up()" (mouseleave)="up()" (dblclick)="closePoly()"></canvas></div>
<div *ngIf="view==='slider'"><div class="ba"><img [src]="orig"><div class="top" [style.clip-path]="'inset(0 0 0 '+split+'%)'"><img [src]="painted"></div></div><input type="range" min="0" max="100" [(ngModel)]="split" style="width:100%"></div>
<div *ngIf="view==='side'" class="row"><div style="flex:1"><b>Before</b><img [src]="orig" style="width:100%"></div><div style="flex:1"><b>After</b><img [src]="painted" style="width:100%"></div></div></div>
<div class="card" style="flex:1 1 280px"><div class="row"><b>Walls:</b><button *ngFor="let w of walls;let i=index" [class.on]="i===active" (click)="active=i;draft=[]" [style.background]="w.color">{{i+1}}</button><button class="alt" (click)="newWall()">+ New wall</button></div>
<div *ngIf="cur as w"><hr><h4>Wall {{active+1}} — {{w.colorName}}</h4><label>Opacity {{w.opacity}}%<input type="range" min="0" max="100" [(ngModel)]="w.opacity" (input)="draw()"></label><br>
<label>Finish <select [(ngModel)]="w.finish" (change)="draw()"><option>matte</option><option>satin</option><option>glossy</option></select></label><br>
<label>Pattern <select [(ngModel)]="w.pattern" (change)="draw()"><option value="none">none</option><option *ngFor="let p of pats" [value]="p.style">{{p.name}}</option></select></label><br>
<label>Pattern opacity {{w.patOpacity}}%<input type="range" min="0" max="100" [(ngModel)]="w.patOpacity" (input)="draw()"></label><br><label>Pattern scale {{w.patScale}}<input type="range" min="4" max="80" [(ngModel)]="w.patScale" (input)="draw()"></label></div>
<hr><div class="row"><input placeholder="Search" [(ngModel)]="q"><select [(ngModel)]="cat"><option value="">All</option><option *ngFor="let c of cats">{{c}}</option></select></div>
<div class="row" style="margin:8px 0"><div class="sw" *ngFor="let c of filtered()" [style.background]="c.hex" [title]="c.name+' '+c.hex" [class.sel]="cur?.color===c.hex" (click)="apply(c)"></div></div>
<div class="row"><input type="color" [(ngModel)]="custom"><button class="alt" (click)="apply({name:'Custom',hex:custom,category:'Custom'})">Use HEX {{custom}}</button></div>
<div class="empty" *ngIf="!filtered().length">No colors match.</div></div></div></div>`})
export class EditorComponent implements OnInit{
 api=inject(Api);route=inject(ActivatedRoute);router=inject(Router);
 @ViewChild('cv') cvRef!:ElementRef<HTMLCanvasElement>;
 colors:ColorItem[]=[];pats:any[]=[];q='';cat='';custom='#C96F52';img?:HTMLImageElement;orig='';painted='';
 walls:Wall[]=[];active=-1;mode:'poly'|'brush'='poly';brush=30;draft:number[][]=[];drawing=false;stroke:any=null;
 view:'edit'|'slider'|'side'='edit';split=50;name='My room';id='';msg='';err='';
 get cur(){return this.walls[this.active]}
 get cats(){return [...new Set(this.colors.map(c=>c.category||'General'))]}
 filtered(){const q=this.q.toLowerCase();return this.colors.filter(c=>(!this.cat||c.category===this.cat)&&(!q||c.name.toLowerCase().includes(q)||c.hex.toLowerCase().includes(q)))}
 ngOnInit(){this.api.get('/colors').subscribe({next:r=>this.colors=r,error:e=>this.err=e.error?.message||'Cannot load colors'});
  this.api.get('/patterns').subscribe({next:r=>this.pats=r,error:()=>{}});
  this.id=this.route.snapshot.paramMap.get('id')||'';
  if(this.id)this.api.get('/projects/'+this.id).subscribe({next:p=>{this.name=p.name;this.load(p.originalPhoto,p.wallSelections||[])},error:e=>this.err=e.error?.message||'Load failed'})}
 pick(ev:Event){this.err='';const f=(ev.target as HTMLInputElement).files?.[0];if(!f)return;
  if(!['image/jpeg','image/png'].includes(f.type))return void(this.err='Only JPG, JPEG or PNG allowed');
  if(f.size>8*1024*1024)return void(this.err='File must be under 8 MB');
  const r=new FileReader();r.onload=()=>{this.load(r.result as string,[],true)};r.readAsDataURL(f)}
 load(src:string,walls:Wall[],fresh=false){const im=new Image();im.onload=()=>{const s=Math.min(1,1280/im.width);const w=Math.round(im.width*s),h=Math.round(im.height*s);
  this.img=im;this.walls=walls;this.active=walls.length?0:-1;this.view='edit';
  setTimeout(()=>{const c=this.cvRef.nativeElement;c.width=w;c.height=h;
   if(fresh){const t=document.createElement('canvas');t.width=w;t.height=h;t.getContext('2d')!.drawImage(im,0,0,w,h);this.orig=t.toDataURL('image/jpeg',.9);this.api.post('/activity',{action:'upload'}).subscribe({error:()=>{}})}else this.orig=src;this.draw()})};
  im.onerror=()=>this.err='Could not read image';im.src=src}
 mask(w:Wall,c:HTMLCanvasElement){const m=document.createElement('canvas');m.width=c.width;m.height=c.height;const g=m.getContext('2d')!;g.fillStyle=g.strokeStyle='#000';
  for(const p of w.polys){g.beginPath();p.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.fill()}
  g.lineCap=g.lineJoin='round';for(const s of w.strokes){g.lineWidth=s.size;g.beginPath();s.pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke()}return m}
 render(overlay:boolean){const c=this.cvRef.nativeElement,x=c.getContext('2d')!;x.globalCompositeOperation='source-over';x.globalAlpha=1;x.clearRect(0,0,c.width,c.height);x.drawImage(this.img!,0,0,c.width,c.height);
  for(const w of this.walls){const m=this.mask(w,c),g=m.getContext('2d')!,W=c.width,H=c.height;
   const t=document.createElement('canvas');t.width=W;t.height=H;const tg=t.getContext('2d')!;tg.drawImage(m,0,0);tg.globalCompositeOperation='source-in';tg.fillStyle=w.color;tg.fillRect(0,0,W,H);
   if(w.pattern!=='none'){tg.globalCompositeOperation='source-atop';tg.globalAlpha=w.patOpacity/100;tg.fillStyle='#000';const s=w.patScale;
    if(w.pattern==='stripes')for(let i=0;i<W;i+=s*2)tg.fillRect(i,0,s,H);
    else if(w.pattern==='dots')for(let i=s;i<W+s;i+=s*2)for(let j=s;j<H+s;j+=s*2){tg.beginPath();tg.arc(i,j,s/3,0,7);tg.fill()}
    else for(let i=0;i<W;i+=s)for(let j=0;j<H;j+=s)if(((i+j)/s)%2===0)tg.fillRect(i,j,s,s);tg.globalAlpha=1}
   x.globalCompositeOperation='multiply';x.globalAlpha=w.opacity/100;x.drawImage(t,0,0);
   const sheen=w.finish==='glossy'?.28:w.finish==='satin'?.12:0;
   if(sheen){g.globalCompositeOperation='source-in';const gr=g.createLinearGradient(0,0,W,H);gr.addColorStop(0,'#fff');gr.addColorStop(1,'rgba(255,255,255,.1)');g.fillStyle=gr;g.fillRect(0,0,W,H);x.globalCompositeOperation='screen';x.globalAlpha=sheen*(w.opacity/100);x.drawImage(m,0,0)}}
  x.globalCompositeOperation='source-over';x.globalAlpha=1;
  if(overlay&&this.draft.length){x.strokeStyle='#ff2d55';x.lineWidth=2;x.setLineDash([6,4]);x.beginPath();this.draft.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.stroke();x.setLineDash([]);this.draft.forEach(q=>{x.fillStyle='#ff2d55';x.fillRect(q[0]-3,q[1]-3,6,6)})}}
 draw(){if(this.img)this.render(true)}
 pos(e:MouseEvent){const c=this.cvRef.nativeElement,r=c.getBoundingClientRect();return [(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height]}
 newWall(){this.walls.push({polys:[],strokes:[],color:'#F5E6D3',colorName:'Warm Beige',category:'Neutral',opacity:70,finish:'matte',pattern:'none',patOpacity:40,patScale:20});this.active=this.walls.length-1;this.draft=[]}
 down(e:MouseEvent){if(this.active<0)this.newWall();const p=this.pos(e);
  if(this.mode==='poly'){this.draft.push(p)}else{this.drawing=true;this.stroke={pts:[p,[p[0]+.1,p[1]]],size:this.brush};this.cur.strokes.push(this.stroke)}this.draw()}
 move(e:MouseEvent){if(this.drawing&&this.stroke){this.stroke.pts.push(this.pos(e));this.draw()}}
 up(){this.drawing=false;this.stroke=null}
 closePoly(){if(this.mode!=='poly')return;if(this.draft.length>3)this.draft.splice(-1);if(this.draft.length>=3&&this.cur)this.cur.polys.push(this.draft);this.draft=[];this.draw()}
 undo(){if(this.draft.length)this.draft.pop();else if(this.cur){const w=this.cur;(w.strokes.length&&(!w.polys.length||this.mode==='brush')?w.strokes:w.polys).pop()}this.draw()}
 clearWall(){if(this.cur){this.cur.polys=[];this.cur.strokes=[]}this.draft=[];this.draw()}
 resetAll(){this.walls=[];this.active=-1;this.draft=[];this.draw()}
 apply(c:ColorItem){if(this.active<0)this.newWall();Object.assign(this.cur,{color:c.hex,colorName:c.name,category:c.category||'General'});this.draw()}
 snap(){this.render(false);const u=this.cvRef.nativeElement.toDataURL('image/jpeg',.88);this.draw();return u}
 ba(v:'slider'|'side'){this.painted=this.snap();this.view=v}
 download(){const a=document.createElement('a');a.href=this.snap();a.download=(this.name||'design')+'.jpg';a.click();this.api.post('/activity',{action:'download'}).subscribe({error:()=>{}})}
 save(){this.err=this.msg='';const used=this.walls.filter(w=>w.polys.length||w.strokes.length);
  const body={name:this.name||'Untitled',originalPhoto:this.orig,paintedPhoto:this.snap(),wallSelections:this.walls,
   appliedColors:used.map(w=>({name:w.colorName,hex:w.color,category:w.category,finish:w.finish,opacity:w.opacity})),
   appliedPatterns:used.filter(w=>w.pattern!=='none').map(w=>({style:w.pattern,opacity:w.patOpacity,scale:w.patScale})),settings:{brush:this.brush}};
  const o=this.id?this.api.put('/projects/'+this.id,body):this.api.post('/projects',body);
  o.subscribe({next:p=>{this.id=p._id;this.msg='Saved ✓'},error:e=>this.err=e.error?.message||'Save failed'})}}
