import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MedplayaGuest } from '../login/login.component';
import { environment } from '../../environments/environment';

interface Query {
  username: string;
}

export interface LoginResponse {
  accessToken: String;
  guest: MedplayaGuest;
}

interface Token {
  guestId: { _value: string };
  username: { _value: string };
}

export type Regime = 'FULL' | 'STANDARD' | 'BASIC';

export interface GetUserByIdResponse {
  id: string;
  name: string;
  surname1: string;
  surname2: string;
  username: string;
  dateIn: string;
  dateOut: string;
  bookingId: string;
  roomNumber: number;
  guestNumber: number;
  regime: Regime;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private router: Router) {}

  private rootUrl = environment.apiUrl;

  public async loginTest() {
    const data = await fetch(`${this.rootUrl}/guests/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'radigalesm' }),
    });

    return await data.json();
  }

  public async login(
    username: string,
    checkinDate: number
  ): Promise<LoginResponse | string> {
    try {
      const query: Query = {
        username,
      };
      const dataFetched = await fetch(`${this.rootUrl}/guests/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      });

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
      localStorage.setItem('accessToken', loginResponse.accessToken.toString());

      return {
        accessToken: loginResponse.accessToken,
        guest: loginResponse.guest,
      };
    } catch (error) {
      return 'error';
    }
  }

  private validateClientLogin(guest: MedplayaGuest, checkinDate: number): void {
    const marshledGuestDateIn = new Date(Number(guest.dateIn));
    marshledGuestDateIn.setHours(0);

    const earlyLoginLimit = this.buildEarlyLoginLimit(marshledGuestDateIn);
    const latelyLoginLimit = this.buildLatelyLoginLimit(marshledGuestDateIn);

    if (checkinDate === marshledGuestDateIn.getTime()) {
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

  private navigateToLogin() {
    return this.router.navigate([``]);
  }

  public validateAuth(guest: GetUserByIdResponse, accessToken?: string) {
    if (!accessToken) {
      this.navigateToLogin();
    } else {
      const decodedToken = accessToken.split('/');
      if (
        !accessToken ||
        guest.id !== decodedToken[0] ||
        guest.username !== decodedToken[1]
      ) {
        this.navigateToLogin();
      }
    }
  }

  public getGuestById = async (
    id: string
  ): Promise<GetUserByIdResponse | undefined> => {
    const response = await fetch(`${this.rootUrl}/guests/find/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return (await response.json()) as GetUserByIdResponse;
  };
}
