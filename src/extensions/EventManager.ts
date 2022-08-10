import * as azmaps from 'azure-maps-control';
import { SelectionControl, SelectionControlEvents, RouteRangeControl } from '../control';

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
        add(eventType: "dataselected", target: SelectionControl, callback: (e: (azmaps.data.Feature<azmaps.data.Geometry, any> | azmaps.Shape)[]) => void): void;

        /**
         * Adds an event to a class once.
         * @param eventType The event name.
         * @param target The class to add the event for.
         * @param callback The event handler callback.
         */
        addOnce(eventType: "dataselected", target: SelectionControl, callback: (e: (azmaps.data.Feature<azmaps.data.Geometry, any> | azmaps.Shape)[]) => void): void;
                 
        /**
         * Adds an event to a class.
         * @param eventType The event name.
         * @param target The class to add the event for.
         * @param callback The event handler callback.
         */
        add(eventType: "rangecalculated", target: RouteRangeControl, callback: (e: azmaps.data.Polygon | azmaps.data.MultiPolygon) => void): void;

        /**
         * Adds an event to a class once.
         * @param eventType The event name.
         * @param target The class to add the event for.
         * @param callback The event handler callback.
         */
        addOnce(eventType: "rangecalculated", target: RouteRangeControl, callback: (e: azmaps.data.Polygon | azmaps.data.MultiPolygon) => void): void;

         /**
         * Adds an event to a class.
         * @param eventType The event name.
         * @param target The class to add the event for.
         * @param callback The event handler callback.
         */
        add(eventType: "showrange", target: RouteRangeControl, callback: (e: azmaps.data.Polygon | azmaps.data.MultiPolygon) => void): void;

        /**
         * Adds an event to a class once.
         * @param eventType The event name.
         * @param target The class to add the event for.
         * @param callback The event handler callback.
         */
        addOnce(eventType: "showrange", target: RouteRangeControl, callback: (e: azmaps.data.Polygon | azmaps.data.MultiPolygon) => void): void;

        /**
         * Adds an event to the `SelectionControl`.
         * @param eventType The event name.
         * @param target The class to add the event for.
         * @param callback The event handler callback.
         */
        add(eventType: "error", target: RouteRangeControl, callback: (e: string) => void): void;

        /**
         * Adds an event to the once.
         * @param eventType The event name.
         * @param target The class to add the event for.
         * @param callback The event handler callback.
         */
        addOnce(eventType: "error", target: RouteRangeControl, callback: (e: string) => void): void;
 
        /**
         * Removes an event listener from a class.
         * @param eventType The event name.
         * @param target The class to remove the event for.
         * @param callback The event handler callback.
         */
        remove(eventType: string, target: SelectionControl | RouteRangeControl, callback: (e?: any) => void): void;
    }
}
