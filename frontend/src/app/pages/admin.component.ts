import {Component,inject,OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Api} from '../services/api.service';
@Component({standalone:true,imports:[CommonModule,FormsModule],template:`
<h2>Admin dashboard</h2><div class="row"><button *ngFor="let t of tabs" [class.alt]="tab!==t" (click)="tab=t;load()">{{t}}</button></div><div class="err">{{err}}</div>
<div *ngIf="tab==='Analytics'&&an" class="card"><div class="grid"><div class="card"><h3>{{an.totalUsers}}</h3>Users</div><div class="card"><h3>{{an.totalUploadedRooms}}</h3>Rooms uploaded</div><div class="card"><h3>{{an.totalSavedDesigns}}</h3>Saved designs</div><div class="card"><h3>{{an.avgActionsPerUser}}</h3>Avg actions/user</div></div>
<h4>Popular colors</h4><div *ngFor="let c of an.popularColors">{{c._id}}: {{c.count}}</div><h4>Popular categories</h4><div *ngFor="let c of an.popularCategories">{{c._id}}: {{c.count}}</div>
<h4>Recent activity</h4><div *ngFor="let a of an.recentActivity">{{a.userId?.name}} — {{a.action}} · {{a.timestamp|date:'short'}}</div></div>
<div *ngIf="tab==='Colors'" class="card"><div class="row"><input placeholder="Name" [(ngModel)]="c.name"><input type="color" [(ngModel)]="c.hex"><input placeholder="Category" [(ngModel)]="c.category"><input placeholder="Brand" [(ngModel)]="c.brand">
<select [(ngModel)]="c.finish"><option>matte</option><option>satin</option><option>glossy</option></select><button (click)="saveColor()">{{c._id?'Update':'Add'}}</button><button class="alt" *ngIf="c._id" (click)="reset()">Cancel</button></div>
<table><tr *ngFor="let x of colors"><td><div class="sw" [style.background]="x.hex"></div></td><td>{{x.name}}</td><td>{{x.hex}}</td><td>{{x.category}}</td><td><button class="alt" (click)="editC(x)">Edit</button> <button class="danger" (click)="delColor(x)">Delete</button></td></tr></table></div>
<div *ngIf="tab==='Patterns'" class="card"><div class="row"><input placeholder="Name" [(ngModel)]="pt.name"><select [(ngModel)]="pt.style"><option>stripes</option><option>dots</option><option>checks</option></select><input placeholder="Category" [(ngModel)]="pt.category"><button (click)="savePat()">{{pt._id?'Update':'Add'}}</button></div>
<table><tr *ngFor="let x of pats"><td>{{x.name}}</td><td>{{x.style}}</td><td>{{x.category}}</td><td><button class="alt" (click)="editP(x)">Edit</button> <button class="danger" (click)="delPat(x)">Delete</button></td></tr></table></div>
<div *ngIf="tab==='Users'" class="card"><table><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr><tr *ngFor="let u of users"><td>{{u.name}}</td><td>{{u.email}}</td><td>{{u.role}}</td><td>{{u.createdAt|date}}</td></tr></table></div>
<div *ngIf="tab==='Projects'" class="grid"><div class="card" *ngFor="let p of projs"><img class="th" [src]="p.paintedPhoto"><b>{{p.name}}</b></div></div>
<div *ngIf="tab==='Feedback'" class="card"><div *ngFor="let f of fb">{{f.rating}}★ {{f.userId?.name}}: {{f.message}}</div></div>`})
export class AdminComponent implements OnInit{api=inject(Api);tabs=['Analytics','Colors','Patterns','Users','Projects','Feedback'];tab='Analytics';err='';
 an:any;colors:any[]=[];pats:any[]=[];users:any[]=[];projs:any[]=[];fb:any[]=[];c:any={name:'',hex:'#cccccc',category:'',brand:'',finish:'matte'};pt:any={name:'',style:'stripes',category:''};
 ngOnInit(){this.load()}
 h=(e:any)=>this.err=e.error?.message||'Request failed';
 load(){this.err='';const g=(p:string,f:(r:any)=>void)=>this.api.get(p).subscribe({next:f,error:this.h});
  ({Analytics:()=>g('/analytics',r=>this.an=r),Colors:()=>g('/colors',r=>this.colors=r),Patterns:()=>g('/patterns',r=>this.pats=r),Users:()=>g('/users',r=>this.users=r),Projects:()=>g('/projects?all=1',r=>this.projs=r),Feedback:()=>g('/feedback',r=>this.fb=r)} as any)[this.tab]()}
 editC(x:any){this.c={...x}}
 editP(x:any){this.pt={...x}}
 reset(){this.c={name:'',hex:'#cccccc',category:'',brand:'',finish:'matte'}}
 saveColor(){const o=this.c._id?this.api.put('/colors/'+this.c._id,this.c):this.api.post('/colors',this.c);o.subscribe({next:()=>{this.reset();this.load()},error:this.h})}
 delColor(x:any){if(confirm('Delete color?'))this.api.del('/colors/'+x._id).subscribe({next:()=>this.load(),error:this.h})}
 savePat(){const o=this.pt._id?this.api.put('/patterns/'+this.pt._id,this.pt):this.api.post('/patterns',this.pt);o.subscribe({next:()=>{this.pt={name:'',style:'stripes',category:''};this.load()},error:this.h})}
 delPat(x:any){if(confirm('Delete pattern?'))this.api.del('/patterns/'+x._id).subscribe({next:()=>this.load(),error:this.h})}}
