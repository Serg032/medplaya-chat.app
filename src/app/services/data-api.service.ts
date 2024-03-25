import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

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
    const response = await fetch(environment.chatAssistantUrl, {
      method: 'POST',
      headers: {
        'x-functions-key':
          'nweHKZRxXM81Qex1p-__fzEUJ5bt1w-tortOdB7Vv1BdAzFuEvmtHw==',
      },
      body: JSON.stringify(this.buildPayload(question)),
    });

    return response.text();
  }

  private buildPayload(question: string): RequestPayload {
    return {
      question,
      hotel: 'Calypso',
    };
  }
}
