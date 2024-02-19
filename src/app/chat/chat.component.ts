import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { Spinner } from '../ui/spinner/spinner.component';
import { getUserById } from '../helpers/get-user-by-id';

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

// Asegura que SpeechRecognitionEvent esté disponible globalmente
declare global {
  interface SpeechRecognitionEvent extends Event {
    // Define la estructura de SpeechRecognitionEvent según la especificación
    results: SpeechRecognitionResultList;
  }
}

declare var webkitSpeechRecognition: any;

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
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  public messageInput = new FormControl();
  public chatMessages: ChatMessage[] = [];
  private clientId: string | null = null;
  public showSpinner: boolean = false;

  recognition: any;
  recognizedText: string = '';

  constructor(private router: ActivatedRoute) {
    this.recognition = new webkitSpeechRecognition();
    this.recognition.lang = 'es-ES';
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.recognizedText = event.results[0][0].transcript;
      this.messageInput.setValue(this.messageInput.value + this.recognizedText);
    };
  }

  async ngOnInit() {
    this.router.paramMap
      .pipe(filter((param) => param.has('id')))
      .subscribe((param) => (this.clientId = param.get('id')));

    console.log('Client id', this.clientId);
    if (this.clientId) {
      const client = await getUserById(this.clientId);
      console.log(client);
    }
  }

  public async sendMessage() {
    try {
      const userMessage = this.messageInput.value;

      if (this.clientId && userMessage) {
        this.scrollToBottom();

        this.chatMessages.push(this.buildChatMessage('user', userMessage));
        setTimeout(() => {
          this.scrollToBottom();
        }, 0);
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
        const createMessageCommand: CreateMessageCommand =
          this.buildCreateMessageCommand(
            this.clientId,
            userMessage,
            chatMessage
          );
        await this.sendCreatedMessage(createMessageCommand);
        this.showSpinner = false;
        this.chatMessages.push(this.buildChatMessage('chat-gpt', chatMessage));
        setTimeout(() => {
          this.scrollToBottom();
        }, 0);
      } else if (!userMessage) {
        alert('Theres no message');
      } else {
        alert('theres no client id');
      }
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

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  startRecognition() {
    this.recognition.start();
  }

  stopRecognition() {
    this.recognition.stop();
  }
}
