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
          '8OM1OEwq1y2GOVfvYfQB6yXQbOB_5KhSoSYaZ3zgv4chAzFugGvudg==',
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

  public buildResponse(response: string) {
    const links = this.extractLinksFromString(response);
    console.log('Links: ', links);

    if (links.length > 0) {
      links.map((link) => {
        response = response.replace(
          link,
          `<a href="${link}" target="_blank">${link}</a>`
        );
      });

      response.split(' ').unshift('<span>');
      response.split(' ').push('</span>');

      return response;
    }

    response.split(' ').unshift('<span>');
    response.split(' ').push('</span>');

    return response;
  }

  public extractLinksFromString(text: string): string[] {
    const regex = /(http[s]?:\/\/[^\s]+)|(www\.[^\s]+)/g;
    const links = text.match(regex);
    return links || [];
  }
}
