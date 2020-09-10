# Azure Maps Selection Control module documentation

## SelectionControl class

Implements: `atlas.Control`

Namespace: `atlas.control`

A control that provides a form for requesting a route range. Adds a marker to the map to select an origin location. Recommended to be used with `non-fixed` position when adding to map.

**Contstructor**

> `SelectionControl(options?: SelectionControlOptions)`

**Methods** 

| Name | Return type | Description |
|------|-------------|-------------|
| `clear()` | | Clears any search area polygons added to the map by the selection control. |
| `dispose()` | | Disposes the control. |
| `getDrawingManager()` | `atlas.drawing.DrawingManager` | Gets the underlying drawing manager of the selection control. |
| `getOptions()` | `SelectionControlOptions` | Gets the options of the control. |
| `setSource(source: atlas.source.DataSource)` | | Updates the data source used for searching/selection. |

**Events**

| Name | Return type | Description |
|------|-------------|-------------|
| `dataselected` | `azmaps.Shape[]` | Event fired when shapes are selected from the specified data source. |

**Usage**

The following shows how to create an instance of the `SelectionControl` class, connect it to a data source and add it to a map.

```JavaScript
//Create a data source and add it to the map.
datasource = new atlas.source.DataSource();
map.sources.add(datasource);

//Add some data to the data source, in this case importing from a a GeoJSON file.
datasource.importDataFromUrl(geojsonFeed);

//Create a layer to render the point data.
map.layers.add(new atlas.layer.BubbleLayer(datasource);                

//Create an instance of the selection control.
var control = new atlas.control.SelectionControl({
    style: 'auto',
    source: datasource
});   

//Add an dataselected event handler that will be notified when shapes have been selected.
map.events.add('dataselected', control, function(selectedShapes){
    //Do something with the shapes. In this case alert the user to the number of selected shapes
    alert(selectedShapes.length + ' shapes selected');
});

//Add the control to the map.
map.controls.add(control, {
    position: 'top-left'
});
```

## SelectionControlOptions interface

Options for the SelectionControlOptions.

**Properties** 

| Name | Type | Description |
|------|------|-------------|
| `markerOptions` | `atlas.HtmlMarkerOptions` | Options for customizing the look of the marker used for selecting the origin location. |
| `fillColor` | `string` | The color to fill the search area with. Default: `'#F2C811'` |
| `fillOpacity` | `number` | The opacity of the fill color of the search area: Default: `0.5` |
| `persistSearchArea` | `boolean` |Specifies if the search area polygon should stay visible after being drawn. Will be removed if the selection control button is pressed again. Default: `false` |
| `routeRangeMinMapSize` | `[number, number]` | The mininum size of the map in order for route range option to be available. Format: [width, height] Default: `[325, 200]` |
| `routeRangeOptions` | `RouteRangeControlOptions` | Options for the underlying route range control. |
| `strokeColor` | `string` | The color to outline of the search area with. Default: `'#F2C811'` |
| `strokeWidth` | `number` | The width of the outline of the search area: Default: `1` |
| `selectionModes` | `SelectionControlMode[]` \| `'all'` | The selection modes to display in the selection control. Default: `'all'` |
| `source` | `azmaps.source.DataSource` | The data source to query data from.  |
| `style` | `atlas.ControlStyle` | The style of the control. Can be; `light`, `dark`, or `auto`. When set to auto, the style will change based on the map style. Overridden if device is in high contrast mode. Default `light`. |

## RouteRangeControl class

Implements: `atlas.Control`

Namespace: `atlas.control`

A control that provides a form for requesting a route range polygon. Adds a draggable marker to the map to select an origin location. When the top level control container has focus, the arrow keys can be used to move the marker. 

When the control is made visible, if the marker is within the current map view, it will appear where in its current position. If its not in the current map view, it will be displayed in the center of the map.

When the map is small, the control may hide the options section of the control for a short period of time to allow the user an oppurtunity to move the marker to a new origin location.

This control only uses a `non-fixed` position when being added to the map. If a different position is added, it will remove and re-add itself.

**Contstructor**

> `RouteRangeControl(options?: RouteRangeControlOptions)`

**Methods** 

| Name | Return type | Description |
|------|-------------|-------------|
| `dispose()` | | Disposes the control. |
| `getOptions()` | `RouteRangeControlOptions` | Gets the options of the control. |
| `setMarkerOptions(options: azmaps.HtmlMarkerOptions)` | | Sets the options for the marker. |
| `setVisible(isVisible: boolean)` | | Hides or shows the route range control. |

