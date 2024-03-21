import { Injectable } from '@angular/core';
import { GetUserByIdResponse } from './user.service';

export interface ConversationByQuery {
  id: string;
  guestId: GetUserByIdResponse[];
  createdAt: string;
  // updatedAt: string;
  // deletedAt: string;
}

export interface CreateConversationCommand {
  guestId: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  private productionUrl = 'https://medplaya-nestjs-back.azurewebsites.net';
  private headers = {
    'Content-Type': 'application/json',
  };
  constructor() {}
  public async getByGuestId(
    guestId: string
  ): Promise<ConversationByQuery[] | []> {
    console.log('Conversation by guest id');
    try {
      const dataFetched = await fetch(
        `${this.productionUrl}/conversations/get/${guestId}`,
        {
          method: 'GET',
        }
      );

      return (await dataFetched.json()) as ConversationByQuery[] | [];
    } catch (error) {
      throw error;
    }
  }

  public async create(command: CreateConversationCommand) {
    console.log('Conversation create');
    try {
      const dataFetched = await fetch(`${this.productionUrl}/conversations`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          guestId: command.guestId,
        }),
      });

      return (await dataFetched.json()) as ConversationByQuery[] | [];
    } catch (error) {
      throw error;
    }
  }

  public async deleteById(id: string) {
    try {
      await fetch(`${this.productionUrl}/${id}`, {
        method: 'DELETE',
        headers: this.headers,
      });
    } catch (error) {
      throw error;
    }
  }
}
