import * as azmaps from 'azure-maps-control';
import { Utils } from '../helpers/Utils';

/** A class that manages the style of a control. Add's 'light' or 'dark' as a CSS class to the container. */
export class ControlStyler {
    /****************************
     * Private Properties
     ***************************/

    private _map: azmaps.Map;
    private _style: string;
    private _container: HTMLElement;

    private _observer: MutationObserver;    
    private _theme: azmaps.ControlStyle;

    /****************************
     * Constructor
     ***************************/
   
    /**
     * A class that manages the style of a control. Add's 'light' or 'dark' as a CSS class to the container.
     */
    constructor(container: HTMLElement, map: azmaps.Map, style: string) {
        this._container = container;
        this._map = map;
        this.setStyle(style);
    }

    /****************************
     * Public Methods
     ***************************/
 
    /**
     * Disposes this resource
     */
    public dispose(): void {
        if (this._container) {
            this._container = null;
        }

        this.updateMap(null);

        Object.keys(this).forEach(k => {
            this[k] = null
        });
    }

    /**
     * Updates the map reference.
     * @param map The new map reference.
     */
    public updateMap(map: azmaps.Map): void {
        if(this._map && this._style === azmaps.ControlStyle.auto){
            this._map.events.remove('styledata', this._onStyleChange);
        }

        this._map = map;
        if(map && this._style === azmaps.ControlStyle.auto){
            map.events.add('styledata', this._onStyleChange);
        }
    }

    /**
     * Sets the style.
     * @param style The new style.
     */
    public setStyle(style: string) {
        const self = this;

        if(style !== self._style){
            self._container.classList.remove(style);

            if(self._style === azmaps.ControlStyle.auto){
                self._map.events.remove('styledata', self._onStyleChange);
            }

            // Set the style or add the auto listener.
            if (style.toLowerCase() === azmaps.ControlStyle.auto) {
                self._onStyleChange();
                self._map.events.add('styledata', self._onStyleChange);
            } else {
                self._container.classList.add(style);
            }

            self._style = style;
        }
    }

    /****************************
     * Private Methods
     ***************************/

    /**
     * Sets the control's theme (light/dark).
     * Only applies changes if the theme is different than the previous.
     */
    private _setTheme(theme: string): void  {
        // Only update if the theme is different.
        if (this._theme !== theme) {
            this._container.classList.remove(this._theme);
            this._container.classList.add(theme);
            this._theme = theme as azmaps.ControlStyle;
        }
    }

    /**
     * A callback for when the map's style changes.
     * Used for auto styling.
     */
    private _onStyleChange = () => {
        if (this._map.getStyle().style.toLowerCase().startsWith('blank')) {
            // If the style is blank the div background should decide the theme.
            if (!this._observer) {
                // Add an observer to see changes to the background.
                this._onBackgroundChange();
                this._observer = new MutationObserver(this._onBackgroundChange);
                this._observer.observe(this._map.getMapContainer(), { attributes: true, attributeFilter: ['style'] });
            }
        } else {
            if (this._observer) {
                // Remove any existing observer for non-blank styles.
                this._observer.disconnect();
                delete this._observer;
            }

            // If the style is anything but blank the style definition should decide the theme.
            //When the style is dark (i.e. satellite, night), show the dark colored theme.
            let theme = 'light';
            if(['satellite', 'satellite_road_labels', 'grayscale_dark','night'].indexOf(this._map.getStyle().style) > -1){
                theme = 'dark';
            }

            this._setTheme(theme);
        }
    }

    /**
     * A callback for when the map's
     */
    private _onBackgroundChange = () => {
        // Calculate the luminosity of the map div's background to determine the theme.
        try {
            var bg = this._map.getMapContainer().style.backgroundColor;

            if(bg === ''){
                this._setTheme('light');
            } else {
                //TODO: update to use built in color tools when available.

                //Try to parse the color, by using a canvas.
                //Use an offscreen canvas to convert the color value to RGB.
                const canvas = <HTMLCanvasElement>Utils.createElm('canvas', { 
                    style: {
                        width: '1px',
                        height: '1px',
                        position:'absolute',
                        visibility:'hidden'
                    }
                });

                const context = canvas.getContext("2d");
                context.beginPath();
                context.rect(0,0,1,1);
                context.fillStyle = bg;
                context.fill();

                const imgData = context.getImageData(0, 0, 1, 1);

                //rbga values for the element in the middle
                const rgba = imgData.data.slice(0, 4);
                
                //Convert the opacity to 0..1
                rgba[3] = rgba[3] / 255.0;

                //Calculate brightness: http://alienryderflex.com/hsp.html
                let brightness  =  Math.sqrt(.299*rgba[0]*rgba[0] + .587*rgba[1]*rgba[1] + .114*rgba[2]*rgba[2]);

                //If brightness is greater than 127 on a 256 scale, it is bright.
                const theme = brightness > 127 ? 'light' : 'dark';
                this._setTheme(theme);
            }
        } catch {
            // If the background color can't be parsed assume it is light.
            this._setTheme('light');
        }
    }
}