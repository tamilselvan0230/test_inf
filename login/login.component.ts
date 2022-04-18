import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

import { Router } from '@angular/router';
import { DoctorserviceService } from '../../services/doctorservice.service';
import { WindowService } from '../../services/window.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  submitted = false;
  loadingform = false;
  emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
  phoneNumber = '^(\+\d{1,3}[- ]?)?\d{10}$';
  error = false;
  verifyerror = false;
  errorexist = false;
  success = false;
 constructor(public formBuilder: FormBuilder, private notifyService: NotificationService, private win: WindowService, private router: Router,public dservice: DoctorserviceService,@Inject(DOCUMENT) private document: Document,
 private renderer: Renderer2) { }
  ngOnInit(): void {
    this.initloginForm();
    this.renderer.addClass(this.document.body, 'embedded-body');
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'embedded-body');
}
  initloginForm() {
    this.loadingform = false;
    this.submitted = false;
   // this.loadverified = false;
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i), Validators.required])],
      password: ['',  [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,30}$/)]],
      user_type_id: [1,[Validators.required]]

    });
  }

  get fo() { return this.loginForm.controls; }

  onSubmit(){
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
        return;
    }else{

      this.loadingform = true;
      const obj = Object.assign(this.loginForm.value);
      this.dservice.adminlogin(obj).subscribe(data => {
        console.log(data);
        localStorage.setItem('token', data.token);
        localStorage.setItem('hId', data.id);
        localStorage.setItem('usertype_id', data.user_type_id);
        // localStorage.setItem('email', response.data.email);
        var obj1 = {id: data.id};
        this.dservice.getDocterDetails(obj1).subscribe(response => {
          console.log(response)
          localStorage.setItem('user', JSON.stringify(response.data));

          if (response.data.user_type_id == 1){
            this.router.navigate(['admin/dashboard']);
          }
        });
        this.error = false;
      },
       err => {
        //  this.error=true;
        this.submitted = true;
        // this.message="Incorrect email address or password";
        this.notifyService.showWarning('Incorrect email address or password', '');
        this.loadingform = false;
        // this.router.navigate(['app/landing/provider-dashboard']);
        // this.initloginForm();
     });

    }
  }

}
