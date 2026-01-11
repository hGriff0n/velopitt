import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { App } from './app';
import { ConfigService } from './services/config-service';
import { SegmentService } from './services/segment-service';
import { OverlayService } from './services/overlay-service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        App
      ],
      providers: [
        { provide: ConfigService, useValue: {} },
        { provide: SegmentService, useValue: { getAllSegments: () => [] } },
        { provide: OverlayService, useValue: {} }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have the title signal set to "velopitt"', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app['title']()).toEqual('velopitt');
  });
});
