import { Component, computed, inject, input, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";
import { Segment, SegmentService } from "../services/segment-service";
import { DecimalPipe } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { ChartConfiguration, ChartEvent, ChartType, Color } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import * as polyline from '@mapbox/polyline';

// TODO: me - Should probably move all of the segment-related display logic here
@Component({
    selector: 'segment-overlay',
    templateUrl: './segment-overlay.html',
    styleUrls: ['./segment-overlay.css'],
    imports: [
        DecimalPipe,
        MatCardModule,
        BaseChartDirective
    ]
})
export class SegmentOverlayComponent {
    visible = input(false);
    segment_id = input(0);
    segment = computed(() => this.segmentData.getSegmentByDomId(this.segment_id()));
    distance = computed(() => this.segment()?.distance as number / 1000);
    elevation = computed(() => this.segment()?.total_elevation_gain);
    maxgrade = computed(() => this.segment()?.maximum_grade as number);
    avggrade = computed(() => this.segment()?.average_grade as number);
    private segmentData: SegmentService = inject(SegmentService);

    public lineChartData: ChartConfiguration['data'] = {
        datasets: [
            {
                data: [65, 59, 80, 81, 56, 55, 40],
                label: 'Elevation',
                fill: true,
                segment: {
                    backgroundColor: ctx => this.chooseBackgroundColor(ctx, 'background'),
                    borderColor: ctx => this.chooseBackgroundColor(ctx, 'border'),
                }
            },
        ],
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    };
    public lineChartType: ChartType = 'line';
    public lineChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        elements: {
            line: {
                tension: 0.9
            }
        },
        scales: {

        },
        plugins: {
            legend: {
                display: false
            }
        //     crosshair: {
        //         line: {
        //             color: '#F66',  // crosshair line color
        //             width: 1        // crosshair line width
        //         },
        //     }
        }
    };

    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
    onChartHover(event: any) {
        // console.log(event);
    }
    chooseBackgroundColor(ctx: any, value: any): Color{
        // ctx.p0DataIndex + ctx.p1DataIndex
        console.log(ctx);
        return "#E5E5E5";
    }

    // turf.js
    private segmentElevation() {
        // TODO: me - I'll want to split into 100m chunks
        // // split the line into 1km segments
        // const chunks = turf.lineChunk(lineData, 1).features;

        // // get the elevation for the leading coordinate of each segment
        // const elevations = [
        //     ...chunks.map((feature) => {
        //         return map.queryTerrainElevation(
        //             feature.geometry.coordinates[0]
        //         );
        //     }),
        //     // do not forget the last coordinate
        //     map.queryTerrainElevation(
        //         chunks[chunks.length - 1].geometry.coordinates[1]
        //     )
        // ];

        // // add dummy labels
        // myLineChart.data.labels = elevations.map(() => '');
        // myLineChart.data.datasets[0] = {
        //     data: elevations,
        //     fill: false,
        //     tension: 0.4
        // };
        // myLineChart.update();
    }
}