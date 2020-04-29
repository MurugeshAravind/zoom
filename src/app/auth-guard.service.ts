import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  constructor(private loginService: LoginService, private route: Router) {}

  canActivate() {
    if (this.loginService.isAuthenticated()) {
      return true;
    }
    this.route.navigate(['login']);
    return false;
  }
}
