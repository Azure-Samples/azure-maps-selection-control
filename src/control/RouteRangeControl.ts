import * as azmaps from 'azure-maps-control';
import { Utils } from '../helpers/Utils';
import { Localization, Resource } from '../helpers/Localization';
import { SimpleBinding } from '../helpers/SimpleBinding';
import { ControlStyler } from '../helpers/ControlStyler';
import { MapMath } from '../extensions/MapMath';
import { VehicleLoadTypes } from '../Enums/VehicleLoadTypes';
import { WeightUnits } from '../Enums/WeightUnits';
import { RouteRangeControlOptions } from './RouteRangeControlOptions';

/** The events supported by the `RouteRangeControl`. */
export interface RouteRangeControlEvents {
    /** Event fired when a route range has been calculated. */
    rangecalculated: azmaps.data.Polygon | azmaps.data.MultiPolygon;

    /** Event fired when a route range is calculated and the showArea option is set to true. */
    showrange: azmaps.data.Polygon | azmaps.data.MultiPolygon;

    /** Event fired when an error occurs. */
    error: string;
}

interface RouteRangeSettings {
    /** One or more origin points. */
    origin?: azmaps.data.Position;

     /** The mode of travel for the requested route. If not defined, default is 'car'. */
    travelMode?: 'pedestrian' | 'bicycle' | 'car' | 'truck';

    /** The type of route range to calculate. */
    selectionArea?: 'time' | 'distance';

    /** Time in minutes for a time based selection area. */
    travelTime?: number;

    /** Distance for a distance based selection area. */
    distance?: number;

    /** Unit of measurement for distances. Default: `'meters'` */
    distanceUnits?: azmaps.math.DistanceUnits;
    
    /** Specific if current traffic conditions should be considered. Note that historical traffic conditions may still be considered. */
    traffic?: boolean;

    /** If traffic is enabled, date to use for predictive traffic. Defaults to current date. */
    leaveAtDate?: string;

    /** If traffic is enabled, time to use for predictive traffic. Defaults to current rounded up to the next 5 minute increment. */
    leaveAtTime?: string;

    /** Specifies something that the route calculation should try to avoid when determining the route.  */
    avoid?: ('borderCrossings' | 'carpools' | 'ferries' | 'motorways' | 'tollRoads' | 'unpavedRoads')[];

    /** Height of the vehicle. A value of 0 means that height restrictions are not considered. */
    height?: number;
        
    /** Length of the vehicle. A value of 0 means that length restrictions are not considered. */
    length?: number;

    /** Width of the vehicle. A value of 0 means that width restrictions are not considered. */
    width?: number;

    /** Axle weight of the vehicle in kilograms. */
    axleWeight?: number;

    /** Unit of measurement for weights. Default: `'kilograms'` */
    weightUnits?: WeightUnits;

    /** Unit of measurement for lengths, widths and heights. Default: `'meters'` */
    lengthUnits?: azmaps.math.DistanceUnits;

    /** Type of load that a truck is carrying. */
    loadType?: VehicleLoadTypes[];

    /** 
    * Number of milliseconds to wait before showing the route range options when the control is displayed. 
    * This is meant to give users a change to adjust the origin location on small maps where the control will cover the marker. 
    * Default: 5000 
    */
    showArea?: boolean;
}

/** A control that provides a form for requesting a route range polygon. Adds a marker to the map to select an origin location. */
export class RouteRangeControl extends azmaps.internal.EventEmitter<RouteRangeControlEvents> implements azmaps.Control {
    /****************************
     * Private Properties
     ***************************/

