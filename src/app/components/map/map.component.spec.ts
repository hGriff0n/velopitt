import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMapComponent } from './map.component';
import { ConfigService } from '../../services/config-service';
import { SegmentService } from '../../services/segment-service';
import { LayerService } from '../../services/layer-service';
import { ThemeService } from '../../services/theme-service';
import { MapStateService } from '../../services/map-state.service';
import { EventService } from '../../services/event.service';
import { signal } from '@angular/core';

// Mock Services
class MockConfigService {
    mapbox = { api_key: 'mock-token' };
}
class MockSegmentService {
    getAllSegments() { return []; }
    getSegmentByDomId(id: number) {
        if (id === 123) {
            return {
                id: 123,
                start_latlng: [0, 0],
                map: { geojson: {} }
            };
        }
        return null;
    }
    vectorToBearing() { return 0; }
    directionVector() { return {}; }
    updateSegmentMapData() { }
}
class MockLayerService {
    registerWithMap = jasmine.createSpy('registerWithMap');
    setRegionVisibility = jasmine.createSpy('setRegionVisibility');
    setBikeNetworkVisibility = jasmine.createSpy('setBikeNetworkVisibility');
}
class MockThemeService {
    themeChanged = signal(0);
    getThemeColor(val: string) { return 'red'; }
}
class MockMapStateService {
    setMap = jasmine.createSpy('setMap');
    flyTo = jasmine.createSpy('flyTo');
    addAllSegments = jasmine.createSpy('addAllSegments');
    addInteractions = jasmine.createSpy('addInteractions');
    toggleSegmentLayer = jasmine.createSpy('toggleSegmentLayer');
    updateMapTheme = jasmine.createSpy('updateMapTheme');
    highlightSegment = jasmine.createSpy('highlightSegment');
    clearHighlights = jasmine.createSpy('clearHighlights');
}
class MockEventService {
    rides = signal<any[]>([{
        id: 'r1',
        name: 'Ride 1',
        startLocation: { coordinates: [0, 0] },
        startLocationLabel: 'Loc'
    }]);
    loadAllGroups = jasmine.createSpy('loadAllGroups');
}

// Mock Mapbox Map Instance
const mockMapInstance = {
    on: jasmine.createSpy('on'),
    resize: jasmine.createSpy('resize'),
    getCanvas: () => ({ style: { cursor: '' } }),
    addSource: jasmine.createSpy('addSource'),
    addLayer: jasmine.createSpy('addLayer'),
    addInteraction: jasmine.createSpy('addInteraction'),
    setPaintProperty: jasmine.createSpy('setPaintProperty'),
    setFeatureState: jasmine.createSpy('setFeatureState'),
    flyTo: jasmine.createSpy('flyTo'),
    remove: jasmine.createSpy('remove'),
    getLayer: jasmine.createSpy('getLayer').and.returnValue(true),
    queryRenderedFeatures: jasmine.createSpy('queryRenderedFeatures').and.returnValue([])
};

