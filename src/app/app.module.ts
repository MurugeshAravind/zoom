import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent, DialoguePopupComponent, BrowsePopupComponent } from './home/home.component';
import { SocialLoginModule, AuthServiceConfig, GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { CommonService } from './common.service';
import {FlexLayoutModule} from '@angular/flex-layout';
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AdminComponent, AdminConfirmationComponent } from './admin/admin.component';
import { ErrorService } from './error.service';
// Config for google and fb authentication
const config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider('748519132686-4d7ckldnm7a99n9smvdp8rq7960ccepv.apps.googleusercontent.com')
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider('423309188606014')
  }
]);

export function provideConfig() {
  return config;
}


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DialoguePopupComponent,
    BrowsePopupComponent,
    AdminConfirmationComponent,
    LoginComponent,
    PageNotFoundComponent,
    AdminComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SocialLoginModule,
    FlexLayoutModule
  ],
  providers: [
    CommonService,
    ErrorService,
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
  }],
  entryComponents: [DialoguePopupComponent, BrowsePopupComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
