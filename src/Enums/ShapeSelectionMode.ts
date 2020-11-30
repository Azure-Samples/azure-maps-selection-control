
/** Type of shapes to allow the SelectionControl to select. */
export enum ShapeSelectionMode {
    /** Only allow point selection. */
    point = 'point',
    
    /** Only allow line selection. */
    line = 'line',

    /** Only allow polygon selection. */
    polygon = 'polygon',

    /** Any shape; point, line, polygon. */
    any = 'any'
}