import { TestBed } from '@angular/core/testing';
import { LayerService } from './layer-service';
import { Map } from 'mapbox-gl';

// Mock Mapbox Map
class MockMap {
    addSource = jasmine.createSpy('addSource');
    addLayer = jasmine.createSpy('addLayer');
    addInteraction = jasmine.createSpy('addInteraction');
    setPaintProperty = jasmine.createSpy('setPaintProperty');
    setFeatureState = jasmine.createSpy('setFeatureState');
    setLayoutProperty = jasmine.createSpy('setLayoutProperty');
    getLayer = jasmine.createSpy('getLayer');
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

    it('should set region visibility on register if isVisible is true', () => {
        service.registerWithMap(mockMap as unknown as Map, true);
        expect(mockMap.setPaintProperty).toHaveBeenCalledWith('regions', 'fill-opacity', 0.2);
    });

    it('should handle region enter interaction', () => {
        service.registerWithMap(mockMap as unknown as Map, false);
        const enterCall = mockMap.addInteraction.calls.all().find((c: any) => c.args[0] === 'region-enter');

        if (enterCall && enterCall.args[1]) {
            const handler = enterCall.args[1].handler;
            // Simulate enter
            handler({ feature: { id: 123 } });
            expect(mockMap.setFeatureState).toHaveBeenCalledWith({ source: 'regions', id: 123 }, { hover: true });

            // Simulate enter again (should not call setFeatureState if already hovered)
            mockMap.setFeatureState.calls.reset();
            handler({ feature: { id: 123 } });
            expect(mockMap.setFeatureState).not.toHaveBeenCalled();
        } else {
            fail('region-enter interaction not registered');
        }
    });

    it('should handle region exit interaction', () => {
        service.registerWithMap(mockMap as unknown as Map, false);

        // Manually add to hovered set via enter handler first
        const enterCall = mockMap.addInteraction.calls.all().find((c: any) => c.args[0] === 'region-enter');
        if (enterCall && enterCall.args[1]) {
            enterCall.args[1].handler({ feature: { id: 456 } });
        }

        const exitCall = mockMap.addInteraction.calls.all().find((c: any) => c.args[0] === 'region-exit');
        if (exitCall && exitCall.args[1]) {
            const handler = exitCall.args[1].handler;

            // Simulate exit
            handler({ feature: { id: 456 } });
            expect(mockMap.setFeatureState).toHaveBeenCalledWith({ source: 'regions', id: 456 }, { hover: false });

            // Simulate exit again (should not call setFeatureState if not hovered)
            mockMap.setFeatureState.calls.reset();
            handler({ feature: { id: 456 } });
            expect(mockMap.setFeatureState).not.toHaveBeenCalled();
        } else {
            fail('region-exit interaction not registered');
        }
    });

    it('should set bike network visibility', () => {
        // Mock getLayer to return true for some, false for others
        mockMap.getLayer = jasmine.createSpy('getLayer').and.callFake((id: string) => {
            return id === 'bike-network-lane';
        });

        service.setBikeNetworkVisibility(mockMap as unknown as Map, true);

        // Should call setLayoutProperty for 'bike-network-lane'
        expect(mockMap.setLayoutProperty).toHaveBeenCalledWith('bike-network-lane', 'visibility', 'visible');

        // Should NOT call for 'bike-network-sharrow'
        expect(mockMap.setLayoutProperty).not.toHaveBeenCalledWith('bike-network-sharrow', jasmine.any(String), jasmine.any(String));

        // Test hiding
        service.setBikeNetworkVisibility(mockMap as unknown as Map, false);
        expect(mockMap.setLayoutProperty).toHaveBeenCalledWith('bike-network-lane', 'visibility', 'none');
    });
});
