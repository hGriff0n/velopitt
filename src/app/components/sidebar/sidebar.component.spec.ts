import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SidebarComponent, RouterTestingModule],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { paramMap: { get: () => null } } }
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit toggleRegion when region button clicked', () => {
        let emitted = false;
        component.toggleRegion.subscribe(() => emitted = true);
        const buttons = fixture.debugElement.queryAll(By.css('button'));
        // Assuming order matches template: region is 1st
        buttons[0].triggerEventHandler('click', null);
        expect(emitted).toBeTrue();
    });
});
