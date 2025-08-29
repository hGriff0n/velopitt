import { Component, computed, inject, input, Input, OnChanges, SimpleChanges } from "@angular/core";
import { Segment, SegmentService } from "../services/segment-service";
import { DecimalPipe } from "@angular/common";
import { MatCardModule } from "@angular/material/card";

// TODO: me - Should probably move all of the segment-related display logic here
@Component({
    selector: 'segment-overlay',
    templateUrl: './segment-overlay.html',
    styleUrls: ['./segment-overlay.css'],
    imports: [
        DecimalPipe,
        MatCardModule
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

    // This also doesn't have the "mousever" elevation/etc. view
    // chart.js (https://github.com/valor-software/ng2-charts)
    // const myLineChart = new Chart(document.getElementById('chart-canvas'), {
    //         type: 'line',
    //         data: {
    //             labels: [],
    //             datasets: []
    //         },
    //         options: {
    //             plugins: {
    //                 legend: {
    //                     display: false
    //                 },
    //                 title: {
    //                     display: true,
    //                     align: 'start',
    //                     text: 'Elevation (m)'
    //                 }
    //             },
    //             maintainAspectRatio: false,
    //             responsive: true,
    //             scales: {
    //                 x: {
    //                     grid: {
    //                         display: false
    //                     }
    //                 },
    //                 y: {
    //                     min: 0,
    //                     grid: {
    //                         display: false
    //                     }
    //                 }
    //             },
    //             elements: {
    //                 point: {
    //                     radius: 0
    //                 }
    //             },
    //             layout: {
    //                 padding: {
    //                     top: 6,
    //                     right: 20,
    //                     bottom: -10,
    //                     left: 20
    //                 }
    //             }
    //         }
    //     });

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