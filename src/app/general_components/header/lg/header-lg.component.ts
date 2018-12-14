import { Component, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { UserInfo } from '../../../models';
import { Router } from '@angular/router';
@Component({
  selector: 'app-header-lg',
  templateUrl: './header-lg.component.html',
  styleUrls: ['./header-lg.component.css']
})
export class HeaderLgComponent {
  showUserDropdown = false;
  version: string = environment.version;

  @Input()
  userInfo: UserInfo;

  constructor(private router: Router) {}

  goTo(route: string) {
    this.router.navigate([route]);
  }
}
