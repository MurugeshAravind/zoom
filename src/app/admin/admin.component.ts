import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../common.service';
import { ErrorService } from '../error.service';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { LoginService } from '../login.service';

export interface DialogData {
  action: string;
  id: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  users: any;
  constructor(
    private router: Router,
    private popUp: ErrorService,
    private common: CommonService,
    private login: LoginService,
    public dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.getUser();
  }

  // Function for getting the user data
  getUser() {
    this.common.GetUser().subscribe(
      (res) => {
        console.log('response from get user in admin component-->', res);
        this.users = res;
      },
      (error) => {
        this.popUp.showMessage(error);
      }
    );
  }

  // Function for approving the image
  approveImage(data) {
    console.log('data inside the approve image-->', data);
    this.common.updateUser(data).subscribe(
      (response) => {
        if (response) {
          this.popUp.showMessage('This image has been approved');
          this.getUser();
        }
      },
      (error) => {
        this.popUp.showMessage(error);
      }
    );
  }

  // For deleting the image from DB
  deleteImage(data) {
    this.common.deleteUser(data).subscribe(
      (response) => {
        if (response) {
          this.popUp.showMessage(response.data);
          this.getUser();
        }
      },
      (error) => {
        this.popUp.showMessage(error);
      }
    );
  }

  onApprove(action, id) {
    console.log('on click on approve-->', action);
    console.log('on click on approve-->', id);
    const dialogRef = this.dialog.open(AdminConfirmationComponent, {
      width: '492px',
      data: { action, id },
    });
    this.getUser();
    dialogRef.afterClosed().subscribe((result) => {
      console.log('result-->', result);
      if (result) {
        const filteredData = this.users.filter(
          (x) => x._id === result.data.id
        )[0];
        console.log('Filtered Data--->', filteredData);
        if (result.flag === true) {
          console.log('we need to proceed with api call to update the db');
          const data = {
            _id: filteredData._id,
            social_id: filteredData.social_id,
            name: filteredData.name,
            file: {
              fileName: filteredData.file.fileName,
              fileType: filteredData.file.fileType,
            },
            isApproved: true,
          };
          this.approveImage(data);
        }
      }
    });
  }

  onReject(action, id) {
    console.log('on click on reject-->', action);
    console.log('on click on reject-->', id);
    const dialogRef = this.dialog.open(AdminConfirmationComponent, {
      width: '492px',
      data: { action, id },
    });
    this.getUser();
    dialogRef.afterClosed().subscribe((result) => {
      console.log('result-->', result);
      if (result) {
        const filteredData = this.users.filter(
          (x) => x._id === result.data.id
        )[0];
        console.log('Filtered Data--->', filteredData);
        if (result.flag === true) {
          const data = {
            id: filteredData._id,
          };
          this.deleteImage(data);
        }
      }
    });
  }

  onLogout() {
    this.login.deletUserInfo();
    this.router.navigate(['/login']);
  }
}

@Component({
  selector: 'app-admin-confirmation',
  templateUrl: 'adminConfirmation.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminConfirmationComponent implements OnInit, OnDestroy {
  status;
  dialogData: any;
  constructor(
    public dialogRef: MatDialogRef<AdminConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}
  ngOnInit() {
    this.dialogData = this.data;
    console.log('data based on the click-->', this.dialogData);
    if (this.dialogData.action === 'approve') {
      this.status = true;
    } else if (this.dialogData.action === 'reject') {
      this.status = false;
    }
  }
  onClose() {
    this.dialogRef.close();
  }
  approve() {
    const object = {
      data: this.data,
      flag: true,
    };
    this.dialogRef.close(object);
  }
  reject() {
    const object = {
      data: this.data,
      flag: false,
    };
    this.dialogRef.close(object);
  }
  ngOnDestroy() {
    this.status = undefined;
    this.dialogData = undefined;
  }
}
