import { Injectable } from '@angular/core';

interface Payload {
  question: string;
  hotel: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataApiService {
  private apiUrl = 'https://claudiafunc-dev.azurewebsites.net/api/medplayafunc';
  constructor() {}

  public async sendQuestion(payload: Payload) {
    try {
      const data = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'x-functions-key':
            'nweHKZRxXM81Qex1p-__fzEUJ5bt1w-tortOdB7Vv1BdAzFuEvmtHw==',
        },
        body: JSON.stringify(payload),
      });

      return (await data.text()) as string;
    } catch (error) {
      throw error;
    }
  }
}
