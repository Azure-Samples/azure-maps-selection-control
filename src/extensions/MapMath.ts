import atlas, * as azmaps from 'azure-maps-control';
import * as pointsWithinPolygon from '@turf/points-within-polygon';
import { WeightUnits } from '../Enums/WeightUnits';

export class MapMath {
    /** Units of weight measurements */
    public static WeightUnits = WeightUnits;

    /**
     * Gets all point features that are within a polygon.
     * @param points Point features to filter.
     * @param searchArea The search area to search within.
     */
    public static pointsWithinPolygon(points: azmaps.data.Feature<azmaps.data.Point, any>[], searchArea: azmaps.data.Polygon | azmaps.data.MultiPolygon | azmaps.data.Feature<azmaps.data.Geometry, any> | azmaps.Shape): azmaps.data.Feature<azmaps.data.Point, any>[] {
        if(points && searchArea){
            let poly: azmaps.data.Polygon | azmaps.data.MultiPolygon;

            if(searchArea instanceof azmaps.Shape){
                //If the search area is a circle, create a polygon from its circle coordinates.
                if (searchArea.isCircle()) {
                    poly = new azmaps.data.Polygon([searchArea.getCircleCoordinates()]);
                } else if (searchArea.getType().indexOf('Polygon') > -1){
                    poly = <azmaps.data.Polygon>searchArea.toJson().geometry;
                }
            } else {      
                const f = <azmaps.data.Feature<azmaps.data.Geometry, any>>searchArea;

                if(f.type === 'Feature') {
                    if(f.geometry.type === 'Point' && f.properties.subType === 'Circle' && typeof f.properties.radius === 'number'){
                        poly = new azmaps.data.Polygon(azmaps.math.getRegularPolygonPath((f.geometry as azmaps.data.Point).coordinates, f.properties.radius, 72, 'meters'))
                    } else if(f.geometry.type.indexOf('Polygon') > -1) {
                        poly = <azmaps.data.Polygon>f.geometry;
                    }
                } 
                
                if(f.type.indexOf('Polygon') !== -1) {
                    poly = <azmaps.data.Polygon>searchArea;
                }
            }

            if(poly){
                //Calculate all points that are within the polygon area.
                //@ts-ignore
                const ptsWithin = pointsWithinPolygon.default(new atlas.data.FeatureCollection(points), poly);

                return ptsWithin.features;
            }
        }

        return [];
    }

    /**
     * Gets all shapes that have point features that are within a polygon.
     * @param shapes Data source or array of shapes with point geometries to filter. Any non-Point geometry shapes will be ignored.
     * @param searchArea The search area to search within.
     */
    public static shapePointsWithinPolygon(shapes: azmaps.Shape[] | azmaps.source.DataSource, searchArea: azmaps.data.Polygon | azmaps.data.MultiPolygon | azmaps.data.Feature<azmaps.data.Geometry, any> | azmaps.Shape): azmaps.Shape[] {
        if(shapes && searchArea){

            //Get array of shapes.
            let sourceShapes = (shapes instanceof azmaps.source.DataSource) ?  shapes.getShapes(): shapes;

            //Extract all points shapes and convert to points.
            let points: azmaps.data.Feature<azmaps.data.Point, any>[] = [];
            
            //Create a shape lookup table by id for quick filtering later.
            let idLoookupTable = {};

            let id: string | number;
            let s: azmaps.Shape;

            for(let i=0, len = sourceShapes.length; i < len; i++){
                s = sourceShapes[i];

                if(s.getType() === 'Point'){
                    id = s.getId();
                    idLoookupTable[id] = s;
                    points.push(new azmaps.data.Feature(new azmaps.data.Point(<azmaps.data.Position>s.getCoordinates()), null, id));
                }
            }
        
            //Filter the points.
            points = MapMath.pointsWithinPolygon(points, searchArea);

            //Grab the parent shape for each feature by using its id from the datasource.
            return points.map(f => idLoookupTable[f.id]);
        }

        return [];
    }

    /**
     * Converts a weight value from one unit to another.
     * Supported units: kilograms, pounds, metricTon, longTon, shortTon
     * @param weight The weight value to convert.
     * @param fromUnits The weight units the value is in.
     * @param toUnits The weight units to convert to.
     * @param decimals The number of decimal places to round the result to.
     * @returns An weight value convertered from one unit to another.
     */
    public static convertWeight(weight: number, fromUnits: string | WeightUnits, toUnits: string | WeightUnits, decimals?: number): number {
        const unitToKg = {
            pounds: 0.45359237,
            metricTon: 1000,
            longTon: 1016,
            shortTon: 907.18474,
            kilograms: 1
        };

        fromUnits = MapMath._normalizeWeightUnit(fromUnits);
        toUnits = MapMath._normalizeWeightUnit(toUnits);

        //Convert to to kg, then from kg to the 'to' units.
        weight = weight * unitToKg[fromUnits] / unitToKg[toUnits];

        if (typeof decimals === "number" && decimals >= 0) {
            const power = Math.pow(10, decimals);
            weight = Math.round(weight * power) / power;
        }

        return weight;
    };

    /**
     * Normalizes a string weight unit.
     * @param unit Unit to normalize.
     */
    private static _normalizeWeightUnit(unit: string): string {
        if(unit){
            //Remove spaces and trailing 's' for plurals.
            unit = unit.toLowerCase().replace(/(\s|s$)/g, '');

            if(['pound','lb'].indexOf(unit) > -1) {
                return 'pounds';
            } else if(['metricton','tonne','t'].indexOf(unit) > -1) {
                return 'metricTon';
            } else if(['longton','weightton', 'w/t', 'wt', 'imperialton', 'displacementton'].indexOf(unit) > -1) {
                return 'longTon';
            } else if(unit === 'shortton') {
                return 'shortTon';
            }
        }
        
        return 'kilograms';
    }
}