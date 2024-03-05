import { Injectable } from '@angular/core';
import { GetUserByIdResponse } from './user.service';

export interface ConversationByQuery {
  id: string;
  guestId: GetUserByIdResponse[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  private rootUrl = 'http://localhost:8080/medplaya';
  private getConversationsUrl = `${this.rootUrl}/conversations/get`;
  private createConversationsUrl = `${this.rootUrl}/conversation/create`;
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
}
