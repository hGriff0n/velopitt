import { Component, ChangeDetectionStrategy, input, output, effect, ViewChild, inject } from "@angular/core";
import { Segment, SegmentService } from "../../services/segment-service";
import { ThemeService } from "../../services/theme-service";
import { DecimalPipe } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { ChartConfiguration, ChartType, Color } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

// TODO: me - Should probably move all of the segment-related display logic here
@Component({
    selector: 'segment-overlay',
    templateUrl: './segment-overlay.html',
    styleUrls: ['./segment-overlay.css'],
    imports: [
        DecimalPipe,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        BaseChartDirective,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SegmentOverlayComponent {
    segment = input<Segment | undefined>(undefined);
    closeOverlay = output<void>();
    private themeService = inject(ThemeService);

    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
    public lineChartData: ChartConfiguration['data'] = {
        datasets: []
    };
    public lineChartType: ChartType = 'line';
    public lineChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
            line: {
                tension: 0.4,
                borderWidth: 2
            },
            point: {
                radius: 0,
                hitRadius: 10
            }
        },
        scales: {
            x: {
                display: false,
                grid: { display: false }
            },
            y: {
                ticks: {
                    color: '#E0E0E0', // --color-off-white
                    font: { size: 10 }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(18, 18, 18, 0.9)',
                titleColor: '#FFD54F',
                bodyColor: '#E0E0E0',
                borderColor: 'rgba(255, 213, 79, 0.3)',
                borderWidth: 1
            }
        }
    };

    constructor() {
        effect(() => {
            const seg = this.segment();
            // Trigger update when theme changes
            const themeChange = this.themeService.themeChanged();

            if (!seg) return;

            // Update chart options with theme colors
            const textColor = this.themeService.getThemeColor('--sys-on-surface') || '#E0E0E0';
            const gridColor = 'rgba(255, 255, 255, 0.1)'; // Could be themed too

            if (this.lineChartOptions?.scales?.['y']?.ticks) {
                this.lineChartOptions.scales['y'].ticks.color = textColor;
            }

            this.lineChartData = {
                datasets: [
                    {
                        data: seg.map.elevation_data,
                        label: 'Elevation',
                        fill: true,
                        segment: {
                            backgroundColor: (ctx: any) => this.chooseBackgroundColor(ctx, 'background'),
                            borderColor: (ctx: any) => this.chooseBackgroundColor(ctx, 'border'),
                        }
                    }
                ],
                labels: Array.from(Array(SegmentService.MAX_SEGMENTS).keys())
            };
            this.chart?.update();
        });
    }

    onChartHover(event: any) {
        // console.log(event);
    }
    chooseBackgroundColor(ctx: any, value: any): Color {
        const seg = this.segment();
        if (!seg) return "black";

        const deltaHeight = seg.map.elevation_data[ctx.p1DataIndex]! - seg.map.elevation_data[ctx.p0DataIndex]!;
        const deltaLength = seg.map.segment_distance!;
        const gradient = deltaHeight / deltaLength * 100;

        if (gradient < 0) {
            return this.themeService.getThemeColor('--color-signal-green') || "#69F0AE";
        } else if (gradient < 3) {
            return this.themeService.getThemeColor('--color-electric-gold') || "#FFD54F";
        } else if (gradient < 7) {
            return "#FB8C00"; // Orange - needs theme variable?
        } else if (gradient < 10) {
            return this.themeService.getThemeColor('--color-stop-red') || "#FF5252";
        } else if (gradient < 15) {
            return "#9C27B0"; // Purple - needs theme variable?
        } else {
            return this.themeService.getThemeColor('--color-gunmetal') || "#121212";
        }
    }
}