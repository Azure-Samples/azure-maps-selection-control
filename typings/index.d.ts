import * as azmaps from 'azure-maps-control';
import * as azmdraw from 'azure-maps-drawing-tools';

declare namespace atlas {    

    export module control {

        /** The events supported by the `RouteRangeControl`. */
        export interface RouteRangeControlEvents {
            /** Event fired when a route range has been calculated. */
            rangecalculated: azmaps.data.Polygon | azmaps.data.MultiPolygon;

            /** Event fired when a route range is calculated and the showArea option is set to true. */
            showrange: azmaps.data.Polygon | azmaps.data.MultiPolygon;

            /** Event fired when an error occurs. */
            error: string;
        }

        /** A control that provides a form for requesting a route range polygon. Adds a marker to the map to select an origin location. */
        export class RouteRangeControl extends azmaps.internal.EventEmitter<RouteRangeControlEvents> implements azmaps.Control {

            /****************************
             * Constructor
             ***************************/
        
            /**
             * A control that provides a form for requesting a route range polygon. Adds a marker to the map to select an origin location.
             * @param options Options for defining how the control is rendered and functions.
             */
            constructor(options?: RouteRangeControlOptions);

            /****************************
             * Public Methods
             ***************************/
            
            /** Disposes the control. */
            public dispose(): void;

            /**
             * Sets the options for the marker.
             * @param options Marker options.
             */
            public setMarkerOptions(options: azmaps.HtmlMarkerOptions): void;

            /**
             * Hides or shows the route range control.
             * @param isVisible Specifies if the route range control should be displayed or not.
             */
            public setVisible(isVisible: boolean): void;

            /** Gets the options of the selection control. */
            public getOptions(): RouteRangeControlOptions;

            /**
             * Action to perform when the control is added to the map.
             * @param map The map the control was added to.
             * @param options The control options used when adding the control to the map.
             * @returns The HTML Element that represents the control.
             */
            public onAdd(map: azmaps.Map, options?: azmaps.ControlOptions): HTMLElement;

            /**
             * Action to perform when control is removed from the map.
             */
            public onRemove(): void;
        }

        /** The events supported by the `SelectionControl`. */
        export interface SelectionControlEvents {
            /** Event fired when shapes are selected from the specified data source. */
            dataselected: azmaps.Shape[];
        }

        /** A control that lets the user use different methods to select data from the map. */
        export class SelectionControl extends azmaps.internal.EventEmitter<SelectionControlEvents> implements azmaps.Control {
            /****************************
             * Constructor
             ***************************/
        
            /**
             * A control that lets the user use different methods to select data from the map.
             * @param options Options for defining how the control is rendered and functions.
             */
            constructor(options?: SelectionControlOptions);

            /****************************
             * Public Methods
             ***************************/

            /**
             * Clears any search area polygons added to the map by the selection control.
             */
            public clear(): void;
            
            /** Disposes the control. */
            public dispose(): void;

            /** Gets the underlying drawing manager of the selection control. */
            public getDrawingManager(): azmdraw.drawing.DrawingManager;

            /** Gets the options of the selection control. */
            public getOptions(): SelectionControlOptions;

            /** Updates the data source used for searching/selection. */
            public setSource(source: azmaps.source.DataSource): void;

            /**
             * Action to perform when the control is added to the map.
             * @param map The map the control was added to.
             * @param options The control options used when adding the control to the map.
             * @returns The HTML Element that represents the control.
             */
            public onAdd(map: azmaps.Map, options?: azmaps.ControlOptions): HTMLElement;

            /**
             * Action to perform when control is removed from the map.
             */
            public onRemove(): void;
        }
    }

    export module math {
        /**
         * Gets all point features that are within a polygon.
         * @param points Point features to filter.
         * @param searchArea The search area to search within.
         */
        export function pointsWithinPolygon(points: azmaps.data.Feature<azmaps.data.Point, any>[], searchArea: azmaps.data.Polygon | azmaps.data.MultiPolygon | azmaps.data.Feature<azmaps.data.Geometry, any> | azmaps.Shape): azmaps.data.Feature<azmaps.data.Point, any>[];

        /**
         * Gets all shapes that have point features that are within a polygon.
         * @param shapes Data source or array of shapes with point geometries to filter. Any non-Point geometry shapes will be ignored.
         * @param searchArea The search area to search within.
         */
        export function shapePointsWithinPolygon(shapes: azmaps.Shape[] | azmaps.source.DataSource, searchArea: azmaps.data.Polygon | azmaps.data.MultiPolygon | azmaps.data.Feature<azmaps.data.Geometry, any> | azmaps.Shape): azmaps.Shape[];

