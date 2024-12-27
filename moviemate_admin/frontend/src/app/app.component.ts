import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { TokenService } from './services/token.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'moviemate_admin';
  constructor(public tokenService: TokenService) { }
  logout() {
    this.tokenService.removeToken();
  }
}
