import {
  Component,
  OnInit,
  Inject,
  OnDestroy,
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import {
  AuthService,
  GoogleLoginProvider,
  SocialUser,
  FacebookLoginProvider,
} from 'angularx-social-login';
import { ErrorService } from '../error.service';
import { CommonService } from '../common.service';
import { Router, NavigationEnd } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MediaMatcher } from '@angular/cdk/layout';

export interface DialogData {
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  user: SocialUser;
  loggedIn: boolean;
  selectedFile: any;
  userDataInDB: any;
  userDataToSend: any;
  isLoading = false;
  items: any;
  matcher: MediaQueryList;
  public isMobile = false;
  basedOnView: any;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    private popUp: ErrorService,
    private commonService: CommonService,
    private breakpointObserver: BreakpointObserver,
    public mediaMatcher: MediaMatcher,
  ) {
    // break point observer for mobiles
    this.breakpointObserver
      .observe([`(max-width: 600px)`])
      .subscribe((result) => {
        console.log(result);
        this.isMobile = result.matches;
      });
    this.socialLoginInfo();
  }
  ngOnInit() {
    this.getUser();
  }

  // Social login
  socialLoginInfo() {
    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = user != null;
      console.log('user info from social login-->', this.user);
      console.log('this.loggedIn info--->', this.loggedIn);
    });
  }

  // For getting the user details from mongodb
  getUser() {
    this.commonService.GetUser().subscribe((res) => {
      // console.log('Data from get user-->', res);
      console.table('table response of get user-->', res);
      this.userDataInDB = res;
      this.items = this.userDataInDB;
    });
  }

  // For saving the user details in mongodb
  saveUser(user) {
    this.commonService.saveUser(user).subscribe(
      (res) => {
        console.log('response after saving-->', res);
        this.getUser();
        if (res.data) {
          this.popUp.showMessage(res.data);
        } else {
          this.popUp.showMessage(res.message);
        }
      },
      (error) => {
        this.popUp.showMessage(error);
      }
    );
  }

  // Uploading the file to server
  fileUploadInServer(file) {
    console.log('File on upload-->', file);
    const formData = new FormData();
    formData.append('file', file);
    this.commonService.uploadFileToServer(formData).subscribe(
      (res) => {
        console.log('response-->', res);
      },
      (error) => {
        console.log('error-->', error);
      }
    );
  }

  // Authentication through google signin
  signInWithGoogle() {
    this.authService
      .signIn(GoogleLoginProvider.PROVIDER_ID)
      .then(() => {
        this.openBrowsePopup();
      })
      .catch((e) => {
        const message = e;
        this.popUp.showMessage(message);
      });
  }

  // Authentication through facebook
  signInWithFB() {
    this.authService
      .signIn(FacebookLoginProvider.PROVIDER_ID)
      .then(() => {
        this.openBrowsePopup();
      })
      .catch((e) => {
        const message = e;
        this.popUp.showMessage(message);
      });
  }

  // Signout
  signOut() {
    this.authService.signOut();
  }

  downloadImage(item) {
    console.log('item-->', item);
    const a: any = document.createElement('a');
    a.href = `../../uploads/${item.file.fileName}`;
    a.download = item.file.fileName;
    document.body.appendChild(a);
    a.style = 'display: none';
    a.click();
    a.remove();
    return false;
  }

  // Opens the browse popup to choose files
  openBrowsePopup() {
    const dialogRef = this.dialog.open(BrowsePopupComponent, {
      width: '492px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('result', result);
      this.getUser();
      this.selectedFile = result;
      if (result !== undefined && result !== false) {
        console.log(
          'selected File inside the browse popup component-->',
          this.selectedFile.name
        );
        const message = `Hi ${this.user.email}, your image is sent for review, we will get back to you shortly!`;
        this.popUp.showMessage(message);
        this.userDataToSend = {
          social_id: this.user.id,
          name: this.user.name,
          file: {
            fileName: this.selectedFile.name,
            fileType: this.selectedFile.type,
          },
          mode: 'save',
          isApproved: false,
        };
        console.log('user data sent-->', this.userDataToSend);
        this.fileUploadInServer(this.selectedFile);
        this.saveUser(this.userDataToSend);
      }
    });
  }

  // Login to admin page
  onAdminLogin() {
    this.router.navigate(['/login']);
  }

  // On click on upload button
  onUpload() {
    const dialogRef = this.dialog.open(DialoguePopupComponent, {
      width: '492px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('result', result);
      if (result) {
        if (this.loggedIn) {
          this.openBrowsePopup();
        } else {
          this.signInWithGoogle();
        }
      } else if (result !== undefined) {
        this.signInWithFB();
      }
    });
  }
}

// Dialogue popup for authentication
@Component({
  selector: 'app-dialog-popup',
  templateUrl: 'dialoguePopup.html',
  styleUrls: ['./home.component.css'],
})
export class DialoguePopupComponent {
  constructor(
    public dialogRef: MatDialogRef<DialoguePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}
  onClose() {
    this.dialogRef.close();
  }
}

// Browse popup for the choosing the image
@Component({
  selector: 'app-browse-popup',
  templateUrl: 'browsePopup.html',
  styleUrls: ['./home.component.css'],
})
export class BrowsePopupComponent implements OnDestroy {
  selectedFile: null;
  loading = false;
  constructor(
    private popUp: ErrorService,
    public dialogRef: MatDialogRef<BrowsePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}
  onSelectFile(e) {
    console.log(
      'event triggered inside the browse popup-->',
      e.target.files[0]
    );
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.selectedFile = e.target.files[0];
    }, 1000);
  }
  onSubmit() {
    console.log(this.selectedFile);
    if (this.selectedFile) {
      this.dialogRef.close(this.selectedFile);
    } else {
      this.popUp.showMessage(
        `Kindly select any image file to proceed further.`
      );
    }
  }
  onClose() {
    this.dialogRef.close();
  }
  ngOnDestroy() {
    this.loading = false;
  }
}
