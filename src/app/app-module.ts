import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';
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
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [ConfigService],
      useFactory: (appConfigService: ConfigService) => {
        return () => {
          //Make sure to return a promise!
          return appConfigService.loadAppConfig();
        };
      }
    }
  ],
  bootstrap: [App]
})
export class AppModule {
}