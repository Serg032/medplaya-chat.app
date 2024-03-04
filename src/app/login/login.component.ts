import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { LoginService } from '../services/login.service';

interface GuestDate {
  _value: string;
}

export interface MedplayaGuest {
  id: string;
  name: string;
  surname1: string;
  surname2: string;
  userName: string;
  dateIn: GuestDate;
  dateOut: GuestDate;
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
  constructor(private loginService: LoginService) {}
  userProfileForm = new FormGroup({
    username: new FormControl(''),
    checkInDate: new FormControl(''),
  });

  public async onSubmit() {
    const value = this.userProfileForm.value;
    const username = value.username;
    const checkinDate = value.checkInDate;

    if (username && checkinDate) {
      await this.loginService.login(username, checkinDate);
    } else {
      alert('All fields needed');
    }
  }
}
