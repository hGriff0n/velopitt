import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { By } from '@angular/platform-browser';

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HeaderComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit menuToggled event on button click', () => {
        let emitted = false;
        component.menuToggled.subscribe(() => emitted = true);

        // Find button
        const button = fixture.debugElement.query(By.css('button'));
        button.triggerEventHandler('click', null);

        expect(emitted).toBeTrue();
    });
});
