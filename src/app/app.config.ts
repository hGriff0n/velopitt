import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideMapboxGL } from 'ngx-mapbox-gl';
import { Base64 } from 'js-base64';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { environment } from '../environments/environment';

import { Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'calendar',
        loadComponent: () => import('./components/calendar/calendar.component').then(m => m.CalendarComponent)
    }
];

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(),
        provideAnimations(),
        provideMapboxGL({ accessToken: Base64.decode(environment.MAPBOX_API_KEY) }),
        provideCharts(withDefaultRegisterables())
    ]
};
