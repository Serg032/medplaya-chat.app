import { Injectable } from '@angular/core';

export interface CreateMessageCommand {
  id: string;
  question: string;
  chatResponse: string;
  conversationId: string;
}

interface SuccessCreatefullyResponse {
  statusCode: 201;
  message: 'Message successfully created';
}

interface FailedCreateResponse {
  statusCode: 400 | 500;
  message: 'Something went wrong' | 'Internal server error';
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private rootUrl = 'http://localhost:8080/medplaya';
  private getMessagesUrl = `${this.rootUrl}/messages/get`;
  private createMessageUrl = `${this.rootUrl}/conversation/create`;
  private headers = {
    'Content-Type': 'application/json',
  };

  constructor() {}

  async createMessage(
    command: CreateMessageCommand
  ): Promise<SuccessCreatefullyResponse | FailedCreateResponse> {
    try {
      const response = await fetch(this.createMessageUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(command),
      });

      if (response.ok) {
        return {
          statusCode: 201,
          message: 'Message successfully created',
        };
      } else {
        return {
          statusCode: 400,
          message: 'Something went wrong',
        };
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Internal server error',
      };
    }
  }
}
