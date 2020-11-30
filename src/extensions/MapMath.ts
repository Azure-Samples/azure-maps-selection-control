import atlas, * as azmaps from 'azure-maps-control';
import * as pointsWithinPolygon from '@turf/points-within-polygon';
import * as booleanOverlap from '@turf/boolean-overlap';
import * as booleanCrosses from '@turf/boolean-crosses';
import * as booleanContains from '@turf/boolean-contains';
import { WeightUnits } from '../Enums/WeightUnits';
import { Utils } from '../helpers/Utils';
import { ShapeSelectionMode } from 'src/Enums/ShapeSelectionMode';

export class MapMath {
    /** Units of weight measurements */
    public static WeightUnits = WeightUnits;

    /**
     * Gets all point features that are within a polygon.
     * @param points Point features to filter.
     * @param searchArea The search area to search within.
     */
    public static pointsWithinPolygon(points: azmaps.data.Feature<azmaps.data.Point, any>[], searchArea: azmaps.data.Polygon | azmaps.data.MultiPolygon | azmaps.data.Feature<azmaps.data.Geometry, any> | azmaps.Shape): azmaps.data.Feature<azmaps.data.Point, any>[] {
        if (points && points.length > 0 && searchArea) {
            let poly = Utils.getPolygon(searchArea);

            if (poly) {
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
        return MapMath.shapesIntersectPolygon(shapes, searchArea, 'point');
    }

    /**
     * Gets all shapes that are intersect a polygon search area     
     * @param shapes Data source or array of shapes with geometries to filter.
     * @param searchArea The polygon search area to check for intersection with.
     * @param shapeSelectionMode Limits what type of shapes can be selected.
     */
    public static shapesIntersectPolygon(shapes: azmaps.Shape[] | azmaps.source.DataSource, searchArea: azmaps.data.Polygon | azmaps.data.MultiPolygon | azmaps.data.Feature<azmaps.data.Geometry, any> | azmaps.Shape, shapeSelectionMode?: ShapeSelectionMode | string): azmaps.Shape[] {
        let results: azmaps.Shape[] = [];

        if (shapes && searchArea) {

            shapeSelectionMode = shapeSelectionMode || 'any';

            //Get array of shapes.
            let sourceShapes = (shapes instanceof azmaps.source.DataSource) ? shapes.getShapes() : shapes;

            //Extract all points shapes and convert to points.
            let points: azmaps.data.Feature<azmaps.data.Point, any>[] = [];

            //Create a shape lookup table by id for quick filtering later.
            let idLoookupTable = {};

            let id: string | number;
            let s: azmaps.Shape;
            let g: azmaps.data.Geometry;

            let poly = Utils.getPolygon(searchArea);

            let allowPoints = shapeSelectionMode === 'point' || shapeSelectionMode === 'any';
            let allowLines = shapeSelectionMode === 'line' || shapeSelectionMode === 'any';
            let allowPolygons = shapeSelectionMode === 'polygon' || shapeSelectionMode === 'any';

            for (let i = 0, len = sourceShapes.length; i < len; i++) {
                s = sourceShapes[i];

                if (s.getType() === 'Point') {
                    if(allowPoints){
                        id = s.getId();
                        idLoookupTable[id] = s;
                        points.push(new azmaps.data.Feature(new azmaps.data.Point(<azmaps.data.Position>s.getCoordinates()), null, id));
                    }
                } else {
                    g = Utils.getGeometry(s);

                    if (
                        //Features are different types, so need to do a more indepth analysis.
                        (g.type.indexOf('Line') > -1 && allowLines && this._isLineInPoly(<azmaps.data.LineString>g, poly)) ||
                        (g.type.indexOf('Polygon') > -1 && allowPolygons && this._isPolyInPoly(<azmaps.data.Polygon>g, poly))
                    ) {
                        results.push(s);
                    }
                }
            }

            if(allowPoints){
                //Filter the points.
                points = MapMath.pointsWithinPolygon(points, searchArea);

                if (points.length > 0) {
                    //Grab the parent shape for each feature by using its id from the datasource.
                    results = results.concat(points.map(f => idLoookupTable[f.id]));
                }
            }
        }

        return results;
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
        if (unit) {
            //Remove spaces and trailing 's' for plurals.
            unit = unit.toLowerCase().replace(/(\s|s$)/g, '');

            if (['pound', 'lb'].indexOf(unit) > -1) {
                return 'pounds';
            } else if (['metricton', 'tonne', 't'].indexOf(unit) > -1) {
                return 'metricTon';
            } else if (['longton', 'weightton', 'w/t', 'wt', 'imperialton', 'displacementton'].indexOf(unit) > -1) {
                return 'longTon';
            } else if (unit === 'shortton') {
                return 'shortTon';
            }
        }

        return 'kilograms';
    }

    /**
     * Checks if type polygons overlap.
     * @param poly Polygon to check.
     * @param target Target polygon.
     */
    private static _isPolyInPoly(poly: azmaps.data.Polygon | azmaps.data.MultiPolygon, target: azmaps.data.Polygon | azmaps.data.MultiPolygon): boolean {
        if(target.type === 'Polygon') {
            if (poly.type === 'MultiPolygon') {
                //Target is polygon, poly is MultiPolygon. Need to iterate over each polygon of poly and test.
                const mp = <azmaps.data.MultiPolygon>poly;
                let p: azmaps.data.Polygon;

                for (let i = 0, len = mp.coordinates.length; i < len; i++) {
                    p = new azmaps.data.Polygon(mp.coordinates[i]);
                    //@ts-ignore
                    if (booleanOverlap.default(target, p) || booleanContains.default(target, p) || booleanContains.default(p, target)) {
                        return true;
                    }
                }

                return false;
            }

            //@ts-ignore
            return booleanOverlap.default(target, poly) || booleanContains.default(target, poly) || booleanContains.default(poly, target);
        }

        //Loop through each polygon within the target polygon and check to see if they intersect.
        const mp = <azmaps.data.MultiPolygon>target;
        for (let i = 0, len = mp.coordinates.length; i < len; i++) {
            if (this._isPolyInPoly(poly, new azmaps.data.Polygon(mp.coordinates[i]))) {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks to see if a line overlaps a polygon
     * @param line Line to check.
     * @param target Target polygon.
     */
    private static _isLineInPoly(line: azmaps.data.LineString | azmaps.data.MultiLineString, target: azmaps.data.Polygon | azmaps.data.MultiPolygon): boolean {
        if(target.type === 'MultiPolygon'){
            //Loop through each polygon within the target polygon and check to see if they intersect.
            const mp = <azmaps.data.MultiPolygon>target;
            for (let i = 0, len = mp.coordinates.length; i < len; i++) {
                if (this._isLineInPoly(line, new azmaps.data.Polygon(mp.coordinates[i]))) {
                    return true;
                }
            }

            return false;
        }

        if(line.type === 'MultiLineString'){
            const ml = <azmaps.data.MultiLineString>line;
            let l: azmaps.data.LineString;
            for (let i = 0, len = ml.coordinates.length; i < len; i++) {
                l = new azmaps.data.LineString(ml.coordinates[i]);
                //@ts-ignore
                if (booleanContains.default(target, l) ||
                    booleanCrosses.default(target, l)) {
                    return true;
                }
            }

            return false;
        }
 
        //@ts-ignore
        return booleanContains.default(target, line) || booleanCrosses.default(target, line);
    }
}