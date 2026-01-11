import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SegmentOverlayComponent } from './segment-overlay.component';
import { Segment } from '../../services/segment-service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Chart, registerables } from 'chart.js';

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
        elevation_data: [400, 450, 500, 450, 400, 400, 400, 400, 400, 400], // Needs to match MAX_SEGMENTS size roughly for chart
        segment_distance: 100
    },
    xoms: { kom: '10s', qom: '12s', overall: '10s', destination: { href: '', type: '', name: '' } },
    pacing_notes: '',
    summary: '',
    related_segments: [],
    camera: undefined
};

describe('SegmentOverlayComponent', () => {
    let component: SegmentOverlayComponent;
    let fixture: ComponentFixture<SegmentOverlayComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SegmentOverlayComponent, NoopAnimationsModule]
        }).compileComponents();

        fixture = TestBed.createComponent(SegmentOverlayComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('segment', MOCK_SEGMENT); // Set initial input
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

    it('should NOT use a <pre> tag as the root display element', () => {
        const preElement = fixture.nativeElement.querySelector('pre#segment_display');
        expect(preElement).toBeFalsy();
    });

    it('should have a root container with class .segment-overlay-container', () => {
        const container = fixture.nativeElement.querySelector('.segment-overlay-container');
        expect(container).toBeTruthy();
    });

    it('should contain four main segment popup sections', () => {
        const popups = fixture.nativeElement.querySelectorAll('.segment-popup');
        expect(popups.length).toBe(4);
    });

    it('should apply the glass-card class to all mat-card elements', () => {
        const cards = fixture.nativeElement.querySelectorAll('mat-card');
        cards.forEach((card: HTMLElement) => {
            expect(card.classList.contains('glass-card')).toBeTrue();
        });
    });
});
