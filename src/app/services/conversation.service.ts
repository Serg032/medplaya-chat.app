import { Injectable } from '@angular/core';
import { GetUserByIdResponse } from './user.service';

interface ConversationByQuery {
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
  private findConversationsUrl = `${this.rootUrl}/conversation/find`;
  private createConversationsUrl = `${this.rootUrl}/conversation/create`;
  constructor() {}
  public async getConversationsByGuest(
    guestId: string
  ): Promise<ConversationByQuery | undefined> {
    try {
      const dataFetched = await fetch(this.findConversationsUrl, {
        method: 'POST',
        body: JSON.stringify({
          where: {
            guestId,
          },
        }),
      });

      return (await dataFetched.json()) as ConversationByQuery | undefined;
    } catch (error) {
      throw error;
    }
  }
}
