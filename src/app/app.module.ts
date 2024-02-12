import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ChatComponent } from './chat/chat.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [AppComponent, ChatComponent],
  imports: [BrowserModule, AppRoutingModule, CommonModule],
  providers: [provideAnimationsAsync()],
  bootstrap: [AppComponent],
})
export class AppModule {}
