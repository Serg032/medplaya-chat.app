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
  private getUrl = `${this.rootUrl}/conversations/get`;
  private createUrl = `${this.rootUrl}/conversation/create`;
  private deleteUrl = `${this.rootUrl}/conversation/delete`;
  private headers = {
    'Content-Type': 'application/json',
  };
  constructor() {}
  public async getByGuestId(
    guestId: string
  ): Promise<ConversationByQuery[] | []> {
    try {
      const dataFetched = await fetch(this.getUrl, {
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

  public async create(command: CreateConversationCommand) {
    try {
      const dataFetched = await fetch(this.createUrl, {
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

  public async deleteById(id: string) {
    try {
      await fetch(`${this.deleteUrl}/${id}`, {
        method: 'DELETE',
        headers: this.headers,
      });
    } catch (error) {
      throw error;
    }
  }
}
