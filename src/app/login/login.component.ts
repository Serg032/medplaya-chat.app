import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Query {
  query: {
    where: {
      username: string;
      room: string;
    };
  };
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
  ],
})
export class LoginComponent {
  constructor(private router: Router) {}
  userProfileForm = new FormGroup({
    username: new FormControl(''),
    room: new FormControl(),
  });

  public onSubmit() {
    const value = this.userProfileForm.value;
    const username = value.username;
    const room = value.room;
    if (username && room) {
      this.login(username, String(room));
      console.log({
        username: {
          value: username,
          typeof: typeof username,
        },
        room: {
          value: room,
          typeof: typeof room,
        },
      });
    } else {
      alert('Both fields needed');
    }
  }

  private async login(username: string, room: string) {
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
      console.log('Response', response.status);

      const data = await response.json();
      console.log(data);
      this.router.navigate(['chat']);
      return data;
    } catch (error) {
      console.log(error);
    }
  }
}
