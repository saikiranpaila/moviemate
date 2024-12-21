import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {

  toast = {
    show: false,
    message: '',
    success: false,
  }

  showToast(message: string, success: boolean) {
    this.toast.show = true;
    this.toast.message = message
    this.toast.success = success
    setTimeout(() => {
      this.toast.message = ''
      this.hideToast();
    }, 3000);
  }

  hideToast() {
    this.toast.show = false;
    this.toast.message = ''
    this.toast.success = true
  }
}
