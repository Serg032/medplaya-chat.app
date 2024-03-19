import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

interface RequestPayload {
  question: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataApiService {
  constructor() {}

  public async makeQuestion(question: string) {
    const response = await fetch(environment.aiDataUrl, {
      method: 'POST',
      headers: {
        'x-functions-key': environment.apiKey,
      },
      body: JSON.stringify({
        question: 'Es mi cumpleaños. Qué puedo hacer para celebrarlo? ',
        hotel: 'Calypso',
      }),
    });

    return response;
  }

  private buildPayload(question: string): RequestPayload {
    return {
      question,
    };
  }
}
