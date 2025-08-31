import { Component, Input, ViewChild } from "@angular/core";
import { Segment, SegmentService } from "../../services/segment-service";
import { DecimalPipe } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
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
        BaseChartDirective,
    ],
    inputs: ["segment"]
})
export class SegmentOverlayComponent {
    private segment_!: Segment;

    set segment(segment: Segment) {
        this.segment_ = segment;
        this.lineChartData = {
            datasets: [
                {
                    data: this.segment.map.elevation_data,
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
    }

    get segment() {
        return this.segment_;
    }

    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
    public lineChartData: ChartConfiguration['data'] = {
        datasets: []
    };
    public lineChartType: ChartType = 'line';
    public lineChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        elements: {
            line: {
                tension: 0.9
            },
            point: {
                radius: 0,

            }
        },
        scales: {

        },
        plugins: {
            legend: {
                display: false
            }
            // The intention with this is to display the gradient while hovering over the chart
            // but it wouldn't compile
            //     crosshair: {
            //         line: {
            //             color: '#F66',  // crosshair line color
            //             width: 1        // crosshair line width
            //         },
            //     }
        }
    };

    onChartHover(event: any) {
        // console.log(event);
    }
    chooseBackgroundColor(ctx: any, value: any): Color {
        const deltaHeight = this.segment.map.elevation_data[ctx.p1DataIndex]! - this.segment.map.elevation_data[ctx.p0DataIndex]!;
        const deltaLength = this.segment.map.segment_distance!;
        const gradient = deltaHeight / deltaLength * 100;

        if (gradient < 0) {
            return "green";
        } else if (gradient < 3) {
            return "yellow";
        } else if (gradient < 7) {
            return "orange";
        } else if (gradient < 10) {
            return "red";
        } else if (gradient < 15) {
            return "purple";
        } else {
            return "black";
        }
    }
}