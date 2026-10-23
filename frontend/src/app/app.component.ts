import {Component,inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router,RouterLink,RouterOutlet} from '@angular/router';
import {Api} from './services/api.service';
@Component({selector:'app-root',standalone:true,imports:[CommonModule,RouterLink,RouterOutlet],template:`
<nav><a class="brand" routerLink="/">🎨 Smart Wall Paint</a><a routerLink="/how-to">How to use</a>
<ng-container *ngIf="api.loggedIn"><a routerLink="/dashboard">My Designs</a><a routerLink="/favorites">Favorites</a><a routerLink="/editor">New Design</a><a *ngIf="api.isAdmin" routerLink="/admin">Admin</a></ng-container>
<span class="sp"></span>
<ng-container *ngIf="!api.loggedIn"><a routerLink="/login">Login</a><a routerLink="/register">Register</a></ng-container>
<ng-container *ngIf="api.loggedIn"><span>{{api.user?.name}} ({{api.user?.role}})</span><button class="alt" (click)="out()">Logout</button></ng-container></nav>
<main><router-outlet></router-outlet></main>`})
export class AppComponent{api=inject(Api);r=inject(Router);out(){this.api.logout();this.r.navigate(['/'])}}