        /**
         * Gets all shapes that are intersect a polygon search area     
         * @param shapes Data source or array of shapes with geometries to filter.
         * @param searchArea The polygon search area to check for intersection with.
         * @param shapeSelectionMode Limits what type of shapes can be selected.
         */
        export function shapesIntersectPolygon(shapes: azmaps.Shape[] | azmaps.source.DataSource, searchArea: azmaps.data.Polygon | azmaps.data.MultiPolygon | azmaps.data.Feature<azmaps.data.Geometry, any> | azmaps.Shape, shapeSelectionMode?: ShapeSelectionMode | string): azmaps.Shape[];

        /**
         * Converts a weight value from one unit to another.
         * Supported units: kilograms, pounds, metricTon, longTon, shortTon
         * @param weight The weight value to convert.
         * @param fromUnits The weight units the value is in.
         * @param toUnits The weight units to convert to.
         * @param decimals The number of decimal places to round the result to.
         * @returns An weight value convertered from one unit to another.
         */
        export function convertWeight(weight: number, fromUnits: string | WeightUnits, toUnits: string | WeightUnits, decimals?: number): number;
    }

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
        source?: azmaps.source.DataSource;

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
    
    /** Units of weight measurements */
    export enum WeightUnits {
        /** A standard metric unit of measurement. */
        kilograms = 'kilograms',
        
        /** A mass measurement unit equal to 0.45359237 kilograms. */
        pounds = 'pounds',
        
        /** A metric unit of mass equal to 1,000 kilograms. */
        metricTon = 'metricTon',

        /**A mass measurement unit equal to 2,240 pounds-mass or 1,016 kilograms or 1.016 metric tons. Typically used in the UK. */
        longTon = 'longTon',

        /** A mass measurement unit equal to 2,000 pounds-mass or 907.18474 kilograms. Typically used in the USA. */
        shortTon = 'shortTon'
    }

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
}

/**
 * This module partially defines the map control.
 * This definition only includes the features added by using the drawing tools.
 * For the base definition see:
 * https://docs.microsoft.com/javascript/api/azure-maps-control/?view=azure-maps-typescript-latest
 */
declare module "azure-maps-control" {
    /**
     * This interface partially defines the map control's `EventManager`.
     * This definition only includes the method added by using the drawing tools.
     * For the base definition see:
     * https://docs.microsoft.com/javascript/api/azure-maps-control/atlas.eventmanager?view=azure-maps-typescript-latest
     */
    export interface EventManager {
        /**
         * Adds an event to a class.
         * @param eventType The event name.
         * @param target The class to add the event for.
         * @param callback The event handler callback.
         */
        add(eventType: "dataselected", target: atlas.control.SelectionControl, callback: (e: azmaps.Shape[]) => void): void;

        /**
         * Adds an event to a class once.
         * @param eventType The event name.
         * @param target The class to add the event for.
         * @param callback The event handler callback.
         */
        addOnce(eventType: "dataselected", target: atlas.control.SelectionControl, callback: (e: azmaps.Shape[]) => void): void;
         
        /**
         * Adds an event to a class.
         * @param eventType The event name.
         * @param target The class to add the event for.
         * @param callback The event handler callback.
         */
        add(eventType: "rangecalculated", target: atlas.control.RouteRangeControl, callback: (e: azmaps.data.Polygon | azmaps.data.MultiPolygon) => void): void;

        /**
         * Adds an event to a class once.
         * @param eventType The event name.
         * @param target The class to add the event for.
         * @param callback The event handler callback.
         */
        addOnce(eventType: "rangecalculated", target: atlas.control.RouteRangeControl, callback: (e: azmaps.data.Polygon | azmaps.data.MultiPolygon) => void): void;

         /**
         * Adds an event to a class.
         * @param eventType The event name.
         * @param target The class to add the event for.
         * @param callback The event handler callback.
         */
        add(eventType: "showrange", target: atlas.control.RouteRangeControl, callback: (e: azmaps.data.Polygon | azmaps.data.MultiPolygon) => void): void;

        /**
         * Adds an event to a class once.
         * @param eventType The event name.
         * @param target The class to add the event for.
         * @param callback The event handler callback.
         */
        addOnce(eventType: "showrange", target: atlas.control.RouteRangeControl, callback: (e: azmaps.data.Polygon | azmaps.data.MultiPolygon) => void): void;

        /**
         * Adds an event to the `SelectionControl`.
         * @param eventType The event name.
         * @param target The class to add the event for.
         * @param callback The event handler callback.
         */
        add(eventType: "error", target: atlas.control.RouteRangeControl, callback: (e: string) => void): void;

        /**
         * Adds an event to the once.
         * @param eventType The event name.
         * @param target The class to add the event for.
         * @param callback The event handler callback.
         */
        addOnce(eventType: "error", target: atlas.control.RouteRangeControl, callback: (e: string) => void): void;
 
        /**
         * Removes an event listener from a class.
         * @param eventType The event name.
         * @param target The class to remove the event for.
         * @param callback The event handler callback.
         */
        remove(eventType: string, target: atlas.control.SelectionControl | atlas.control.RouteRangeControl, callback: (e?: any) => void): void;
    }
}

export = atlas;