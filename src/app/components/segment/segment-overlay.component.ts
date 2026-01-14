import { Component, ChangeDetectionStrategy, input, output, effect, ViewChild, inject } from "@angular/core";
import { Segment, SegmentService } from "../../services/segment-service";
import { ThemeService } from "../../services/theme-service";
import { DecimalPipe } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { ChartConfiguration, ChartType, Color } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

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
                    color: this.themeService.getThemeColor('--sys-on-surface'),
                    font: { size: 10 }
                },
                grid: {
                    color: this.themeService.getThemeColor('--sys-chart-grid')
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: true,
                backgroundColor: this.themeService.getThemeColor('--sys-tooltip-bg'),
                titleColor: this.themeService.getThemeColor('--sys-primary'),
                bodyColor: this.themeService.getThemeColor('--sys-on-surface'),
                borderColor: this.themeService.getThemeColor('--sys-tooltip-border'),
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
            if (this.lineChartOptions?.scales?.['y']) {
                if (this.lineChartOptions.scales['y'].ticks) {
                    this.lineChartOptions.scales['y'].ticks.color = this.themeService.getThemeColor('--sys-on-surface');
                }
                if (this.lineChartOptions.scales['y'].grid) {
                    this.lineChartOptions.scales['y'].grid.color = this.themeService.getThemeColor('--sys-chart-grid');
                }
            }

            if (this.lineChartOptions?.plugins?.tooltip) {
                this.lineChartOptions.plugins.tooltip.backgroundColor = this.themeService.getThemeColor('--sys-tooltip-bg');
                this.lineChartOptions.plugins.tooltip.titleColor = this.themeService.getThemeColor('--sys-primary');
                this.lineChartOptions.plugins.tooltip.bodyColor = this.themeService.getThemeColor('--sys-on-surface');
                this.lineChartOptions.plugins.tooltip.borderColor = this.themeService.getThemeColor('--sys-tooltip-border');
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

        // Semantic theme variables for gradients
        if (gradient < 0) {
            return this.themeService.getThemeColor('--sys-gradient-downhill');
        } else if (gradient < 3) {
            return this.themeService.getThemeColor('--sys-gradient-flat');
        } else if (gradient < 7) {
            return this.themeService.getThemeColor('--sys-gradient-uphill');
        } else if (gradient < 10) {
            return this.themeService.getThemeColor('--sys-gradient-steep');
        } else if (gradient < 15) {
            return this.themeService.getThemeColor('--sys-gradient-very-steep');
        } else {
            return this.themeService.getThemeColor('--sys-gradient-extreme');
        }
    }
}