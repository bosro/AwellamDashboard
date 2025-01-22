import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { RouterModule } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MainModule } from './main/main.module';
import {  provideHttpClient } from '@angular/common/http';
import { MainLayoutComponent } from './main/main-layout.component';
// import { InjectionService } from '';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';

@NgModule({
  declarations: [
    AppComponent,
  //  MainLayoutComponent,
  //  HeaderComponent,
  //  FooterComponent,
  //  SidebarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    MainModule
  ],
  providers: [
    provideAnimationsAsync(),
    provideHttpClient(),
    // InjectionService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
