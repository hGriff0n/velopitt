import { NgModule, provideBrowserGlobalErrorListeners, inject  } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { provideMapboxGL } from 'ngx-mapbox-gl';

import { ConfigService } from './services/config-service';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

@NgModule({
  declarations: [
    App
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule // NEW: import HttpClientModule!
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    // TODO: me - This should be in github secrets
    provideMapboxGL({accessToken: ""}),
  ],
  bootstrap: [App]
})
export class AppModule {
  // TODO: me - This actually needs to load before mapbox gl as that's where the token is
  private readonly config = inject(ConfigService);
}