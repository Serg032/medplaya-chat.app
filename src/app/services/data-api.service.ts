import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

interface RequestPayload {
  question: string;
  hotel: Hotel;
}

type Hotel = 'Calypso';

@Injectable({
  providedIn: 'root',
})
export class DataApiService {
  constructor() {}

  public async makeQuestion(question: string) {
    const response = await fetch(
      'https://claudiafunc.azurewebsites.net/api/medplayafunc',
      {
        method: 'POST',
        headers: {
          'x-functions-key':
            '8OM1OEwq1y2GOVfvYfQB6yXQbOB_5KhSoSYaZ3zgv4chAzFugGvudg==',
        },
        body: JSON.stringify(this.buildPayload(question)),
      }
    );

    return response.text();
  }

  private buildPayload(question: string): RequestPayload {
    return {
      question,
      hotel: 'Calypso',
    };
  }
}
