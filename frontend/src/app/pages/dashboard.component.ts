import {Component,inject,OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute,RouterLink} from '@angular/router';
import {Api} from '../services/api.service';
@Component({standalone:true,imports:[CommonModule,RouterLink],template:`
<div class="row"><h2 style="flex:1">{{fav?'Favorites':'Saved designs'}}</h2><a class="btn" routerLink="/editor">+ New design</a></div>
<div class="err">{{err}}</div>
<div class="empty card" *ngIf="loaded&&!list.length">Nothing here yet. Upload a room photo to start.</div>
<div class="grid"><div class="card" *ngFor="let p of list"><img class="th" [src]="p.paintedPhoto"><h4>{{p.name}}</h4><small>{{p.updatedAt|date:'medium'}}</small>
<div class="row" style="margin-top:8px"><a class="btn" [routerLink]="['/editor',p._id]">Edit</a><button class="alt" (click)="star(p)">{{p.favorite?'★':'☆'}}</button><a class="btn alt" style="color:#222" [href]="p.paintedPhoto" [download]="p.name+'.jpg'">Download</a><button class="danger" (click)="del(p)">Delete</button></div></div></div>`})
export class DashboardComponent implements OnInit{api=inject(Api);fav=!!inject(ActivatedRoute).snapshot.data['fav'];list:any[]=[];loaded=false;err='';
 ngOnInit(){this.load()}
 load(){this.api.get('/projects',this.fav?{favorite:1}:{}).subscribe({next:r=>{this.list=r;this.loaded=true},error:e=>this.err=e.error?.message||'Failed to load'})}
 star(p:any){this.api.put('/projects/'+p._id,{favorite:!p.favorite}).subscribe(()=>this.load())}
 del(p:any){if(confirm('Delete this design?'))this.api.del('/projects/'+p._id).subscribe(()=>this.load())}}
