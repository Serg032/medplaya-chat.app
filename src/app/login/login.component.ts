import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';

interface Query {
  query: {
    where: {
      username: string;
      room: string;
    };
  };
}

enum Status {
  PENDDING,
  OK,
  NO_OK,
}

interface LoginResponse {
  id: string;
  nif: string;
  room: string;
  name: string;
  status: Status;
  code: string;
  username: string;
  isActive: boolean;
  amount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
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
  constructor(private router: Router) {}
  userProfileForm = new FormGroup({
    username: new FormControl(''),
    checkInDate: new FormControl(new Date()),
    room: new FormControl(),
  });

  public onSubmit() {
    const value = this.userProfileForm.value;
    const username = value.username;
    const room = value.room;
    console.log(this.userProfileForm.value.checkInDate);
    if (username && room) {
      this.login(username, String(room));
    } else {
      alert('Both fields needed');
    }
  }

  private async login(
    username: string,
    room: string
  ): Promise<LoginResponse | void> {
    try {
      const query: Query = {
        query: {
          where: {
            username,
            room,
          },
        },
      };
      const response = await fetch(
        'http://localhost:8080/medplaya/client/find',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(query),
        }
      );

      if (response.status === 404) {
        alert('El usuario no existe');
        return;
      }
      if (response.status === 500) {
        alert('Error en el servidor');
        return;
      }

      const data = (await response.json()) as LoginResponse;
      this.router.navigate([`chat/${data.id}`]);
      console.log(data);
      return data;
    } catch (error) {
      console.log(error);
    }
  }
}
