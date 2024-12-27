import { NgClass } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BackendService } from '../../services/backend.service';
import { ToastComponent } from '../toast/toast.component';
import { flush } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, ToastComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  @ViewChild('toast') toast!: ToastComponent
  userNameControl: FormControl = new FormControl('', Validators.required);
  passwordControl: FormControl = new FormControl('', Validators.required);
  userForm: FormGroup = new FormGroup({
    username: this.userNameControl,
    password: this.passwordControl
  });
  constructor(private backend: BackendService, private tokenService: TokenService, private router: Router) { }
  login() {
    this.backend.login(this.userForm.value).subscribe({
      next: (res: { token: string }) => { this.tokenService.saveToken(res.token), this.toast.showToast("Login Successful", true), this.router.navigate(['/']) },
      error: (err) => { this.toast.showToast("Invalid Login", false) }
    })
  }
}
