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
import { LayerService } from './services/layer-service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        App
      ],
      providers: [
        { provide: ConfigService, useValue: { mapbox: { api_key: 'test' } } },
        {
          provide: SegmentService,
          useValue: {
            getAllSegments: () => [],
            getSegmentByDomId: (id: any) => ({
              id,
              name: 'Test',
              map: { geojson: { type: 'LineString', coordinates: [] }, elevation_data: [] }
            }),
            updateSegmentMapData: () => { }
          }
        },
        { provide: LayerService, useValue: { registerWithMap: () => { }, setRegionVisibility: () => { } } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
    expect(app.segment.getSegmentByDomId).toBeDefined();
  });

  it('should have the title signal set to "velopitt"', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app['title']()).toEqual('velopitt');
  });

  it('should toggle regionShowing when toggleRegionLayer is called', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.regionShowing()).withContext('initially false').toBeFalse();
    app.toggleRegionLayer();
    expect(app.regionShowing()).withContext('true after toggle').toBeTrue();
    app.toggleRegionLayer();
    expect(app.regionShowing()).withContext('false after second toggle').toBeFalse();
  });

  it('should toggle segmentShowing when toggleSegmentLayer is called', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.segmentShowing()).toBeFalse();
    app.toggleSegmentLayer();
    expect(app.segmentShowing()).toBeTrue();
  });

  it('should toggle bikemapShowing when toggleBikeNetwork is called', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.bikemapShowing()).toBeTrue();
    app.toggleBikeNetwork();
    expect(app.bikemapShowing()).toBeFalse();
  });

  it('should toggle bikemapPlusShowing when toggleBikePlus is called', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.bikemapPlusShowing()).toBeFalse();
    app.toggleBikePlus();
    expect(app.bikemapPlusShowing()).toBeTrue();
  });

  it('should update selectedSegment and isShow when onSegmentSelected is called', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.onSegmentSelected(5);
    expect(app.selectedSegment()).toBe(5);
    expect(app.isShow()).toBeTrue();

    app.onSegmentSelected(-1);
    expect(app.selectedSegment()).toBe(0);
    expect(app.isShow()).toBeFalse();
  });
});
