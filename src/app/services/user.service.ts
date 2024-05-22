import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MedplayaGuest } from '../login/login.component';
import { environment } from '../../environments/environment';

interface LoginPayload {
  username: string;
  checkinTimestamp: number;
}

export interface LoginSuccesfullResponse {
  accessToken: string;
  guest: MedplayaGuest;
}

export interface LoginFailedResponse {
  message:
    | 'Guest not found'
    | 'Wrong checkin date'
    | 'Is to early to checkin'
    | 'Is to late to checkin'
    | 'Something went wrong';
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

  public async login(
    payload: LoginPayload
  ): Promise<LoginSuccesfullResponse | LoginFailedResponse> {
    try {
      const data = await fetch(`${this.rootUrl}/guests/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const response = (await data.json()) as
        | LoginSuccesfullResponse
        | LoginFailedResponse;

      if ('message' in response && response.message === 'Guest not found') {
        alert('El usuario no existe');
        return { message: 'Guest not found' };
      }
      if ('message' in response && response.message === 'Wrong checkin date') {
        alert('Fecha de entrada incorrecta');
        return { message: 'Wrong checkin date' };
      }
      if (
        'message' in response &&
        response.message === 'Is to early to checkin'
      ) {
        alert('Es demasiado pronto para hacer el checkin');
        return { message: 'Is to early to checkin' };
      }
      if (
        'message' in response &&
        response.message === 'Is to late to checkin'
      ) {
        alert('Es demasiado tarde para hacer el checkin');
        return { message: 'Is to late to checkin' };
      }

      localStorage.setItem(
        'accessToken',
        (response as LoginSuccesfullResponse).accessToken.toString()
      );

      this.navigateToChat((response as LoginSuccesfullResponse).guest.id);

      return {
        accessToken: (response as LoginSuccesfullResponse).accessToken,
        guest: (response as LoginSuccesfullResponse).guest,
      };
    } catch (error) {
      return { message: 'Something went wrong' };
    }
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
