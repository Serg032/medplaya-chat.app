import { Injectable } from '@angular/core';
import { Regime } from './user.service';

export interface Message {
  id: string;
  question: string;
  chatResponse: string;
  conversationId: string;
  conversation: {
    id: string;
    guestId: string;
    guest: {
      id: string;
      name: string;
      surname1: string;
      surname2: string;
      userName: string;
      dateIn: string;
      dateOut: string;
      bookingId: string;
      roomNumber: 0;
      guestNumber: 0;
      regime: Regime;
      createdAt: string;
      updatedAt: string;
      deletedAt: string;
    };
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export interface CreateMessageCommand {
  id: string;
  question: string;
  chatResponse: string;
  conversationId: string;
}

interface GetMessagesByConversationIdQuery {
  query: {
    where: {
      conversationId: string;
    };
  };
}

export interface ChatResponse {
  chatMessage: string;
}

interface SuccessCreatefullyResponse {
  statusCode: 201;
  message: 'Message successfully created';
}

export interface FailedCreateResponse {
  statusCode: 400 | 500;
  message: 'Something went wrong' | 'Internal server error';
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private rootUrl = 'http://localhost:8080/medplaya';
  private getMessagesUrl = `${this.rootUrl}/messages/get`;
  private createMessageUrl = `${this.rootUrl}/message/create`;
  private assitantUrl = 'http://localhost:3000';
  private headers = {
    'Content-Type': 'application/json',
  };

  constructor() {}

  public async createMessage(
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

  // unused
  // public async sendQuestionToAssistant(
  //   userQuestion: string
  // ): Promise<ChatResponse | undefined> {
  //   try {
  //     const response = await fetch(this.assitantUrl, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ message: userQuestion }),
  //     });
  //     if (!response.ok) {
  //       return;
  //     }

  //     return (await response.json()) as ChatResponse;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  public async getMessagesByConversationId(
    query: GetMessagesByConversationIdQuery
  ): Promise<Message[] | [] | undefined> {
    const response = await fetch(this.getMessagesUrl, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(query),
    });

    if (!response.ok) {
      return;
    }

    return await response.json();
  }
}
