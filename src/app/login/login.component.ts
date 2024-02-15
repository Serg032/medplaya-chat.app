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
    };
  };
}

enum Status {
  PENDDING,
  OK,
  NO_OK,
}

export interface Client {
  id: string;
  name: string;
  lastname: string;
  username: string;
  checkin: string;
  code: string;
  room: string;
  status: Status;
  isActive: true;
  amount: number;
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
  });

  public async onSubmit() {
    const value = this.userProfileForm.value;
    const username = value.username;
    const checkinDate = value.checkInDate;

    if (username && checkinDate) {
      await this.login(username, checkinDate);
    } else {
      alert('All fields needed');
    }
  }

  private async login(
    username: string,
    checkinDate: Date
  ): Promise<Client | void> {
    try {
      const query: Query = {
        query: {
          where: {
            username,
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

      const client = (await response.json()) as Client;

      return client;
    } catch (error) {
      console.log(error);
    }
  }

  private marshallCheckinDateFromDatabase = (
    stringCheckinDate: string
  ): Date => {
    const marshaledCheckin = new Date(stringCheckinDate.slice(0, 10).trim());
    marshaledCheckin.setHours(0), marshaledCheckin.setMinutes(0);
    marshaledCheckin.setSeconds(0);

    return marshaledCheckin;
  };

  private buildEarlyLoginLimit(marshaledCheckinDate: Date): Date {
    const limit = new Date(marshaledCheckinDate.getTime());
    limit.setDate(marshaledCheckinDate.getDate() - 3);
    return limit;
  }

  private buildLatelyLoginLimit(marshaledCheckoutDate: Date): Date {
    const limit = new Date(marshaledCheckoutDate.getTime());
    limit.setDate(marshaledCheckoutDate.getDate() + 1);
    return limit;
  }

  private validateClientLogin(client: Client, checkinDate: string): void {
    const marshaledCheckin = this.marshallCheckinDateFromDatabase(
      client.checkin
    );
    const earlyLoginLimit = this.buildEarlyLoginLimit(marshaledCheckin);
    const latelyLoginLimit = this.buildLatelyLoginLimit(marshaledCheckin);
    console.log('marshaled checkin from database', marshaledCheckin);
    console.log('early limit', earlyLoginLimit);
    console.log('lately limit', latelyLoginLimit);
    if (marshaledCheckin === new Date(checkinDate)) {
      if (new Date() < earlyLoginLimit || new Date() > latelyLoginLimit) {
        alert('Access denied, too early');
      } else {
        this.router.navigate([`chat/${client.id}`]);
      }
    } else {
      alert('Wrong check in date');
    }
  }
}
