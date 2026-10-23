import {inject} from '@angular/core';
import {CanActivateFn,Router} from '@angular/router';
import {Api} from '../services/api.service';
export const authGuard:CanActivateFn=()=>{const a=inject(Api);return a.loggedIn||inject(Router).createUrlTree(['/login'])};
export const adminGuard:CanActivateFn=()=>{const a=inject(Api);return (a.loggedIn&&a.isAdmin)||inject(Router).createUrlTree(['/'])};
