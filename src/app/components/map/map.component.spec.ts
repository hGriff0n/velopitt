import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppMapComponent } from './map.component';
import { ConfigService } from '../../services/config-service';
import { SegmentService } from '../../services/segment-service';
import { OverlayService } from '../../services/overlay-service';

// Mock Services
class MockConfigService {
    mapbox = { api_key: 'mock-token' };
}
class MockSegmentService {
    getAllSegments() { return []; }
}
class MockOverlayService {
    registerWithMap() { }
    setRegionVisibility() { }
    toggleBikePlus() { }
}

describe('AppMapComponent', () => {
    let component: AppMapComponent;
    let fixture: ComponentFixture<AppMapComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppMapComponent],
            providers: [
                { provide: ConfigService, useClass: MockConfigService },
                { provide: SegmentService, useClass: MockSegmentService },
                { provide: OverlayService, useClass: MockOverlayService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AppMapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
