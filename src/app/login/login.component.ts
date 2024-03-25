import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { UserService } from '../services/user.service';
import { environment } from '../../environments/environment';

interface GuestId {
  _value: string;
}

interface GuestUsername {
  _value: string;
}
interface GuestDate {
  _value: string;
}

export interface MedplayaGuest {
  id: string;
  name: string;
  surname1: string;
  surname2: string;
  username: GuestUsername;
  dateIn: number;
  dateOut: number;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
  ],
})
export class LoginComponent {
  constructor(private loginService: UserService) {}
  userProfileForm = new FormGroup({
    username: new FormControl(''),
    checkInDate: new FormControl(''),
  });

  async ngOnInit() {}
  public async onSubmit() {
    const value = this.userProfileForm.value;
    const username = value.username;
    const checkinDate = value.checkInDate;

    if (username && checkinDate) {
      await this.loginService.login(username, new Date(checkinDate).getTime());
    } else {
      alert('All fields needed');
    }
  }
}
