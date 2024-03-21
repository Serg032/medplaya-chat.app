import { Injectable } from '@angular/core';
import { GetUserByIdResponse } from './user.service';
import { environment } from '../../environments/environment';

export interface ConversationByQuery {
  id: string;
  guestId: GetUserByIdResponse[];
  createdAt: string;
}

export interface CreateConversationCommand {
  guestId: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  private rootUrl = environment.apiUrl;
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
        `${this.rootUrl}/conversations/get/${guestId}`,
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
      const dataFetched = await fetch(`${this.rootUrl}/conversations`, {
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
      await fetch(`${this.rootUrl}/${id}`, {
        method: 'DELETE',
        headers: this.headers,
      });
    } catch (error) {
      throw error;
    }
  }
}
