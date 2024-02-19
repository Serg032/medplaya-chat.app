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
  checkout: string;
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
    checkInDate: new FormControl(''),
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
    checkinDate: string
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
      this.validateClientLogin(client, checkinDate);
      return client;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  private marshallCheckinDateFromDatabase = (
    stringCheckinDate: string
  ): Date => {
    const marshaledCheckin = new Date(stringCheckinDate.slice(0, 10).trim());
    marshaledCheckin.setHours(0), marshaledCheckin.setMinutes(0);
    marshaledCheckin.setSeconds(0);
    marshaledCheckin.setMilliseconds(0);

    return marshaledCheckin;
  };

  private marshallCheckoutDateFromDatabase = (
    stringCheckoutDate: string
  ): Date => {
    const marshaledCheckout = new Date(stringCheckoutDate.slice(0, 10).trim());
    marshaledCheckout.setHours(0), marshaledCheckout.setMinutes(0);
    marshaledCheckout.setSeconds(0);
    marshaledCheckout.setMilliseconds(0);

    return marshaledCheckout;
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

  private buildToday(): Date {
    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);

    return today;
  }

  private validateClientLogin(client: Client, checkinDate: string): void {
    const marshaledCheckin = this.marshallCheckinDateFromDatabase(
      client.checkin
    );
    const marshaledCheckout = this.marshallCheckoutDateFromDatabase(
      client.checkout
    );
    const earlyLoginLimit = this.buildEarlyLoginLimit(marshaledCheckin);
    const latelyLoginLimit = this.buildLatelyLoginLimit(marshaledCheckout);

    console.log('marshaled checkin from database', marshaledCheckin);
    console.log('early limit', earlyLoginLimit);
    console.log('lately limit', latelyLoginLimit);
    console.log(
      marshaledCheckin.getTime(),
      new Date(checkinDate).getTime(),
      marshaledCheckin.getTime() === new Date(checkinDate).getTime()
    );

    if (marshaledCheckin.getTime() === new Date(checkinDate).getTime()) {
      const todayDate = this.buildToday();

      if (todayDate.getTime() < earlyLoginLimit.getTime()) {
        alert('Access denied, too early');
        return;
      } else if (todayDate.getTime() > latelyLoginLimit.getTime()) {
        console.log(
          todayDate.getTime() > latelyLoginLimit.getTime(),
          todayDate.getTime(),
          latelyLoginLimit.getTime(),
          'Fri Feb 16 2024 00:00:00 GMT+0100 (hora estándar de Europa central)' ===
            'Fri Feb 16 2024 00:00:00 GMT+0100 (hora estándar de Europa central)'
        );
        alert('Access denied, too late');
        return;
      } else {
        this.navigateToChat(client.id);
      }
    } else {
      alert('Wrong check in date');
      return;
    }
  }

  private navigateToChat(clientId: string) {
    return this.router.navigate([`chat/${clientId}`]);
  }
}
