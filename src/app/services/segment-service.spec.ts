import { TestBed } from '@angular/core/testing';
import { SegmentService } from './segment-service';
import { Map } from 'mapbox-gl';

describe('SegmentService', () => {
    let service: SegmentService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SegmentService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should load segments from JSON', () => {
        const segments = service.getAllSegments();
        expect(segments.length).toBeGreaterThan(0);

        // Check first segment structure
        const firstSegment = segments[0];
        expect(firstSegment.id).toBeDefined();
        expect(firstSegment.name).toBeDefined();
        expect(firstSegment.map.geojson).toBeDefined();
        // Verify coordinates are numbers
        expect(firstSegment.start_latlng.length).toBe(2);
        expect(typeof firstSegment.start_latlng[0]).toBe('number');
    });

    it('should calculate direction vector', () => {
        const segment = service.getAllSegments()[0];
        const vector = service.directionVector(segment);
        expect(vector.length).toBe(2);
    });

    it('should calculate bearing', () => {
        const bearing = service.vectorToBearing([10, 10]);
        expect(bearing).toBeGreaterThanOrEqual(0);
        expect(bearing).toBeLessThanOrEqual(360);
    });

    it('should update segment map data', () => {
        const mockMap = {
            queryTerrainElevation: jasmine.createSpy('queryTerrainElevation').and.returnValue(100)
        } as unknown as Map;

        const segment = service.getAllSegments()[0];
        service.updateSegmentMapData(segment.id, mockMap);

        expect(mockMap.queryTerrainElevation).toHaveBeenCalled();
        expect(segment.map.elevation_data.length).toBeGreaterThan(0);
    });
});
