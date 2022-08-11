import * as azmaps from 'azure-maps-control';
import * as azmdraw from 'azure-maps-drawing-tools';
import { SelectionControlOptions as SelectionControlOptions } from './SelectionControlOptions';
import { MapMath } from '../extensions/MapMath';
import { Utils } from '../helpers/Utils';
import { Localization, Resource } from '../helpers/Localization';
import { ControlStyler } from '../helpers/ControlStyler';
import { RouteRangeControl } from './RouteRangeControl';
import { SelectionControlMode } from '../Enums/SelectionControlMode';
import { RouteRangeControlOptions } from './RouteRangeControlOptions';

/** The events supported by the `SelectionControl`. */
export interface SelectionControlEvents {
    /** Event fired when shapes are selected from the specified data source. */
    dataselected: (azmaps.data.Feature<azmaps.data.Geometry, any> | azmaps.Shape)[];

    /** Event fired when a search area has been created. */
    searchareacreated: azmaps.data.Polygon | azmaps.data.MultiPolygon;
}

/** A control that lets the user use different methods to select data from the map. */
export class SelectionControl extends azmaps.internal.EventEmitter<SelectionControlEvents> implements azmaps.Control {

    /****************************
     * Private Properties
     ***************************/

    private _options: SelectionControlOptions = {
        container: null,
        style: azmaps.ControlStyle.light,
        selectionModes: 'all',
        fillColor: '#F2C811',
        fillOpacity: 0.5,
        strokeColor: '#F2C811',
        strokeWidth: 1,
        persistSearchArea: false,
        routeRangeMinMapSize: [325, 200],
        routeRangeOptions: {},
        shapeSelectionMode: 'any'
    };

    private _map: azmaps.Map;
    private _drawingManager: azmdraw.drawing.DrawingManager;
    private _container: HTMLElement;
    private _rangeControl: RouteRangeControl;
    private _rangeDataSource: azmaps.source.DataSource;
    private _rangeLayers: (azmaps.layer.LineLayer | azmaps.layer.PolygonLayer)[];
    private _routeRangeBtn: HTMLElement;

    private _hasMouse: boolean = false;
    private _hasFocus: boolean = false;

    private _styler: ControlStyler;  
    private _position: azmaps.ControlPosition;

    private static readonly _css = {
        button: 'azure-maps-control-button',
        inUse: 'in-use',
        hidden: 'hidden-accessible-element'
    };

    /****************************
     * Constructor
     ***************************/
   
    /**
     * A control that lets the user use different methods to select data from the map.
     * @param options Options for defining how the control is rendered and functions.
     */
    constructor(options?: SelectionControlOptions) {
        super();

        this._options = Object.assign(this._options, options || {}); 
        this._rangeDataSource = new azmaps.source.DataSource(null, {
            buffer: 512
        });
    }

    /****************************
     * Public Methods
     ***************************/

    /**
     * Clears any search area polygons added to the map by the selection control.
     */
    public clear(): void {
        this._drawingManager.getSource().clear();
        this._rangeDataSource.clear();
     }
    
    /** Disposes the control. */
    public dispose(): void {
        const self = this;

        if(self._map){
            self._map.controls.remove(self);
        }

        if(self._styler){
            self._styler.dispose();
        }

        Object.keys(self).forEach(k => {
            self[k] = null;
        });
    }

    /** Gets the underlying drawing manager of the selection control. */
    public getDrawingManager(): azmdraw.drawing.DrawingManager {
        return this._drawingManager;
    }

    /** Gets the options of the selection control. */
    public getOptions(): SelectionControlOptions {
        return Object.assign({}, this._options);
    }

    /** Updates the data source used for searching/selection. */
    public setSource(source: azmaps.source.DataSource | azmaps.source.VectorTileSource): void {
        this._options.source = source;
    }

