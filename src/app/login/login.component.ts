import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';
import { ErrorService } from '../error.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  constructor(
    private router: Router,
    private login: LoginService,
    private popUp: ErrorService
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  navigateTo() {
    this.router.navigate(['/home']);
  }

  submit() {
    console.log(this.form);
    if (this.form.valid) {
      console.log('Form is valid!');
      this.login
        .validate(this.form.value.username, this.form.value.password)
        .subscribe(
          (response) => {
            if (response) {
              console.log('response-->', response);
              this.login.setUserInfo({ user: response });
              this.router.navigate(['/admin']);
            }
          },
          (error) => {
            this.popUp.showMessage(error.message);
          }
        );
    }
  }
}
