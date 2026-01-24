import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SegmentOverlayComponent } from './segment-overlay.component';
import { Segment } from '../../services/segment-service';
import { ThemeService } from '../../services/theme-service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Chart, registerables } from 'chart.js';
import { signal } from '@angular/core';

Chart.register(...registerables);

// Mock Segment Data
const MOCK_SEGMENT: Segment = {
    id: 123,
    name: 'Test Segment',
    activity_type: 'Ride',
    distance: 1000,
    average_grade: 5.5,
    maximum_grade: 10.2,
    elevation_high: 500,
    elevation_low: 400,
    start_latlng: [40, -80],
    end_latlng: [40.1, -80.1],
    climb_category: 1,
    city: 'Pittsburgh',
    state: 'PA',
    country: 'USA',
    created_at: '2023-01-01',
    updated_at: '2023-01-02',
    total_elevation_gain: 100,
    map: {
        id: 'map1',
        polyline: 'poly',
        geojson: { type: 'LineString', coordinates: [] },
        elevation_data: [400, 450, 500, 450, 400, 400, 400, 400, 400, 400],
        segment_distance: 100
    },
    xoms: { kom: '10s', qom: '12s', overall: '10s', destination: { href: '', type: '', name: '' } },
    pacing_notes: '',
    summary: '',
    related_segments: [],
    camera: undefined
};

class MockThemeService {
    themeChanged = signal(0);
    getThemeColor(variableName: string): string {
        return 'rgba(0,0,0,0)';
    }
}

describe('SegmentOverlayComponent', () => {
    let component: SegmentOverlayComponent;
    let fixture: ComponentFixture<SegmentOverlayComponent>;
    let themeService: ThemeService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SegmentOverlayComponent, NoopAnimationsModule],
            providers: [
                { provide: ThemeService, useClass: MockThemeService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SegmentOverlayComponent);
        component = fixture.componentInstance;
        themeService = TestBed.inject(ThemeService);
        fixture.componentRef.setInput('segment', MOCK_SEGMENT);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize chart data when segment input is set', () => {
        expect(component.lineChartData).toBeDefined();
        expect(component.lineChartData.datasets[0].data).toEqual(MOCK_SEGMENT.map.elevation_data);
    });

    it('should update chart when segment changes', () => {
        const newSegment = { ...MOCK_SEGMENT, name: 'New Segment', map: { ...MOCK_SEGMENT.map, elevation_data: [1, 2, 3] } };
        fixture.componentRef.setInput('segment', newSegment);
        fixture.detectChanges();
        expect(component.lineChartData.datasets[0].data).toEqual([1, 2, 3]);
    });

    it('should update the segment name in the template when input changes', () => {
        const titleElement = fixture.nativeElement.querySelector('mat-card-title');
        expect(titleElement.textContent).toContain(MOCK_SEGMENT.name);

        const newSegment = { ...MOCK_SEGMENT, name: 'Updated Route' };
        fixture.componentRef.setInput('segment', newSegment);
        fixture.detectChanges();
        expect(titleElement.textContent).toContain('Updated Route');
    });

    it('should emit closeOverlay when close button is clicked', () => {
        const spy = spyOn(component.closeOverlay, 'emit');
        const button = fixture.nativeElement.querySelector('.close-button');
        expect(button).withContext('Close button should exist').toBeTruthy();
        button.click();
        expect(spy).toHaveBeenCalled();
    });

    it('should return correct colors for different gradients', () => {
        spyOn(themeService, 'getThemeColor').and.callFake((val) => val);

        const testGradient = (h1: number, h2: number) => {
            // Create a new segment object to ensure change detection runs if needed, 
            // though specifically we are calling chooseBackgroundColor directly which uses this.segment()
            const seg = { ...MOCK_SEGMENT, map: { ...MOCK_SEGMENT.map, elevation_data: [h1, h2], segment_distance: 100 } };
            fixture.componentRef.setInput('segment', seg);
            fixture.detectChanges();
            return component.chooseBackgroundColor({ p0DataIndex: 0, p1DataIndex: 1 }, 'bg');
        };

        // Downhill (-20%)
        expect(testGradient(100, 80)).toBe('--sys-gradient-downhill');

        // Flat (2%)
        expect(testGradient(0, 2)).toBe('--sys-gradient-flat');

        // Uphill (5%)
        expect(testGradient(0, 5)).toBe('--sys-gradient-uphill');

        // Steep (9%)
        expect(testGradient(0, 9)).toBe('--sys-gradient-steep');

        // Very Steep (14%)
        expect(testGradient(0, 14)).toBe('--sys-gradient-very-steep');

        // Extreme (20%)
        expect(testGradient(0, 20)).toBe('--sys-gradient-extreme');
    });

    it('should handle undefined segment in chooseBackgroundColor', () => {
        fixture.componentRef.setInput('segment', undefined);
        fixture.detectChanges();
        const color = component.chooseBackgroundColor({}, 'bg');
        expect(color).toBe('black');
    });
});
