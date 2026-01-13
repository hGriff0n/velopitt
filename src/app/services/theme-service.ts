import { Injectable, signal, effect, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export interface Theme {
    name: string;
    filename: string;
}

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private static readonly THEME_LINK_ID = 'app-theme';
    private static readonly THEMES: Theme[] = [
        { name: 'Default', filename: 'default.css' },
        { name: 'Carbon', filename: 'carbon.css' },
        { name: 'River', filename: 'river.css' },
        { name: 'Rust', filename: 'rust.css' }
    ];

    currentTheme = signal<Theme>(ThemeService.THEMES[0]);

    // Signal to notify when theme has actually loaded/changed in DOM
    themeChanged = signal<number>(0);

    constructor(@Inject(DOCUMENT) private document: Document) {
        // Initial load
        this.loadTheme(this.currentTheme().filename);
    }

    setTheme(name: string) {
        const theme = ThemeService.THEMES.find(t => t.name === name);
        if (theme) {
            this.currentTheme.set(theme);
            this.loadTheme(theme.filename);
        }
    }

    getAvailableThemes(): string[] {
        return ThemeService.THEMES.map(t => t.name);
    }

    /**
     * Gets the computed value of a CSS variable.
     * Useful for syncing canvas/JS colors with CSS theme.
     */
    getThemeColor(variableName: string): string {
        return getComputedStyle(this.document.body).getPropertyValue(variableName).trim();
    }

    private loadTheme(filename: string) {
        const head = this.document.getElementsByTagName('head')[0];
        const existingLink = this.document.getElementById(ThemeService.THEME_LINK_ID) as HTMLLinkElement;

        // Path relative to index.html (public folder content is served at root)
        const url = `themes/${filename}`;

        if (existingLink) {
            existingLink.href = url;
        } else {
            const link = this.document.createElement('link');
            link.id = ThemeService.THEME_LINK_ID;
            link.rel = 'stylesheet';
            link.href = url;
            head.appendChild(link);
        }

        // Notify dependants that theme url has been requested
        // Note: link loading is async, but for color swapping typically 
        // waiting for next tick or just relying on eventual consistency is fine.
        // If we need strict sync, we'd need onload handlers.
        // For Mapbox, it's safer to check computed styles after a small delay 
        // or when the link loads.

        if (existingLink) {
            // Force a signal update after a short delay to allow CSS OM to update?
            // Or just rely on the fact that when we set the signal, effects run,
            // and we might need to read the style *then*.
            // But setting href is async.
            // Let's add a load listener if possible, or just emit immediately and hope.
            // Better: use onload on the link element.
            existingLink.onload = () => {
                this.themeChanged.update(v => v + 1);
            };
        } else {
            // Newly created link
            const link = this.document.getElementById(ThemeService.THEME_LINK_ID) as HTMLLinkElement;
            link.onload = () => {
                this.themeChanged.update(v => v + 1);
            };
        }
    }
}
