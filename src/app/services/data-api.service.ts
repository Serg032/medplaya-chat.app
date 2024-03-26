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
    if (response.includes('http') || response.includes('www')) {
      const splittedResponse = response.split(' ');
      const link = splittedResponse.find(
        (link) => link.includes('http') || link.includes('www')
      );
      if (link) {
        const linkIndex = splittedResponse.indexOf(link);
        // Quiero que el link si su ultimo caracter no es una letra o un numero sea eliminado
        const lastChar = link[link.length - 1];
        if (link && !lastChar.match(/[a-z0-9]/i)) {
          const customLink = link.slice(0, -1);
          const linkBuilt = `<a href="${customLink}" target="_blank">${link}</a>`;
          splittedResponse[linkIndex] = linkBuilt;

          return splittedResponse.join(' ');
        }
        const linkBuilt = `<a href="${link}" target="_blank">${link}</a>`;
        splittedResponse[linkIndex] = linkBuilt;

        return splittedResponse.join(' ');
      }
    }

    response.split(' ').unshift('<span>');
    response.split(' ').push('</span>');

    return response;
  }
}
