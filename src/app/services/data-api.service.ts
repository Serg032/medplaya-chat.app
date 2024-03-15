import { Injectable } from '@angular/core';

interface RequestPayload {
  question: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataApiService {
  constructor() {}

  public async makeQuestion(question: string) {
    const response = await fetch(
      'https://claudiafunc-dev.azurewebsites.net/api/medplayafunc',
      {
        method: 'POST',
        headers:{
          "x-functions-key": 'nweHKZRxXM81Qex1p-__fzEUJ5bt1w-tortOdB7Vv1BdAzFuEvmtHw==',
        },
        body: JSON.stringify(({
          "question":"Es mi cumpleaños. Qué puedo hacer para celebrarlo? ",
          "hotel":"Calypso"
      }
      )),
      }
    );

    return response;
  }

  private buildPayload(question: string): RequestPayload {
    return {
      question,
    };
  }
}
