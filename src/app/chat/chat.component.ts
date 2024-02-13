import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

interface ChatResponse {
  chatMessage: string;
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
    MatDividerModule,
  ],
})
export class ChatComponent {
  public messageInput = new FormControl();

  public async sendMessage() {
    try {
      const response = await fetch('http://localhost:3000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: this.messageInput.value }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData: ChatResponse = await response.json();
      // this.responseMessage = responseData; // Assuming your response is a string

      console.log('Response', responseData.chatMessage);
    } catch (error) {
      console.log(error);
    }

    this.messageInput.setValue('');
  }
}
