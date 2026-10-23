import {Component,inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute,Router} from '@angular/router';
import {Api} from '../services/api.service';
@Component({standalone:true,imports:[CommonModule,FormsModule],template:`
<div class="card" style="max-width:420px;margin:auto"><h2>{{reg?'Create account':'Login'}}</h2>
<div class="row" style="flex-direction:column;align-items:stretch">
<input *ngIf="reg" placeholder="Name" [(ngModel)]="f.name"><input placeholder="Email" type="email" [(ngModel)]="f.email">
<input placeholder="Password (min 8 chars)" type="password" [(ngModel)]="f.password" (keyup.enter)="go()">
<button (click)="go()" [disabled]="busy">{{reg?'Register':'Login'}}</button><div class="err">{{err}}</div></div></div>`})
export class AuthComponent{api=inject(Api);router=inject(Router);reg=inject(ActivatedRoute).snapshot.data['mode']==='register';f:any={name:'',email:'',password:''};err='';busy=false;
 go(){this.err='';this.busy=true;this.api.auth(this.reg?'register':'login',this.f).subscribe({next:r=>this.router.navigate([r.user.role==='ADMIN'?'/admin':'/dashboard']),error:e=>{this.err=e.error?.message||'Cannot reach server';this.busy=false}})}}
