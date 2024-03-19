import { Injectable } from '@angular/core';
import { environment } from './../../environments/environment';

interface Payload {
  question: string;
  hotel: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataApiService {
  private apiUrl = environment.aiDataUrl;
  constructor() {}

  public async sendQuestion(payload: Payload) {
    try {
      const data = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'x-functions-key': environment.apiKey,
        },
        body: JSON.stringify(payload),
      });

      return (await data.text()) as string;
    } catch (error) {
      throw error;
    }
  }
}
