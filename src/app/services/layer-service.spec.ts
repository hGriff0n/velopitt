import { TestBed } from '@angular/core/testing';
import { LayerService } from './layer-service';
import { Map, MapMouseEvent } from 'mapbox-gl';

// Mock Mapbox Map
class MockMap {
    addSource = jasmine.createSpy('addSource');
    addLayer = jasmine.createSpy('addLayer');
    addInteraction = jasmine.createSpy('addInteraction');
    setPaintProperty = jasmine.createSpy('setPaintProperty');
    setFeatureState = jasmine.createSpy('setFeatureState');
    setLayoutProperty = jasmine.createSpy('setLayoutProperty');
}

describe('LayerService', () => {
    let service: LayerService;
    let mockMap: MockMap;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LayerService);
        mockMap = new MockMap();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should register layers with map', () => {
        service.registerWithMap(mockMap as unknown as Map, false);

        // Verify sources are added
        expect(mockMap.addSource).toHaveBeenCalledWith('bikeplus', jasmine.any(Object));
        expect(mockMap.addSource).toHaveBeenCalledWith('regions', jasmine.any(Object));

        // Verify layers are added
        expect(mockMap.addLayer).toHaveBeenCalledWith(jasmine.objectContaining({ id: 'bikeplus' }));
        expect(mockMap.addLayer).toHaveBeenCalledWith(jasmine.objectContaining({ id: 'regions' }));
        expect(mockMap.addLayer).toHaveBeenCalledWith(jasmine.objectContaining({ id: 'region-borders' }));

        // Verify interactions
        expect(mockMap.addInteraction).toHaveBeenCalledWith('region-enter', jasmine.any(Object));
        expect(mockMap.addInteraction).toHaveBeenCalledWith('region-exit', jasmine.any(Object));
    });

    it('should toggle bike plus visibility', () => {
        // Initial state check (implicitly false based on initialization)
        // Call toggle
        service.toggleBikePlus(mockMap as unknown as Map);

        // Expect opacity to be set to 0.9 (visible)
        expect(mockMap.setPaintProperty).toHaveBeenCalledWith('bikeplus', 'line-opacity', 0.9);

        // Toggle again
        service.toggleBikePlus(mockMap as unknown as Map);

        // Expect opacity to be set to 0 (hidden)
        expect(mockMap.setPaintProperty).toHaveBeenCalledWith('bikeplus', 'line-opacity', 0);
    });

    it('should set region visibility', () => {
        service.setRegionVisibility(mockMap as unknown as Map, true);
        expect(mockMap.setPaintProperty).toHaveBeenCalledWith('regions', 'fill-opacity', 0.2);
        expect(mockMap.setPaintProperty).toHaveBeenCalledWith('region-borders', 'line-opacity', 1);

        service.setRegionVisibility(mockMap as unknown as Map, false);
        expect(mockMap.setPaintProperty).toHaveBeenCalledWith('regions', 'fill-opacity', 0);
        expect(mockMap.setPaintProperty).toHaveBeenCalledWith('region-borders', 'line-opacity', 0);
    });
});
