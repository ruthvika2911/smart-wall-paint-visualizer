import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
@Component({standalone:true,imports:[RouterLink],template:`<div class="card" style="text-align:center;padding:60px 20px"><h1>See your walls in a new color</h1>
<p>Upload a room photo, select the walls by hand, try colors, finishes and patterns, compare before/after and save your design.</p>
<a class="btn" routerLink="/register">Get started</a> <a class="btn" style="background:#888" routerLink="/how-to">How it works</a></div>`})
export class HomeComponent{}
@Component({standalone:true,template:`<div class="card"><h2>How to use</h2><ol><li>Register and log in.</li><li>Choose <b>New Design</b> and upload a JPG/PNG room photo.</li><li>Pick <b>Polygon</b> (click points, double-click to close) or <b>Brush</b> to mark a wall.</li><li>Choose a color, opacity, finish and optional pattern.</li><li>Use <b>New wall</b> to paint another wall a different color.</li><li>Open Before/After to compare, then Save or Download.</li></ol></div>`})
export class HowToComponent{}