    /**
     * Action to perform when the control is added to the map.
     * @param map The map the control was added to.
     * @param options The control options used when adding the control to the map.
     * @returns The HTML Element that represents the control.
     */
    public onAdd(map: azmaps.Map, options?: azmaps.ControlOptions): HTMLElement {
        const self = this;

        self._position = (options && options.position)? options.position : <azmaps.ControlPosition>'non-fixed';
        self._map = map;

        const opts = self._options;

        const dm = new azmdraw.drawing.DrawingManager(map);
        self._drawingManager = dm;
       
        map.events.add('drawingcomplete', dm, self._searchArea);
        map.events.add('drawingchanged', dm, self._copyDrawnShape);

        //Customize the drawing styles.
        const l = dm.getLayers();
        l.polygonLayer.setOptions({
            fillColor: opts.fillColor,
            fillOpacity: opts.fillOpacity
        });

        const lineOptions = {
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
        const resx = Localization.getResource(map.getStyle().language);      

        //Create the main control container.
        self._createContainer(resx);

        if(self._styler){
            self._styler.updateMap(map);
        } else {
            self._styler = new ControlStyler(self._container, map, opts.style || 'light');
        }

        //If a container is specified, move it to the container once the map has loaded the control. 
        if(opts.container && opts.container !== '') {
            setTimeout(()=> {
                const c = (typeof opts.container === 'string')? document.getElementById(opts.container): opts.container;
                c.appendChild(this._container);
            }, 10);
        }

        return self._container;
    }

    /**
     * Action to perform when control is removed from the map.
     */
    public onRemove(): void {
        const self = this;
        const map = self._map;

        self.clear();

        if (self._container) {
            self._container.remove();
            self._container = null;
        }

        if(map){
            const mapEvents = map.events;
            const rangeControl = self._rangeControl;

            if(rangeControl){                         
                mapEvents.remove('showrange', rangeControl, self._displayRangePolygon);
                mapEvents.remove('rangecalculated', rangeControl, self._searchArea);
                map.controls.remove(rangeControl);
                self._rangeControl = null;
            }

            mapEvents.remove('resize', self._mapResized);  
            map.sources.remove(self._rangeDataSource);
            mapEvents.remove('drawingchanged', self._drawingManager, self._copyDrawnShape);

            if(self._rangeLayers){
                map.layers.remove(self._rangeLayers);
            }
        }

        self._styler.updateMap(null);

        if(self._drawingManager){
            self._drawingManager.dispose();
            self._drawingManager = null;
        }

        self._map = null;
    }

    /****************************
     * Private Methods
     ***************************/

    /**
     * Maps a copy of a drawn shape.
     * @param shape Shape that is being drawn.
     */
    private _copyDrawnShape = (shape: azmaps.Shape) => {
        this._rangeDataSource.setShapes([new azmaps.Shape(new azmaps.data.Polygon(<azmaps.data.Position[]>shape.getCoordinates()))]);
    }

    /**
     * Create the content of the container.
     * @param resx The localization resource.
     */
    private _createContainer(resx: Resource): void {
        
        //Cache variables and function for better minification.        
        const self = this;
        const opts = self._options;
        const css = SelectionControl._css;
        
        const container =  Utils.createElm('div', {
            class: ['azure-maps-control-container'],
            propName: 'selectionControl'
        }, resx);            
        self._container = container;

        const selectionGrid = Utils.createElm('div', {
            class: [css.hidden],
            propName: 'selectionModes'
        }, resx);

        let modes = Object.keys(SelectionControlMode);
        if(Array.isArray(opts.selectionModes)){
            modes = opts.selectionModes as string[];
        }

        modes.forEach(key => {
            const selectionBtn = self._buildSelectModeBtn(key, css.button, resx);
            selectionGrid.appendChild(selectionBtn);

            if(key === 'routeRange'){
                self._routeRangeBtn = selectionBtn;
            }
        });

        container.addEventListener('mouseover', () => {
            self._hasMouse = true;
            container.classList.add(css.inUse);
            selectionGrid.classList.remove(css.hidden);
        });

        container.addEventListener('focusin', () => {
            self._hasFocus = true;
            container.classList.add(css.inUse);
            selectionGrid.classList.remove(css.hidden);
        });

        container.addEventListener('mouseleave', () => {
            self._hasMouse = false;
            if (!self._hasFocus) {
                container.classList.remove(css.inUse);
                selectionGrid.classList.add(css.hidden);
            }
        });

        container.addEventListener('focusout', (event) => {
            if (!(event.relatedTarget instanceof Node && container.contains(event.relatedTarget))) {
                self._hasFocus = false;
                if (!self._hasMouse) {
                    container.classList.remove(css.inUse);
                    selectionGrid.classList.add(css.hidden);
                }
            }
        });

        //Create the flyout button.
        const flyoutBtn = Utils.createElm('button', {
            class: [css.button, 'pointer-selection'],
            propName: 'selectMode',
            attr: {
                type: 'button'
            }
        }, resx);
        
        //If search area is persisted, remove it when the user clicks on the flyout button.
        flyoutBtn.addEventListener('click', () => {
            self.clear();
        });

        if (opts && (self._position === 'top-right' || self._position === 'bottom-right')) {
            container.appendChild(selectionGrid);
            container.appendChild(flyoutBtn);
        } else {
            container.appendChild(flyoutBtn);
            container.appendChild(selectionGrid);
        }

        //Create child route range control.
        const rangeOptions: RouteRangeControlOptions = {
            isVisible: false,
            markerOptions: {
                color: opts.fillColor
            },
            style: opts.style || azmaps.ControlStyle.light,
            collapsible: true,
            calculateOnMarkerMove: false
        };

        if(opts.routeRangeOptions) {
            if(opts.routeRangeOptions.markerOptions){
                opts.routeRangeOptions.markerOptions = Object.assign(rangeOptions.markerOptions, opts.routeRangeOptions.markerOptions);
            }

            Object.assign(rangeOptions, opts.routeRangeOptions);
        }

        const routeRangeControl = new RouteRangeControl(rangeOptions);

        const map = self._map;
        map.controls.add(routeRangeControl);

        self._rangeControl = routeRangeControl;

        map.events.add('resize', self._mapResized);  
        self._mapResized();

        map.events.add('rangecalculated', routeRangeControl, self._searchArea);
        map.events.add('showrange', routeRangeControl, self._displayRangePolygon);
    }

    /**
     * Displays a route range polygon on the map.
     * @param searchArea A polygon search area generated by a route range control.
     */
    private _displayRangePolygon = (searchArea: azmaps.data.Polygon | azmaps.data.MultiPolygon) => {
        this._rangeDataSource.setShapes([searchArea]);
    }

    /** Search within an polygon area. */
    private _searchArea = (searchArea: azmaps.data.Polygon | azmaps.data.MultiPolygon | azmaps.data.Feature<azmaps.data.Geometry, any> | azmaps.Shape) => {
        const self = this;

        if(!self._options.persistSearchArea){
            self.clear();
        }

        const source = self._options.source;

        if(source && searchArea){            
            self._invokeEvent('searchareacreated', (searchArea instanceof azmaps.Shape || searchArea.type === 'Feature') ? <azmaps.data.Polygon>Utils.getGeometry(<azmaps.Shape>searchArea) : <azmaps.data.Polygon>searchArea);

            let shapes = [];

            if(source instanceof azmaps.source.DataSource) {
                shapes = source.getShapes();
            } else if (source instanceof azmaps.source.VectorTileSource) {
                //@ts-ignore
                shapes = map.map.querySourceFeatures(source.getId(), {
                    sourceLayer: self.getOptions().sourceLayer
                });
            }

            self._invokeEvent('dataselected', MapMath.shapesIntersectPolygon(shapes, searchArea));
        }

        //Allow a bit of a delay before removing the drawn area.
        self._drawingManager.setOptions({ mode: <azmdraw.drawing.DrawingMode>'idle' });
    };
    
    /**
     * Creates selection mode buttons.
     * @param name The name of the selection mode button to create. 
     * @param btnClass The button class name.
     * @param resx Resources.
     */
    private _buildSelectModeBtn(name: string, btnClass: string, resx: Resource): HTMLButtonElement  {
        const btn = <HTMLButtonElement>Utils.createElm('button', {
            attr: {
                type: 'button'
            },
            propName: name + 'Selection',
            class: [btnClass, name + '-selection']
        }, resx);
        
        const self = this;

        btn.onclick = () => {
            self.clear();

            if(name === 'routeRange') {
                self._rangeControl.setVisible(true);
            } else {
                self._drawingManager.setOptions({
                    mode: <azmdraw.drawing.DrawingMode>('draw-' + name)
                });
            }
        };

        return btn;
    }

    /** Event handler for when the map resizes. */
    private _mapResized = () => {
        const self = this;
        const minSize = self._options.routeRangeMinMapSize;
        const mapSize = self._map.getMapContainer().getBoundingClientRect();

        self._routeRangeBtn.style.display = (mapSize.width >= minSize[0] && mapSize.height >= minSize[1])? '': 'none';
    };
}