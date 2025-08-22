import { Component, computed, inject, input, Input, OnChanges, SimpleChanges } from "@angular/core";
import { Segment, SegmentService } from "../services/segment-service";

// TODO: me - Should probably move all of the segment-related display logic here
@Component({
    selector: 'segment-overlay',
    templateUrl: './segment-overlay.html',
    styleUrls: ['./segment-overlay.css'],
})
export class SegmentOverlayComponent {
    visible = input(false);
    segment_id = input(0);
    segment = computed(() => this.segmentData.getSegmentByDomId(this.segment_id()));
    private segmentData: SegmentService = inject(SegmentService);
}