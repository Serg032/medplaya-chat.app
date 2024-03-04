import { Injectable, input } from '@angular/core';
import { Router } from '@angular/router';
import { MedplayaGuest } from '../login/login.component';

interface Query {
  username: string;
}

export interface LoginResponse {
  accessToken: String;
  guest: MedplayaGuest;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private router: Router) {}

  public async login(
    username: string,
    checkinDate: string
  ): Promise<LoginResponse | string> {
    try {
      const query: Query = {
        username,
      };
      const dataFetched = await fetch(
        'http://localhost:8080/medplaya/guests/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(query),
        }
      );

      if (dataFetched.status === 404) {
        alert('El usuario no existe');
        return 'El usuario no existe';
      }
      if (dataFetched.status === 500) {
        alert('Error en el servidor');
        return 'Error en el servidor';
      }

      const loginResponse = (await dataFetched.json()) as LoginResponse;
      this.validateClientLogin(loginResponse.guest, checkinDate);
      return {
        accessToken: loginResponse.accessToken,
        guest: loginResponse.guest,
      };
    } catch (error) {
      return 'error';
    }
  }

  private validateClientLogin(guest: MedplayaGuest, checkinDate: string): void {
    // const marshaledCheckin = this.marshallCheckinDateFromDatabase(
    //   String(guest.dateIn)
    // );
    // const marshaledCheckout = this.marshallCheckoutDateFromDatabase(
    //   String(guest.dateOut)
    // );

    const guestDateIn = guest.dateIn._value;
    const guestDateOut = guest.dateOut._value;
    const inputCheckin = new Date(checkinDate);
    inputCheckin.setHours(0);
    inputCheckin.setMinutes(0);
    inputCheckin.setSeconds(0);
    inputCheckin.setMilliseconds(0);

    const databaseCheckin = new Date(guest.dateIn._value);
    databaseCheckin.setHours(0);
    databaseCheckin.setMinutes(0);
    databaseCheckin.setSeconds(0);
    databaseCheckin.setMilliseconds(0);

    const earlyLoginLimit = this.buildEarlyLoginLimit(new Date(guestDateIn));
    const latelyLoginLimit = this.buildLatelyLoginLimit(new Date(guestDateOut));

    console.log(
      'checkin',
      databaseCheckin,
      'input checkin',
      inputCheckin,
      databaseCheckin.getTime() === inputCheckin.getTime()
    );

    if (databaseCheckin.getTime() === inputCheckin.getTime()) {
      const todayDate = this.buildToday();

      if (todayDate.getTime() < earlyLoginLimit.getTime()) {
        alert('Access denied, too early');
        return;
      } else if (todayDate.getTime() > latelyLoginLimit.getTime()) {
        alert('Access denied, too late');
        return;
      } else {
        this.navigateToChat(guest.id);
      }
    } else {
      alert('Wrong check in date');
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

  private navigateToChat(clientId: string) {
    return this.router.navigate([`chat/${clientId}`]);
  }
}
