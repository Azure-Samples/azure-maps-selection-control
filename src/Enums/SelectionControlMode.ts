
/** Modes of selection for the SelectionControl. */
export enum SelectionControlMode {
    /** Draw a circular area to select in. */
    circle = 'circle',
    
    /** Draw a rectangular area to select in. */
    rectangle = 'rectangle',

    /** Draw a polygon area to select in. */
   polygon = 'polygon',

    /** Generates a selection area based on travel distance or time. */
    routeRange = 'routeRange'
}