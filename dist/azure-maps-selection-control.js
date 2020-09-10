/*
MIT License

    Copyright (c) Microsoft Corporation.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE
*/

(function (exports, azmaps, azmdraw) {
    'use strict';

    var azmaps__default = 'default' in azmaps ? azmaps['default'] : azmaps;

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    /**
     * Helper class for merging namespaces.
     */
    var Namespace = /** @class */ (function () {
        function Namespace() {
        }
        Namespace.merge = function (namespace, base) {
            var context = window || global;
            var parts = namespace.split(".");
            for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
                var part = parts_1[_i];
                if (context[part]) {
                    context = context[part];
                }
                else {
                    return base;
                }
            }
            return __assign(__assign({}, context), base);
        };
        return Namespace;
    }());

    /**
     * Earth Radius used with the Harvesine formula and approximates using a spherical (non-ellipsoid) Earth.
     */

    /**
     * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}.
     *
     * @name featureCollection
     * @param {Feature[]} features input features
     * @param {Object} [options={}] Optional Parameters
     * @param {Array<number>} [options.bbox] Bounding Box Array [west, south, east, north] associated with the Feature
     * @param {string|number} [options.id] Identifier associated with the Feature
     * @returns {FeatureCollection} FeatureCollection of Features
     * @example
     * var locationA = turf.point([-75.343, 39.984], {name: 'Location A'});
     * var locationB = turf.point([-75.833, 39.284], {name: 'Location B'});
     * var locationC = turf.point([-75.534, 39.123], {name: 'Location C'});
     *
     * var collection = turf.featureCollection([
     *   locationA,
     *   locationB,
     *   locationC
     * ]);
     *
     * //=collection
     */
    function featureCollection(features, options) {
        // Optional Parameters
        options = options || {};
        if (!isObject(options)) throw new Error('options is invalid');
        var bbox = options.bbox;
        var id = options.id;

        // Validation
        if (!features) throw new Error('No features passed');
        if (!Array.isArray(features)) throw new Error('features must be an Array');
        if (bbox) validateBBox(bbox);
        if (id) validateId(id);

        // Main
        var fc = {type: 'FeatureCollection'};
        if (id) fc.id = id;
        if (bbox) fc.bbox = bbox;
        fc.features = features;
        return fc;
    }

    /**
     * isNumber
     *
     * @param {*} num Number to validate
     * @returns {boolean} true/false
     * @example
     * turf.isNumber(123)
     * //=true
     * turf.isNumber('foo')
     * //=false
     */
    function isNumber(num) {
        return !isNaN(num) && num !== null && !Array.isArray(num);
    }

    /**
     * isObject
     *
     * @param {*} input variable to validate
     * @returns {boolean} true/false
     * @example
     * turf.isObject({elevation: 10})
     * //=true
     * turf.isObject('foo')
     * //=false
     */
    function isObject(input) {
        return (!!input) && (input.constructor === Object);
    }

    /**
     * Validate BBox
     *
     * @private
     * @param {Array<number>} bbox BBox to validate
     * @returns {void}
     * @throws Error if BBox is not valid
     * @example
     * validateBBox([-180, -40, 110, 50])
     * //=OK
     * validateBBox([-180, -40])
     * //=Error
     * validateBBox('Foo')
     * //=Error
     * validateBBox(5)
     * //=Error
     * validateBBox(null)
     * //=Error
     * validateBBox(undefined)
     * //=Error
     */
    function validateBBox(bbox) {
        if (!bbox) throw new Error('bbox is required');
        if (!Array.isArray(bbox)) throw new Error('bbox must be an Array');
        if (bbox.length !== 4 && bbox.length !== 6) throw new Error('bbox must be an Array of 4 or 6 numbers');
        bbox.forEach(function (num) {
            if (!isNumber(num)) throw new Error('bbox must only contain numbers');
        });
    }

    /**
     * Validate Id
     *
     * @private
     * @param {string|number} id Id to validate
     * @returns {void}
     * @throws Error if Id is not valid
     * @example
     * validateId([-180, -40, 110, 50])
     * //=Error
     * validateId([-180, -40])
     * //=Error
     * validateId('Foo')
     * //=OK
     * validateId(5)
     * //=OK
     * validateId(null)
     * //=Error
     * validateId(undefined)
     * //=Error
     */
    function validateId(id) {
        if (!id) throw new Error('id is required');
        if (['string', 'number'].indexOf(typeof id) === -1) throw new Error('id must be a number or a string');
    }

    /**
     * Unwrap a coordinate from a Point Feature, Geometry or a single coordinate.
     *
     * @name getCoord
     * @param {Array<number>|Geometry<Point>|Feature<Point>} coord GeoJSON Point or an Array of numbers
     * @returns {Array<number>} coordinates
     * @example
     * var pt = turf.point([10, 10]);
     *
     * var coord = turf.getCoord(pt);
     * //= [10, 10]
     */
    function getCoord(coord) {
        if (!coord) throw new Error('coord is required');
        if (coord.type === 'Feature' && coord.geometry !== null && coord.geometry.type === 'Point') return coord.geometry.coordinates;
        if (coord.type === 'Point') return coord.coordinates;
        if (Array.isArray(coord) && coord.length >= 2 && coord[0].length === undefined && coord[1].length === undefined) return coord;

        throw new Error('coord must be GeoJSON Point or an Array of numbers');
    }

    /**
     * Unwrap coordinates from a Feature, Geometry Object or an Array
     *
     * @name getCoords
     * @param {Array<any>|Geometry|Feature} coords Feature, Geometry Object or an Array
     * @returns {Array<any>} coordinates
     * @example
     * var poly = turf.polygon([[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]);
     *
     * var coords = turf.getCoords(poly);
     * //= [[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]
     */
    function getCoords(coords) {
        if (!coords) throw new Error('coords is required');

        // Feature
        if (coords.type === 'Feature' && coords.geometry !== null) return coords.geometry.coordinates;

        // Geometry
        if (coords.coordinates) return coords.coordinates;

        // Array of numbers
        if (Array.isArray(coords)) return coords;

        throw new Error('coords must be GeoJSON Feature, Geometry Object or an Array');
    }

    // http://en.wikipedia.org/wiki/Even%E2%80%93odd_rule
    // modified from: https://github.com/substack/point-in-polygon/blob/master/index.js
    // which was modified from http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    /**
     * Takes a {@link Point} and a {@link Polygon} or {@link MultiPolygon} and determines if the point resides inside the polygon. The polygon can
     * be convex or concave. The function accounts for holes.
     *
     * @name booleanPointInPolygon
     * @param {Coord} point input point
     * @param {Feature<Polygon|MultiPolygon>} polygon input polygon or multipolygon
     * @param {Object} [options={}] Optional parameters
     * @param {boolean} [options.ignoreBoundary=false] True if polygon boundary should be ignored when determining if the point is inside the polygon otherwise false.
     * @returns {boolean} `true` if the Point is inside the Polygon; `false` if the Point is not inside the Polygon
     * @example
     * var pt = turf.point([-77, 44]);
     * var poly = turf.polygon([[
     *   [-81, 41],
     *   [-81, 47],
     *   [-72, 47],
     *   [-72, 41],
     *   [-81, 41]
     * ]]);
     *
     * turf.booleanPointInPolygon(pt, poly);
     * //= true
     */
    function booleanPointInPolygon(point, polygon, options) {
        // Optional parameters
        options = options || {};
        if (typeof options !== 'object') throw new Error('options is invalid');
        var ignoreBoundary = options.ignoreBoundary;

        // validation
        if (!point) throw new Error('point is required');
        if (!polygon) throw new Error('polygon is required');

        var pt = getCoord(point);
        var polys = getCoords(polygon);
        var type = (polygon.geometry) ? polygon.geometry.type : polygon.type;
        var bbox = polygon.bbox;

        // Quick elimination if point is not inside bbox
        if (bbox && inBBox(pt, bbox) === false) return false;

        // normalize to multipolygon
        if (type === 'Polygon') polys = [polys];

        for (var i = 0, insidePoly = false; i < polys.length && !insidePoly; i++) {
            // check if it is in the outer ring first
            if (inRing(pt, polys[i][0], ignoreBoundary)) {
                var inHole = false;
                var k = 1;
                // check for the point in any of the holes
                while (k < polys[i].length && !inHole) {
                    if (inRing(pt, polys[i][k], !ignoreBoundary)) {
                        inHole = true;
                    }
                    k++;
                }
                if (!inHole) insidePoly = true;
            }
        }
        return insidePoly;
    }

    /**
     * inRing
     *
     * @private
     * @param {Array<number>} pt [x,y]
     * @param {Array<Array<number>>} ring [[x,y], [x,y],..]
     * @param {boolean} ignoreBoundary ignoreBoundary
     * @returns {boolean} inRing
     */
    function inRing(pt, ring, ignoreBoundary) {
        var isInside = false;
        if (ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]) ring = ring.slice(0, ring.length - 1);

        for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            var xi = ring[i][0], yi = ring[i][1];
            var xj = ring[j][0], yj = ring[j][1];
            var onBoundary = (pt[1] * (xi - xj) + yi * (xj - pt[0]) + yj * (pt[0] - xi) === 0) &&
                ((xi - pt[0]) * (xj - pt[0]) <= 0) && ((yi - pt[1]) * (yj - pt[1]) <= 0);
            if (onBoundary) return !ignoreBoundary;
            var intersect = ((yi > pt[1]) !== (yj > pt[1])) &&
            (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi);
            if (intersect) isInside = !isInside;
        }
        return isInside;
    }

    /**
     * inBBox
     *
     * @private
     * @param {Position} pt point [x,y]
     * @param {BBox} bbox BBox [west, south, east, north]
     * @returns {boolean} true/false if point is inside BBox
     */
    function inBBox(pt, bbox) {
        return bbox[0] <= pt[0] &&
               bbox[1] <= pt[1] &&
               bbox[2] >= pt[0] &&
               bbox[3] >= pt[1];
    }

    /**
     * Callback for featureEach
     *
     * @callback featureEachCallback
     * @param {Feature<any>} currentFeature The current Feature being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     */

    /**
     * Iterate over features in any GeoJSON object, similar to
     * Array.forEach.
     *
     * @name featureEach
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @param {Function} callback a method that takes (currentFeature, featureIndex)
     * @returns {void}
     * @example
     * var features = turf.featureCollection([
     *   turf.point([26, 37], {foo: 'bar'}),
     *   turf.point([36, 53], {hello: 'world'})
     * ]);
     *
     * turf.featureEach(features, function (currentFeature, featureIndex) {
     *   //=currentFeature
     *   //=featureIndex
     * });
     */
    function featureEach(geojson, callback) {
        if (geojson.type === 'Feature') {
            callback(geojson, 0);
        } else if (geojson.type === 'FeatureCollection') {
            for (var i = 0; i < geojson.features.length; i++) {
                if (callback(geojson.features[i], i) === false) break;
            }
        }
    }

    /**
     * Callback for geomEach
     *
     * @callback geomEachCallback
     * @param {Geometry} currentGeometry The current Geometry being processed.
     * @param {number} featureIndex The current index of the Feature being processed.
     * @param {Object} featureProperties The current Feature Properties being processed.
     * @param {Array<number>} featureBBox The current Feature BBox being processed.
     * @param {number|string} featureId The current Feature Id being processed.
     */

    /**
     * Iterate over each geometry in any GeoJSON object, similar to Array.forEach()
     *
     * @name geomEach
     * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
     * @param {Function} callback a method that takes (currentGeometry, featureIndex, featureProperties, featureBBox, featureId)
     * @returns {void}
     * @example
     * var features = turf.featureCollection([
     *     turf.point([26, 37], {foo: 'bar'}),
     *     turf.point([36, 53], {hello: 'world'})
     * ]);
     *
     * turf.geomEach(features, function (currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
     *   //=currentGeometry
     *   //=featureIndex
     *   //=featureProperties
     *   //=featureBBox
     *   //=featureId
     * });
     */
    function geomEach(geojson, callback) {
        var i, j, g, geometry, stopG,
            geometryMaybeCollection,
            isGeometryCollection,
            featureProperties,
            featureBBox,
            featureId,
            featureIndex = 0,
            isFeatureCollection = geojson.type === 'FeatureCollection',
            isFeature = geojson.type === 'Feature',
            stop = isFeatureCollection ? geojson.features.length : 1;

        // This logic may look a little weird. The reason why it is that way
        // is because it's trying to be fast. GeoJSON supports multiple kinds
        // of objects at its root: FeatureCollection, Features, Geometries.
        // This function has the responsibility of handling all of them, and that
        // means that some of the `for` loops you see below actually just don't apply
        // to certain inputs. For instance, if you give this just a
        // Point geometry, then both loops are short-circuited and all we do
        // is gradually rename the input until it's called 'geometry'.
        //
        // This also aims to allocate as few resources as possible: just a
        // few numbers and booleans, rather than any temporary arrays as would
        // be required with the normalization approach.
        for (i = 0; i < stop; i++) {

            geometryMaybeCollection = (isFeatureCollection ? geojson.features[i].geometry :
                (isFeature ? geojson.geometry : geojson));
            featureProperties = (isFeatureCollection ? geojson.features[i].properties :
                (isFeature ? geojson.properties : {}));
            featureBBox = (isFeatureCollection ? geojson.features[i].bbox :
                (isFeature ? geojson.bbox : undefined));
            featureId = (isFeatureCollection ? geojson.features[i].id :
                (isFeature ? geojson.id : undefined));
            isGeometryCollection = (geometryMaybeCollection) ? geometryMaybeCollection.type === 'GeometryCollection' : false;
            stopG = isGeometryCollection ? geometryMaybeCollection.geometries.length : 1;

            for (g = 0; g < stopG; g++) {
                geometry = isGeometryCollection ?
                    geometryMaybeCollection.geometries[g] : geometryMaybeCollection;

                // Handle null Geometry
                if (geometry === null) {
                    if (callback(null, featureIndex, featureProperties, featureBBox, featureId) === false) return false;
                    continue;
                }
                switch (geometry.type) {
                case 'Point':
                case 'LineString':
                case 'MultiPoint':
                case 'Polygon':
                case 'MultiLineString':
                case 'MultiPolygon': {
                    if (callback(geometry, featureIndex, featureProperties, featureBBox, featureId) === false) return false;
                    break;
                }
                case 'GeometryCollection': {
                    for (j = 0; j < geometry.geometries.length; j++) {
                        if (callback(geometry.geometries[j], featureIndex, featureProperties, featureBBox, featureId) === false) return false;
                    }
                    break;
                }
                default:
                    throw new Error('Unknown Geometry Type');
                }
            }
            // Only increase `featureIndex` per each feature
            featureIndex++;
        }
    }

    /**
     * Finds {@link Points} that fall within {@link (Multi)Polygon(s)}.
     *
     * @name pointsWithinPolygon
     * @param {Feauture|FeatureCollection<Point>} points Points as input search
     * @param {FeatureCollection|Geoemtry|Feature<Polygon|MultiPolygon>} polygons Points must be within these (Multi)Polygon(s)
     * @returns {FeatureCollection<Point>} points that land within at least one polygon
     * @example
     * var points = turf.points([
     *     [-46.6318, -23.5523],
     *     [-46.6246, -23.5325],
     *     [-46.6062, -23.5513],
     *     [-46.663, -23.554],
     *     [-46.643, -23.557]
     * ]);
     *
     * var searchWithin = turf.polygon([[
     *     [-46.653,-23.543],
     *     [-46.634,-23.5346],
     *     [-46.613,-23.543],
     *     [-46.614,-23.559],
     *     [-46.631,-23.567],
     *     [-46.653,-23.560],
     *     [-46.653,-23.543]
     * ]]);
     *
     * var ptsWithin = turf.pointsWithinPolygon(points, searchWithin);
     *
     * //addToMap
     * var addToMap = [points, searchWithin, ptsWithin]
     * turf.featureEach(ptsWithin, function (currentFeature) {
     *   currentFeature.properties['marker-size'] = 'large';
     *   currentFeature.properties['marker-color'] = '#000';
     * });
     */
    function pointsWithinPolygon(points, polygons) {
        var results = [];
        geomEach(polygons, function (polygon) {
            featureEach(points, function (point) {
                if (booleanPointInPolygon(point, polygon)) results.push(point);
            });
        });
        return featureCollection(results);
    }

    /** Units of weight measurements */
    (function (WeightUnits) {
        /** A standard metric unit of measurement. */
        WeightUnits["kilograms"] = "kilograms";
        /** A mass measurement unit equal to 0.45359237 kilograms. */
        WeightUnits["pounds"] = "pounds";
        /** A metric unit of mass equal to 1,000 kilograms. */
        WeightUnits["metricTon"] = "metricTon";
        /**A mass measurement unit equal to 2,240 pounds-mass or 1,016 kilograms or 1.016 metric tons. Typically used in the UK. */
        WeightUnits["longTon"] = "longTon";
        /** A mass measurement unit equal to 2,000 pounds-mass or 907.18474 kilograms. Typically used in the USA. */
        WeightUnits["shortTon"] = "shortTon";
    })(exports.WeightUnits || (exports.WeightUnits = {}));

    var MapMath = /** @class */ (function () {
        function MapMath() {
        }
        /**
         * Gets all point features that are within a polygon.
         * @param points Point features to filter.
         * @param searchArea The search area to search within.
         */
        MapMath.pointsWithinPolygon = function (points, searchArea) {
            if (points && searchArea) {
                var poly = void 0;
                if (searchArea instanceof azmaps.Shape) {
                    //If the search area is a circle, create a polygon from its circle coordinates.
                    if (searchArea.isCircle()) {
                        poly = new azmaps.data.Polygon([searchArea.getCircleCoordinates()]);
                    }
                    else if (searchArea.getType().indexOf('Polygon') > -1) {
                        poly = searchArea.toJson().geometry;
                    }
                }
                else {
                    var f = searchArea;
                    if (f.type === 'Feature') {
                        if (f.geometry.type === 'Point' && f.properties.subType === 'Circle' && typeof f.properties.radius === 'number') {
                            poly = new azmaps.data.Polygon(azmaps.math.getRegularPolygonPath(f.geometry.coordinates, f.properties.radius, 72, 'meters'));
                        }
                        else if (f.geometry.type.indexOf('Polygon') > -1) {
                            poly = f.geometry;
                        }
                    }
                    if (f.type.indexOf('Polygon') !== -1) {
                        poly = searchArea;
                    }
                }
                if (poly) {
                    //Calculate all points that are within the polygon area.
                    //@ts-ignore
                    var ptsWithin = pointsWithinPolygon(new azmaps__default.data.FeatureCollection(points), poly);
                    return ptsWithin.features;
                }
            }
            return [];
        };
        /**
         * Gets all shapes that have point features that are within a polygon.
         * @param shapes Data source or array of shapes with point geometries to filter. Any non-Point geometry shapes will be ignored.
         * @param searchArea The search area to search within.
         */
        MapMath.shapePointsWithinPolygon = function (shapes, searchArea) {
            if (shapes && searchArea) {
                //Get array of shapes.
                var sourceShapes = (shapes instanceof azmaps.source.DataSource) ? shapes.getShapes() : shapes;
                //Extract all points shapes and convert to points.
                var points = [];
                //Create a shape lookup table by id for quick filtering later.
                var idLoookupTable_1 = {};
                var id = void 0;
                var s = void 0;
                for (var i = 0, len = sourceShapes.length; i < len; i++) {
                    s = sourceShapes[i];
                    if (s.getType() === 'Point') {
                        id = s.getId();
                        idLoookupTable_1[id] = s;
                        points.push(new azmaps.data.Feature(new azmaps.data.Point(s.getCoordinates()), { id: id }));
                    }
                }
                //Filter the points.
                points = MapMath.pointsWithinPolygon(points, searchArea);
                //Grab the parent shape for each feature by using its id from the datasource.
                return points.map(function (f) { return idLoookupTable_1[f.id]; });
            }
            return [];
        };
        /**
         * Converts a weight value from one unit to another.
         * Supported units: kilograms, pounds, metricTon, longTon, shortTon
         * @param weight The weight value to convert.
         * @param fromUnits The weight units the value is in.
         * @param toUnits The weight units to convert to.
         * @param decimals The number of decimal places to round the result to.
         * @returns An weight value convertered from one unit to another.
         */
        MapMath.convertWeight = function (weight, fromUnits, toUnits, decimals) {
            var unitToKg = {
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
                var power = Math.pow(10, decimals);
                weight = Math.round(weight * power) / power;
            }
            return weight;
        };
        /**
         * Normalizes a string weight unit.
         * @param unit Unit to normalize.
         */
        MapMath._normalizeWeightUnit = function (unit) {
            if (unit) {
                //Remove spaces and trailing 's' for plurals.
                unit = unit.toLowerCase().replace(/(\s|s$)/g, '');
                if (['pound', 'lb'].indexOf(unit) > -1) {
                    return 'pounds';
                }
                else if (['metricton', 'tonne', 't'].indexOf(unit) > -1) {
                    return 'metricTon';
                }
                else if (['longton', 'weightton', 'w/t', 'wt', 'imperialton', 'displacementton'].indexOf(unit) > -1) {
                    return 'longTon';
                }
                else if (unit === 'shortton') {
                    return 'shortTon';
                }
            }
            return 'kilograms';
        };
        /** Units of weight measurements */
        MapMath.WeightUnits = exports.WeightUnits;
        return MapMath;
    }());

    var Utils = /** @class */ (function () {
        function Utils() {
        }
        /**
         * Helper to class to quickly create DOM elements.
         * @param type The type of element to create.
         * @param elmInfo Details to add to the element.
         * @param resx A resource file for localization.
         */
        Utils.createElm = function (type, elmInfo, resx, binding) {
            var elm = document.createElement(type);
            if (elmInfo) {
                if (elmInfo.propName && resx) {
                    var r = resx[elmInfo.propName];
                    if (r) {
                        elmInfo.attr = Object.assign(elmInfo.attr || {}, {
                            'alt': r,
                            'title': r
                        });
                    }
                }
                if (type === 'select' && elmInfo.selectVals) {
                    elmInfo.selectVals.forEach(function (val) {
                        var o = document.createElement('option');
                        o.setAttribute('value', val);
                        if (val === elmInfo.selected) {
                            o.setAttribute('selected', 'true');
                        }
                        o.appendChild(document.createTextNode((resx && resx[val]) ? resx[val] : val));
                        elm.appendChild(o);
                    });
                }
                Utils.setAttributes(elm, elmInfo.attr);
                if (elmInfo.class) {
                    elmInfo.class.forEach(function (c) {
                        if (c) {
                            elm.classList.add(c);
                        }
                    });
                }
                if (elmInfo.style) {
                    Object.assign(elm.style, elmInfo.style);
                }
                Utils.appendChildren(elm, elmInfo.children);
                if (elmInfo.innerHTML) {
                    elm.innerHTML += elmInfo.innerHTML;
                }
                if (binding && elmInfo.propName) {
                    binding.bind(elm, elmInfo.propName, null, elmInfo.bindingChanged);
                }
            }
            return elm;
        };
        /**
         * Appends multiple elements as children of a target element.
         * @param elm Target element to append children to.
         * @param children Child elements to append.
         */
        Utils.appendChildren = function (elm, children) {
            if (elm && children) {
                children.forEach(function (c) {
                    elm.appendChild(c);
                });
            }
        };
        /**
         * Sets multiple attributes on an element.
         * @param elm Element to add attributes to.
         * @param attr Attributes to add.
         */
        Utils.setAttributes = function (elm, attr) {
            if (elm && attr) {
                Object.keys(attr).forEach(function (k) {
                    elm.setAttribute(k, attr[k]);
                });
            }
        };
        /**
         * Tries and determines if the browser supports the individual date and the time input types.
         */
        Utils.isDateTimeInputSupported = function () {
            var self = this;
            if (typeof self.isDateTimeSupported !== 'boolean') {
                //Create date and time input elements and pass in bad date to see if they correct it. 
                //If it doesn't then the browser is likely falling back to a textbox and doesn't support these elements yet.
                var invalidValue = 'not-a-valid-value';
                var input = self.createElm('input', {
                    attr: {
                        type: 'date',
                        value: invalidValue
                    }
                });
                var isDateSupported = (input.value !== invalidValue);
                input = self.createElm('input', {
                    attr: {
                        type: 'time',
                        value: invalidValue
                    }
                });
                var isTimeSupported = (input.value !== invalidValue);
                //This only ever needs to be determined once per session, so cache the findings for quicker checks later.
                self.isDateTimeSupported = isDateSupported && isTimeSupported;
            }
            return self.isDateTimeSupported;
        };
        /** Number format for en-US decimal value numbers with no comma groupings. */
        Utils.USNumberFormat = new Intl.NumberFormat('en-US', { useGrouping: false }).format;
        return Utils;
    }());

    var keys = [
    	"selectionControl",
    	"routeRangeControl",
    	"truckDimensionsToggle",
    	"truckDimensions",
    	"loadTypeToggle",
    	"travelMode",
    	"selectionArea",
    	"distance",
    	"lengthUnits",
    	"length",
    	"height",
    	"width",
    	"axleWeight",
    	"car",
    	"truck",
    	"pedestrian",
    	"bicycle",
    	"selectOrigin",
    	"time",
    	"travelTime",
    	"distanceUnits",
    	"meters",
    	"miles",
    	"kilometers",
    	"yards",
    	"feet",
    	"weightUnits",
    	"kilograms",
    	"longTon",
    	"metricTon",
    	"pounds",
    	"shortTon",
    	"loadType",
    	"avoid",
    	"search",
    	"cancel",
    	"borderCrossings",
    	"carpools",
    	"ferries",
    	"motorways",
    	"tollRoads",
    	"unpavedRoads",
    	"otherHazmatHarmfulToWater",
    	"USHazmatClass9",
    	"USHazmatClass5",
    	"USHazmatClass6",
    	"USHazmatClass7",
    	"USHazmatClass2",
    	"USHazmatClass8",
    	"USHazmatClass1",
    	"USHazmatClass3",
    	"USHazmatClass4",
    	"circleSelection",
    	"rectangleSelection",
    	"polygonSelection",
    	"routeRangeSelection",
    	"showArea",
    	"traffic",
    	"considerTraffic",
    	"leaveAt",
    	"leaveAtDate",
    	"leaveAtTime",
    	"selectionModes",
    	"selectMode",
    	"avoidToggle",
    	"routeRangeError"
    ];
    var langs = {
    	en: [
    		"Data selection control",
    		"Route range control. Select origin location by dragging marker with mouse or arrow keys.",
    		"Toggle truck dimension options",
    		"Truck dimensions",
    		"Toggle load type options",
    		"Travel mode",
    		"Selection area",
    		"Distance",
    		"Length units",
    		"Length",
    		"Height",
    		"Width",
    		"Axle weight",
    		"Car",
    		"Truck",
    		"Pedestrian",
    		"Bicycle",
    		"Drag marker to select origin location",
    		"Time",
    		"Travel time (minutes)",
    		"Distance units",
    		"Meters",
    		"Miles",
    		"Kilometers",
    		"Yards",
    		"Feet",
    		"Weight units",
    		"Kilograms",
    		"Long ton",
    		"Metric ton",
    		"Pounds",
    		"Short ton",
    		"Load type",
    		"Avoid",
    		"Search",
    		"Cancel",
    		"Border crossings",
    		"Carpools",
    		"Ferries",
    		"Motorways",
    		"Toll roads",
    		"Unpaved roads",
    		"Harmful to water",
    		"Miscellaneous",
    		"Oxidizers",
    		"Poisons",
    		"Radioactive",
    		"Compressed gas",
    		"Corrosives",
    		"Explosives",
    		"Flammable liquids",
    		"Flammable solids",
    		"Circle selection",
    		"Rectangle selection",
    		"Polygon selection",
    		"Route range selection",
    		"Show area",
    		"Traffic",
    		"Include traffic in calculation",
    		"Leave at",
    		"Leave at date",
    		"Leave at time",
    		"Selection modes",
    		"Select mode",
    		"Toggle avoid options",
    		"Error requesting route range polygon."
    	],
    	af: [
    		"Data seleksie beheer",
    		"Roete wissel beheer. Kies oorsprong plek deur merker te sleep met die muis of pyltjie sleutels.",
    		"Toggle vragmotor dimensie opsies",
    		"vragmotor dimensies",
    		"Toggle tipe vrag opsies",
    		"Reis af",
    		"Seleksie area",
    		"Afstand",
    		"Lengte-eenhede",
    		"lengte",
    		"Hoogte",
    		"wydte",
    		"Axle gewig",
    		"Voertuig",
    		"Vragmotor",
    		"Voetganger",
    		"Fiets",
    		"Sleep merker te kies oorsprong plek",
    		"Tyd",
    		"Reistyd (minute)",
    		"Afstand eenhede",
    		"Meter",
    		"Myl",
    		"Kilometer",
    		"Treë",
    		"Voete",
    		"Gewig eenhede",
    		"Kilogram",
    		"Lang ton",
    		"Metrieke ton",
    		"Pond",
    		"Kort ton",
    		"Tipe vrag",
    		"Verhoed",
    		"Soek",
    		"Kanselleer",
    		"Grensposte",
    		"Carpooler",
    		"Ferries",
    		"Paaie",
    		"Tolpaaie",
    		"Ongeplaveide paaie",
    		"Skadelik vir water",
    		"Diverse",
    		"Oxidant",
    		"Gifstowwe",
    		"Radioaktiewe",
    		"Saamgeperste gas",
    		"Corrosieven",
    		"Plofstof",
    		"Vlambare vloeistowwe",
    		"Vlambare vaste stowwe",
    		"Sirkel seleksie",
    		"Reghoek seleksie",
    		"Veelhoek seleksie",
    		"Reistyd seleksie",
    		"Wys area",
    		"verkeer",
    		"Sluit verkeer in berekening",
    		"verlaat op",
    		"Verlaat op datum",
    		"Verlaat ten tye",
    		"seleksie modes",
    		"Kies modus",
    		"Toggle vermy opsies",
    		"Fout versoek roete reeks veelhoek."
    	],
    	ar: [
    		"تحكم اختيار البيانات",
    		"الطريق تتراوح السيطرة. تحديد أصل المكان عن طريق سحب علامة مع الماوس أو مفاتيح الأسهم.",
    		"تبديل خيارات شاحنة البعد",
    		"أبعاد شاحنة",
    		"تبديل خيارات نوع الحمل",
    		"وضع السفر",
    		"منطقة التحديد",
    		"مسافة",
    		"وحدة طول",
    		"الطول",
    		"ارتفاع",
    		"عرض",
    		"وزن المحور",
    		"سيارة",
    		"شاحنة",
    		"مشاة",
    		"دراجة",
    		"اسحب علامة لتحديد موقع الأصل",
    		"زمن",
    		"السفر عبر الزمن (دقيقة)",
    		"وحدات المسافة",
    		"متر",
    		"اميال",
    		"كم",
    		"ساحات",
    		"أقدام",
    		"وحدات الوزن",
    		"كجم",
    		"طن طويلة",
    		"طن متري",
    		"جنيه أو رطل للوزن",
    		"طن أمريكي",
    		"نوع الحمولة",
    		"تجنب",
    		"بحث",
    		"إلغاء",
    		"المعابر الحدودية",
    		"الانتقال الجماعي",
    		"العبارات",
    		"الطرق السريعة",
    		"الطرق ذات الرسوم",
    		"الطرق غير المعبدة",
    		"تضر المياه",
    		"متنوع",
    		"المؤكسدات",
    		"السموم",
    		"إشعاعي النشاط",
    		"غاز مضغوط",
    		"المواد المسببة للتآكل",
    		"متفجرات",
    		"سوائل قابلة للإشتعال",
    		"المواد الصلبة القابلة للاشتعال",
    		"اختيار دائرة",
    		"اختيار المستطيل",
    		"اختيار المضلع",
    		"السفر اختيار الوقت",
    		"مشاهدة منطقة",
    		"حركة المرور",
    		"تشمل حركة المرور في حساب",
    		"مغادرة عند",
    		"إجازة في التاريخ",
    		"ترك في وقت",
    		"طرق اختيار",
    		"حدد الوضع",
    		"خيارات تجنب تبديل",
    		"خطأ طلب مجموعة الطريق المضلع."
    	],
    	eu: [
    		"Datu aukeraketa kontrol",
    		"Ibilbidea bitartekoa kontrola. Aukeratu jatorria kokapena markatzailea arrastatu sagua edo gezi gakoak.",
    		"Toggle kamioi dimentsio aukerak",
    		"Kamioia dimentsiotan",
    		"Toggle karga mota aukerak",
    		"Bidaiak modua",
    		"Hautaketa inguruan",
    		"Distantzia",
    		"Luzera unitateak",
    		"Luzera",
    		"Altuera",
    		"Zabalera",
    		"Eje pisua",
    		"Car",
    		"Kamioia",
    		"Oinezko",
    		"Bizikleta",
    		"Arrastatu hautatu jatorria kokapena markatzailea",
    		"Ordua",
    		"Bidaia denbora (minutuak)",
    		"Distantzia unitateak",
    		"Metroak",
    		"Mila",
    		"Kilometroak",
    		"Yards",
    		"Oinak",
    		"Pisu-unitateak",
    		"Kilogramo",
    		"Long tonako",
    		"Metric tona",
    		"Pounds",
    		"Tonako short",
    		"Karga-mota",
    		"Ez",
    		"Search",
    		"Utzi",
    		"Border pasabideak",
    		"Carpools",
    		"Ferries",
    		"Autobideak",
    		"Bidesariak",
    		"Unpaved errepide",
    		"Ur kaltegarriak",
    		"Denetarik",
    		"Oxidizers",
    		"Poisons",
    		"Erradiaktiboa",
    		"Konprimitutako gas",
    		"Garratzak",
    		"Lehergailuak",
    		"Likido sukoiak",
    		"Sukoiak solidoen",
    		"Circle aukeraketa",
    		"Rectangle aukeraketa",
    		"Poligono aukeraketa",
    		"Bidaia denboran aukeraketa",
    		"Show inguruan",
    		"Trafikoa",
    		"Besteak beste, kalkulua trafikoa",
    		"tan Utzi",
    		"data Utzi",
    		"berean Utzi",
    		"Hautaketa moduak",
    		"aukeratu modua",
    		"Toggle saihesteko aukera",
    		"Errorea ibilbidea sorta poligono eskatzeko."
    	],
    	bg: [
    		"Данните селекционен контрол",
    		"Път варира контрол. Изберете местоположение произход, като плъзнете маркера с мишката или клавишите със стрелки.",
    		"Превключване на опции камион размери",
    		"размери на камиони",
    		"опции тип товар Превключване",
    		"Начин на пътуване",
    		"област Selection",
    		"разстояние",
    		"Дължина единици",
    		"дължина",
    		"височина",
    		"широчина",
    		"ос на тегло",
    		"Кола",
    		"Камион",
    		"Пешеходец",
    		"велосипед",
    		"Drag маркер, за да изберете място произход",
    		"път",
    		"Време за пътуване (минути)",
    		"единици за разстояние",
    		"метри",
    		"Майлс",
    		"Километри",
    		"Ярда",
    		"Крака",
    		"Тегло единици",
    		"Килограми",
    		"Дълъг тон",
    		"Метричен тон",
    		"лири",
    		"Кратък тон",
    		"тип Load",
    		"Да се ​​избегне",
    		"Търсене",
    		"Отказ",
    		"гранични пунктове",
    		"Carpools",
    		"Фериботите",
    		"магистрали",
    		"Платени пътища",
    		"Неасфалтирани пътища",
    		"Вреден за вода",
    		"Разни",
    		"Окислители",
    		"Отрови",
    		"радиоактивен",
    		"Сгъстен газ",
    		"Корозивни",
    		"Експлозиви",
    		"запалими течности",
    		"твърди запалими вещества",
    		"подбор Circle",
    		"избор на правоъгълник",
    		"подбор Polygon",
    		"избор Времето за пътуване",
    		"Покажи област",
    		"Трафик",
    		"Включи трафик в изчисление",
    		"Оставете най-",
    		"Оставете дата",
    		"Оставете време",
    		"режими за избор на",
    		"Изберете режим",
    		"опции Превключване избягвайте",
    		"Грешка с искане гама маршрут многоъгълник."
    	],
    	zh: [
    		"数据选择控制",
    		"道路范围控制。通过拖动标记用鼠标选择原点位置或箭头键。",
    		"切换卡车尺寸选项",
    		"卡车尺寸",
    		"切换负载类型选项",
    		"旅游模式",
    		"选择区域",
    		"距离",
    		"长度单位",
    		"长度",
    		"高度",
    		"宽度",
    		"轴重",
    		"汽车",
    		"卡车",
    		"行人",
    		"自行车",
    		"拖动标记来选择原点位置",
    		"时间",
    		"旅行时间（分钟）",
    		"距离单位",
    		"米",
    		"万里",
    		"公里",
    		"码",
    		"脚",
    		"重量单位",
    		"公斤",
    		"英吨",
    		"公吨",
    		"英镑",
    		"短吨",
    		"负载类型",
    		"避免",
    		"搜索",
    		"取消",
    		"边境口岸",
    		"合乘",
    		"渡轮",
    		"高速公路",
    		"收费公路",
    		"土路",
    		"有害水",
    		"杂",
    		"氧化剂",
    		"毒药",
    		"放射性的",
    		"压缩气体",
    		"腐蚀性物质",
    		"炸药",
    		"易燃液体",
    		"易燃固体",
    		"圆选择",
    		"矩形选择",
    		"多边形选择",
    		"旅行时间选择",
    		"展示区",
    		"交通",
    		"包括计算流量",
    		"在离开",
    		"在留日期",
    		"在留时间",
    		"选择模式",
    		"选择模式",
    		"切换避免选项",
    		"错误请求道路范围的多边形。"
    	],
    	hr: [
    		"Podaci kontrola za odabir",
    		"Ruta rasponu kontrole. Odaberite podrijetlo položaj povlačenjem marker s mišem ili tipke sa strelicama.",
    		"Prebaci opcije dimenzija kamiona",
    		"dimenzije kamiona",
    		"Prebaci opcije tipa opterećenja",
    		"Način putovanja",
    		"Područje za odabir",
    		"Udaljenost",
    		"Duljina jedinice",
    		"dužina",
    		"Visina",
    		"Širina",
    		"osovinsko opterećenje",
    		"Automobil",
    		"Kamion",
    		"Pješak",
    		"Bicikl",
    		"Povucite marker za odabir lokacije porijekla",
    		"Vrijeme",
    		"Vrijeme putovanja (minuta)",
    		"Udaljenost jedinice",
    		"Metara",
    		"Milja",
    		"Kilometara",
    		"Yards",
    		"Noge",
    		"Težina jedinice",
    		"Kilograma",
    		"Metrička tona",
    		"Metričkih tona",
    		"Funti",
    		"Kratki tona",
    		"Vrsta opterećenja",
    		"Izbjegavajte",
    		"traži",
    		"Otkazati",
    		"Granični prijelazi",
    		"Carpools",
    		"Trajekti",
    		"Autoceste",
    		"Cesta s naplatom cestarine",
    		"Makadam",
    		"Štetno za vodu",
    		"Razni",
    		"Oxidizers",
    		"Otrovi",
    		"Radioaktivan",
    		"Komprimirani plin",
    		"Koroziju",
    		"Eksplozivi",
    		"Zapaljive tekućine",
    		"Zapaljive krute tvari",
    		"Izbor krug",
    		"Izbor pravokutnik",
    		"Izbor poligon",
    		"Putovanja odabir vremena",
    		"Prikaži područje",
    		"Promet",
    		"Uključi promet u izračun",
    		"Ostavite na",
    		"Ostavite na dan",
    		"Ostavite na vrijeme",
    		"načini odabira",
    		"Odaberite način",
    		"Prebaci opcije Izbjegavajte",
    		"Pogreška traži raspon put poligon."
    	],
    	cs: [
    		"Ovládání výběr dat",
    		"Trasa rozsah kontroly. Nalezení původu tažením značky s myší nebo šipkami.",
    		"Toggle možnosti rozměr truck",
    		"rozměry návěsové",
    		"možnosti typu zatížení Toggle",
    		"Režim cesty",
    		"Volba area",
    		"Vzdálenost",
    		"Délkových jednotek",
    		"Délka",
    		"Výška",
    		"Šířka",
    		"Zatížení nápravy",
    		"Auto",
    		"Nákladní auto",
    		"Pěší",
    		"Jízdní kolo",
    		"Drag značka pro výběr místa původu",
    		"Čas",
    		"Cestovní čas (minuty)",
    		"Vzdálenost jednotky",
    		"Metry",
    		"Miles",
    		"Kilometry",
    		"Yards",
    		"Chodidla",
    		"Jednotky hmotnosti",
    		"Kilogramů",
    		"Long ton",
    		"Metrická tuna",
    		"Liber",
    		"Short ton",
    		"Typ zátěže",
    		"Vyhýbat se",
    		"Vyhledávání",
    		"Zrušení",
    		"Hraniční přechody",
    		"Carpools",
    		"Trajekty",
    		"Dálnic",
    		"Placené silnice",
    		"Nezpevněné cesty",
    		"Škodlivá pro vodu",
    		"Smíšený",
    		"Oxidizers",
    		"Jedy",
    		"Radioaktivní",
    		"Stlačený plyn",
    		"Žíraviny",
    		"Výbušniny",
    		"Hořlavé kapaliny",
    		"Hořlavé tuhé látky",
    		"Volba circle",
    		"Obdélník výběru",
    		"Volba polygon",
    		"Volba cesty",
    		"Show area",
    		"Provoz",
    		"Zahrnout provoz ve výpočtu",
    		"odejít",
    		"Nechat datu",
    		"Zanechat v době",
    		"režimy pro výběr",
    		"Vyberte režim",
    		"možnosti Toggle Vyhněte",
    		"Chyba při vyžádání rozsah trasa polygonu."
    	],
    	da: [
    		"Data, udvælgelse kontrol",
    		"Rute spænder kontrol. Vælg oprindelsesbetegnelse ved at trække markøren med musen eller piletasterne.",
    		"Toggle lastbil dimension muligheder",
    		"truck dimensioner",
    		"Toggle belastning typen muligheder",
    		"Travel-tilstand",
    		"Udvælgelse område",
    		"Afstand",
    		"Længde enheder",
    		"Længde",
    		"Højde",
    		"Bredde",
    		"aksel vægt",
    		"Bil",
    		"Lastbil",
    		"Fodgænger",
    		"Cykel",
    		"Træk markøren til at vælge oprindelsesbetegnelse",
    		"Tid",
    		"Rejsetid (minutter)",
    		"Distance enheder",
    		"Målere",
    		"Miles",
    		"Kilometer",
    		"Yards",
    		"Feet",
    		"Vægtenheder",
    		"Kg",
    		"Lang ton",
    		"Ton",
    		"Pund",
    		"Short ton",
    		"Belastningstype",
    		"Undgå",
    		"Søg",
    		"Afbestille",
    		"Grænseovergange",
    		"Carpools",
    		"Færger",
    		"Motorveje",
    		"Betalingsveje",
    		"Grusveje",
    		"Skadelig for vand",
    		"Diverse",
    		"Iltningsmidler",
    		"Giftstoffer",
    		"Radioaktiv",
    		"Komprimeret gas",
    		"Ætsende",
    		"Sprængstoffer",
    		"Brandfarlige væsker",
    		"Brandfarlige faste stoffer",
    		"Udvælgelse circle",
    		"Markeringsrektangel",
    		"Udvælgelse polygon",
    		"Rejsetid udvælgelse",
    		"Vis område",
    		"Trafik",
    		"Medtag trafik i beregning",
    		"Efterlad på",
    		"Efterlad på dato",
    		"Efterlad på tid",
    		"tilstande Selection",
    		"Vælg tilstand",
    		"Toggle Undgå muligheder",
    		"Fejl anmoder rute rækkevidde polygon."
    	],
    	nl: [
    		"Gegevens selectie controle",
    		"Route instelbaar detectiebereik. Selecteer herkomst door marker te slepen met de muis of de pijltoetsen.",
    		"Toggle truck dimensie opties",
    		"truck afmetingen",
    		"Toggle lasttype opties",
    		"Reismodus",
    		"Selectiegebied",
    		"Afstand",
    		"Lengte eenheden",
    		"Lengte",
    		"Hoogte",
    		"Breedte",
    		"asdruk",
    		"Auto",
    		"Vrachtwagen",
    		"Voetganger",
    		"Fiets",
    		"Sleep marker te selecteren herkomst",
    		"Tijd",
    		"Reistijd (minuten)",
    		"Afstand units",
    		"Meters",
    		"Mijlen",
    		"Kilometers",
    		"Yards",
    		"Voeten",
    		"Gewichtseenheden",
    		"Kilogram",
    		"Engelse pond",
    		"Ton",
    		"Pounds",
    		"Short ton",
    		"Lasttype",
    		"Vermijd",
    		"Zoeken",
    		"Annuleer",
    		"Grensovergangen",
    		"Carpools",
    		"Ferries",
    		"Snelwegen",
    		"Tolwegen",
    		"Onverharde wegen",
    		"Schadelijk voor in het water",
    		"Diversen",
    		"Oxidatiemiddelen",
    		"Vergiftigingen",
    		"Radioactieve",
    		"Gecomprimeerd gas",
    		"Bijtende stoffen",
    		"Explosieven",
    		"Ontvlambare vloeistoffen",
    		"Brandbare vaste stoffen",
    		"Circle selectie",
    		"Rectangle selectie",
    		"Polygon selectie",
    		"Reistijd selectie",
    		"Show area",
    		"Verkeer",
    		"Inclusief het verkeer in de berekening",
    		"Vertrekken om",
    		"Laat op de datum",
    		"Laat op het moment",
    		"selectie modi",
    		"Selecteer modus",
    		"Toggle vermijden opties",
    		"Fout bij het aanvragen route bereik veelhoek."
    	],
    	et: [
    		"Andmed juhtnupus",
    		"Marsruudi ulatuvad kontrolli. Valige päritolu asukoha lohistades marker hiire või nooleklahvidega.",
    		"Lülita veoauto mõõde võimalusi",
    		"Truck mõõtmed",
    		"Lülita koormuse tüüp võimalusi",
    		"Reisirežiim",
    		"Valikualal",
    		"Kaugus",
    		"Pikkus üksused",
    		"pikkus",
    		"kõrgus",
    		"laius",
    		"teljekoormus",
    		"Auto",
    		"Veoauto",
    		"Jalakäija",
    		"Jalgratas",
    		"Drag marker valige päritolu asukoha",
    		"Aeg",
    		"Travel aeg (minutites)",
    		"Kaugus üksused",
    		"Meetri",
    		"Miili",
    		"Kilomeetri",
    		"Yards",
    		"Jalad",
    		"Kaalu ühikud",
    		"Kilogrammi",
    		"Pikk tonn",
    		"Tonni",
    		"Nael",
    		"Lühike tonn",
    		"Load tüüp",
    		"Vältima",
    		"Otsing",
    		"Tühistama",
    		"Piiriületuste",
    		"Carpools",
    		"Ferries",
    		"Kiirteed",
    		"Toll teed",
    		"Katteta teed",
    		"Kahjulik vees",
    		"Muu",
    		"Oksüdandid",
    		"Mürgid",
    		"Radioaktiivne",
    		"Surugaasi",
    		"Söövitavaid",
    		"Lõhkeained",
    		"Tuleohtlikud vedelikud",
    		"Tuleohtlikud tahked ained",
    		"Circle valiku",
    		"Ristkülik valikut",
    		"Polygon valikut",
    		"Travel aeg valikut",
    		"Näita piirkond",
    		"liiklus",
    		"Kaasa liikluse arvutus",
    		"Jäta",
    		"Jäta kuupäev",
    		"Jäta ajal",
    		"valikurežiimid",
    		"Valige režiim",
    		"Lülita vältida võimalusi",
    		"Viga kutse marsruudi valikut hulknurk."
    	],
    	fi: [
    		"Tietojen valinta ohjaus",
    		"Reitti alueen säätö. Valitse alkuperä sijaintia vetämällä merkki hiirellä tai nuolinäppäimillä.",
    		"Toggle kuorma ulottuvuus vaihtoehtoja",
    		"Truck mitat",
    		"Toggle kuormitustyyppi vaihtoehtoja",
    		"Reitin tyyppi",
    		"Valinta-alue",
    		"Etäisyys",
    		"Pituus yksikköä",
    		"Pituus",
    		"Korkeus",
    		"Leveys",
    		"akselipaino",
    		"Auto",
    		"Kuorma-auto",
    		"Jalankulkija",
    		"Polkupyörä",
    		"Vedä merkintää valitaksesi alkuperää sijainti",
    		"Aika",
    		"Matka-aika (minuuttia)",
    		"Mittayksiköt",
    		"Mittarit",
    		"Mailia",
    		"Kilometriä",
    		"Yards",
    		"Jalat",
    		"Painoyksikköä",
    		"Kilogrammaa",
    		"Pitkä tonni",
    		"Tonni",
    		"Puntaa",
    		"Lyhyt tonni",
    		"Kuormitustyyppi",
    		"Välttää",
    		"Hae",
    		"Peruuttaa",
    		"Rajanylitysten",
    		"Carpools",
    		"Lautat",
    		"Moottoritiet",
    		"Tietullit",
    		"Päällystämättömät tiet",
    		"Vahingoittaa vesistöjä",
    		"Sekalainen",
    		"Hapettimet",
    		"Myrkyt",
    		"Radioaktiivinen",
    		"Puristettu kaasu",
    		"Syövyttäviä aineita",
    		"Räjähteet",
    		"Helposti syttyvät nesteet",
    		"Syttyvät kiinteät aineet",
    		"Circle valinta",
    		"Suorakaide valinta",
    		"Monikulmio valinta",
    		"Matka-aika valinta",
    		"Näyttelyalue",
    		"liikenne",
    		"Sisällyttää liikenteen laskenta",
    		"jätä",
    		"Jätä ajankohtana",
    		"Jätä hetkellä",
    		"valinta tilaa",
    		"Valitse tila",
    		"Toggle välttää vaihtoehtoja",
    		"Virhe pyydettäessä reitti alue monikulmio."
    	],
    	fr: [
    		"Contrôle de sélection des données",
    		"Route de la chaîne de contrôle. Sélectionnez l'emplacement d'origine en faisant glisser le marqueur avec les touches souris ou les flèches.",
    		"Basculer options de dimension de camion",
    		"Dimensions de camion",
    		"Basculer options de type de charge",
    		"Mode voyage",
    		"Zone de sélection",
    		"Distance",
    		"Les unités de longueur",
    		"Longueur",
    		"la taille",
    		"Largeur",
    		"poids de l'essieu",
    		"Voiture",
    		"Un camion",
    		"Piéton",
    		"Vélo",
    		"Faites glisser marqueur de sélection d'emplacement d'origine",
    		"Temps",
    		"Temps de voyage (minutes)",
    		"Unités de distance",
    		"Mètres",
    		"Miles",
    		"Kilomètres",
    		"Yards",
    		"Pieds",
    		"Unités de poids",
    		"Kilogrammes",
    		"Tonne longue",
    		"Tonne",
    		"Livres sterling",
    		"Tonne courte",
    		"Type de charge",
    		"Éviter",
    		"Chercher",
    		"Annuler",
    		"Les passages frontaliers",
    		"Covoiturages",
    		"Ferries",
    		"Motorways",
    		"Les routes à péage",
    		"Des routes non pavées",
    		"Nocif pour l'eau",
    		"Divers",
    		"Comburants",
    		"Poisons",
    		"Radioactif",
    		"Gaz compressé",
    		"Corrosives",
    		"Explosifs",
    		"Liquides inflammables",
    		"Matières solides inflammables",
    		"Sélection cercle",
    		"Sélection rectangle",
    		"Sélection polygon",
    		"Sélection du temps voyage",
    		"Afficher la zone",
    		"Circulation",
    		"Inclure le trafic dans le calcul",
    		"Quitte à",
    		"Laisser à la date",
    		"Laissez au temps",
    		"Modes de sélection",
    		"Sélectionnez le mode",
    		"Basculer éviter les options",
    		"Erreur demandant polygone de gamme d'itinéraire."
    	],
    	gl: [
    		"de mando de selección de datos",
    		"Route varían control. Seleccione a localización orixe arrastrando marcador co rato ou as frechas.",
    		"Cambiar opcións de dimensión camión",
    		"dimensións camión",
    		"opcións de tipo de carga de alternancia",
    		"Modo de viaxe",
    		"Área de selección",
    		"Distancia",
    		"Unidades de lonxitude",
    		"lonxitude",
    		"altura",
    		"ancho",
    		"peso por eixe",
    		"Coche",
    		"Camión",
    		"Peón",
    		"Bicicleta",
    		"Arrastre marcador para seleccionar o lugar de orixe",
    		"Tempo",
    		"O tempo de viaxe (minutos)",
    		"Unidades de distancia",
    		"Metros",
    		"Miles",
    		"Quilómetros",
    		"Yards",
    		"Pés",
    		"Unidades de peso",
    		"Quilogramos",
    		"Tonelada longa",
    		"Tonelada métrica",
    		"Libras",
    		"Tonelada corta",
    		"Tipo de carga",
    		"Evite",
    		"Buscar",
    		"Cancelar",
    		"Postos de fronteira",
    		"Carpools",
    		"Ferries",
    		"Autoestradas",
    		"Estradas con peaxe",
    		"Estradas non pavimentadas",
    		"Prexudicial para a auga",
    		"Diverso",
    		"Oxidantes",
    		"Velenos",
    		"Radioactivo",
    		"Gas comprimido",
    		"Corrosivos",
    		"Explosivos",
    		"Líquidos inflamables",
    		"Sólidos inflamables",
    		"Selección círculo",
    		"Selección rectángulo",
    		"Selección polígono",
    		"Selección tempo de viaxe",
    		"Amosar área",
    		"tráfico",
    		"Inclúen o tráfico no cálculo",
    		"deixe polo",
    		"Deixar a data",
    		"Deixe o tempo",
    		"modos de selección",
    		"Seleccione o modo de",
    		"opcións Evitar alternancia",
    		"Erro solicitando gama ruta polígono."
    	],
    	de: [
    		"Datenauswahlsteuerung",
    		"Route reiche Kontrolle. Wählt Herkunft Standort durch Markierung mit der Maus ziehen oder Pfeiltasten.",
    		"Toggle LKW Dimension Optionen",
    		"Abmessungen des Staplers",
    		"Toggle-Lasttyp-Optionen",
    		"Reisemodus",
    		"Auswahlbereich",
    		"Entfernung",
    		"Längeneinheiten",
    		"Länge",
    		"Höhe",
    		"Breite",
    		"Achsgewicht",
    		"Wagen",
    		"Lkw",
    		"Fußgänger",
    		"Fahrrad",
    		"Ziehen Marker zu wählen Herkunft Standort",
    		"Zeit",
    		"Reisezeit (minuten)",
    		"Entfernungseinheiten",
    		"Meter",
    		"Meilen",
    		"Kilometer",
    		"Yards",
    		"Füße",
    		"Gewichtseinheiten",
    		"Kg",
    		"Lange tonne",
    		"Tonne",
    		"Pounds",
    		"Short ton",
    		"Lastart",
    		"Vermeiden",
    		"Suche",
    		"Stornieren",
    		"Grenzübergänge",
    		"Carpools",
    		"Fähren",
    		"Autobahnen",
    		"Gebührenpflichtige straßen",
    		"Straßen ohne belag",
    		"Schädlich für wasser",
    		"Verschiedenes",
    		"Oxidizers",
    		"Vergiftet",
    		"Radioaktiv",
    		"Komprimiertes gas",
    		"Ätzende",
    		"Explosive",
    		"Entflammbare flüssigkeiten",
    		"Brennbare feststoffe",
    		"Kreis auswahl",
    		"Rectangle auswahl",
    		"Polygon-auswahl",
    		"Reisezeit auswahl",
    		"Show-bereich",
    		"Der Verkehr",
    		"Fügen Sie Verkehr in der Berechnung",
    		"Verlassen um",
    		"Lassen Sie am Datum",
    		"Lassen Sie zum Zeitpunkt",
    		"Auswahlmodi",
    		"Auswahlmodus",
    		"Toggle vermeiden Optionen",
    		"Fehler Route Bereich Polygon anfordert."
    	],
    	el: [
    		"ελέγχου επιλογής δεδομένων",
    		"Route εύρος ελέγχου. Επιλέξτε την τοποθεσία προέλευσης σύροντας δείκτη με το ποντίκι ή τα πλήκτρα βέλους.",
    		"Εναλλαγή επιλογές διάσταση φορτηγό",
    		"διαστάσεις φορτηγών",
    		"Εναλλαγή επιλογές τύπου φορτίου",
    		"Λειτουργία ταξίδια",
    		"Περιοχή επιλογής",
    		"Απόσταση",
    		"Μονάδες μήκους",
    		"Μήκος",
    		"Υψος",
    		"Πλάτος",
    		"βάρος ανά άξονα",
    		"Αυτοκίνητο",
    		"Φορτηγό",
    		"Πεζός",
    		"Ποδήλατο",
    		"δείκτη σύρετε για να επιλέξετε την τοποθεσία προέλευσης",
    		"Χρόνος",
    		"Η διάρκεια του ταξιδιού (λεπτά)",
    		"Μονάδες απόστασης",
    		"Μετρητές",
    		"Miles",
    		"Χιλιόμετρα",
    		"Ναυπηγεία",
    		"Πόδια",
    		"Μονάδες βάρους",
    		"Κιλά",
    		"Long τόνο",
    		"Μετρικός τόνος",
    		"Λίρες",
    		"Σύντομη τόνο",
    		"Τύπος φορτίου",
    		"Αποφύγει",
    		"Αναζήτηση",
    		"Ματαίωση",
    		"Σημεία διέλευσης των συνόρων",
    		"Αυτοκίνητα",
    		"Πλοία",
    		"Αυτοκινητόδρομοι",
    		"Δρόμοι με διόδια",
    		"Μη ασφαλτοστρωμένοι δρόμοι",
    		"Επιβλαβές για το νερό",
    		"Διάφορα",
    		"Οξειδωτικά",
    		"Δηλητήρια",
    		"Ραδιενεργός",
    		"Συμπιεσμένο φυσικό αέριο",
    		"Διαβρωτικά",
    		"Εκρηκτικά",
    		"Εύφλεκτα υγρά",
    		"Εύφλεκτα στερεά",
    		"Επιλογή κύκλος",
    		"Επιλογή ορθογώνιο",
    		"Επιλογή πολύγωνο",
    		"Επιλογή ταξίδι στο χρόνο",
    		"Εμφάνιση περιοχή",
    		"ΚΙΝΗΣΗ στους ΔΡΟΜΟΥΣ",
    		"Συμπεριλάβετε κυκλοφορίας κατά τον υπολογισμό",
    		"Αφήστε σε",
    		"Αφήστε κατά την ημερομηνία",
    		"Αφήστε κατά το χρόνο",
    		"τρόποι επιλογής",
    		"Επιλέξτε τη λειτουργία",
    		"επιλογές αποφεύγουν Εναλλαγή",
    		"Σφάλμα ζητώντας εύρος διαδρομής πολύγωνο."
    	],
    	hi: [
    		"डाटा चयन नियंत्रण",
    		"मार्ग लेकर नियंत्रण। माउस के साथ मार्कर खींचकर मूल स्थान का चयन करें या तीर कुंजियों का।",
    		"टॉगल ट्रक आयाम विकल्प",
    		"ट्रक आयाम",
    		"टॉगल लोड प्रकार के विकल्प",
    		"यात्रा मोड",
    		"चुनाव क्षेत्र",
    		"दूरी",
    		"लंबाई इकाइयों",
    		"लंबाई",
    		"ऊंचाई",
    		"चौड़ाई",
    		"एक्सल वजन",
    		"गाड़ी",
    		"ट्रक",
    		"पैदल यात्री",
    		"साइकिल",
    		"चुनिंदा मूल स्थान के लिए मार्कर को खींचें",
    		"समय",
    		"यात्रा के समय (मिनट)",
    		"दूरी की इकाइयां",
    		"मीटर",
    		"मीलों",
    		"किलोमीटर",
    		"गज",
    		"पैर का पंजा",
    		"भार इकाइयों",
    		"किलोग्राम",
    		"लंबा टन",
    		"मैट्रिक टन",
    		"पाउंड",
    		"लघु टन",
    		"लोड प्रकार",
    		"बचें",
    		"खोज",
    		"रद्द करना",
    		"सीमा क्रॉसिंगों",
    		"कारपूल",
    		"घाट",
    		"सड़कों",
    		"टोल की सड़के",
    		"कच्ची सड़कें",
    		"पानी के लिए हानिकारक",
    		"विविध",
    		"ऑक्सीडाइजर",
    		"जहर",
    		"रेडियोधर्मी",
    		"संपीडित गैस",
    		"संक्षारक",
    		"विस्फोटक",
    		"ज्वलनशील तरल",
    		"ज्वलनशील ठोस",
    		"सर्किल चयन",
    		"आयत चयन",
    		"बहुभुज चयन",
    		"यात्रा के समय चयन",
    		"दिखाएँ क्षेत्र",
    		"यातायात",
    		"गणना में ट्रैफ़िक शामिल करें",
    		"पर छोड़ दें",
    		"की तारीख में छोड़ दो",
    		"समय में छोड़ दो",
    		"चयन मोड",
    		"मोड का चयन करें",
    		"टॉगल से बचने के विकल्प",
    		"मार्ग रेंज बहुभुज का अनुरोध करते हुए त्रुटि।"
    	],
    	hu: [
    		"Adatválasztó ellenőrzés",
    		"Útvonal tartomány ellenőrzés. Válassza származási helyet húzással marker egeret vagy a nyilakkal.",
    		"Toggle teherautó dimenzió lehetőségek",
    		"Truck méretek",
    		"Toggle terhelés típusától lehetőségek",
    		"Utazási mód",
    		"Felvételi terület",
    		"Távolság",
    		"Hosszmértékegységet",
    		"Hossz",
    		"Magasság",
    		"Szélesség",
    		"tengelyterhelés",
    		"Autó",
    		"Kamion",
    		"Gyalogos",
    		"Kerékpár",
    		"Jelölő húzása a kezdőhely kijelöléséhez",
    		"Idő",
    		"Az utazási idő (perc)",
    		"Távolságegység",
    		"Méter",
    		"Mérföld",
    		"Kilométerek",
    		"Yard",
    		"Feet",
    		"Tömegegységei",
    		"Kilogramm",
    		"Long ton",
    		"Metrikus tonna",
    		"Font",
    		"Short ton",
    		"Terhelés típusa",
    		"Elkerül",
    		"Keresés",
    		"Megszünteti",
    		"Határátkelők",
    		"Carpools",
    		"Kompok",
    		"Autópályák",
    		"Fizetős utak",
    		"Földutakat",
    		"Ártalmas a vízi",
    		"Vegyes",
    		"Oxidálószerek",
    		"Mérgek",
    		"Radioaktív",
    		"Sűrített gáz",
    		"Korroziv",
    		"Robbanóanyagok",
    		"Gyúlékony folyadékok",
    		"Gyúlékony szilárd anyagok",
    		"Kör kiválasztása",
    		"Téglalap kiválasztás",
    		"Sokszög kiválasztás",
    		"Az utazási idő kiválasztása",
    		"Megjelenítése terület",
    		"Forgalom",
    		"Tartalmazza a forgalom számítás",
    		"Hagyja a",
    		"Hagyja a dátum",
    		"Hagyja időpontban",
    		"Felvételi módok",
    		"Select módban",
    		"Toggle elkerül lehetőségek",
    		"Hiba az útvonalon tartományban sokszög."
    	],
    	id: [
    		"kontrol seleksi data",
    		"Route berkisar kontrol. Pilih lokasi asal dengan menyeret penanda dengan mouse atau tombol panah.",
    		"Beralih pilihan dimensi truk",
    		"dimensi truk",
    		"Beralih jenis beban pilihan",
    		"Modus travel",
    		"Area seleksi",
    		"Jarak",
    		"Unit panjang",
    		"Panjangnya",
    		"Tinggi",
    		"Lebar",
    		"berat poros",
    		"Mobil",
    		"Truk",
    		"Pejalan kaki",
    		"Sepeda",
    		"Seret penanda untuk memilih lokasi asal",
    		"Waktu",
    		"Perjalanan waktu (menit)",
    		"Unit jarak",
    		"Meter",
    		"Miles",
    		"Kilometer",
    		"Yards",
    		"Kaki",
    		"Unit berat",
    		"Kilogram",
    		"Panjang ton",
    		"Metrik ton",
    		"Pounds",
    		"Singkat ton",
    		"Jenis beban",
    		"Menghindari",
    		"Cari",
    		"Membatalkan",
    		"Penyeberangan perbatasan",
    		"Carpools",
    		"Feri",
    		"Raya",
    		"Jalan tol",
    		"Jalan beraspal",
    		"Berbahaya untuk air",
    		"Bermacam-macam",
    		"Oksidasi",
    		"Racun",
    		"Radioaktif",
    		"Gas terkompresi",
    		"Corrosives",
    		"Bahan peledak",
    		"Cairan mudah terbakar",
    		"Padatan mudah terbakar",
    		"Seleksi lingkaran",
    		"Seleksi persegi panjang",
    		"Seleksi polygon",
    		"Perjalanan pemilihan waktu",
    		"Tampilkan daerah",
    		"Lalu lintas",
    		"Sertakan lalu lintas dalam perhitungan",
    		"Tinggalkan di",
    		"Tinggalkan pada tanggal",
    		"Tinggalkan saat",
    		"mode seleksi",
    		"pilih modus",
    		"Pilihan menghindari beralih",
    		"Kesalahan meminta berbagai rute poligon."
    	],
    	it: [
    		"selettore dati",
    		"Percorso campo di regolazione. Seleziona posizione di origine trascinando marcatore con il mouse o le frecce.",
    		"Toggle opzioni di dimensione camion",
    		"dimensioni camion",
    		"Toggle opzioni tipo di carico",
    		"Modalità di viaggio",
    		"Area di selezione",
    		"Distanza",
    		"Unità di lunghezza",
    		"Lunghezza",
    		"Altezza",
    		"Larghezza",
    		"peso per asse",
    		"Macchina",
    		"Camion",
    		"Pedone",
    		"Bicicletta",
    		"marcatore Trascinare per selezionare posizione di origine",
    		"Tempo",
    		"Il tempo di percorrenza (minuti)",
    		"Unità di distanza",
    		"Metri",
    		"Miglia",
    		"Chilometri",
    		"Yards",
    		"Piedi",
    		"Unità di peso",
    		"Chilogrammi",
    		"Tonnellata lunga",
    		"Tonnellata",
    		"Sterline",
    		"Breve ton",
    		"Tipo di caricamento",
    		"Evitare",
    		"Ricerca",
    		"Annulla",
    		"Valichi di frontiera",
    		"Carpools",
    		"Traghetti",
    		"Autostrade",
    		"Strade a pedaggio",
    		"Strade sterrate",
    		"Nocivo per l'acqua",
    		"Miscellaneo",
    		"Ossidanti",
    		"Veleni",
    		"Radioattivo",
    		"Gas compresso",
    		"Corrosivi",
    		"Esplosivi",
    		"Liquidi infiammabili",
    		"Solidi infiammabili",
    		"Selezione circle",
    		"Rettangolo di selezione",
    		"Selezione poligono",
    		"Selezione del tempo di viaggio",
    		"Visualizza zona",
    		"Traffico",
    		"Includi traffico di calcolo",
    		"Partiamo alle",
    		"Lasciare alla data",
    		"Lasciare al momento",
    		"modalità di selezione",
    		"Selezionare la modalità",
    		"Opzioni Evita Toggle",
    		"Errore nella richiesta di gamma percorso poligono."
    	],
    	ja: [
    		"データ選択制御",
    		"ルートの範囲を制御します。マウスでマーカーをドラッグして元の場所を選択するか、矢印キーを。",
    		"トグルトラックの寸法オプション",
    		"トラック寸法",
    		"トグルロードタイプのオプション",
    		"トラベルモード",
    		"選択エリア",
    		"距離",
    		"長さの単位",
    		"長さ",
    		"高さ",
    		"幅",
    		"軸荷重",
    		"車",
    		"トラック",
    		"歩行者",
    		"自転車",
    		"原点の場所を選択するためのドラッグマーカー",
    		"時間",
    		"移動時間（分）",
    		"距離の単位",
    		"メーター",
    		"マイル",
    		"キロ",
    		"ヤード",
    		"足",
    		"重量単位",
    		"キログラム",
    		"ロングトン",
    		"メトリックトン",
    		"ポンド",
    		"ショートトン",
    		"ロードタイプ",
    		"避ける",
    		"探す",
    		"キャンセル",
    		"国境通過",
    		"相乗り",
    		"フェリー",
    		"高速道路",
    		"有料道路",
    		"未舗装の道路",
    		"水に有害",
    		"雑多",
    		"酸化剤",
    		"毒",
    		"放射性",
    		"圧縮ガス",
    		"腐食",
    		"爆発物",
    		"可燃性の液体",
    		"可燃性固体",
    		"サークルの選択",
    		"矩形選択",
    		"ポリゴンの選択",
    		"所要時間の選択",
    		"表示エリア",
    		"トラフィック",
    		"計算にトラフィックを含めます",
    		"休暇で",
    		"日のまま",
    		"時のまま",
    		"選択モード",
    		"モードを選択します",
    		"トグル回避オプション",
    		"ルートの範囲のポリゴンを要求するエラー。"
    	],
    	kk: [
    		"Деректер таңдау бақылау",
    		"Маршрут диапазоны бақылау. тінтуірмен маркер сүйреу арқылы шығу орынды таңдаңыз немесе көрсеткі пернелерін.",
    		"Toggle жүк өлшемі параметрлері",
    		"жүк өлшемдері",
    		"Toggle жүктеме түрі параметрлері",
    		"Саяхат режимі",
    		"Таңдау ауданы",
    		"Қашықтық",
    		"Ұзындығы бірлік",
    		"ұзындық",
    		"биіктік",
    		"ені",
    		"ось салмағы",
    		"Машина",
    		"Жүк",
    		"Жаяу",
    		"Велосипед",
    		"шығу орналасуын таңдау үшін сүйреңіз маркер",
    		"Уақыт",
    		"Саяхат уақыты (минут)",
    		"Қашықтық бірліктері",
    		"Метр",
    		"Miles",
    		"Шақырым",
    		"Аулалары",
    		"Feet",
    		"Салмағы бірлік",
    		"Кг",
    		"Ұзақ тонна",
    		"Метрикалық тонна",
    		"Фунт",
    		"Қысқа тонна",
    		"Load түрі",
    		"Аулақ",
    		"іздеу",
    		"Күшін жою",
    		"Шекаралық өткелдерде",
    		"Автопулов",
    		"Паромдар",
    		"Автомагистральдар",
    		"Ақылы жолдар",
    		"Топырақты жолдар",
    		"Суға зиянды",
    		"Әр түрлі",
    		"Окислителей",
    		"Улар",
    		"Радиоактивті",
    		"Сығылған газ",
    		"Ыдыратуға",
    		"Жарылғыш заттар",
    		"Тұтанғыш сұйықтықтар",
    		"Тұтанғыш қатты заттар",
    		"Circle таңдау",
    		"Rectangle таңдау",
    		"Көпбұрыш таңдау",
    		"Саяхат уақыты таңдау",
    		"Көрсету ауданы",
    		"Трафик",
    		"есептеу трафикті қамтиды",
    		"Қалдыру кезінде",
    		"күнгі Қалдыру",
    		"уақытта Қалдыру",
    		"таңдау режимдері",
    		"режимін таңдаңыз",
    		"Toggle аулақ опциялары",
    		"маршрут ауқымы көпбұрыштың салушы қатесі."
    	],
    	ko: [
    		"데이터 선택 컨트롤",
    		"경로 제어를 다양합니다. 마우스로 마커를 드래그하여 원점 위치를 선택하거나 화살표 키를.",
    		"토글 트럭 차원 옵션",
    		"트럭 차원",
    		"전환 부하 유형 옵션",
    		"여행 모드",
    		"선택 영역",
    		"거리",
    		"길이 단위",
    		"길이",
    		"신장",
    		"폭",
    		"차축 무게",
    		"차",
    		"트럭",
    		"보행자",
    		"자전거",
    		"선택 원점 위치로 드래그 마커",
    		"시각",
    		"소요 시간 (분)",
    		"거리 단위",
    		"미터",
    		"마일",
    		"킬로미터",
    		"야드",
    		"피트",
    		"무게 단위",
    		"킬로그램",
    		"영국 톤",
    		"메트릭 톤",
    		"파운드",
    		"짧은 톤",
    		"로드 형",
    		"기피",
    		"검색",
    		"취소",
    		"국경",
    		"카풀",
    		"페리",
    		"고속도로",
    		"유료 도로",
    		"비포장 도로",
    		"물에 유해",
    		"여러 가지 잡다한",
    		"산화제",
    		"독",
    		"방사성",
    		"압축 가스",
    		"부식제",
    		"폭발물",
    		"인화성 액체",
    		"가연성 고체",
    		"서클 선택",
    		"사각형 선택",
    		"다각형 선택",
    		"여행 시간 선택",
    		"표시 영역",
    		"교통",
    		"계산 트래픽을 포함",
    		"에 남겨주세요",
    		"날짜에 남겨주세요",
    		"한 번에 남겨주세요",
    		"선택 모드",
    		"선택 모드",
    		"전환 피할 옵션",
    		"경로 범위 다각형을 요청하는 오류가 발생했습니다."
    	],
    	es: [
    		"control de selección de datos",
    		"Ruta rango de control. Seleccionar ubicación de origen arrastrando marcador con el ratón o las teclas de flecha.",
    		"Toggle opciones de dimensión camión",
    		"dimensiones de la carretilla",
    		"Toggle opciones de tipo de carga",
    		"El modo de viaje",
    		"Área de selección",
    		"Distancia",
    		"Las unidades de longitud",
    		"Longitud",
    		"Altura",
    		"Anchura",
    		"peso por eje",
    		"Coche",
    		"Camión",
    		"Peatonal",
    		"Bicicleta",
    		"Arrastre marcador para seleccionar la ubicación de origen",
    		"Hora",
    		"El tiempo de viaje (minutos)",
    		"Unidades de distancia",
    		"Metros",
    		"Miles",
    		"Kilómetros",
    		"Yardas",
    		"Pies",
    		"Unidades de peso",
    		"Kilogramos",
    		"Tonelada larga",
    		"Tonelada métrica",
    		"Libras",
    		"Tonelada corta",
    		"Tipo de carga",
    		"Evitar",
    		"Buscar",
    		"Cancelar",
    		"Cruces fronterizos",
    		"Comparte coche",
    		"Transbordadores",
    		"Autopistas",
    		"Carreteras de peaje",
    		"Carreteras sin pavimentar",
    		"Contaminación de las aguas",
    		"Diverso",
    		"Oxidantes",
    		"Venenos",
    		"Radioactivo",
    		"Gas comprimido",
    		"Corrosivos",
    		"Explosivos",
    		"Líquidos inflamables",
    		"Sólidos inflamables",
    		"Selección círculo",
    		"Rectángulo de selección",
    		"De selección poligonal",
    		"Selección del tiempo de viaje",
    		"Mostrar área",
    		"Tráfico",
    		"Incluir en el cálculo del tráfico",
    		"Dejar en",
    		"Deja en la fecha",
    		"Deja en el momento",
    		"modos de selección",
    		"Seleccionar modo",
    		"Evita opciones de alternar",
    		"Error al solicitar polígono gama ruta."
    	],
    	lv: [
    		"Datu atlase kontrole",
    		"Route svārstās kontroli. Izvēlieties izcelsmes vietu, velkot marķieri ar peli vai bultu taustiņus.",
    		"Pārslēgt kravas dimensija iespējas",
    		"kravas izmēri",
    		"Pārslēgt slodze tips iespējas",
    		"Travel režīms",
    		"Atlase platība",
    		"Attālums",
    		"Garums vienības",
    		"garums",
    		"augstums",
    		"platums",
    		"ass svars",
    		"Auto",
    		"Smagā mašīna",
    		"Gājējs",
    		"Velosipēds",
    		"Velciet marķieri uz izvēlieties izcelsmes vietu",
    		"Laiks",
    		"Brauciena laiks (minūtes)",
    		"Attāluma mērvienības",
    		"Metri",
    		"Miles",
    		"Kilometri",
    		"Jardi",
    		"Pēdas",
    		"Svara vienības",
    		"Kilogrami",
    		"Long ton",
    		"Metriskā tonna",
    		"Mārciņas",
    		"Īsā tonna",
    		"Slodzes tips",
    		"Izvairīties",
    		"Meklēt",
    		"Atcelt",
    		"Robežšķērsošana",
    		"Carpools",
    		"Prāmji",
    		"Automaģistrāles",
    		"Maksas ceļi",
    		"Ceļi bez",
    		"Kaitīgs ūdens",
    		"Dažādi",
    		"Oksidētāji",
    		"Indes",
    		"Radioaktīvs",
    		"Saspiesta gāze",
    		"Kodīgas",
    		"Sprāgstvielas",
    		"Viegli uzliesmojošus šķidrumus",
    		"Uzliesmojošas cietas vielas",
    		"Circle atlase",
    		"Taisnstūris atlase",
    		"Poligons atlase",
    		"Braukšanas laiks atlase",
    		"Rādīt platība",
    		"satiksme",
    		"Iekļaut satiksmi aprēķinos",
    		"Atstājiet at",
    		"Atstājiet uz datuma",
    		"Atstājiet laikā",
    		"Atlases režīmi",
    		"Izvēlieties režīmu",
    		"Pārslēgt izvairieties iespējas",
    		"Kļūda pieprasot maršruts diapazons poligonu."
    	],
    	lt: [
    		"Duomenų atranka kontrolė",
    		"Maršruto svyruoja kontrolę. Pasirinkite kilmės vietą vilkdami žymeklį su pele arba rodyklių klavišais.",
    		"Toggle sunkvežimis dimensija galimybės",
    		"sunkvežimių matmenys",
    		"Toggle Krovinio tipas galimybės",
    		"Keliavimo būdas",
    		"Pasirinkimas plotas",
    		"Atstumas",
    		"Ilgis vienetai",
    		"ilgis",
    		"aukštis",
    		"plotis",
    		"ašies svoris",
    		"Automobilis",
    		"Sunkvežimis",
    		"Pėsčiasis",
    		"Dviratis",
    		"Vilkite žymeklį pasirinkite kilmės vietos",
    		"Laikas",
    		"Kelionės trukmė (min)",
    		"Atstumas vienetai",
    		"Metrų",
    		"Mylios",
    		"Kilometrų",
    		"Km",
    		"Kojos",
    		"Masės vienetai",
    		"Kilogramų",
    		"Ilgas tona",
    		"Metrinės tonos",
    		"Svarų",
    		"Trumpas tona",
    		"Krovinio tipas",
    		"Venkite",
    		"Paieška",
    		"Atšaukti",
    		"Sienos kirtimo",
    		"Keliones automobiliu",
    		"Keltai",
    		"Greitkeliai",
    		"Apmokestinti keliai",
    		"Negrįsti keliai",
    		"Žalingas vandens",
    		"Jvairus",
    		"Oksidatoriais",
    		"Nuodai",
    		"Radioaktyvus",
    		"Suspaustos dujos",
    		"Korozinės",
    		"Sprogmenys",
    		"Degūs skysčiai",
    		"Degiosios kietosios",
    		"Draugų pasirinkimas",
    		"Stačiakampis pasirinkimas",
    		"Daugiakampis pasirinkimas",
    		"Kelionės laikas pasirinkimo",
    		"Rodyti plotas",
    		"eismas",
    		"Įtraukti eismo apskaičiavimo",
    		"Palikite bent",
    		"Palikite bent dieną",
    		"Palikite metu",
    		"atrankos būdai",
    		"Pasirinkite režimą",
    		"Toggle Venkite galimybės",
    		"Klaida prašančioji maršrutas diapazonas daugiakampis."
    	],
    	ms: [
    		"Data kawalan pilihan",
    		"Route berkisar kawalan. Pilih lokasi asal dengan menyeret penanda dengan tetikus atau kekunci anak panah.",
    		"Togol pilihan trak dimensi",
    		"dimensi trak",
    		"Togol pilihan jenis beban",
    		"Mod perjalanan",
    		"Kawasan pilihan",
    		"Jarak",
    		"Unit panjang",
    		"Negara",
    		"tinggi",
    		"lebar",
    		"berat gandar",
    		"Kereta",
    		"Trak",
    		"Pejalan kaki",
    		"Basikal",
    		"Seret penanda untuk pilih lokasi asal",
    		"Masa",
    		"Masa perjalanan (minit)",
    		"Unit jarak",
    		"Meter",
    		"Batu",
    		"Kilometer",
    		"Yards",
    		"Kaki",
    		"Unit berat badan",
    		"Kilogram",
    		"Tan panjang",
    		"Tan metrik",
    		"Pounds",
    		"Tan pendek",
    		"Jenis beban",
    		"Elakkan",
    		"cari",
    		"Batal",
    		"Lintasan sempadan",
    		"Perkongsian kereta",
    		"Feri",
    		"Lebuh raya",
    		"Jalan bertol",
    		"Jalan yang tidak berturap",
    		"Berbahaya kepada air",
    		"Pelbagai",
    		"Pengoksida",
    		"Racun",
    		"Radioaktif",
    		"Gas termampat",
    		"Bahan menghakis",
    		"Bahan letupan",
    		"Cecair mudah terbakar",
    		"Pepejal mudah terbakar",
    		"Pilihan circle",
    		"Pilihan segi empat tepat",
    		"Pilihan polygon",
    		"Pilihan masa perjalanan",
    		"Persembahan kawasan",
    		"Traffic",
    		"Termasuk trafik dalam pengiraan",
    		"biarkan sekurang",
    		"Meninggalkan pada tarikh",
    		"Meninggalkan pada masa",
    		"mod pilihan",
    		"pilih mod",
    		"pilihan mengelakkan togol",
    		"Ralat meminta pelbagai laluan poligon."
    	],
    	nb: [
    		"Data utvalg kontroll",
    		"Rute områdekontroll. Velg opprinnelse plassering ved å dra markøren med musen eller piltastene.",
    		"Toggle lastebil dimensjon alternativer",
    		"lastebil dimensjoner",
    		"Toggle belastning typealternativer",
    		"Reisemodus",
    		"Merket område",
    		"Avstand",
    		"Lengdeenheter",
    		"Lengde",
    		"Høyde",
    		"Bredde",
    		"aksellast",
    		"Bil",
    		"Lastebil",
    		"Fotgjenger",
    		"Sykkel",
    		"Dra markøren for å velge opprinnelse plassering",
    		"Tid",
    		"Reisetid (minutter)",
    		"Avstandsenheter",
    		"Meter",
    		"Miles",
    		"Kilometer",
    		"Yards",
    		"Feet",
    		"Vekt enheter",
    		"Kilo",
    		"Long ton",
    		"Metrisk tonn",
    		"Pounds",
    		"Kort ton",
    		"Lasttypen",
    		"Unngå",
    		"Søk",
    		"Avbryt",
    		"Grenseoverganger",
    		"Carpools",
    		"Ferger",
    		"Motorveier",
    		"Bomveier",
    		"Grusveier",
    		"Skadelig for vann",
    		"Diverse",
    		"Oksidanter",
    		"Gift",
    		"Radioaktivt",
    		"Komprimert gass",
    		"Korrosjon",
    		"Sprengstoff",
    		"Brennbare væsker",
    		"Brannfarlige faste stoffer",
    		"Circle utvalg",
    		"Rektangel utvalg",
    		"Polygon utvalg",
    		"Reisetid utvalg",
    		"Vis område",
    		"Trafikk",
    		"Inkluder trafikk i beregningen",
    		"La det",
    		"La det være dato",
    		"La det være tid",
    		"valgmodus",
    		"Velg modus",
    		"Toggle Unngå alternativer",
    		"Feil ber om ruteområde polygon."
    	],
    	pl: [
    		"kontrola selekcji danych",
    		"wynosić droga sterowania. Wybierz lokalizację pochodzenia przeciągając znacznik z myszy lub klawiszy strzałek.",
    		"Przegubowe opcje wymiarowe ciężarówka",
    		"wymiary pojazdów ciężarowych",
    		"Opcje typu obciążenia przerzutowe",
    		"Tryb podróży",
    		"Obszar wyboru",
    		"Dystans",
    		"Jednostki długości",
    		"Długość",
    		"Wysokość",
    		"Szerokość",
    		"nacisk na oś",
    		"Samochód",
    		"Samochód ciężarowy",
    		"Pieszy",
    		"Rower",
    		"Przeciągnij znacznik do wybranej lokalizacji pochodzenia",
    		"Czas",
    		"Czas podróży (minuty)",
    		"Jednostki odległości",
    		"Metrów",
    		"Miles",
    		"Kilometry",
    		"Stocznie",
    		"Stopy",
    		"Jednostki wagowe",
    		"Kilogramy",
    		"Długi ton",
    		"Tonę",
    		"Funtów",
    		"Tona",
    		"Typ obciążenia",
    		"Uniknąć",
    		"Szukaj",
    		"Anuluj",
    		"Przejścia graniczne",
    		"Carpools",
    		"Promy",
    		"Autostrady",
    		"Płatne drogi",
    		"Drogi gruntowe",
    		"Szkodliwy dla wody",
    		"Różne",
    		"Utleniacze",
    		"Trucizny",
    		"Radioaktywny",
    		"Sprężony gaz",
    		"Korozyjne",
    		"Materiały wybuchowe",
    		"Łatwopalne ciecze",
    		"Palne substancje stałe",
    		"Wybór krąg",
    		"Wybór prostokąt",
    		"Wybór wielokąt",
    		"Wybór czasu podróży",
    		"Pokaż obszar",
    		"ruch drogowy",
    		"Obejmują ruch w obliczeniach",
    		"pozostawić na",
    		"Pozostawić na bieżąco",
    		"Pozostawić na czas",
    		"tryby wyboru",
    		"Wybierz tryb",
    		"opcje Unikaj przerzutowe",
    		"Błąd zainteresowanie zakres trasa wielokąt."
    	],
    	pt: [
    		"de comando de selecção de dados",
    		"Route variam controle. Seleccione a localização origem arrastando marcador com o mouse ou as setas.",
    		"Alternar opções de dimensão caminhão",
    		"dimensões caminhão",
    		"opções de tipo de carga de alternância",
    		"Modo de viagem",
    		"Área de seleção",
    		"Distância",
    		"Unidades de comprimento",
    		"comprimento",
    		"Altura",
    		"Largura",
    		"peso por eixo",
    		"Carro",
    		"Caminhão",
    		"Pedestre",
    		"Bicicleta",
    		"Arraste marcador para selecionar o local de origem",
    		"Tempo",
    		"O tempo de viagem (minutos)",
    		"Unidades de distância",
    		"Metros",
    		"Miles",
    		"Quilômetros",
    		"Yards",
    		"Pés",
    		"Unidades de peso",
    		"Quilogramas",
    		"Tonelada longa",
    		"Tonelada metrica",
    		"Libras",
    		"Tonelada curta",
    		"Tipo de carga",
    		"Evitar",
    		"Procurar",
    		"Cancelar",
    		"Postos de fronteira",
    		"Carpools",
    		"Ferries",
    		"Auto-estradas",
    		"Rodovias com pedágio",
    		"Ruas não pavimentadas",
    		"Prejudicial à água",
    		"Diversos",
    		"Oxidantes",
    		"Venenos",
    		"Radioativo",
    		"Gás comprimido",
    		"Corrosivos",
    		"Explosivos",
    		"Líquidos inflamáveis",
    		"Sólidos inflamáveis",
    		"Selecção círculo",
    		"Seleção retângulo",
    		"Seleção polígono",
    		"Seleção tempo de viagem",
    		"Mostrar área",
    		"Tráfego",
    		"Incluem o tráfego no cálculo",
    		"Deixe pelo",
    		"Deixar a data",
    		"Deixe pelo tempo",
    		"modos de seleção",
    		"Modo de seleção",
    		"opções Evitar alternância",
    		"Erro solicitando gama rota polígono."
    	],
    	ro: [
    		"Controlul de selectare a datelor",
    		"Route gama de control. Selectați origine locația trăgând marcatorul cu mouse-ul sau tastele săgeată.",
    		"Toggle opțiuni de dimensiune camion",
    		"dimensiuni camioane",
    		"Opțiunile privind tipul de sarcină Toggle",
    		"Mod de călătorie",
    		"Zona de selecție",
    		"Distanţă",
    		"Unități lungime",
    		"Lungime",
    		"Înălţime",
    		"Lăţime",
    		"greutatea pe osie",
    		"Mașină",
    		"Camion",
    		"Pieton",
    		"Bicicletă",
    		"glisați marcatorul pentru a selecta originea locație",
    		"Timp",
    		"Durata călătoriei (minute)",
    		"Unități de distanță",
    		"Contoare",
    		"Miles",
    		"Kilometri",
    		"Yards",
    		"Picioare",
    		"Unități de greutate",
    		"Kilograme",
    		"Tonă engleză",
    		"Tonă metrică",
    		"Lire",
    		"Tona scurt",
    		"Tipul de încărcare",
    		"Evita",
    		"Căutare",
    		"Anulare",
    		"Trecerile la frontieră",
    		"Carpools",
    		"Feriboturile",
    		"Autostrăzi",
    		"Drumurile cu taxă",
    		"Drumuri nepavate",
    		"Nociv pentru apa",
    		"Diverse",
    		"Oxidanţi",
    		"Otrăvurile",
    		"Radioactiv",
    		"Gaz comprimat",
    		"Corozivi",
    		"Explozivi",
    		"Lichide inflamabile",
    		"Solide inflamabile",
    		"Cercul de selecție",
    		"Selecție dreptunghi",
    		"Selecție poligon",
    		"Selecția timpului de călătorie",
    		"Afișați zona",
    		"Trafic",
    		"Includeți traficul în calcul",
    		"Pleacă la",
    		"Se lasă la data",
    		"Se lasă la timp",
    		"moduri de selecție",
    		"Selectați modul",
    		"opțiuni Evitați Toggle",
    		"Eroare la solicitarea gama de traseu poligon."
    	],
    	ru: [
    		"Контроль выбора данных",
    		"Маршрут диапазон регулирования. Выберите местоположение происхождения путем перетаскивания маркера с помощью мыши или клавиши со стрелками.",
    		"Переключение вариантов измерения грузовика",
    		"размеры грузовых автомобилей",
    		"Параметры типа нагрузки Переключение",
    		"Режим путешествия",
    		"Область выбора",
    		"Расстояние",
    		"Длина блоков",
    		"длина",
    		"Рост",
    		"Ширина",
    		"вес мост",
    		"Машина",
    		"Грузовая машина",
    		"Пешеход",
    		"Велосипед",
    		"Перетащите маркер выбора места происхождения",
    		"Время",
    		"Время в пути (мин)",
    		"Ед.измер.расст",
    		"Метры",
    		"Миль",
    		"Километров",
    		"Ярды",
    		"Ноги",
    		"Вес единицы",
    		"Килограммы",
    		"Длинная тонна",
    		"Метрическая тонна",
    		"Фунты",
    		"Короткая тонна",
    		"Тип нагрузки",
    		"Избегайте",
    		"Поиск",
    		"Отмена",
    		"Пограничные переходы",
    		"Совместное использование автомобиля",
    		"Паромы",
    		"Магистрали",
    		"Платные дороги",
    		"Грунтовые дороги",
    		"Вредный для воды",
    		"Разное",
    		"Окислители",
    		"Яды",
    		"Радиоактивное",
    		"Сжатый газ",
    		"Едкие",
    		"Взрывчатые вещества",
    		"Огнеопасные жидкости",
    		"Легковоспламеняющиеся твердые вещества",
    		"Выбор круг",
    		"Выбор прямоугольник",
    		"Выбор polygon",
    		"Выбор времени для путешествий",
    		"Показать область",
    		"Трафик",
    		"Включите трафик в расчете",
    		"Оставить на",
    		"Оставьте на день",
    		"Оставьте на время",
    		"режимы выбора",
    		"Выбор режима работы",
    		"Варианты остерегайтесь Переключить",
    		"Ошибка запроса диапазона маршрута многоугольник."
    	],
    	sr: [
    		"Подаци контрола избор",
    		"Роуте распону контролу. Селецт порекла локацију превлачењем маркера помоћу миша или стрелица.",
    		"Тоггле камион димензија опције",
    		"Труцк димензије",
    		"Тоггле тип оптерећење опције",
    		"Režim путовања",
    		"Izbor површина",
    		"Раздаљина",
    		"Dužina јединица",
    		"дужина",
    		"висина",
    		"ширина",
    		"оптерећење",
    		"Ауто",
    		"Камион",
    		"Пешак",
    		"Бицикл",
    		"Драг маркер који изаберите порекла локација",
    		"Време",
    		"Време путовања (минута)",
    		"Удаљеност јединице",
    		"Метара",
    		"Миља",
    		"Километара",
    		"Метара",
    		"Стопала",
    		"Тежина јединице",
    		"Килограми",
    		"Метричка тона",
    		"Метричка тона",
    		"Поундс",
    		"Кратко тона",
    		"Тип лоад",
    		"Избегавајте",
    		"Претрага",
    		"Поништити, отказати",
    		"Granični прелази",
    		"Царпоолс",
    		"Трајекти",
    		"Autoputevi",
    		"Путеве са путарином",
    		"Makadami",
    		"Штетан по води",
    		"Остало",
    		"Оксидатори",
    		"Otrovi",
    		"Радиоактиван",
    		"Компримовани гас",
    		"Корозивне",
    		"Eksploziv",
    		"Запаљиве течности",
    		"Запаљиве материје",
    		"Круг избора",
    		"Правоугаоник избор",
    		"Полигон избор",
    		"Време путовања избор",
    		"Схов област",
    		"Саобраћај",
    		"Укључују саобраћај у обрачун",
    		"Оставите у",
    		"Оставите на дан",
    		"Оставите у време",
    		"Селецтион режими",
    		"izaberite режим",
    		"Тоггле Избегавајте опције",
    		"Еррор тражи опсег пут полигон."
    	],
    	sk: [
    		"Ovládanie výber dát",
    		"Trasa rozsah kontroly. Nájdenie pôvodu ťahaním značky s myšou alebo šípkami.",
    		"Toggle možnosti rozmer truck",
    		"rozmery návesovej",
    		"možnosti typu zaťaženia Toggle",
    		"Režim cesty",
    		"Voľba area",
    		"Vzdialenosť",
    		"Dĺžkových jednotiek",
    		"dĺžka",
    		"výška",
    		"šírka",
    		"zaťaženie nápravy",
    		"Auto",
    		"Nákladné auto",
    		"Pešej",
    		"Bicykel",
    		"Presunutím značky vyberte miesto pôvodu",
    		"Čas",
    		"Cestovný čas (minúty)",
    		"Vzdialenosť jednotky",
    		"Metrov",
    		"Miles",
    		"Kilometre",
    		"Yards",
    		"Nohy",
    		"Jednotky hmotnosti",
    		"Kilogramov",
    		"Dlhá tona",
    		"Metrická tona",
    		"Libier",
    		"Krátka tona",
    		"Typ záťaže",
    		"Vyhnite",
    		"Vyhľadávanie",
    		"Zrušiť",
    		"Hraničné priechody",
    		"Carpools",
    		"Trajekty",
    		"Diaľnic",
    		"Spoplatnené cesty",
    		"Nespevnené cesty",
    		"Škodlivá pre vodu",
    		"Zmiešaný",
    		"Oxidizers",
    		"Jedy",
    		"Rádioaktívne",
    		"Stlačený plyn",
    		"Žieraviny",
    		"Výbušniny",
    		"Horľavé kvapaliny",
    		"Horľavé tuhé látky",
    		"Voľba circle",
    		"Obdĺžnik výberu",
    		"Voľba polygón",
    		"Voľba cesty",
    		"Show area",
    		"prevádzka",
    		"Zahrnúť prevádzku vo výpočte",
    		"odísť",
    		"nechať dátume",
    		"Zanechať v čase",
    		"režimy pre výber",
    		"Vyberte režim",
    		"možnosti Toggle Vyhnite",
    		"Chyba pri vyžiadanie rozsah trasa polygónu."
    	],
    	sl: [
    		"Nadzor izbor podatkov",
    		"Pot segajo nadzor. Izberite lokacijo izvora z vlečenjem marker z miško ali puščicami.",
    		"Preklop možnosti tovornjak razsežnosti",
    		"mere za tovorna vozila",
    		"Preklop možnosti tipa obremenitve",
    		"Način potovanja",
    		"Izbira območje",
    		"Razdalja",
    		"Dolžina enote",
    		"dolžina",
    		"Višina",
    		"Premer",
    		"osna obremenitev",
    		"Avto",
    		"Truck",
    		"Pešec",
    		"Koles",
    		"Povlecite marker izberite lokacijo izvora",
    		"Čas",
    		"Potovalni čas (min)",
    		"Enote razdalje",
    		"Metrov",
    		"Milje",
    		"Kilometri",
    		"Yards",
    		"Feet",
    		"Teža enote",
    		"Kilogramov",
    		"Dolga ton",
    		"Tona",
    		"Funtov",
    		"Kratek ton",
    		"Tip bremena",
    		"Izogibajte",
    		"Iskanje",
    		"Preklic",
    		"Mejni prehodi",
    		"Carpools",
    		"Trajekti",
    		"Avtoceste",
    		"Cestninskih cest",
    		"Neasfaltirane ceste",
    		"Škodljiva za vodo",
    		"Ostalo",
    		"Oksidante",
    		"Strupi",
    		"Radioaktivni",
    		"Stisnjen plin",
    		"Jedkih",
    		"Eksplozivi",
    		"Vnetljive tekočine",
    		"Vnetljive trdne snovi",
    		"Izbor krog",
    		"Izbor pravokotnik",
    		"Izbor poligon",
    		"Travel izbor čas",
    		"Pokaži območje",
    		"Traffic",
    		"Vključi prometa v izračun",
    		"pustite",
    		"Pustite na dan",
    		"Pustite času",
    		"načini za izbor",
    		"Izbira načina",
    		"Preklop možnosti odsesavanje",
    		"Napaka zahteva območje pot poligon."
    	],
    	sv: [
    		"Data val kontroll",
    		"Rutt varierar kontroll. Välj ursprung plats genom att dra markören med musen eller piltangenterna.",
    		"Växla lastbil dimension alternativ",
    		"lastbils dimensioner",
    		"Växla alternativ last typ",
    		"Färdmedel",
    		"Markerat område",
    		"Distans",
    		"Längdenheter",
    		"Längd",
    		"Höjd",
    		"Bredd",
    		"axeltryck",
    		"Bil",
    		"Lastbil",
    		"Fotgängare",
    		"Cykel",
    		"Dra markör väljer du ursprung plats",
    		"Tid",
    		"Restid (minuter)",
    		"Avståndsenheter",
    		"Meter",
    		"Miles",
    		"Kilometer",
    		"Yards",
    		"Fötter",
    		"Vikt heter",
    		"Kilogram",
    		"Lång ton",
    		"Metriskt ton",
    		"Pounds",
    		"Short ton",
    		"Lasttyp",
    		"Undvika",
    		"Sök",
    		"Annullera",
    		"Gränsövergångar",
    		"Samåkning",
    		"Färjor",
    		"Motorvägar",
    		"Vägtullar",
    		"Oasfalterade vägar",
    		"Skadliga för vatten",
    		"Diverse",
    		"Oxidationsmedel",
    		"Gifter",
    		"Radioaktiv",
    		"Komprimerad gas",
    		"Frätande",
    		"Explosiva varor",
    		"Brandfarliga vätskor",
    		"Brandfarliga fasta ämnen",
    		"Circle val",
    		"Rektangel val",
    		"Polygon val",
    		"Restid val",
    		"Visa area",
    		"Trafik",
    		"Inkludera trafiken i beräkning",
    		"Lämna vid",
    		"Lämna betalning",
    		"Lämna vid tiden",
    		"urval lägen",
    		"Välj läge",
    		"Växla Undvik alternativ",
    		"Fel begära ruttområde polygon."
    	],
    	th: [
    		"การควบคุมตัวเลือกข้อมูล",
    		"เส้นทางการควบคุมช่วง เลือกสถานที่กำเนิดโดยการลากเครื่องหมายด้วยเมาส์หรือปุ่มลูกศร",
    		"สลับตัวเลือกรถบรรทุกมิติ",
    		"ขนาดรถบรรทุก",
    		"สลับตัวเลือกชนิดการโหลด",
    		"โหมดการเดินทาง",
    		"การเลือกพื้นที่",
    		"ระยะทาง",
    		"หน่วยความยาว",
    		"ความยาว",
    		"ความสูง",
    		"ความกว้าง",
    		"น้ำหนัก Axle",
    		"รถยนต์",
    		"รถบรรทุก",
    		"คนเดินเท้า",
    		"รถจักรยาน",
    		"ลากเครื่องหมายไปยังสถานที่กำเนิดเลือก",
    		"เวลา",
    		"ใช้เวลาเดินทาง (นาที)",
    		"หน่วยระยะทาง",
    		"เมตร",
    		"ไมล์",
    		"กิโลเมตร",
    		"หลา",
    		"ฟุต",
    		"หน่วยน้ำหนัก",
    		"กิโลกรัม",
    		"ตันยาว",
    		"เมตริกตัน",
    		"ปอนด์",
    		"ตันสั้น",
    		"ประเภทการโหลด",
    		"หลีกเลี่ยงการ",
    		"ค้นหา",
    		"ยกเลิก",
    		"ข้ามพรมแดน",
    		"Carpools",
    		"เรือข้ามฟาก",
    		"มอเตอร์เวย์",
    		"ถนนโทร",
    		"ถนนลูกรัง",
    		"ที่เป็นอันตรายลงไปในน้ำ",
    		"เบ็ดเตล็ด",
    		"ออกซิไดเซอร์",
    		"สารพิษ",
    		"กัมมันตรังสี",
    		"บีบอัดก๊าซ",
    		"กัดกร่อน",
    		"วัตถุระเบิด",
    		"ของเหลวไวไฟ",
    		"ของแข็งไวไฟ",
    		"เลือกวงกลม",
    		"เลือกสี่เหลี่ยมผืนผ้า",
    		"เลือกรูปหลายเหลี่ยม",
    		"เลือกเวลาในการเดินทาง",
    		"แสดงพื้นที่",
    		"การจราจร",
    		"รวมถึงการจราจรในการคำนวณ",
    		"ออกจากที่",
    		"ณ วันที่ฝาก",
    		"ทิ้งไว้ตลอดเวลา",
    		"โหมดการเลือก",
    		"เลือกโหมด",
    		"ตัวเลือกการหลีกเลี่ยงการสลับ",
    		"เกิดข้อผิดพลาดขอรูปหลายเหลี่ยมช่วงเส้นทาง"
    	],
    	tr: [
    		"Veri seçim kontrolü",
    		"Rota kontrolünü değişir. Fare ile işaretleyici sürükleyerek kökenli konumu seçin veya ok tuşlarını kullanın.",
    		"Geçiş kamyon boyut seçenekleri",
    		"Araç boyutları",
    		"Geçiş yük tipi seçenekleri",
    		"Seyahat modu",
    		"Seçim bölgesi",
    		"Mesafe",
    		"Uzunluk birimleri",
    		"uzunluk",
    		"Yükseklik",
    		"Genişlik",
    		"Dingil ağırlığı",
    		"Araba",
    		"Kamyon",
    		"Yaya",
    		"Bisiklet",
    		"seçme kökenli konuma sürükleyin işaretleyici",
    		"Zaman",
    		"Seyahat süresi (dakika)",
    		"Uzaklık birimleri",
    		"Metre",
    		"Miles",
    		"Kilometre",
    		"Yards",
    		"Ayaklar",
    		"Ağırlık birimleri",
    		"Kilogram",
    		"Uzun ton",
    		"Ton",
    		"Pound",
    		"Kısa ton",
    		"Yük tipi",
    		"Önlemek",
    		"Arama",
    		"İptal etmek",
    		"Sınır geçişleri",
    		"Ortak araba",
    		"Feribot",
    		"Otoyolları",
    		"Paralı yollar",
    		"Asfaltsız yollar",
    		"Suya zararlı",
    		"Çeşitli",
    		"Oksidanlar",
    		"Zehirler",
    		"Radyoaktif",
    		"Sıkıştırılmış gaz",
    		"Korozivler",
    		"Patlayıcılar",
    		"Yanıcı sıvılar",
    		"Yanıcı katılar",
    		"Çember seçim",
    		"Dikdörtgen seçimi",
    		"Poligon seçimi",
    		"Seyahat süresi seçimi",
    		"Göster alanı",
    		"Trafik",
    		"Hesaplamada trafiği dahil",
    		"en bırakın",
    		"tarihte bırakın",
    		"anda bırakın",
    		"Seçim modları",
    		"Mod seç",
    		"Geçiş önlemek seçenekleri",
    		"Rota aralığı çokgen talep hata."
    	],
    	uk: [
    		"Контроль вибору даних",
    		"Маршрут діапазон регулювання. Виберіть місце розташування походження шляхом перетягування маркера за допомогою миші або клавіші зі стрілками.",
    		"Перемикання варіантів вимірювання вантажівки",
    		"розміри вантажних автомобілів",
    		"Параметри типу навантаження Перемикання",
    		"Режим подорожі",
    		"Область вибору",
    		"Відстань",
    		"Довжина блоків",
    		"довжина",
    		"висота",
    		"ширина",
    		"вага міст",
    		"Автомобіль",
    		"Вантажівка",
    		"Пішохід",
    		"Велосипед",
    		"Перетягніть маркер вибору місця походження",
    		"Час",
    		"Час в дорозі (хв)",
    		"Ед.ізмер.расст",
    		"Метри",
    		"Миль",
    		"Кілометрів",
    		"Ярди",
    		"Ноги",
    		"Вага одиниці",
    		"Кілограми",
    		"Довга тонна",
    		"Метрична тонна",
    		"Фунти",
    		"Коротка тонна",
    		"Тип навантаження",
    		"Уникайте",
    		"Пошук",
    		"Скасувати",
    		"Прикордонні переходи",
    		"Спільне використання автомобіля",
    		"Пороми",
    		"Магістралі",
    		"Платні дороги",
    		"Грунтові дороги",
    		"Шкідливий для води",
    		"Різне",
    		"Окислювачі",
    		"Отрути",
    		"Радіоактивне",
    		"Стиснутий газ",
    		"Їдкі",
    		"Вибухові речовини",
    		"Горючі рідини",
    		"Легкозаймисті тверді речовини",
    		"Вибір коло",
    		"Вибір прямокутник",
    		"Вибір polygon",
    		"Вибір часу для подорожей",
    		"Показати область",
    		"трафік",
    		"Увімкніть трафік в розрахунку",
    		"Залиште",
    		"Залиште на день",
    		"Залиште на час",
    		"режими вибору",
    		"Вибір режиму роботи",
    		"Варіанти остерігайтеся Переключити",
    		"Помилка запиту діапазону маршруту багатокутник."
    	],
    	vi: [
    		"kiểm soát lựa chọn dữ liệu",
    		"Route dao động kiểm soát. Chọn vị trí gốc bằng cách kéo điểm đánh dấu bằng chuột hoặc phím mũi tên.",
    		"Chuyển đổi tùy chọn chiều xe tải",
    		"kích thước xe tải",
    		"Chuyển đổi kiểu tùy chọn tải",
    		"Chế độ du lịch",
    		"Khu vực lựa chọn",
    		"Khoảng cách",
    		"Đơn vị chiều dài",
    		"Chiều dài",
    		"Chiều cao",
    		"Chiều rộng",
    		"Trọng lượng trục",
    		"Xe hơi",
    		"Xe tải",
    		"Người đi bộ",
    		"Xe đạp",
    		"Kéo điểm đánh dấu để chọn vị trí gốc",
    		"Thời gian",
    		"Thời gian đi lại (phút)",
    		"Đơn vị khoảng cách",
    		"Mét",
    		"Miles",
    		"Km",
    		"Yards",
    		"Đôi chân",
    		"Đơn vị trọng lượng",
    		"Kg",
    		"Dài lâu",
    		"Tấn",
    		"Bảng",
    		"Tấn ngắn",
    		"Loại tải",
    		"Tránh",
    		"Tìm kiếm",
    		"Hủy bỏ",
    		"Đường biên giới",
    		"Carpool",
    		"Phà",
    		"Đường cao tốc",
    		"Đường toll",
    		"Con đường không trải nhựa",
    		"Có hại cho nước",
    		"Điều khoản khác",
    		"Oxi hóa",
    		"Độc",
    		"Phóng xạ",
    		"Khí nén",
    		"Các chất ăn mòn",
    		"Chất nổ",
    		"Chất lỏng dễ cháy",
    		"Chất rắn dễ cháy",
    		"Vòng tròn lựa chọn",
    		"Lựa chọn hình chữ nhật",
    		"Lựa chọn polygon",
    		"Lựa chọn thời gian đi lại",
    		"Hiện khu vực",
    		"Giao thông",
    		"Bao gồm giao thông trong tính toán",
    		"Để lại tại",
    		"Để lại vào ngày",
    		"Rời khỏi lúc",
    		"chế độ lựa chọn",
    		"Chọn chế độ",
    		"lựa chọn tránh Toggle",
    		"Lỗi yêu cầu phạm vi tuyến đường đa giác."
    	]
    };

    var Localization = /** @class */ (function () {
        function Localization() {
        }
        /**
         * Retrieves localization resources for a specified language.
         * @param language The language to get resources for.
         */
        Localization.getResource = function (language) {
            var self = this;
            if (language) {
                language = language.toLowerCase();
                if (language.indexOf('-') > 0) {
                    language = language.substring(0, language.indexOf('-'));
                }
            }
            else {
                language = 'en';
            }
            if (!self._resxCache) {
                self._resxCache = {};
            }
            var loadedLanguages = Object.keys(self._resxCache);
            var supportedLanguages = Object.keys(langs);
            if (loadedLanguages.indexOf(language) === -1) {
                //Language isn't loaded yet. Check if it is supported, if not default to english.
                if (supportedLanguages.indexOf(language) === -1) {
                    language = 'en';
                }
                //Check that the language is loaded, if not, load it.
                if (loadedLanguages.indexOf(language) === -1) {
                    //@ts-ignore
                    var r_1 = {};
                    keys.forEach(function (k, i) {
                        r_1[k] = langs[language][i];
                    });
                    //Cache the language resources.
                    self._resxCache[language] = r_1;
                }
            }
            return self._resxCache[language];
        };
        return Localization;
    }());

    /** A class that manages the style of a control. Add's 'light' or 'dark' as a CSS class to the container. */
    var ControlStyler = /** @class */ (function () {
        /****************************
         * Constructor
         ***************************/
        /**
         * A class that manages the style of a control. Add's 'light' or 'dark' as a CSS class to the container.
         */
        function ControlStyler(container, map, style) {
            var _this = this;
            /**
             * A callback for when the map's style changes.
             * Used for auto styling.
             */
            this._onStyleChange = function () {
                if (_this._map.getStyle().style.toLowerCase().startsWith('blank')) {
                    // If the style is blank the div background should decide the theme.
                    if (!_this._observer) {
                        // Add an observer to see changes to the background.
                        _this._onBackgroundChange();
                        _this._observer = new MutationObserver(_this._onBackgroundChange);
                        _this._observer.observe(_this._map.getMapContainer(), { attributes: true, attributeFilter: ['style'] });
                    }
                }
                else {
                    if (_this._observer) {
                        // Remove any existing observer for non-blank styles.
                        _this._observer.disconnect();
                        delete _this._observer;
                    }
                    // If the style is anything but blank the style definition should decide the theme.
                    //When the style is dark (i.e. satellite, night), show the dark colored theme.
                    var theme = 'light';
                    if (['satellite', 'satellite_road_labels', 'grayscale_dark', 'night'].indexOf(_this._map.getStyle().style) > -1) {
                        theme = 'dark';
                    }
                    _this._setTheme(theme);
                }
            };
            /**
             * A callback for when the map's
             */
            this._onBackgroundChange = function () {
                // Calculate the luminosity of the map div's background to determine the theme.
                try {
                    var bg = _this._map.getMapContainer().style.backgroundColor;
                    if (bg === '') {
                        _this._setTheme('light');
                    }
                    else {
                        //TODO: update to use built in color tools when available.
                        //Try to parse the color, by using a canvas.
                        //Use an offscreen canvas to convert the color value to RGB.
                        var canvas = Utils.createElm('canvas', {
                            style: {
                                width: '1px',
                                height: '1px',
                                position: 'absolute',
                                visibility: 'hidden'
                            }
                        });
                        var context_1 = canvas.getContext("2d");
                        context_1.beginPath();
                        context_1.rect(0, 0, 1, 1);
                        context_1.fillStyle = bg;
                        context_1.fill();
                        var imgData = context_1.getImageData(0, 0, 1, 1);
                        //rbga values for the element in the middle
                        var rgba = imgData.data.slice(0, 4);
                        //Convert the opacity to 0..1
                        rgba[3] = rgba[3] / 255.0;
                        //Calculate brightness: http://alienryderflex.com/hsp.html
                        var brightness = Math.sqrt(.299 * rgba[0] * rgba[0] + .587 * rgba[1] * rgba[1] + .114 * rgba[2] * rgba[2]);
                        //If brightness is greater than 127 on a 256 scale, it is bright.
                        var theme = brightness > 127 ? 'light' : 'dark';
                        _this._setTheme(theme);
                    }
                }
                catch (_a) {
                    // If the background color can't be parsed assume it is light.
                    _this._setTheme('light');
                }
            };
            this._container = container;
            this._map = map;
            this._style = style;
            // Set the style or add the auto listener.
            if (style.toLowerCase() === azmaps.ControlStyle.auto) {
                this._onStyleChange();
                this._map.events.add('styledata', this._onStyleChange);
            }
            else {
                container.classList.add(style);
            }
        }
        /****************************
         * Public Methods
         ***************************/
        /**
         * Disposes this resource
         */
        ControlStyler.prototype.dispose = function () {
            var _this = this;
            if (this._container) {
                this._container = null;
            }
            this.updateMap(null);
            Object.keys(this).forEach(function (k) {
                _this[k] = null;
            });
        };
        /**
         * Updates the map reference.
         * @param map The new map reference.
         */
        ControlStyler.prototype.updateMap = function (map) {
            if (this._map && this._style === azmaps.ControlStyle.auto) {
                this._map.events.remove('styledata', this._onStyleChange);
            }
            this._map = map;
            if (map && this._style === azmaps.ControlStyle.auto) {
                map.events.add('styledata', this._onStyleChange);
            }
        };
        /****************************
         * Private Methods
         ***************************/
        /**
         * Sets the control's theme (light/dark).
         * Only applies changes if the theme is different than the previous.
         */
        ControlStyler.prototype._setTheme = function (theme) {
            // Only update if the theme is different.
            if (this._theme !== theme) {
                this._container.classList.remove(this._theme);
                this._container.classList.add(theme);
                this._theme = theme;
            }
        };
        return ControlStyler;
    }());

    /**
     * A simple binding class that adds one-way binding to HTMLElements to a JSON object.
     */
    var SimpleBinding = /** @class */ (function () {
        /**
         * Adds one-way binding to HTMLElements to a JSON object.
         * @param target The target object to bind to.
         */
        function SimpleBinding(target) {
            this._events = {}; //event = { elm, callback };
            this._target = target;
        }
        /**
         * Disposes the bindings and frees the resources.
         */
        SimpleBinding.prototype.dispose = function () {
            var self = this;
            var e = self._events;
            //Event names
            var events = Object.keys(self._events);
            events.forEach(function (n) {
                events[n].elm.removeEventListener(n, events[n].callack);
            });
            self._events = null;
            self._target = null;
        };
        /**
         * Binds ane element value to propery value in the object.
         * @param elm Element to bind to.
         * @param propName The property name to add the values to in the target object.
         * @param isCheckboxArray Specifies if the element is part of a group of checkbox inputs that should be grouped into a single property as an array of values.
         * @param onchange A callback function to trigger when a change occurs.
         */
        SimpleBinding.prototype.bind = function (elm, propName, isCheckboxArray, onchange) {
            var self = this;
            if (elm) {
                self.addEvent(elm, 'onchange', function () {
                    //@ts-ignore
                    var val = elm.value;
                    var e = elm;
                    if (elm.tagName === 'LABEL') {
                        e = elm.firstChild;
                    }
                    if (e.tagName === 'INPUT') {
                        var input = e;
                        switch (input.type) {
                            case 'number':
                                val = parseFloat(val);
                                break;
                            case 'checkbox':
                                if (isCheckboxArray) {
                                    var items = self._target[propName];
                                    if (!items) {
                                        items = [];
                                    }
                                    var idx = items.indexOf(input.value);
                                    if (input.checked && idx === -1) {
                                        items.push(input.value);
                                    }
                                    else if (!input.checked && idx > -1) {
                                        items = items.splice(idx, 1);
                                    }
                                    val = items;
                                }
                                else {
                                    val = input.checked;
                                }
                                break;
                        }
                    }
                    self._target[propName] = val;
                    if (onchange) {
                        onchange(val);
                    }
                });
                elm.onchange(new Event('onchange'));
            }
            return self;
        };
        /**
         * Adds an event
         * @param elm
         * @param name
         * @param callback
         */
        SimpleBinding.prototype.addEvent = function (elm, name, callback) {
            if (elm && name && callback) {
                var e = this._events;
                if (!e[name]) {
                    e[name] = [];
                }
                e[name].push({
                    elm: elm,
                    callack: callback
                });
                elm.addEventListener(name, callback);
                elm[name] = callback;
            }
        };
        return SimpleBinding;
    }());

    /** A control that provides a form for requesting a route range polygon. Adds a marker to the map to select an origin location. */
    var RouteRangeControl = /** @class */ (function (_super) {
        __extends(RouteRangeControl, _super);
        /****************************
         * Constructor
         ***************************/
        /**
         * A control that provides a form for requesting a route range polygon. Adds a marker to the map to select an origin location.
         * @param options Options for defining how the control is rendered and functions.
         */
        function RouteRangeControl(options) {
            var _this = _super.call(this) || this;
            /****************************
             * Private Properties
             ***************************/
            /** Default options. */
            _this._options = {
                markerOptions: {
                    color: '#F2C811',
                    secondaryColor: '#011C2C',
                    htmlContent: '<svg xmlns="http://www.w3.org/2000/svg" style="cursor:move" width="28px" height="39px" viewBox="-1 -1 27 38"><path d="M12.25.25a12.254 12.254 0 0 0-12 12.494c0 6.444 6.488 12.109 11.059 22.564.549 1.256 1.333 1.256 1.882 0C17.762 24.853 24.25 19.186 24.25 12.744A12.254 12.254 0 0 0 12.25.25Z" style="fill:{color};stroke:{secondaryColor};stroke-width:2"/><g style="transform:scale(0.2);transform-origin: 13% 10%;"><path d="m50 38h-4v14c0 0 0 1 0 1l9 9 2-2-9-9v-13z" fill="{secondaryColor}" stroke="{secondaryColor}" stroke-width="2px"/><path d="m48 81c-15 0-28-12-28-28s12-28 28-28 28 12 28 28-12 28-28 28zm23-52 3-3c1-1 1-3-0-4-1-1-3-1-4-0l-3 3c-4-3-10-5-16-5v-4h9v-6h-24v6h9v4c-15 1-28 13-30 29s7 31 22 36 31-0 40-14 6-31-5-42z" fill="{secondaryColor}" stroke="{secondaryColor}" stroke-width="2px"/></g></svg>'
                },
                style: azmaps.ControlStyle.light,
                isVisible: true,
                position: 'left',
                collapsible: false,
                calculateOnMarkerMove: true
            };
            /** How long to delay a search after the marker has been moved using the keyboard. */
            _this._markerMoveSearchDelay = 600;
            /** How many pixels the marker will move for an arrow key press occurs on the top level route range container. */
            _this._arrowKeyOffset = 5;
            /** When map is small, this specifies how long the options should be hidden to give the user a chance to move the marker. */
            _this._showOptionsDelay = 0;
            /** Data bound settings used for requesting a route range polygon. */
            _this._settings = {};
            /****************************
             * Private Methods
             ***************************/
            /**
             * Callback function for when localization resources have loaded.
             * Create the content of the container.
             * @param resx The localization resource.
             */
            _this._createContainer = function (resx) {
                //Cache variables and function for better minification.        
                var self = _this;
                var css = RouteRangeControl._css;
                var createElm = Utils.createElm;
                //Create a binding to the settings object.
                var binding = new SimpleBinding(self._settings);
                self._binding = binding;
                //Create the main container.
                var container = Utils.createElm('div', {
                    class: ['azure-maps-control-container', RouteRangeControl._css.container],
                    style: {
                        display: (self._options.isVisible) ? '' : 'none'
                    },
                    attr: {
                        'aria-label': resx.routeRangeControl,
                        tabindex: '-1'
                    }
                });
                container.addEventListener('keydown', _this._onContainerKeyDown);
                self._container = container;
                //Create travelTime option.
                //<input type="number" value="15" min="1" max="1440">
                var travelTime = createElm('input', {
                    attr: {
                        type: 'number',
                        value: '15',
                        min: '1',
                        max: '1440'
                    },
                    propName: 'travelTime'
                }, resx, binding);
                var timeOptionRow = self._createOptionRow(resx.travelTime, travelTime);
                //Create distance options.
                /*
                    <input type="number" value="5" min="1" max="1000">
                    <select class="distanceUnits">
                        <option value="meters">Meters</option>
                        <option value="miles">Miles</option>
                        <option value="kilometers" selected>Kilometers</option>
                        <option value="yards">Yards</option>
                    </select>
                */
                var distance = createElm('input', {
                    attr: {
                        type: 'number',
                        value: '5',
                        min: '1',
                        max: '1000'
                    },
                    propName: 'distance'
                }, resx, binding);
                var distanceUnits = createElm('select', {
                    selectVals: ['meters', 'miles', 'kilometers', 'yards'],
                    selected: 'kilometers',
                    propName: 'distanceUnits'
                }, resx, binding);
                var distanceOptionRow = self._createOptionRow(resx.distance, [distance, distanceUnits]);
                //Create show area option.
                //<input type="checkbox" checked="checked"/>
                var showArea = createElm('input', {
                    attr: {
                        type: 'checkbox',
                        checked: 'checked'
                    },
                    propName: 'showArea'
                }, resx, binding);
                //Create traffic options.
                /*
                <div class="atlas-route-range-row traffic-option" style="display:none;">
                    <div class="atlas-route-range-col1">Leave at</div>
                    <div class="atlas-route-range-col2">
                        <input type="date">
                        <input type="time" step="300">
                    </div>
                </div>
                */
                var leaveAtDate = createElm('input', {
                    attr: {
                        type: 'date'
                    },
                    style: {
                        marginBottom: '3px'
                    },
                    propName: 'leaveAtDate'
                }, resx, binding);
                var leaveAtTime = createElm('input', {
                    attr: {
                        type: 'time',
                        step: '300'
                    },
                    propName: 'leaveAtTime'
                }, resx, binding);
                var trafficOption = self._createOptionRow(resx.leaveAt, [leaveAtDate, leaveAtTime]);
                trafficOption.style.display = 'none';
                var isDateTimeSupported = Utils.isDateTimeInputSupported();
                //Set the initial date/time to the current date/time to the next 5 minute round value.
                if (isDateTimeSupported) {
                    //Set the date and time pickers.
                    var d = new Date();
                    var hour = d.getHours();
                    var min = d.getMinutes();
                    //Round minutes to the next 5 minute.
                    min = Math.ceil(min / 5) * 5;
                    if (min === 60) {
                        hour++;
                        min = 0;
                    }
                    d = new Date(d.toDateString());
                    d = new Date(d.setHours(hour, min));
                    //Just in case the hours have increased into a new day.
                    hour = d.getHours();
                    self._settings.leaveAtDate = d.toISOString().split('T')[0];
                    leaveAtDate.value = self._settings.leaveAtDate;
                    leaveAtDate.setAttribute('min', self._settings.leaveAtDate);
                    var hh = ((hour < 10) ? '0' : '') + Utils.USNumberFormat(hour);
                    var mm = ((min < 10) ? '0' : '') + Utils.USNumberFormat(min);
                    self._settings.leaveAtTime = hh + ":" + mm;
                    leaveAtTime.value = self._settings.leaveAtTime;
                }
                //Create length options.
                /*
                <div class="atlas-route-range-row">
                    <div class="atlas-route-range-col1">Length</div>
                    <div class="atlas-route-range-col2">
                        <input type="number" min="0"/>
                        <select>
                            <option value="feet">Feet</option>
                            <option value="meters" selected>Meters</option>
                            <option value="yards">Yards</option>
                        </select>
                    </div>
                </div>
                */
                var length = createElm('input', {
                    attr: {
                        type: 'number',
                        min: '0'
                    },
                    propName: 'length'
                }, resx, binding);
                var lengthUnits = createElm('select', {
                    selectVals: ['feet', 'meters', 'yards'],
                    selected: 'meters',
                    propName: 'lengthUnits'
                }, resx, binding);
                var lengthRow = self._createOptionRow(resx.length, [length, lengthUnits], true);
                //Create height options.
                /*
                 <div class="atlas-route-range-row">
                    <div class="atlas-route-range-col1">Height</div>
                    <div class="atlas-route-range-col2">
                        <input type="number" min="0"/>
                    </div>
                </div>
                */
                var height = createElm('input', {
                    attr: {
                        type: 'number',
                        min: '0'
                    },
                    propName: 'height'
                }, resx, binding);
                var heightRow = self._createOptionRow(resx.height, height, true);
                //Create width options.
                /*
                 <div class="atlas-route-range-row">
                    <div class="atlas-route-range-col1">Width</div>
                    <div class="atlas-route-range-col2">
                        <input type="number" min="0"/>
                    </div>
                </div>
                */
                var width = createElm('input', {
                    attr: {
                        type: 'number',
                        min: '0'
                    },
                    propName: 'width'
                }, resx, binding);
                var widthRow = self._createOptionRow(resx.width, width, true);
                //Create weight options.
                /*
                <div class="atlas-route-range-row">
                    <div class="atlas-route-range-col1">Axle weight</div>
                    <div class="atlas-route-range-col2">
                        <input type="number" min="0"/>
                        <select>
                            <option value="kilograms" selected>Kilograms</option>
                            <option value="longTon">Long ton</option>
                            <option value="metricTon">Metric ton</option>
                            <option value="pounds">Pounds</option>
                            <option value="shortTon">Short ton</option>
                        </select>
                    </div>
                </div>
                */
                var axleWeight = createElm('input', {
                    attr: {
                        type: 'number',
                        min: '0'
                    },
                    propName: 'axleWeight'
                }, resx, binding);
                var weightUnits = createElm('select', {
                    selectVals: ['kilograms', 'longTon', 'metricTon', 'pounds', 'shortTon'],
                    selected: 'kilograms',
                    propName: 'weightUnits'
                }, resx, binding);
                var weightRow = self._createOptionRow(resx.axleWeight, [axleWeight, weightUnits], true);
                //Create toggle button for truck dimensions.
                /*
                <div class="atlas-route-range-row">
                    <div class="atlas-route-range-col1">
                        <button class="atlas-route-range-expand-btn" aria-expanded="false" aria-label="Toggle truck dimension options">Truck dimensions <span class="atlas-route-range-toggle-icon"></span></button>
                    </div>
                </div>
                */
                var truckDimensionsToggle = self._createToggleBtn(resx.truckDimensions, resx.truckDimensionsToggle, [
                    lengthRow, heightRow, widthRow, weightRow
                ]);
                //Create load type options.
                /*
                 /*
                <div class="atlas-route-range-row">
                    <div class="atlas-route-range-col1">
                        <button class="atlas-route-range-expand-btn" aria-expanded="false" aria-label="Toggle load type options">Load type <span class="atlas-route-range-toggle-icon"></span></button>
                    </div>
                </div>
                <div class="atlas-route-range-row">
                    <div class="atlas-route-range-col1" style="display:none;">
                        <input value="USHazmatClass2" type="checkbox"/>Compressed gas<br/>
                        <input value="USHazmatClass8" type="checkbox"/>Corrosives<br/>
                        <input value="USHazmatClass1" type="checkbox"/>Explosives<br/>
                        <input value="USHazmatClass3" type="checkbox"/>Flammable liquids<br/>
                        <input value="USHazmatClass4" type="checkbox"/>Flammable solids
                    </div>
                    <div class="atlas-route-range-col2" style="display:none;">
                        <input value="otherHazmatHarmfulToWater" type="checkbox"/>Harmful to water<br/>
                        <input value="USHazmatClass9" type="checkbox"/>Miscellaneous<br/>
                        <input value="USHazmatClass5" type="checkbox"/>Oxidizers<br/>
                        <input value="USHazmatClass6" type="checkbox"/>Poisons<br/>
                        <input value="USHazmatClass7" type="checkbox"/>Radioactive
                    </div>
                </div>
                */
                var loadTypeOptions = self._createCheckboxGroup('loadType', ['USHazmatClass2', 'USHazmatClass8', 'USHazmatClass1', 'USHazmatClass3', 'USHazmatClass4', 'otherHazmatHarmfulToWater', 'USHazmatClass9', 'USHazmatClass5', 'USHazmatClass6', 'USHazmatClass7'], resx, function (values) {
                    //Cross reference USHazmatClass1 with otherHazmatExplosive.
                    var USHazmatClass1 = values.indexOf('USHazmatClass1');
                    var otherHazmatExplosive = values.indexOf('otherHazmatExplosive');
                    if (USHazmatClass1 > 0) {
                        if (otherHazmatExplosive === -1) {
                            values.push('otherHazmatExplosive');
                        }
                    }
                    else if (otherHazmatExplosive > 0) {
                        //Remove this value as the USHazmatClass1 is unselected.
                        values = values.splice(otherHazmatExplosive, 1);
                    }
                    //Cross reference USHazmatClass9 with otherHazmatGeneral.
                    var USHazmatClass9 = values.indexOf('USHazmatClass9');
                    var otherHazmatGeneral = values.indexOf('otherHazmatGeneral');
                    if (USHazmatClass9 > 0) {
                        if (otherHazmatGeneral === -1) {
                            values.push('otherHazmatGeneral');
                        }
                    }
                    else if (otherHazmatGeneral > 0) {
                        //Remove this value as the USHazmatClass9 is unselected.
                        values = values.splice(otherHazmatGeneral, 1);
                    }
                });
                //Group truck options.
                var truckToggleOptions = [truckDimensionsToggle, loadTypeOptions[0]];
                // const truckOptions = [lengthRow, heightRow, widthRow, weightRow, loadTypeOptions[1]];
                //Create avoid options.
                /*
                <div class="atlas-route-range-row">
                    <div class="atlas-route-range-col1">
                        <button class="atlas-route-range-expand-btn" aria-expanded="false" aria-label="Toggle avoid type options list">Avoid  <span class="atlas-route-range-toggle-icon"></span></button>
                    </div>
                </div>
                <div class="atlas-route-range-row">
                    <div class="atlas-route-range-col1" style="display:none;">
                        <input value="borderCrossings" type="checkbox" />Border crossings<br/>
                        <input value="carpools" type="checkbox" />Carpools<br/>
                        <input value="ferries" type="checkbox" />Ferries
                    </div>
                    <div class="atlas-route-range-col2" style="display:none;">
                        <input value="motorways" type="checkbox" />Motorways<br/>
                        <input value="tollRoads" type="checkbox" />Toll roads<br/>
                        <input value="unpavedRoads" type="checkbox" />Unpaved roads
                    </div>
                </div>
                */
                var avoidOptions = self._createCheckboxGroup('avoid', ['borderCrossings', 'carpools', 'ferries', 'motorways', 'tollRoads', 'unpavedRoads'], resx);
                //Create traffic option.
                var useTraffic = createElm('input', {
                    attr: { type: 'checkbox' },
                    propName: 'traffic',
                    bindingChanged: function (val) {
                        trafficOption.style.display = self._getDateTimePickerDisplay();
                    }
                }, resx, binding);
                var useTrafficRow = self._createOptionRow(resx.traffic, useTraffic);
                //Create selection area option.
                /*
                    <select>
                        <option value="distance">Distance</option>
                        <option value="time" selected>Time</option>
                    </select>
                */
                var selectionArea = createElm('select', {
                    selectVals: ['distance', 'time'],
                    selected: 'time',
                    propName: 'selectionArea',
                    bindingChanged: function (val) {
                        //Hide/show options depending on the selection area value.
                        var isTime = (val === 'time');
                        timeOptionRow.style.display = (isTime) ? '' : 'none';
                        distanceOptionRow.style.display = (!isTime) ? '' : 'none';
                        useTrafficRow.style.display = (isTime && (self._settings.travelMode === 'car' || self._settings.travelMode === 'truck')) ? '' : 'none';
                        trafficOption.style.display = self._getDateTimePickerDisplay();
                    }
                }, resx, binding);
                //Create travel mode option.
                /*
                    <select>
                        <option value="car" selected>Car</option>
                        <option value="bicycle">Bicycle</option>
                        <option value="pedestrian">Pedestrian</option>
                        <option value="truck">Truck</option>
                    </select>
                */
                var travelMode = createElm('select', {
                    selectVals: ['car', 'bicycle', 'pedestrian', 'truck'],
                    selected: 'car',
                    propName: 'travelMode',
                    bindingChanged: function (val) {
                        //Hide/show certain options depending on the selected travel mode.
                        var isVehicle = true;
                        var isTruck = false;
                        switch (val) {
                            case 'pedestrian':
                            case 'bicycle':
                                isVehicle = false;
                                break;
                            case 'truck':
                                isTruck = true;
                                break;
                        }
                        avoidOptions.forEach(function (ao) {
                            ao.style.display = (isVehicle) ? '' : 'none';
                        });
                        truckToggleOptions.forEach(function (toggle) {
                            toggle.style.display = (isTruck) ? '' : 'none';
                            //Toggle close all truck options if not showing truck,
                            if (!isTruck && toggle.getAttribute('aria-expanded') === 'true') {
                                toggle.click();
                            }
                        });
                        useTrafficRow.style.display = (isVehicle && self._settings.selectionArea === 'time') ? '' : 'none';
                        trafficOption.style.display = self._getDateTimePickerDisplay();
                    }
                }, resx, binding);
                //Create buttons
                /*
                 <div class="atlas-route-range-row">
                    <div class="atlas-route-range-col1"><button class="atlas-route-range-search-btn">Search</button></div>
                    <div class="atlas-route-range-col2"><button class="atlas-route-range-cancel-btn">Cancel</button></div>
                </div>
                 */
                //Create search button.
                var searchBtn = createElm('button', {
                    class: [css.searchBtn],
                    propName: 'search',
                    innerHTML: resx['search']
                }, resx);
                searchBtn.onclick = self._onSearch;
                self._searchBtn = searchBtn;
                //Create cancel button.
                var cancelBtn = createElm('button', {
                    class: [css.cancelBtn],
                    propName: 'cancel',
                    innerHTML: resx['cancel']
                }, resx);
                if (!self._options.collapsible) {
                    cancelBtn.style.display = 'none';
                }
                cancelBtn.onclick = self._onCancel;
                //Create button row.
                var btnRow = Utils.createElm('div', {
                    class: [css.row],
                    style: {
                        display: 'block'
                    },
                    children: [Utils.createElm('div', {
                            style: {
                                'text-align': 'center'
                            },
                            children: [searchBtn, cancelBtn]
                        })]
                });
                //Create options container.
                self._optionSection = createElm('div', { class: [css.options], children: [
                        //Add travel mode.
                        self._createOptionRow(resx.travelMode, travelMode),
                        //Add selection area option.
                        self._createOptionRow(resx.selectionArea, selectionArea),
                        //Add travelTime option.
                        timeOptionRow,
                        //Add distance options.
                        distanceOptionRow,
                        //Add show area option.
                        self._createOptionRow(resx.showArea, showArea),
                        //Add use traffic option.
                        useTrafficRow,
                        //Add traffic option.
                        trafficOption,
                        //Add truck dimension toggle.
                        truckDimensionsToggle,
                        //Add truck dimenion options.
                        lengthRow, heightRow, widthRow, weightRow,
                        //Add load type options.
                        loadTypeOptions[0], loadTypeOptions[1],
                        //Add avoid options.
                        avoidOptions[0], avoidOptions[1]
                    ] });
                //Add options to container.
                Utils.appendChildren(container, [
                    //Add the intstructions.
                    createElm('div', { class: [css.instructions], innerHTML: resx.selectOrigin }, resx),
                    //Add options container.
                    self._optionSection,
                    //Add buttons.
                    btnRow
                ]);
                self._map.events.add('resize', self._mapResized);
                self._mapResized();
                if (self._options.isVisible) {
                    self.setVisible(self._options.isVisible);
                }
            };
            /** Event handler for when the search button is pressed. */
            _this._onSearch = function () {
                //Cache functions and variables for better minification.
                var self = _this;
                var convertDistance = azmaps.math.convertDistance;
                var round = Math.round;
                var request = self._settings;
                //Ensure numbers are properly formatted when converted to a string. Don't allow comma groupings.
                var numberFormatter = Utils.USNumberFormat;
                //Create the query string value. Have to manually create string since loadType and avoid values have to be added as individual parameters which JSON objects don't allow.
                var queryString = []; //encodeURIComponent
                //Origin query
                queryString.push("query=" + numberFormatter(request.origin[1]) + "," + numberFormatter(request.origin[0]));
                queryString.push("travelMode=" + request.travelMode);
                if (request.selectionArea === 'time') {
                    queryString.push("timeBudgetInSec=" + numberFormatter(round(request.travelTime * 60)));
                    if (request.traffic) {
                        queryString.push("traffic=true");
                        if (request.leaveAtDate && request.leaveAtTime) {
                            //Check to see if seconds need to be added.
                            var t = request.leaveAtTime;
                            if (t.match(/:/g).length === 1) {
                                t += ':00';
                            }
                            //1996-12-19T16:39:57 - Don't specify timezone in request. The service will use the timezone of the origin point automatically.
                            queryString.push("departAt=" + request.leaveAtDate + "T" + t);
                        }
                    }
                }
                else {
                    queryString.push("distanceBudgetInMeters=" + numberFormatter(round(convertDistance(request.distance, request.distanceUnits, 'meters'))));
                }
                if (request.travelMode === 'car' || request.travelMode === 'truck') {
                    //avoid
                    if (request.avoid) {
                        request.avoid.forEach(function (a) {
                            queryString.push("avoid=" + a);
                        });
                    }
                }
                if (request.travelMode === 'truck') {
                    //vehcileLength (m), vehicleWidth (m), vehicleHeight (m), vehicleAxleWeight (kg), vehicleLoadType         
                    if (!isNaN(request.length)) {
                        queryString.push("vehcileLength=" + numberFormatter(round(convertDistance(request.length, request.lengthUnits, 'meters'))));
                    }
                    if (!isNaN(request.width)) {
                        queryString.push("vehicleWidth=" + numberFormatter(round(convertDistance(request.width, request.lengthUnits, 'meters'))));
                    }
                    if (!isNaN(request.height)) {
                        queryString.push("vehicleHeight=" + numberFormatter(round(convertDistance(request.height, request.lengthUnits, 'meters'))));
                    }
                    if (!isNaN(request.height)) {
                        queryString.push("vehicleAxleWeight=" + numberFormatter(round(MapMath.convertWeight(request.axleWeight, request.weightUnits, 'kilograms'))));
                    }
                    if (request.loadType) {
                        request.loadType.forEach(function (lt) {
                            queryString.push("vehicleLoadType=" + lt);
                        });
                    }
                }
                //Create the URL request. 
                var url = "https://" + self._map.getServiceOptions().domain + "/route/range/json?api-version=1.0&" + queryString.join('&');
                //Sign the request. This will use the same authenication that the map is using to access the Azure Maps platform.
                //This gives us the benefit of not having to worry about if this is using subscription key or Azure AD.
                var requestParams = self._map.authentication.signRequest({ url: url });
                fetch(requestParams.url, {
                    method: 'GET',
                    mode: 'cors',
                    headers: new Headers(requestParams.headers)
                })
                    .then(function (r) { return r.json(); }, function (e) { return self._invokeEvent('error', self._resx.routeRangeError); })
                    .then(function (response) {
                    if (response.reachableRange) {
                        //Convert the response into GeoJSON and add it to the map.
                        var positions = response.reachableRange.boundary.map(function (latLng) {
                            return [latLng.longitude, latLng.latitude];
                        });
                        var isochrone = new azmaps.data.Polygon([positions]);
                        self._invokeEvent('rangecalculated', isochrone);
                        if (self._settings.showArea) {
                            self._invokeEvent('showrange', isochrone);
                        }
                    }
                    else {
                        self._invokeEvent('error', self._resx.routeRangeError);
                    }
                }, function (error) { return self._invokeEvent('error', self._resx.routeRangeError); });
                if (self._options.collapsible) {
                    //Hide the input panel and marker.
                    self.setVisible(false);
                }
            };
            /** Event handler for when the cancel button is clicked. */
            _this._onCancel = function () {
                //Hide the input panel and marker.
                _this.setVisible(false);
            };
            /** Event handler for when the origin marker is dragged. */
            _this._onMarkerDragged = function () {
                var self = _this;
                self._settings.origin = self._marker.getOptions().position;
                self._optionSection.style.display = '';
                self._searchBtn.style.display = '';
                self._hideOptionsTimeout = null;
                if (self._options.calculateOnMarkerMove) {
                    self._onSearch();
                }
            };
            /** Clears the timeout that is preventing the route range options panel from appearing. */
            _this._onMarkerDargStart = function () {
                if (_this._hideOptionsTimeout) {
                    clearTimeout(_this._hideOptionsTimeout);
                    _this._hideOptionsTimeout = null;
                }
            };
            /** Event handler for when a the container has focus and arrow keys are used to adjust the position of the marker. */
            _this._onContainerKeyDown = function (e) {
                //If the top level container has focus and an arrow key is pressed, move the marker.
                if (e.keyCode > 36 && e.keyCode < 41 && e.target.classList.contains('azure-maps-control-container')) {
                    var self_1 = _this;
                    //Convert the position of the marker to pixels based on the current zoom level of the map, then offset it accordingly. 
                    var zoom = self_1._map.getCamera().zoom;
                    var pixel = azmaps.math.mercatorPositionsToPixels([self_1._marker.getOptions().position], zoom)[0];
                    var offset = self_1._arrowKeyOffset;
                    //Left arrow = 37, Up arrow = 38, Right arrow = 39, Down arrow = 40
                    if (e.keyCode === 37) {
                        pixel[0] -= offset;
                    }
                    else if (e.keyCode === 38) {
                        pixel[1] -= offset;
                    }
                    else if (e.keyCode === 39) {
                        pixel[0] += offset;
                    }
                    else if (e.keyCode === 40) {
                        pixel[1] += offset;
                    }
                    var pos = azmaps.math.mercatorPixelsToPositions([pixel], zoom)[0];
                    self_1._marker.setOptions({
                        position: pos
                    });
                    self_1._settings.origin = pos;
                    if (self_1._options.calculateOnMarkerMove) {
                        if (self_1._markerKeyMoveTimeout) {
                            clearTimeout(self_1._markerKeyMoveTimeout);
                        }
                        self_1._markerKeyMoveTimeout = setTimeout(function () {
                            self_1._onSearch();
                        }, self_1._markerMoveSearchDelay);
                    }
                    e.preventDefault();
                    e.stopPropagation();
                }
            };
            /** Event handler for when the map resizes. */
            _this._mapResized = function () {
                var self = _this;
                var mapSize = self._map.getMapContainer().getBoundingClientRect();
                //If the map is 750 pixels wide or more, offset the position of the control away from the edge a little.
                var min = '';
                var delay = 0;
                var position = self._options.position;
                if (mapSize.width < 750 || (position === 'center' && mapSize.height < 600)) {
                    min = '-min';
                    //If the map is less 750 pixels width or 600 pixels high when centered, delay the display of options in the container so that the user has a chance to move the marker before it is covered up. 
                    //This delay will be be short circuited when the user stops dragging the marker.
                    delay = 5000;
                }
                else if (position !== 'center') {
                    //Check to see see if there are any other controls on the same side as this control. If not, then minimize the gap between the control and the side of the map.
                    var controlContainers = Array.from(self._map.controls['controlContainer'].children);
                    var cnt_1 = 0;
                    controlContainers.forEach(function (c) {
                        if (c.classList.toString().indexOf(position) > -1) {
                            cnt_1 += c.children.length;
                        }
                    });
                    if (cnt_1 === 0) {
                        min = '-min';
                    }
                }
                self._container.classList.remove('left', 'right', 'center', 'left-min', 'right-min', 'center-min');
                self._container.classList.add(position + min);
                self._showOptionsDelay = delay;
            };
            var self = _this;
            if (options.markerOptions) {
                Object.assign(options.markerOptions, self._options.markerOptions);
            }
            self._options = Object.assign(self._options, options || {});
            self._marker = new azmaps.HtmlMarker(Object.assign(self._options.markerOptions, { draggable: true }));
            return _this;
        }
        /****************************
         * Public Methods
         ***************************/
        /** Disposes the control. */
        RouteRangeControl.prototype.dispose = function () {
            var self = this;
            if (self._map) {
                self._map.controls.remove(self);
            }
            if (self._binding) {
                self._binding.dispose();
                self._binding = null;
            }
            if (self._styler) {
                self._styler.dispose();
            }
            Object.keys(self).forEach(function (k) {
                self[k] = null;
            });
        };
        /**
         * Sets the options for the marker.
         * @param options Marker options.
         */
        RouteRangeControl.prototype.setMarkerOptions = function (options) {
            Object.assign(this._options.markerOptions, options);
            this._marker.setOptions(options);
        };
        /**
         * Hides or shows the route range control
         * @param isVisible Specifies if the route range control should be displayed or not.
         */
        RouteRangeControl.prototype.setVisible = function (isVisible) {
            var self = this;
            if (self._marker && self._map) {
                var cam = self._map.getCamera();
                var pos = cam.center;
                //If the previous origin is within the current map view, use that, otherwise use center of map so that user doesn't have to go looking for it.
                if (self._settings.origin && azmaps.data.BoundingBox.containsPosition(cam.bounds, self._settings.origin)) {
                    pos = self._settings.origin;
                }
                self._settings.origin = pos;
                self._marker.setOptions({ position: pos, visible: isVisible });
                if (isVisible && self._options.calculateOnMarkerMove) {
                    self._onSearch();
                }
            }
            if (self._container) {
                var display = (isVisible) ? '' : 'none';
                self._optionSection.style.display = 'none';
                self._searchBtn.style.display = 'none';
                self._container.style.display = display;
                //Only let the instructions be displayed initially for a period of time so that the user can focus on moving the origin marker.
                if (isVisible) {
                    self._hideOptionsTimeout = setTimeout(function () {
                        self._optionSection.style.display = '';
                        self._searchBtn.style.display = '';
                        self._hideOptionsTimeout = null;
                    }, self._showOptionsDelay);
                }
            }
            //Set focus on the container if being made visible the container exists.
            if (self._options.isVisible !== isVisible && isVisible && self._container) {
                self._container.focus();
            }
            self._options.isVisible = isVisible;
        };
        /** Gets the options of the selection control. */
        RouteRangeControl.prototype.getOptions = function () {
            return Object.assign({}, this._options);
        };
        /**
         * Action to perform when the control is added to the map.
         * @param map The map the control was added to.
         * @param options The control options used when adding the control to the map.
         * @returns The HTML Element that represents the control.
         */
        RouteRangeControl.prototype.onAdd = function (map, options) {
            if (options && options.position && options.position !== 'non-fixed') {
                map.controls.remove(this);
                map.controls.add(this, { position: 'non-fixed' });
                return;
            }
            var self = this;
            self._map = map;
            self._marker.setOptions({ visible: self._options.isVisible });
            map.markers.add(self._marker);
            map.events.add('dragstart', self._marker, self._onMarkerDargStart);
            map.events.add('dragend', self._marker, self._onMarkerDragged);
            //Get the resource file for the maps language.
            var resx = Localization.getResource(map.getStyle().language);
            self._resx = resx;
            //Create the main control container.        
            self._createContainer(resx);
            if (self._styler) {
                self._styler.updateMap(map);
            }
            else {
                self._styler = new ControlStyler(self._container, map, self._options.style || 'light');
            }
            return self._container;
        };
        /**
         * Action to perform when control is removed from the map.
         */
        RouteRangeControl.prototype.onRemove = function () {
            var self = this;
            if (self._container) {
                self._container.removeEventListener('keydown', this._onContainerKeyDown);
                self._container.remove();
                self._container = null;
            }
            if (self._binding) {
                self._binding.dispose();
                self._binding = null;
            }
            self._styler.updateMap(null);
            self._map.events.remove('resize', self._mapResized);
            self._map.events.remove('dragstart', self._marker, self._onMarkerDargStart);
            self._map.events.remove('dragend', self._marker, self._onMarkerDragged);
            self._map.markers.remove(self._marker);
            self._map = null;
        };
        /**
          * Creates an option row.
          * @param title Title of the option.
          * @param children Options to add as children.
          * @param indent Specifies if the col1 item should be indented.
          */
        RouteRangeControl.prototype._createOptionRow = function (title, children, indent) {
            var css = RouteRangeControl._css;
            return Utils.createElm('div', { class: [css.row], children: [
                    Utils.createElm('div', { class: [css.col1, (indent) ? 'indent' : undefined], innerHTML: title }),
                    Utils.createElm('div', { class: [css.col2], children: Array.isArray(children) ? children : [children] })
                ] });
        };
        /**
         * Creates a toggle button.
         * @param displayLabel Display label for button.
         * @param ariaLabel Aria label for button.
         * @param children Children to hide/show when toggled.
         */
        RouteRangeControl.prototype._createToggleBtn = function (displayLabel, ariaLabel, children) {
            //<button class="atlas-route-range-expand-btn" aria-expanded="false" aria-label="Toggle truck dimension options">Truck dimensions <span class="atlas-route-range-toggle-icon"></span></button>
            var css = RouteRangeControl._css;
            var toggleBtn = Utils.createElm('button', {
                attr: {
                    type: 'button',
                    'aria-expanded': 'false',
                    'aria-label': ariaLabel
                },
                class: [css.expndBtn],
                innerHTML: displayLabel + " <span class=\"" + css.toggleIcon + "\"></span>"
            });
            //Hide all children by default.
            children.forEach(function (c) {
                c.style.display = 'none';
            });
            toggleBtn.onclick = function () {
                var expanded = toggleBtn.getAttribute('aria-expanded');
                var display = '';
                if (expanded === 'true') {
                    expanded = 'false';
                    display = 'none';
                    toggleBtn.getElementsByClassName(css.toggleIcon)[0].classList.remove(css.expandedToggleIcon);
                }
                else {
                    expanded = 'true';
                    toggleBtn.getElementsByClassName(css.toggleIcon)[0].classList.add(css.expandedToggleIcon);
                }
                toggleBtn.setAttribute('aria-expanded', expanded);
                children.forEach(function (c) {
                    c.style.display = display;
                });
            };
            return toggleBtn;
        };
        /**
         * Creates a row with two columns that contains a list of checkboxes that represent a group of options. Returns two elements; a toogle button, and a row div with all the options inside.
         * @param propName Property name to bind to.
         * @param values Values to create chack boxes for. S
         * @param resx Resources.
         * @param onchange Callback function to trigger when binding value changes.
         */
        RouteRangeControl.prototype._createCheckboxGroup = function (propName, values, resx, onchange) {
            var css = RouteRangeControl._css;
            var numVals = values.length;
            var elm;
            var i;
            var label;
            //Create the options.
            var numCol1 = Math.ceil(numVals / 2);
            var col1Children = [];
            var col2Children = [];
            for (i = 0; i < numVals; i++) {
                //Create the checkbox.
                elm = Utils.createElm('input', { attr: { type: 'checkbox', value: values[i] }, propName: values[i] }, resx);
                //Wrap the element with a label.
                label = Utils.createElm('label', {
                    innerHTML: resx[values[i]],
                    children: [elm]
                });
                //Bind element value.
                this._binding.bind(label, propName, true, onchange);
                if (i < numCol1) {
                    col1Children.push(label);
                    if (i < numCol1 - 1) {
                        col1Children.push(document.createElement('br'));
                    }
                }
                else {
                    col2Children.push(label);
                    if (i < numVals - 1) {
                        col2Children.push(document.createElement('br'));
                    }
                }
            }
            //Create first column of options.
            var col1 = Utils.createElm('div', {
                class: [css.col1],
                style: {
                    display: 'none'
                },
                children: col1Children
            });
            //Create second column of options.
            var col2 = Utils.createElm('div', {
                class: [css.col2],
                style: {
                    display: 'none'
                },
                children: col2Children
            });
            //Create row of options.
            var row = Utils.createElm('div', { class: [css.row], children: [col1, col2] });
            //Create toggle button.
            var toggleBtn = this._createToggleBtn(resx[propName], resx[propName + 'Toggle'], [col1, col2]);
            return [toggleBtn, row];
        };
        /**
         * Gets the display value for the data time picker.
         */
        RouteRangeControl.prototype._getDateTimePickerDisplay = function () {
            var self = this;
            return (Utils.isDateTimeInputSupported() && self._settings.selectionArea === 'time' && self._settings.traffic && (self._settings.travelMode === 'car' || self._settings.travelMode === 'truck')) ? '' : 'none';
        };
        /** CSS class names. */
        RouteRangeControl._css = {
            root: 'atlas-route-range-',
            container: 'atlas-route-range-container',
            row: 'atlas-route-range-row',
            col1: 'atlas-route-range-col1',
            col2: 'atlas-route-range-col2',
            instructions: 'atlas-route-range-instructions',
            options: 'atlas-route-range-options',
            searchBtn: 'atlas-route-range-search-btn',
            cancelBtn: 'atlas-route-range-cancel-btn',
            expndBtn: 'atlas-route-range-expand-btn',
            toggleIcon: 'atlas-route-range-toggle-icon',
            expandedToggleIcon: 'atlas-route-range-toggle-icon-expanded'
        };
        return RouteRangeControl;
    }(azmaps.internal.EventEmitter));

    /** Modes of selection for the SelectionControl. */
    (function (SelectionControlMode) {
        /** Draw a circular area to select in. */
        SelectionControlMode["circle"] = "circle";
        /** Draw a rectangular area to select in. */
        SelectionControlMode["rectangle"] = "rectangle";
        /** Draw a polygon area to select in. */
        SelectionControlMode["polygon"] = "polygon";
        /** Generates a selection area based on travel distance or time. */
        SelectionControlMode["routeRange"] = "routeRange";
    })(exports.SelectionControlMode || (exports.SelectionControlMode = {}));

    /** A control that lets the user use different methods to select data from the map. */
    var SelectionControl = /** @class */ (function (_super) {
        __extends(SelectionControl, _super);
        /****************************
         * Constructor
         ***************************/
        /**
         * A control that lets the user use different methods to select data from the map.
         * @param options Options for defining how the control is rendered and functions.
         */
        function SelectionControl(options) {
            var _this = _super.call(this) || this;
            /****************************
             * Private Properties
             ***************************/
            _this._options = {
                style: azmaps.ControlStyle.light,
                selectionModes: 'all',
                fillColor: '#F2C811',
                fillOpacity: 0.5,
                strokeColor: '#F2C811',
                strokeWidth: 1,
                persistSearchArea: false,
                routeRangeMinMapSize: [325, 200],
                routeRangeOptions: {}
            };
            _this._hasMouse = false;
            _this._hasFocus = false;
            /****************************
             * Private Methods
             ***************************/
            /**
             * WORKAROUND: Remove this when the drawing tools properly support polygon previews.
             * @param shape Shape that is being drawn.
             */
            _this._copyDrawnShape = function (shape) {
                _this._rangeDataSource.setShapes([new azmaps.Shape(new azmaps.data.Polygon(shape.getCoordinates()))]);
            };
            /**
             * Displays a route range polygon on the map.
             * @param searchArea A polygon search area generated by a route range control.
             */
            _this._displayRangePolygon = function (searchArea) {
                _this._rangeDataSource.setShapes([searchArea]);
            };
            /** Search within an polygon area. */
            _this._searchArea = function (searchArea) {
                var self = _this;
                self.clear();
                var source = self._options.source;
                if (source && searchArea) {
                    var shapes = MapMath.shapePointsWithinPolygon(source.getShapes(), searchArea);
                    self._invokeEvent('dataselected', shapes);
                }
                //Allow a bit of a delay before removing the drawn area.
                self._drawingManager.setOptions({ mode: 'idle' });
            };
            /** Event handler for when the map resizes. */
            _this._mapResized = function () {
                var minSize = _this._options.routeRangeMinMapSize;
                var mapSize = _this._map.getMapContainer().getBoundingClientRect();
                _this._routeRangeBtn.style.display = (mapSize.width >= minSize[0] && mapSize.height >= minSize[1]) ? '' : 'none';
            };
            _this._options = Object.assign(_this._options, options || {});
            _this._rangeDataSource = new azmaps.source.DataSource(null, {
                buffer: 512
            });
            return _this;
        }
        /****************************
         * Public Methods
         ***************************/
        /**
         * Clears any search area polygons added to the map by the selection control.
         */
        SelectionControl.prototype.clear = function () {
            this._drawingManager.getSource().clear();
            this._rangeDataSource.clear();
        };
        /** Disposes the control. */
        SelectionControl.prototype.dispose = function () {
            var self = this;
            if (self._map) {
                self._map.controls.remove(self);
            }
            if (self._styler) {
                self._styler.dispose();
            }
            Object.keys(self).forEach(function (k) {
                self[k] = null;
            });
        };
        /** Gets the underlying drawing manager of the selection control. */
        SelectionControl.prototype.getDrawingManager = function () {
            return this._drawingManager;
        };
        /** Gets the options of the selection control. */
        SelectionControl.prototype.getOptions = function () {
            return Object.assign({}, this._options);
        };
        /** Updates the data source used for searching/selection. */
        SelectionControl.prototype.setSource = function (source) {
            this._options.source = source;
        };
        /**
         * Action to perform when the control is added to the map.
         * @param map The map the control was added to.
         * @param options The control options used when adding the control to the map.
         * @returns The HTML Element that represents the control.
         */
        SelectionControl.prototype.onAdd = function (map, options) {
            var self = this;
            self._position = (options && options.position) ? options.position : 'non-fixed';
            self._map = map;
            var opts = self._options;
            var dm = new azmdraw.drawing.DrawingManager(map);
            self._drawingManager = dm;
            map.events.add('drawingcomplete', dm, self._searchArea);
            //WORKAROUND: Remove the following event when the drawing tools properly support polygon preview.
            map.events.add('drawingchanged', dm, self._copyDrawnShape);
            //Customize the drawing styles.
            var l = dm.getLayers();
            l.polygonLayer.setOptions({
                fillColor: opts.fillColor,
                fillOpacity: opts.fillOpacity
            });
            var lineOptions = {
                strokeColor: opts.strokeColor,
                strokeWidth: opts.strokeWidth
            };
            l.polygonOutlineLayer.setOptions(lineOptions);
            l.lineLayer.setOptions(lineOptions);
            //Add source and layer for rendering route range polygon.
            map.sources.add(self._rangeDataSource);
            self._rangeLayers = [
                new azmaps.layer.PolygonLayer(self._rangeDataSource, null, l.polygonLayer.getOptions()),
                new azmaps.layer.LineLayer(self._rangeDataSource, null, l.lineLayer.getOptions())
            ];
            //Add the route range polygon layers below the transit layer.
            self._map.layers.add(self._rangeLayers, 'transit');
            //Get the resource file for the maps language.
            var resx = Localization.getResource(map.getStyle().language);
            //Create the main control container.
            self._createContainer(resx);
            if (self._styler) {
                self._styler.updateMap(map);
            }
            else {
                self._styler = new ControlStyler(self._container, map, opts.style || 'light');
            }
            return self._container;
        };
        /**
         * Action to perform when control is removed from the map.
         */
        SelectionControl.prototype.onRemove = function () {
            var self = this;
            self.clear();
            if (self._container) {
                self._container.remove();
                self._container = null;
            }
            if (self._map) {
                if (self._rangeControl) {
                    self._map.events.remove('showrange', self._rangeControl, self._displayRangePolygon);
                    self._map.events.remove('rangecalculated', self._rangeControl, self._searchArea);
                    self._map.controls.remove(self._rangeControl);
                    self._rangeControl = null;
                }
                self._map.events.remove('resize', self._mapResized);
                self._map.sources.remove(self._rangeDataSource);
                //WORKAROUND: Remove the following event when the drawing tools properly support polygon preview.
                self._map.events.remove('drawingchanged', self._drawingManager, self._copyDrawnShape);
                if (self._rangeLayers) {
                    self._map.layers.remove(self._rangeLayers);
                }
            }
            self._styler.updateMap(null);
            if (self._drawingManager) {
                self._drawingManager.dispose();
                self._drawingManager = null;
            }
            self._map = null;
        };
        /**
         * Create the content of the container.
         * @param resx The localization resource.
         */
        SelectionControl.prototype._createContainer = function (resx) {
            //Cache variables and function for better minification.        
            var self = this;
            var opts = self._options;
            var css = SelectionControl._css;
            var container = Utils.createElm('div', {
                class: ['azure-maps-control-container'],
                propName: 'selectionControl'
            }, resx);
            self._container = container;
            var selectionGrid = Utils.createElm('div', {
                class: [css.hidden],
                propName: 'selectionModes'
            }, resx);
            var modes = Object.keys(exports.SelectionControlMode);
            if (Array.isArray(opts.selectionModes)) {
                modes = opts.selectionModes;
            }
            modes.forEach(function (key) {
                var selectionBtn = self._buildSelectModeBtn(key, css.button, resx);
                selectionGrid.appendChild(selectionBtn);
                if (key === 'routeRange') {
                    self._routeRangeBtn = selectionBtn;
                }
            });
            container.addEventListener('mouseover', function () {
                self._hasMouse = true;
                container.classList.add(css.inUse);
                selectionGrid.classList.remove(css.hidden);
            });
            container.addEventListener('focusin', function () {
                self._hasFocus = true;
                container.classList.add(css.inUse);
                selectionGrid.classList.remove(css.hidden);
            });
            container.addEventListener('mouseleave', function () {
                self._hasMouse = false;
                if (!self._hasFocus) {
                    container.classList.remove(css.inUse);
                    selectionGrid.classList.add(css.hidden);
                }
            });
            container.addEventListener('focusout', function (event) {
                if (!(event.relatedTarget instanceof Node && container.contains(event.relatedTarget))) {
                    self._hasFocus = false;
                    if (!self._hasMouse) {
                        container.classList.remove(css.inUse);
                        selectionGrid.classList.add(css.hidden);
                    }
                }
            });
            //Create the flyout button.
            var flyoutBtn = Utils.createElm('button', {
                class: [css.button, 'pointer-selection'],
                propName: 'selectMode',
                attr: {
                    type: 'button'
                }
            }, resx);
            //If search area is persisted, remove it when the user clicks on the flyout button.
            flyoutBtn.addEventListener('click', function () {
                self.clear();
            });
            if (opts && (self._position === 'top-right' || self._position === 'bottom-right')) {
                container.appendChild(selectionGrid);
                container.appendChild(flyoutBtn);
            }
            else {
                container.appendChild(flyoutBtn);
                container.appendChild(selectionGrid);
            }
            //Create child route range control.
            var rangeOptions = {
                isVisible: false,
                markerOptions: {
                    color: self._options.fillColor
                },
                style: opts.style || azmaps.ControlStyle.light,
                collapsible: true,
                calculateOnMarkerMove: false
            };
            if (opts.routeRangeOptions) {
                if (opts.routeRangeOptions.markerOptions) {
                    opts.routeRangeOptions.markerOptions = Object.assign(rangeOptions.markerOptions, opts.routeRangeOptions.markerOptions);
                }
                Object.assign(rangeOptions, opts.routeRangeOptions);
            }
            var routeRangeControl = new RouteRangeControl(rangeOptions);
            self._map.controls.add(routeRangeControl);
            self._rangeControl = routeRangeControl;
            self._map.events.add('resize', self._mapResized);
            self._mapResized();
            self._map.events.add('rangecalculated', self._rangeControl, self._searchArea);
            self._map.events.add('showrange', self._rangeControl, self._displayRangePolygon);
        };
        /**
         * Creates selection mode buttons.
         * @param name The name of the selection mode button to create.
         * @param btnClass The button class name.
         * @param resx Resources.
         */
        SelectionControl.prototype._buildSelectModeBtn = function (name, btnClass, resx) {
            var _this = this;
            var btn = Utils.createElm('button', {
                attr: {
                    type: 'button'
                },
                propName: name + 'Selection',
                class: [btnClass, name + '-selection']
            }, resx);
            var self = this;
            btn.onclick = function () {
                self.clear();
                if (name === 'routeRange') {
                    _this._rangeControl.setVisible(true);
                }
                else {
                    self._drawingManager.setOptions({
                        mode: ('draw-' + name)
                    });
                }
            };
            return btn;
        };
        SelectionControl._css = {
            button: 'azure-maps-control-button',
            inUse: 'in-use',
            hidden: 'hidden-accessible-element'
        };
        return SelectionControl;
    }(azmaps.internal.EventEmitter));



    var baseControl = /*#__PURE__*/Object.freeze({
        __proto__: null,
        SelectionControl: SelectionControl,
        RouteRangeControl: RouteRangeControl
    });

    var control = Namespace.merge("atlas.control", baseControl);
    var math = Namespace.merge("atlas.math", MapMath);

    exports.control = control;
    exports.math = math;

}(this.atlas = this.atlas || {}, atlas, atlas));
