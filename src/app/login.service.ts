import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http: HttpClient) {}
  isAuthenticated() {
    const userData = localStorage.getItem('userInfo');
    if (userData && JSON.parse(userData)) {
      return true;
    }
    return false;
  }

  setUserInfo(user) {
    localStorage.setItem('userInfo', JSON.stringify(user));
  }

  validate(email, password) {
    return this.http
      .post('http://localhost:3000/api/login', { username: email, password })
      .pipe(map((response) => response));
  }

  deletUserInfo() {
    localStorage.removeItem('userInfo');
  }
}
