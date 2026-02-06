import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { By } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                SidebarComponent,
                RouterTestingModule,
                MatListModule,
                MatButtonModule,
                MatDividerModule
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render all layer toggle buttons', () => {
        const buttons = fixture.debugElement.queryAll(By.css('button[mat-list-item]'));
        // We expect 4 toggle buttons + 5 link buttons = 9 total
        expect(buttons.length).toBe(9);

        // Check specific toggle texts to ensure order/existence
        const buttonTexts = buttons.map(b => b.nativeElement.textContent.trim());
        expect(buttonTexts).toContain('Toggle region layer');
        expect(buttonTexts).toContain('Toggle segment layer');
        expect(buttonTexts).toContain('Toggle Bike Map layer');
        expect(buttonTexts).toContain('Toggle Bike Plus layer');
    });

    it('should render all navigation links', () => {
        const linkButtons = fixture.debugElement.queryAll(By.directive(RouterLink)); // Actually standard buttons for now but with routerLink

        // Just check the texts of the bottom section
        const buttons = fixture.debugElement.queryAll(By.css('button[mat-list-item]'));
        const linkTexts = buttons.slice(4).map(b => b.nativeElement.textContent.trim());

        expect(linkTexts).toEqual([
            'Group Rides + Events',
            'Community Resources',
            'Route Builder',
            'Etiquette and Safety',
            'Racing'
        ]);
    });

    it('should apply active class based on inputs', () => {
        // Default state: bikemapShowing=true
        fixture.componentRef.setInput('bikemapShowing', true);
        fixture.detectChanges();

        const buttons = fixture.debugElement.queryAll(By.css('button[mat-list-item]'));
        // Index 2 is Bike Map
        expect(buttons[2].nativeElement.classList).toContain('active-button');

        // Change input
        fixture.componentRef.setInput('bikemapShowing', false);
        fixture.detectChanges();
        expect(buttons[2].nativeElement.classList).not.toContain('active-button');

        // Toggle Segment
        fixture.componentRef.setInput('segmentShowing', true);
        fixture.detectChanges();
        // Index 1 is Segment
        expect(buttons[1].nativeElement.classList).toContain('active-button');
    });

    it('should emit outputs when clicked', () => {
        // Spy on outputs
        spyOn(component.toggleRegion, 'emit');
        spyOn(component.toggleSegment, 'emit');

        const buttons = fixture.debugElement.queryAll(By.css('button[mat-list-item]'));

        // Click Region (Index 0)
        buttons[0].triggerEventHandler('click', null);
        expect(component.toggleRegion.emit).toHaveBeenCalled();

        // Click Segment (Index 1)
        buttons[1].triggerEventHandler('click', null);
        expect(component.toggleSegment.emit).toHaveBeenCalled();
    });
});