describe('AppMapComponent', () => {
    let component: AppMapComponent;
    let fixture: ComponentFixture<AppMapComponent>;
    let mapStateService: MockMapStateService;
    let eventService: MockEventService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppMapComponent],
            providers: [
                { provide: ConfigService, useClass: MockConfigService },
                { provide: SegmentService, useClass: MockSegmentService },
                { provide: LayerService, useClass: MockLayerService },
                { provide: ThemeService, useClass: MockThemeService },
                { provide: MapStateService, useClass: MockMapStateService },
                { provide: EventService, useClass: MockEventService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AppMapComponent);
        component = fixture.componentInstance;
        mapStateService = TestBed.inject(MapStateService) as unknown as MockMapStateService;
        eventService = TestBed.inject(EventService) as unknown as MockEventService;

        // Suppress initMap to avoid real Map creation issues
        spyOn(component as any, 'initMap').and.stub();

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set map on MapStateService when loaded', () => {
        // Trigger onLoad manually
        (component as any).onLoad({ target: mockMapInstance });

        expect(mapStateService.setMap).toHaveBeenCalledWith(mockMapInstance as any);
        expect(component.mapLoaded.emit).toBeDefined();
    });

    it('should fly to segment via MapStateService when clicked', () => {
        (component as any).onLoad({ target: mockMapInstance });
        spyOn(component.segmentSelected, 'emit');

        (component as any).handleSegmentClickEvent(123, { lng: 0, lat: 0 });

        expect(component.segmentSelected.emit).toHaveBeenCalledWith(123);
        expect(mapStateService.flyTo).toHaveBeenCalled();
        const args = mapStateService.flyTo.calls.mostRecent().args[0];
        expect(args.zoom).toBe(16);
    });

    it('should highlight segment on click', () => {
        (component as any).onLoad({ target: mockMapInstance });
        (component as any).handleSegmentClickEvent(123, { lng: 0, lat: 0 });

        expect(mapStateService.highlightSegment).toHaveBeenCalledWith(
            mockMapInstance as any,
            123,
            true
        );
    });

    it('should handle map clicks to deselect', () => {
        (component as any).onLoad({ target: mockMapInstance });
        spyOn(component.segmentSelected, 'emit');

        fixture.componentRef.setInput('selectedSegmentId', 123);
        fixture.detectChanges();

        (component as any).onMapClick({ point: { x: 0, y: 0 } });

        expect(component.segmentSelected.emit).toHaveBeenCalledWith(-1);
    });

    it('should register interactions and handle callbacks', () => {
        (component as any).onLoad({ target: mockMapInstance });

        expect(mapStateService.addInteractions).toHaveBeenCalled();
        const callArgs = mapStateService.addInteractions.calls.mostRecent().args;
        expect(callArgs[0]).toBe(mockMapInstance as any);

        const callbacks = callArgs[1];
        expect(callbacks).toBeDefined();

        spyOn(component as any, 'handleSegmentClickEvent');
        callbacks.onClick(999, { lng: 1, lat: 2 });
        expect(component['handleSegmentClickEvent']).toHaveBeenCalledWith(999, { lng: 1, lat: 2 });

        callbacks.onHover(999);
        expect(mapStateService.highlightSegment).toHaveBeenCalledWith(mockMapInstance as any, 999, true);

        fixture.componentRef.setInput('selectedSegmentId', 888);
        fixture.detectChanges();
        mapStateService.highlightSegment.calls.reset();

        callbacks.onLeave(999);
        expect(mapStateService.highlightSegment).toHaveBeenCalledWith(mockMapInstance as any, 999, false);

        fixture.componentRef.setInput('selectedSegmentId', 999);
        fixture.detectChanges();
        mapStateService.highlightSegment.calls.reset();

        callbacks.onLeave(999);
        expect(mapStateService.highlightSegment).not.toHaveBeenCalled();
    });

    it('should update ride markers when toggled', () => {
        // Initialize map
        (component as any).onLoad({ target: mockMapInstance });

        // Mock createMarker to avoid real Marker issues
        spyOn(component, 'createMarker').and.callFake((ride, map) => {
            // Simulate pushing to array as the real method does
            (component as any).rideMarkers.push({ remove: jasmine.createSpy('remove') });
        });

        // Initially false
        expect((component as any).rideMarkers.length).toBe(0);

        // Toggle ON
        fixture.componentRef.setInput('rideStartsShowing', true);
        fixture.detectChanges();

        // Should have added markers
        expect(component.createMarker).toHaveBeenCalled();
        expect((component as any).rideMarkers.length).toBe(1);
        expect((component as any).rideMarkers.length).toBe(1);

        // Toggle OFF
        fixture.componentRef.setInput('rideStartsShowing', false);
        fixture.detectChanges();

        expect((component as any).rideMarkers.length).toBe(0);
    });
});
