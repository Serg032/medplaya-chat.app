import { Injectable } from '@angular/core';
import { GetUserByIdResponse } from './user.service';

export interface ConversationByQuery {
  id: string;
  guestId: GetUserByIdResponse[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export interface CreateConversationCommand {
  guestId: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  private rootUrl = 'http://localhost:8080/medplaya';
  private getConversationsUrl = `${this.rootUrl}/conversations/get`;
  private createConversationsUrl = `${this.rootUrl}/conversation/create`;
  private headers = {
    'Content-Type': 'application/json',
  };
  constructor() {}
  public async getConversationsByGuestId(
    guestId: string
  ): Promise<ConversationByQuery[] | []> {
    try {
      const dataFetched = await fetch(this.getConversationsUrl, {
        method: 'POST',
        body: JSON.stringify({
          where: {
            guestId,
          },
        }),
      });

      return (await dataFetched.json()) as ConversationByQuery[] | [];
    } catch (error) {
      throw error;
    }
  }

  public async createConversation(command: CreateConversationCommand) {
    try {
      const dataFetched = await fetch(this.createConversationsUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          id: crypto.randomUUID(),
          guestId: command.guestId,
        }),
      });

      return (await dataFetched.json()) as ConversationByQuery[] | [];
    } catch (error) {
      throw error;
    }
  }
}