    /** Default options. */
    private _options: RouteRangeControlOptions = {
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

    /** Map instance. */
    private _map: azmaps.Map;

    /** Root container. */
    private _container: HTMLElement;

    /** HTML elements that are shown/hidden depending on map size. */
    private _optionSection: HTMLElement;
    private _searchBtn: HTMLElement;  

    /** The marker for selecting the origin location. */
    private _marker: azmaps.HtmlMarker;

    /** Monitors the map style and updates the control as needed. */
    private _styler: ControlStyler;

    /** Data binder for the control. */
    private _binding: SimpleBinding;

    /** Resources for localization. */
    private _resx: Resource;

    /** The timeout used for hiding the options for a period of time when the map is small. */
    private _hideOptionsTimeout: NodeJS.Timeout; 

    /** How long to delay a search after the marker has been moved using the keyboard. */
    private _markerMoveSearchDelay = 600;

    /** Timeout for delayed search after marker has been moved with an arrow key. */
    private _markerKeyMoveTimeout: NodeJS.Timeout;

    /** How many pixels the marker will move for an arrow key press occurs on the top level route range container. */
    private _arrowKeyOffset = 5;

    /** When map is small, this specifies how long the options should be hidden to give the user a chance to move the marker. */
    private _showOptionsDelay: number = 0;

    /** CSS class names. */
    private static readonly _css = {
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

    /** Data bound settings used for requesting a route range polygon. */
    private _settings: RouteRangeSettings = {};

    /****************************
     * Constructor
     ***************************/
   
    /**
     * A control that provides a form for requesting a route range polygon. Adds a marker to the map to select an origin location.
     * @param options Options for defining how the control is rendered and functions.
     */
    constructor(options?: RouteRangeControlOptions) {
        super();

        const self = this;
        if(options.markerOptions){
            Object.assign(options.markerOptions, self._options.markerOptions); 
        }
        self._options = Object.assign(self._options, options || {}); 
        self._marker = new azmaps.HtmlMarker(Object.assign(self._options.markerOptions, { draggable: true }));
    }

    /****************************
     * Public Methods
     ***************************/
    
    /** Disposes the control. */
    public dispose(): void {
        const self = this;

        if(self._map){
            self._map.controls.remove(self);
        }

        if(self._binding){
            self._binding.dispose();
            self._binding = null;
        }

        if(self._styler){
            self._styler.dispose();
        }

        Object.keys(self).forEach(k => {
            self[k] = null;
        });
    }

    /**
     * Sets the options for the marker.
     * @param options Marker options.
     */
    public setMarkerOptions(options: azmaps.HtmlMarkerOptions): void {
        Object.assign(this._options.markerOptions, options);
        this._marker.setOptions(options);
    }

    /**
     * Hides or shows the route range control
     * @param isVisible Specifies if the route range control should be displayed or not.
     */
    public setVisible(isVisible: boolean): void {
        const self = this;

        if(self._marker && self._map) {
            const cam = self._map.getCamera();
            let pos = cam.center;

            //If the previous origin is within the current map view, use that, otherwise use center of map so that user doesn't have to go looking for it.
            if(self._settings.origin && azmaps.data.BoundingBox.containsPosition(cam.bounds, self._settings.origin)) {
                pos = self._settings.origin;
            }

            self._settings.origin = pos;

            self._marker.setOptions({ position: pos, visible: isVisible });

            if(isVisible && self._options.calculateOnMarkerMove){
                self._onSearch();
             }
        }

        if(self._container){
            const display = (isVisible)? '' : 'none';

            self._optionSection.style.display = 'none';
            self._searchBtn.style.display = 'none';
            self._container.style.display = display;
            
            //Only let the instructions be displayed initially for a period of time so that the user can focus on moving the origin marker.
            if(isVisible){ 
                self._hideOptionsTimeout = setTimeout(() => {
                    self._optionSection.style.display = '';
                    self._searchBtn.style.display = '';                    
                    self._hideOptionsTimeout = null;
                }, self._showOptionsDelay);
            }
        }

        //Set focus on the container if being made visible the container exists.
        if( self._options.isVisible !== isVisible && isVisible && self._container){
            self._container.focus();
        }

        self._options.isVisible = isVisible;
    }

    /** Gets the options of the selection control. */
    public getOptions(): RouteRangeControlOptions {
        return Object.assign({}, this._options);
    }

    /**
     * Action to perform when the control is added to the map.
     * @param map The map the control was added to.
     * @param options The control options used when adding the control to the map.
     * @returns The HTML Element that represents the control.
     */
    public onAdd(map: azmaps.Map, options?: azmaps.ControlOptions): HTMLElement {        

        if(options && options.position && options.position !== 'non-fixed') {
            map.controls.remove(this);
            map.controls.add(this, { position: <azmaps.ControlPosition>'non-fixed' });
            return;
        }

        const self = this;
        self._map = map;
        
        const marker = self._marker;
        marker.setOptions({ visible: self._options.isVisible });
        map.markers.add(marker);

        const mapEvents = map.events;
        mapEvents.add('dragstart', marker, self._onMarkerDargStart);
        mapEvents.add('dragend', marker, self._onMarkerDragged);

        //Get the resource file for the maps language.
        const resx = Localization.getResource(map.getStyle().language);
        self._resx = resx;

        //Create the main control container.        
        self._createContainer(resx);
        
        if(self._styler){
            self._styler.updateMap(map);
        } else {
            self._styler = new ControlStyler(self._container, map, self._options.style || 'light');
        }

        return self._container;
    }

    /**
     * Action to perform when control is removed from the map.
     */
    public onRemove(): void {
        const self = this;
        const container = self._container;

        if (container) {
            container.removeEventListener('keydown', this._onContainerKeyDown);
            container.remove();
            self._container = null;
        }

        if(self._binding){
            self._binding.dispose();
            self._binding = null;
        }

        self._styler.updateMap(null);
        
        const map = self._map;
        const mapEvents = map.events;
        const marker = self._marker;

        mapEvents.remove('resize', self._mapResized);  
        mapEvents.remove('dragstart', marker, self._onMarkerDargStart);
        mapEvents.remove('dragend', marker, self._onMarkerDragged);
        map.markers.remove(marker);        
        self._map = null;
    }

    /****************************
     * Private Methods
     ***************************/

    /**
     * Callback function for when localization resources have loaded. 
     * Create the content of the container.
     * @param resx The localization resource.
     */
    private _createContainer = (resx: Resource) => {

        //Cache variables and function for better minification.        
        const self = this;
        const css = RouteRangeControl._css;
        const createElm = Utils.createElm;    
                
        //Create a binding to the settings object.
        const binding = new SimpleBinding(self._settings);
        self._binding = binding;
        
        //Create the main container.
        const container = Utils.createElm('div', { 
            class: ['azure-maps-control-container', RouteRangeControl._css.container], 
            style: {
                display: (self._options.isVisible)? '': 'none'
            },
            attr: {
                'aria-label': resx.routeRangeControl,
                 tabindex: '-1'
            }
        });

        container.addEventListener('keydown', this._onContainerKeyDown);
          
        self._container = container;      

        //Create travelTime option.
        //<input type="number" value="15" min="1" max="1440">
        const travelTime = createElm('input', {
            attr: {
                type: 'number',
                value: '15',
                min: '1',
                max: '1440'
            },
            propName: 'travelTime'
        }, resx, binding);

        const timeOptionRow = self._createOptionRow(resx.travelTime, travelTime);

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
        const distance = createElm('input', {
            attr: {
                type: 'number',
                value: '5',
                min: '1',
                max: '1000'
            },
            propName: 'distance'
        }, resx, binding);

        const distanceUnits = createElm('select', {
            selectVals: ['meters', 'miles', 'kilometers', 'yards'],
            selected: 'kilometers',
            propName: 'distanceUnits'
        }, resx, binding);

        const distanceOptionRow = self._createOptionRow(resx.distance, [distance, distanceUnits]);

        //Create show area option.
        //<input type="checkbox" checked="checked"/>
        const showArea = createElm('input', {
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

        const leaveAtDate = <HTMLInputElement>createElm('input', {
            attr: {
                type: 'date'
            },
            style: {
                marginBottom: '3px'
            },
            propName: 'leaveAtDate'
        }, resx, binding);

        const leaveAtTime = <HTMLInputElement>createElm('input', {
            attr: {
                type: 'time',
                step: '300'
            },
            propName: 'leaveAtTime'
        }, resx, binding);

        const trafficOption = self._createOptionRow(resx.leaveAt, [leaveAtDate, leaveAtTime]);
        trafficOption.style.display = 'none';

        const isDateTimeSupported = Utils.isDateTimeInputSupported();

        //Set the initial date/time to the current date/time to the next 5 minute round value.
        if(isDateTimeSupported){
            //Set the date and time pickers.
            let d = new Date();
            let hour: string | number = d.getHours();    
            let min: string | number = d.getMinutes();

            //Round minutes to the next 5 minute.
            min = Math.ceil(min / 5) * 5;

            if(min === 60){
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

            const hh = ((hour < 10)? '0' : '') +  Utils.USNumberFormat(hour);
            const mm = ((min < 10)? '0' : '') +  Utils.USNumberFormat(min);
                    
            self._settings.leaveAtTime = `${hh}:${mm}`;

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
        const length = createElm('input', {
            attr: {
                type: 'number',
                min: '0'
            },
            propName: 'length'
        }, resx, binding);
        
        const lengthUnits = createElm('select', {
            selectVals: ['feet', 'meters', 'yards'],
            selected: 'meters',
            propName: 'lengthUnits'
        }, resx, binding);

        const lengthRow =  self._createOptionRow(resx.length, [length, lengthUnits], true);

        //Create height options.
        /*
         <div class="atlas-route-range-row">
            <div class="atlas-route-range-col1">Height</div>
            <div class="atlas-route-range-col2">
                <input type="number" min="0"/>
            </div>
        </div>
        */
        const height = createElm('input', {
            attr: {
                type: 'number',
                min: '0'
            },
            propName: 'height'
        }, resx, binding);

        const heightRow =  self._createOptionRow(resx.height, height, true);

        //Create width options.
        /*
         <div class="atlas-route-range-row">
            <div class="atlas-route-range-col1">Width</div>
            <div class="atlas-route-range-col2">
                <input type="number" min="0"/>
            </div>
        </div>    
        */
        const width = createElm('input', {
            attr: {
                type: 'number',
                min: '0'
            },
            propName: 'width'
        }, resx, binding);

        const widthRow =  self._createOptionRow(resx.width, width, true);

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
        const axleWeight = createElm('input', {
            attr: {
                type: 'number',
                min: '0'
            },
            propName: 'axleWeight'
        }, resx, binding);
        
        const weightUnits = createElm('select', {
            selectVals: ['kilograms', 'longTon', 'metricTon', 'pounds', 'shortTon'],
            selected: 'kilograms',
            propName: 'weightUnits'
        }, resx, binding);
        
        const weightRow =  self._createOptionRow(resx.axleWeight, [axleWeight, weightUnits], true);

        //Create toggle button for truck dimensions.
        /*
        <div class="atlas-route-range-row">
            <div class="atlas-route-range-col1">
                <button class="atlas-route-range-expand-btn" aria-expanded="false" aria-label="Toggle truck dimension options">Truck dimensions <span class="atlas-route-range-toggle-icon"></span></button>
            </div>
        </div> 
        */
        const truckDimensionsToggle = self._createToggleBtn(resx.truckDimensions, resx.truckDimensionsToggle, [
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
        const loadTypeOptions = self._createCheckboxGroup('loadType', ['USHazmatClass2', 'USHazmatClass8', 'USHazmatClass1', 'USHazmatClass3', 'USHazmatClass4', 'otherHazmatHarmfulToWater', 'USHazmatClass9', 'USHazmatClass5', 'USHazmatClass6', 'USHazmatClass7'], 
            resx, (values) => {

            //Cross reference USHazmatClass1 with otherHazmatExplosive.
            const USHazmatClass1 = values.indexOf('USHazmatClass1');
            const otherHazmatExplosive = values.indexOf('otherHazmatExplosive');

            if(USHazmatClass1 > 0){
                if(otherHazmatExplosive === -1){
                    values.push('otherHazmatExplosive');
                }
            } else if(otherHazmatExplosive > 0) {
                //Remove this value as the USHazmatClass1 is unselected.
                values = values.splice(otherHazmatExplosive, 1);
            }  

            //Cross reference USHazmatClass9 with otherHazmatGeneral.
            const USHazmatClass9 = values.indexOf('USHazmatClass9');
            const otherHazmatGeneral = values.indexOf('otherHazmatGeneral');
            
            if(USHazmatClass9 > 0){
                if(otherHazmatGeneral === -1){
                    values.push('otherHazmatGeneral');
                }
            } else if(otherHazmatGeneral > 0) {
                //Remove this value as the USHazmatClass9 is unselected.
                values = values.splice(otherHazmatGeneral, 1);
            }   
        });

        //Group truck options.
        const truckToggleOptions = [truckDimensionsToggle, loadTypeOptions[0]];
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
        const avoidOptions =  self._createCheckboxGroup('avoid', ['borderCrossings', 'carpools', 'ferries', 'motorways', 'tollRoads', 'unpavedRoads'], resx);

        //Create traffic option.
        const useTraffic = createElm('input', {
            attr: { type: 'checkbox' },
            propName: 'traffic',
            bindingChanged: (val) => {
                trafficOption.style.display = self._getDateTimePickerDisplay();    
            }
        }, resx, binding);

        const useTrafficRow = self._createOptionRow(resx.traffic, useTraffic);

        //Create selection area option.
        /*
            <select>
                <option value="distance">Distance</option>
                <option value="time" selected>Time</option>
            </select>
        */
        const selectionArea = createElm('select', {
            selectVals: ['distance', 'time'],
            selected: 'time',
            propName: 'selectionArea',
            bindingChanged: (val) => {
                //Hide/show options depending on the selection area value.
                let isTime = (val === 'time');

                timeOptionRow.style.display = (isTime)? '': 'none'; 
                distanceOptionRow.style.display = (!isTime)? '': 'none'; 
                useTrafficRow.style.display = (isTime && (self._settings.travelMode === 'car' || self._settings.travelMode === 'truck'))? '': 'none';
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
       const travelMode = createElm('select', {
         selectVals: ['car', 'bicycle', 'pedestrian', 'truck'],
         selected: 'car',
         propName: 'travelMode',
         bindingChanged: (val)=> {
            //Hide/show certain options depending on the selected travel mode.
            let isVehicle = true;
            let isTruck = false;

            switch(val){
                case 'pedestrian':
                case 'bicycle':
                    isVehicle = false;
                    break;
                case 'truck':
                    isTruck = true;
                    break; 
            }

            avoidOptions.forEach(ao => {
                ao.style.display = (isVehicle)? '': 'none';
            });

            truckToggleOptions.forEach(toggle => {
                toggle.style.display = (isTruck)? '': 'none';

                //Toggle close all truck options if not showing truck,
                if(!isTruck && toggle.getAttribute('aria-expanded') === 'true'){
                    toggle.click();
                }
            });    
            
            useTrafficRow.style.display = (isVehicle && self._settings.selectionArea === 'time')? '': 'none';
            trafficOption.style.display = self._getDateTimePickerDisplay();
         }}, resx, binding);

        //Create buttons
        /*
         <div class="atlas-route-range-row">
            <div class="atlas-route-range-col1"><button class="atlas-route-range-search-btn">Search</button></div>
            <div class="atlas-route-range-col2"><button class="atlas-route-range-cancel-btn">Cancel</button></div>
        </div>
         */

        //Create search button.
        const searchBtn = createElm('button', {
            class: [css.searchBtn],
            propName: 'search',
            innerHTML: resx['search']
        }, resx);

        searchBtn.onclick = self._onSearch;

        self._searchBtn = searchBtn;

        //Create cancel button.
        const cancelBtn = createElm('button', {
            class: [css.cancelBtn],
            propName: 'cancel',            
            innerHTML: resx['cancel']
        }, resx);

        if(!self._options.collapsible){
            cancelBtn.style.display = 'none';
        }

        cancelBtn.onclick = self._onCancel;

        //Create button row.
        const btnRow =  Utils.createElm('div', { 
            class: [css.row], 
            style: {
                display: 'block'
            },
            children: [Utils.createElm('div', {
                style: {
                    'text-align': 'center'
                },
                children: [searchBtn, cancelBtn]
            })]});

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
        ]});

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

        if(self._options.isVisible) {
            self.setVisible(self._options.isVisible);
        }
    }

    /**
      * Creates an option row.
      * @param title Title of the option.
      * @param children Options to add as children.
      * @param indent Specifies if the col1 item should be indented.
      */
    private _createOptionRow(title: string, children: HTMLElement | HTMLElement[], indent?: boolean): HTMLElement {
        const css = RouteRangeControl._css;

        return Utils.createElm('div', { class: [css.row], children: [
            Utils.createElm('div', { class: [css.col1, (indent)? 'indent': undefined], innerHTML: title }),
            Utils.createElm('div', { class: [css.col2], children: Array.isArray(children)? children: [children]})
        ]});
    }

    /**
     * Creates a toggle button.
     * @param displayLabel Display label for button.
     * @param ariaLabel Aria label for button.
     * @param children Children to hide/show when toggled.
     */
    private _createToggleBtn(displayLabel: string, ariaLabel: string, children: HTMLElement[]): HTMLElement {
         //<button class="atlas-route-range-expand-btn" aria-expanded="false" aria-label="Toggle truck dimension options">Truck dimensions <span class="atlas-route-range-toggle-icon"></span></button>
        const css = RouteRangeControl._css;

        const toggleBtn = Utils.createElm('button', {
            attr: {
                type: 'button',
                'aria-expanded': 'false',
                'aria-label': ariaLabel
            },
            class: [css.expndBtn],
            innerHTML: `${displayLabel} <span class="${css.toggleIcon}"></span>`}
        );

        //Hide all children by default.
        children.forEach(c => {
            c.style.display = 'none'
        });

        toggleBtn.onclick = () => {
            let expanded = toggleBtn.getAttribute('aria-expanded');
            let display = '';

            if(expanded === 'true'){
                expanded = 'false';
                display = 'none';
                toggleBtn.getElementsByClassName(css.toggleIcon)[0].classList.remove(css.expandedToggleIcon);
            } else {
                expanded = 'true';
                toggleBtn.getElementsByClassName(css.toggleIcon)[0].classList.add(css.expandedToggleIcon);
            }

            toggleBtn.setAttribute('aria-expanded', expanded);

            children.forEach(c => {
                c.style.display = display
            });
        };

        return toggleBtn;
    }

    /**
     * Creates a row with two columns that contains a list of checkboxes that represent a group of options. Returns two elements; a toogle button, and a row div with all the options inside.
     * @param propName Property name to bind to.
     * @param values Values to create chack boxes for. S
     * @param resx Resources.
     * @param onchange Callback function to trigger when binding value changes.
     */
    private _createCheckboxGroup(propName: string, values: string[], resx: Resource, onchange?: (val: string[]) => void): [HTMLElement, HTMLElement] {
        const css = RouteRangeControl._css;
        const numVals = values.length;
        
        let elm: HTMLInputElement;
        let i: number;
        let label: HTMLElement;

        //Create the options.
        const numCol1 = Math.ceil(numVals / 2);
        const col1Children: HTMLElement[] = [];
        const col2Children = [];

        for(i = 0; i < numVals; i++){
            //Create the checkbox.
            elm = <HTMLInputElement>Utils.createElm('input', { attr: { type: 'checkbox', value: values[i] }, propName: values[i] }, resx);

            //Wrap the element with a label.
            label = Utils.createElm('label', {
                innerHTML: resx[values[i]],
                children: [elm]
            });

            //Bind element value.
            this._binding.bind(label, propName, true, onchange);

            if(i < numCol1) {
                col1Children.push(label);
                if(i < numCol1 - 1){
                    col1Children.push(document.createElement('br'));
                }
            } else {
                col2Children.push(label);

                if(i < numVals - 1){
                    col2Children.push(document.createElement('br'));
                }
            }
        }

        //Create first column of options.
        const col1 = Utils.createElm('div', {
            class: [css.col1],
            style: {
                display: 'none'
            },
            children: col1Children
        });

        //Create second column of options.
        const col2 = Utils.createElm('div', {
            class: [css.col2],
            style: {
                display: 'none'
            },
            children: col2Children
        });
        
        //Create row of options.
        const row = Utils.createElm('div', { class: [css.row], children: [col1, col2]});       

        //Create toggle button.
        const toggleBtn = this._createToggleBtn(resx[propName], resx[propName + 'Toggle'], [col1, col2]);

        return [toggleBtn , row];
    }

    /**
     * Gets the display value for the data time picker.
     */
    private _getDateTimePickerDisplay(): string {
        const self = this;
        return (Utils.isDateTimeInputSupported() && self._settings.selectionArea === 'time' && self._settings.traffic && (self._settings.travelMode === 'car' || self._settings.travelMode === 'truck')) ? '': 'none';
    }

    /** Event handler for when the search button is pressed. */
    private _onSearch = () => {
        //Cache functions and variables for better minification.
        const self = this;
        const convertDistance = azmaps.math.convertDistance;
        const round = Math.round;
        const request = self._settings;

        //Ensure numbers are properly formatted when converted to a string. Don't allow comma groupings.
        const numberFormatter =  Utils.USNumberFormat;
        
        //Create the query string value. Have to manually create string since loadType and avoid values have to be added as individual parameters which JSON objects don't allow.
        const queryString: string[] = [];//encodeURIComponent

        //Origin query
        queryString.push(`query=${numberFormatter(request.origin[1])},${numberFormatter(request.origin[0])}`);

        queryString.push(`travelMode=${request.travelMode}`);

        if(request.selectionArea === 'time'){
            queryString.push(`timeBudgetInSec=${numberFormatter(round(request.travelTime * 60))}`);

            if(request.traffic){
                queryString.push(`traffic=true`);
    
                if(request.leaveAtDate && request.leaveAtTime){
                    //Check to see if seconds need to be added.
                    let t = request.leaveAtTime;

                    if(t.match(/:/g).length === 1){
                        t += ':00';
                    }

                   //1996-12-19T16:39:57 - Don't specify timezone in request. The service will use the timezone of the origin point automatically.
                   queryString.push(`departAt=${request.leaveAtDate}T${t}`);
                }
            }
        } else {
            queryString.push(`distanceBudgetInMeters=${numberFormatter(round(convertDistance(request.distance, request.distanceUnits, 'meters')))}`);
        }

        if (request.travelMode === 'car' || request.travelMode === 'truck') {
            //avoid
            if(request.avoid){
                request.avoid.forEach(a => {
                    queryString.push(`avoid=${a}`);
                });
            }
        } 

        if(request.travelMode === 'truck'){
            //vehcileLength (m), vehicleWidth (m), vehicleHeight (m), vehicleAxleWeight (kg), vehicleLoadType         
            if(!isNaN(request.length)){
                queryString.push(`vehcileLength=${numberFormatter(round(convertDistance(request.length, request.lengthUnits, 'meters')))}`);
            }

            if(!isNaN(request.width)){
                queryString.push(`vehicleWidth=${numberFormatter(round(convertDistance(request.width, request.lengthUnits, 'meters')))}`);
            }

            if(!isNaN(request.height)){
                queryString.push(`vehicleHeight=${numberFormatter(round(convertDistance(request.height, request.lengthUnits, 'meters')))}`);
            }

            if(!isNaN(request.height)){
                queryString.push(`vehicleAxleWeight=${numberFormatter(round(MapMath.convertWeight(request.axleWeight, request.weightUnits, 'kilograms')))}`);
            }

            if(request.loadType){
                request.loadType.forEach(lt => {
                    queryString.push(`vehicleLoadType=${lt}`);
                });
            }
        } 
        
        //Create the URL request. 
        const url = `https://${self._map.getServiceOptions().domain}/route/range/json?api-version=1.0&${queryString.join('&')}`;

        //Sign the request. This will use the same authenication that the map is using to access the Azure Maps platform.
        //This gives us the benefit of not having to worry about if this is using subscription key or Azure AD.
        const requestParams = self._map.authentication.signRequest({ url: url });

        fetch(requestParams.url, {
            method: 'GET',
            mode: 'cors',
            headers: new Headers(<Record<string, string>>requestParams.headers)
        })
        .then(r => r.json(), e => self._invokeEvent('error', self._resx.routeRangeError))
        .then(response => {
            if (response.reachableRange) {
                //Convert the response into GeoJSON and add it to the map.

                const positions = response.reachableRange.boundary.map(function (latLng) {
                    return [latLng.longitude, latLng.latitude];
                });

                const isochrone = new azmaps.data.Polygon([positions]);

                self._invokeEvent('rangecalculated', isochrone);

                if(self._settings.showArea){
                    self._invokeEvent('showrange', isochrone);
                }
            } else {
                self._invokeEvent('error', self._resx.routeRangeError);
            }
        }, error => self._invokeEvent('error', self._resx.routeRangeError));

        if(self._options.collapsible){
            //Hide the input panel and marker.
            self.setVisible(false);
        }
    };

    /** Event handler for when the cancel button is clicked. */
    private _onCancel = () => {
         //Hide the input panel and marker.
         this.setVisible(false);
    };

    /** Event handler for when the origin marker is dragged. */
    private _onMarkerDragged = () => {
        const self = this;

        self._settings.origin = self._marker.getOptions().position;

        self._optionSection.style.display = '';        
        self._searchBtn.style.display = '';   
        self._hideOptionsTimeout = null;

        if(self._options.calculateOnMarkerMove){
            self._onSearch();
        }
    };

    /** Clears the timeout that is preventing the route range options panel from appearing. */
    private _onMarkerDargStart = () => {
        if(this._hideOptionsTimeout){
            clearTimeout(this._hideOptionsTimeout);
            this._hideOptionsTimeout = null;
        }
    };

    /** Event handler for when a the container has focus and arrow keys are used to adjust the position of the marker. */
    private _onContainerKeyDown = (e: KeyboardEvent) => {
        //If the top level container has focus and an arrow key is pressed, move the marker.
        if(e.keyCode > 36 && e.keyCode < 41 && (<HTMLElement>e.target).classList.contains('azure-maps-control-container')){
            const self = this;
            
            //Convert the position of the marker to pixels based on the current zoom level of the map, then offset it accordingly. 
            const zoom = self._map.getCamera().zoom;
            let pixel = azmaps.math.mercatorPositionsToPixels([self._marker.getOptions().position], zoom)[0];
            const offset = self._arrowKeyOffset;

            //Left arrow = 37, Up arrow = 38, Right arrow = 39, Down arrow = 40
            if(e.keyCode === 37){
                pixel[0] -= offset;
            } else if(e.keyCode === 38){
                pixel[1] -= offset;
            } else if(e.keyCode === 39){
                pixel[0] += offset;
            } else if(e.keyCode === 40){
                pixel[1] += offset;
            }

            const pos = azmaps.math.mercatorPixelsToPositions([pixel], zoom)[0];

            self._marker.setOptions({
                position: pos
            });

            self._settings.origin = pos;

            if(self._options.calculateOnMarkerMove){
                if(self._markerKeyMoveTimeout){
                    clearTimeout(self._markerKeyMoveTimeout);
                }

                self._markerKeyMoveTimeout = setTimeout(() => {
                    self._onSearch();
                }, self._markerMoveSearchDelay);
            }

            e.preventDefault();
            e.stopPropagation();
        }
    }
    
    /** Event handler for when the map resizes. */
    private _mapResized = () => {
        const self = this;
        const mapSize = self._map.getMapContainer().getBoundingClientRect();

        //If the map is 750 pixels wide or more, offset the position of the control away from the edge a little.
        let min = '';
        let delay = 0;
        const position = self._options.position;

        if(mapSize.width < 750 || (position === 'center' && mapSize.height < 600)) {
            min = '-min';

            //If the map is less 750 pixels width or 600 pixels high when centered, delay the display of options in the container so that the user has a chance to move the marker before it is covered up. 
            //This delay will be be short circuited when the user stops dragging the marker.
            delay = 5000;
        } else if(position !== 'center'){
            //Check to see see if there are any other controls on the same side as this control. If not, then minimize the gap between the control and the side of the map.
            const controlContainers = Array.from((<HTMLDivElement>self._map.controls['controlContainer']).children);
            let cnt = 0;

            controlContainers.forEach(c => {
                if(c.classList.toString().indexOf(position) > -1){
                    cnt += c.children.length;
                }
            });

            if(cnt === 0){
                min = '-min';
            }
        }

        self._container.classList.remove('left', 'right', 'center', 'left-min', 'right-min', 'center-min')
        self._container.classList.add(position + min);

        self._showOptionsDelay = delay;
    };
}