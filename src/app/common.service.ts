import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(private http: HttpClient) {}
  saveUser(user): Observable<any> {
    return this.http
      .post('http://localhost:3000/api/SaveUser', user)
      .pipe(map((response) => response));
  }
  updateUser(user): Observable<any> {
    return this.http
    .post('http://localhost:3000/api/updateUser', user )
    .pipe(map((response) => response));
  }
  GetUser(): Observable<any> {
    return this.http
      .get('http://localhost:3000/api/getUser')
      .pipe(map((response) => response));
  }
  deleteUser(id): Observable<any> {
    return this.http
      .post('http://localhost:3000/api/deleteUser', id )
      .pipe(map((response) => response));
  }
  uploadFileToServer(file): Observable<any> {
    return this.http
      .post('http://localhost:3000/api/imageUpload', file)
      .pipe(map((response) => response));
  }
}