**Events**

| Name | Return type | Description |
|------|-------------|-------------|
| `error` | `string` | Event fired when an error occurs. |
| `showrange` | `azmaps.data.Polygon | azmaps.data.MultiPolygon` | Event fired when a route range is calculated and the showArea option is set to true. |
| `rangecalculated` | `azmaps.data.Polygon | azmaps.data.MultiPolygon` | Event fired when a route range has been calculated. |


**Usage**

The `RouteRangeControl` class is used by the selection control under the hood, but it can also be used directly if this is the only control needed. Here is an example.

```JavaScript
//Create an instance of the route range control.
var control = new atlas.control.RouteRangeControl({
    style: 'auto'
});   

//Add a rangecalculated event handler that will be notified when a route range has been calculated.
map.events.add('rangecalculated', control, function(routeRangePolygon){
    //Do something with the route range polygon. 
    
});

//Add the control to the map.
map.controls.add(control);
```

## RouteRangeControlOptions interface

Options for the RouteRangeControl.

**Properties** 

| Name | Type | Description |
|------|------|-------------|
| `calculateOnMarkerMove` | `boolean` | Specifies if a route range should be calculated automatically when the marker is moved either with the mouse arrow keys when the top level route range control has focus or by dragging the marker with the mouse. Note that this can result in a lot of additional requests being generated. Default: `true` |
| `collapsible` | `boolean` | Specifies if the control should hide after a search is done. When set to false, the cancel button is not displayed. Default: `false` |
| `markerOptions` | `atlas.HtmlMarkerOptions` | Options for customizing the look of the marker used for selecting the origin location. |
| `isVisible` | `boolean` | Specifies if the control should be visible when added to the map. Default: `false` |
| `position` | `'left'` \| `'center'` \| `'right'` | How to position the control when added to the map with non-fixed position. Default: `'left'` |
| `style` | `atlas.ControlStyle` | The style of the control. Can be; `light`, `dark`, or `auto`. When set to auto, the style will change based on the map style. Overridden if device is in high contrast mode. Default `light`. |

## SelectionControlMode enum

Namespace: `atlas`

Modes of selection for the SelectionControl.

| Name | Value | Description |
|------|-------|-------------|
| `circle` | `'circle'` | Draw a circular area to select in. |
| `polygon` | `'polygon'` | Draw a polygon area to select in. |
| `rectangle` | `'rectangle'` | Draw a rectangular area to select in. |
| `routeRange` | `'routeRange'` | Generates a selection area based on travel distance or time. |

## WeightUnits enum

Namespace: `atlas`

Units of weight measurements.

**Properties** 

| Name | Value | Description |
|------|-------|-------------|
| `kilograms` | `'kilograms'` | A standard metric unit of measurement. |
| `pounds` | `'pounds'` | A mass measurement unit equal to 0.45359237 kilograms. |
| `metricTon` | `'metricTon'` | A metric unit of mass equal to 1,000 kilograms. |
| `longTon` | `'longTon'` | A mass measurement unit equal to 2,240 pounds-mass or 1,016 kilograms or 1.016 metric tons. Typically used in the UK. |
| `shortTon` | `'shortTon'` | A mass measurement unit equal to 2,000 pounds-mass or 907.18474 kilograms. Typically used in the USA. |

## Math extensions

The following static functions have been added to the `atlas.math` namespace.

| Name | Return type | Description |
|------|-------------|-------------|
| `convertWeight(weight: number, fromUnits: string | WeightUnits, toUnits: string | WeightUnits, decimals?: number)` | `number` | Converts a weight value from one unit to another. Supported units: kilograms, pounds, metricTon, longTon, shortTon. |
| `pointsWithinPolygon(points: azmaps.data.Feature<azmaps.data.Point, any>[], searchArea: azmaps.data.Polygon | azmaps.data.MultiPolygon | azmaps.data.Feature<azmaps.data.Geometry, any> | azmaps.Shape)` | `azmaps.data.Feature<azmaps.data.Point, any>[]` | Gets all point features that are within a polygon. |
| `shapePointsWithinPolygon(shapes: azmaps.Shape[] | azmaps.source.DataSource, searchArea: azmaps.data.Polygon | azmaps.data.MultiPolygon | azmaps.data.Feature<azmaps.data.Geometry, any> | azmaps.Shape)` | `azmaps.Shape[]` | Gets all shapes that have point features that are within a polygon. |
 