import * as azmaps from 'azure-maps-control';
import { RouteRangeControlOptions } from './RouteRangeControlOptions';
import { SelectionControlMode } from '../Enums/SelectionControlMode';
import { ShapeSelectionMode } from 'src/Enums/ShapeSelectionMode';

/** Options for the SelectionControlOptions. */
export interface SelectionControlOptions {

    /**
    * The style of the control. Can be; light, dark, or auto. When set to auto, the style will change based on the map style.
    * Overridden if device is in high contrast mode.
    * @default light
    */
    style?: azmaps.ControlStyle;

    /**
     * The data source to query data from. 
     */
    source?: azmaps.source.DataSource | azmaps.source.VectorTileSource;

    /**
     * Required when the source of the layer is a VectorTileSource. 
     * A vector source can have multiple layers within it, this identifies which one to query. 
     * Prohibited for all other types of sources.
     */
    sourceLayer?: string;

    /** The selection modes to display in the selection control. */
    selectionModes?: SelectionControlMode[] | 'all';

    /** The color to fill the search area with. Default: `'#797775'` */
    fillColor?: string;

    /** The opacity of the fill color of the search area: Default: `0.5` */
    fillOpacity?: number;

    /** The color to outline of the search area with. Default: `'#797775'` */
    strokeColor?: string;

    /** The width of the outline of the search area: Default: `1` */
    strokeWidth?: number;

    /** Specifies if the search area polygon should stay visible after being drawn. Will be removed if the selection control button is pressed again. Default: `false` */
    persistSearchArea?: boolean;

    /** The mininum size of the map in order for route range option to be available. Format: [width, height] Default: [325, 200] */
    routeRangeMinMapSize?: [number, number];

    /** Options for the underlying route range control. */
    routeRangeOptions?: RouteRangeControlOptions;

    /** Specifies the type of shapes to select from the data source. Default: 'any' */
    shapeSelectionMode?: ShapeSelectionMode | string;
}