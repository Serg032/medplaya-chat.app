import { Injectable } from '@angular/core';
import { Regime } from './user.service';
import { environment } from '../../environments/environment';

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
  question: string;
  chatResponse: string;
  conversationId: string;
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
  private rootUrl = environment.apiUrl;
  private headers = {
    'Content-Type': 'application/json',
  };

  constructor() {}

  public async createMessage(
    command: CreateMessageCommand
  ): Promise<SuccessCreatefullyResponse | FailedCreateResponse> {
    try {
      const response = await fetch(`${this.rootUrl}/messages`, {
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

  public async getMessagesByConversationId(
    conversationId: string
  ): Promise<Message[] | [] | undefined> {
    const response = await fetch(`${this.rootUrl}/messages/${conversationId}`, {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      return;
    }

    return await response.json();
  }
}
