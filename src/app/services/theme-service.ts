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
        let link = this.document.getElementById(ThemeService.THEME_LINK_ID) as HTMLLinkElement;

        // Path relative to index.html
        const url = `themes/${filename}`;

        if (link) {
            link.href = url;
            // Add onload for existing link updates if needed? 
            // Reuse logic below
        } else {
            link = this.document.createElement('link');
            link.id = ThemeService.THEME_LINK_ID;
            link.rel = 'stylesheet';
            link.href = url;
            head.appendChild(link);
        }

        // Attach handler to whichever link we have
        // Note: setting onload on an existing link that is already loaded might not fire?
        // But changing href triggers load.
        link.onload = () => {
            this.themeChanged.update(v => v + 1);
        };
    }
}
