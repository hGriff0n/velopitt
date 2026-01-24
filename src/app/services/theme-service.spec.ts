import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme-service';
import { DOCUMENT } from '@angular/common';

describe('ThemeService', () => {
    let service: ThemeService;
    let mockDocument: any;
    let mockHead: any;
    let mockLink: any;

    beforeEach(() => {
        mockHead = {
            appendChild: jasmine.createSpy('appendChild')
        };
        mockLink = {
            id: '',
            rel: '',
            href: '',
            onload: null
        };
        mockDocument = {
            getElementsByTagName: jasmine.createSpy('getElementsByTagName').and.returnValue([mockHead]),
            getElementById: jasmine.createSpy('getElementById').and.callFake((id: string) => {
                if (id === 'app-theme') {
                    // Return null first to simulate creation, or existing link
                    return null;
                }
                return null;
            }),
            createElement: jasmine.createSpy('createElement').and.returnValue(mockLink),
            body: document.createElement('body') // Use real body for getComputedStyle or mock it?
        };

        TestBed.configureTestingModule({
            providers: [
                ThemeService,
                { provide: DOCUMENT, useValue: mockDocument }
            ]
        });

        // Note: Constructor calls loadTheme('default.css') immediately
        service = TestBed.inject(ThemeService);
    });

    it('should be created and load default theme', () => {
        expect(service).toBeTruthy();
        expect(mockDocument.createElement).toHaveBeenCalledWith('link');
        expect(mockHead.appendChild).toHaveBeenCalled();
        expect(mockLink.href).toContain('themes/default.css');
    });

    it('should set theme and update link', () => {
        // Reset spies from constructor call
        mockDocument.getElementById.and.returnValue(mockLink); // Now link exists

        service.setTheme('Carbon');

        expect(service.currentTheme().name).toBe('Carbon');
        expect(mockLink.href).toContain('themes/carbon.css');
    });

    it('should update signal when theme loads (onload event)', () => {
        // We need to simulate the onload callback
        // The constructor set onload on the new link
        expect(mockLink.onload).toBeDefined();

        const initialCount = service.themeChanged();

        // Trigger onload
        mockLink.onload();

        expect(service.themeChanged()).toBe(initialCount + 1);
    });

    it('should get available themes', () => {
        const themes = service.getAvailableThemes();
        expect(themes).toContain('Default');
        expect(themes).toContain('Carbon');
    });

    it('should get theme color from computed style', () => {
        // Mock getComputedStyle globally or on window?
        // Since getThemeColor uses getComputedStyle(this.document.body)
        // We can spy on window.getComputedStyle
        spyOn(window, 'getComputedStyle').and.returnValue({
            getPropertyValue: (prop: string) => {
                if (prop === '--sys-primary') return ' blue ';
                return '';
            }
        } as any);

        const color = service.getThemeColor('--sys-primary');
        expect(color).toBe('blue');
    });
});
