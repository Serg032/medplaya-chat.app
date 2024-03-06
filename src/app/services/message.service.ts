import { Injectable } from '@angular/core';

interface CreateMessageCommand {
  id: string;
  question: string;
  chatResponse: string;
  conversationId: string;
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

  async createMessage(command: CreateMessageCommand) {
    try {
      const data = await fetch(this.createMessageUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(command),
      });

      return await data.json();
    } catch (error) {}
  }
}
