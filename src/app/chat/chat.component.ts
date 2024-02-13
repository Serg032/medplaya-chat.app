import { Component, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { __param } from 'tslib';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Spinner } from '../ui/spinner/spinner.component';

interface ChatResponse {
  chatMessage: string;
}

interface ChatMessage {
  author: string;
  message: string;
}

interface CreateMessageCommand {
  id: string;
  question: string;
  chatResponse: string;
  clientId: string;
}

type messageAuthor = 'user' | 'chat-gpt';

interface idFromUrl {
  id: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCardModule,
    CommonModule,
    Spinner,
  ],
})
export class ChatComponent implements OnInit {
  public messageInput = new FormControl();
  public chatMessages: ChatMessage[] = [];
  private clientId: string | null = null;
  public showSpinner: boolean = false;
  constructor(private router: ActivatedRoute) {}

  ngOnInit() {
    this.router.paramMap
      .pipe(filter((param) => param.has('id')))
      .subscribe((param) => (this.clientId = param.get('id')));

    console.log('Client id', this.clientId);
  }

  public async sendMessage() {
    try {
      const userMessage = this.messageInput.value;
      this.chatMessages.push(this.buildChatMessage('user', userMessage));
      this.messageInput.setValue('');
      this.showSpinner = true;

      const chatResponse = await fetch('http://localhost:3000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!chatResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const chatResponseData: ChatResponse = await chatResponse.json();
      const chatMessage = chatResponseData.chatMessage;

      if (this.clientId) {
        const createMessageCommand: CreateMessageCommand =
          this.buildCreateMessageCommand(
            this.clientId,
            userMessage,
            chatMessage
          );
        await this.sendCreatedMessage(createMessageCommand);
      }

      this.showSpinner = false;
      this.chatMessages.push(this.buildChatMessage('chat-gpt', chatMessage));
    } catch (error) {
      console.log(error);
    }
  }

  private buildChatMessage(
    author: messageAuthor,
    message: string
  ): ChatMessage {
    return {
      author,
      message,
    };
  }

  private async sendCreatedMessage(command: CreateMessageCommand) {
    await fetch('http://localhost:8080/medplaya/message/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });
  }

  private buildCreateMessageCommand(
    clientId: string,
    question: string,
    chatResponse: string
  ): CreateMessageCommand {
    let customChatResponse;
    let customQuestion;
    if (chatResponse.length > 255) {
      customChatResponse = chatResponse.slice(0, 200);
    }
    if (question.length > 255) {
      customQuestion = question.slice(0, 200);
    }

    return {
      id: crypto.randomUUID(),
      question: customQuestion ? customQuestion : question,
      chatResponse: customChatResponse ? customChatResponse : chatResponse,
      clientId,
    };
  }
}
