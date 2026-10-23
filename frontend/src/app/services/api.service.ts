import {Injectable,inject} from '@angular/core';
import {HttpClient,HttpInterceptorFn} from '@angular/common/http';
import {tap} from 'rxjs';
export const API='http://localhost:5000/api';
export const authInterceptor:HttpInterceptorFn=(req,next)=>{const t=localStorage.getItem('token');return next(t?req.clone({setHeaders:{Authorization:'Bearer '+t}}):req)};
@Injectable({providedIn:'root'})
export class Api{
 private http=inject(HttpClient);
 user:any=JSON.parse(localStorage.getItem('user')||'null');
 get loggedIn(){return !!localStorage.getItem('token')}
 get isAdmin(){return this.user?.role==='ADMIN'}
 auth(kind:'login'|'register',b:any){return this.http.post<any>(`${API}/auth/${kind}`,b).pipe(tap(r=>{localStorage.setItem('token',r.token);localStorage.setItem('user',JSON.stringify(r.user));this.user=r.user}))}
 logout(){localStorage.removeItem('token');localStorage.removeItem('user');this.user=null}
 get<T=any>(p:string,params?:any){return this.http.get<T>(API+p,{params})}
 post<T=any>(p:string,b:any){return this.http.post<T>(API+p,b)}
 put<T=any>(p:string,b:any){return this.http.put<T>(API+p,b)}
 del<T=any>(p:string){return this.http.delete<T>(API+p)}
}
