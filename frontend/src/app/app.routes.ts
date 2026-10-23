import {Routes} from '@angular/router';
import {authGuard,adminGuard} from './guards/guards';
import {HomeComponent,HowToComponent} from './pages/home.component';
import {AuthComponent} from './pages/auth.component';
import {DashboardComponent} from './pages/dashboard.component';
import {EditorComponent} from './pages/editor.component';
import {AdminComponent} from './pages/admin.component';
export const routes:Routes=[
 {path:'',component:HomeComponent},{path:'how-to',component:HowToComponent},
 {path:'login',component:AuthComponent,data:{mode:'login'}},{path:'register',component:AuthComponent,data:{mode:'register'}},
 {path:'dashboard',component:DashboardComponent,canActivate:[authGuard]},
 {path:'favorites',component:DashboardComponent,canActivate:[authGuard],data:{fav:true}},
 {path:'editor',component:EditorComponent,canActivate:[authGuard]},{path:'editor/:id',component:EditorComponent,canActivate:[authGuard]},
 {path:'admin',component:AdminComponent,canActivate:[adminGuard]},
 {path:'**',redirectTo:''}];
