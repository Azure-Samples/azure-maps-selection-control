import * as azmaps from 'azure-maps-control';

/** Options for the RouteRangeControl. */
export interface RouteRangeControlOptions {
    /**
     * Options for customizing the look of the marker used for selecting the origin location.
     */
    markerOptions?: azmaps.HtmlMarkerOptions;

    /**
    * The style of the control. Can be; light, dark, or auto. When set to auto, the style will change based on the map style.
    * Overridden if device is in high contrast mode.  Default: `'light'`
    */
    style?: azmaps.ControlStyle;

    /** Specifies if the control should be visible when added to the map. Default: `false` */
    isVisible?: boolean;

    /** How to position the control when added to the map with non-fixed position. Default: `'left'` */
    position?: 'left' | 'center' | 'right';

    /** Specifies if the control should hide after a search is done. When set to false, the cancel button is not displayed. Default: `false`  */
    collapsible?: boolean;

    /** 
     * Specifies if a route range should be calculated automatically when the marker is moved either with the mouse arrow keys when the top level route range control has focus or by dragging the marker with the mouse. 
     * Note that this can result in a lot of additional requests being generated. 
     * Default: `true` 
     */
    calculateOnMarkerMove?: boolean;
}
