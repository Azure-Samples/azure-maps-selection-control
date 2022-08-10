import atlas, * as azmaps from 'azure-maps-control';
import { SimpleBinding } from './SimpleBinding';

/** Object containing details for creating a DOM element. */
export interface ElementInfo {
    /** Attribute values to add to the element. */
    attr?: { [key: string]: string };

    /** The css classes to add to the element. */
    class?: string[];

    /** The CSS style values to add to the element. */
    style?: { [key: string]: any };

    /** The property name for binding to objext and getting resource values for title and alt attribute values for accessibility. */
    propName?: string;

    /** If the element is a select tag, these are the options values. These values will be looked up in the resource table as well for display name but will fallback on displaying the value. */
    selectVals?: string[];

    /** If the element is a select tag, this is the name of the selected option. */
    selected?: string;

    /** HTML or text to add to the element. */
    innerHTML?: string;

    /** Child elements to append to this element. */
    children?: HTMLElement[];

    /** Change event for binding. */
    bindingChanged?: (val: string | number | string[]) => void;
}

export class Utils {
    /** Number format for en-US decimal value numbers with no comma groupings. */
    public static USNumberFormat = new Intl.NumberFormat('en-US', { useGrouping: false }).format;

    /**
     * Helper to class to quickly create DOM elements.
     * @param type The type of element to create.
     * @param elmInfo Details to add to the element.
     * @param resx A resource file for localization.
     */
    public static createElm(type: 'button' | 'canvas' | 'div' | 'input' | 'select' | 'label' | 'br', elmInfo?: ElementInfo, resx?: { [key: string]: any }, binding?: SimpleBinding): HTMLElement {
        var elm = document.createElement(type);

        if(elmInfo){
            if(elmInfo.propName && resx){
                var r = resx[elmInfo.propName];
                if(r){
                    elmInfo.attr = Object.assign(elmInfo.attr || {}, {
                        'alt': r,
                        'title': r
                    });
                }
            }

            if(type === 'select' && elmInfo.selectVals){
                elmInfo.selectVals.forEach(val => {
                    var o = document.createElement('option');
                    o.setAttribute('value', val);

                    if(val === elmInfo.selected){
                        o.setAttribute('selected', 'true');
                    }

                    o.appendChild(document.createTextNode((resx && resx[val])? resx[val] : val));
                    elm.appendChild(o);
                });   
            }

            Utils.setAttributes(elm, elmInfo.attr);

            if(elmInfo.class){
                elmInfo.class.forEach(c => {
                    if(c){
                        elm.classList.add(c);
                    }
                });                
            }

            if(elmInfo.style){
                Object.assign(elm.style, elmInfo.style);
            }

            Utils.appendChildren(elm, elmInfo.children);

            if(elmInfo.innerHTML){
                elm.innerHTML += elmInfo.innerHTML;
            }

            if(binding && elmInfo.propName){
                binding.bind(elm, elmInfo.propName, null, elmInfo.bindingChanged);
            }
        }

        return elm;
    }

    /**
     * Appends multiple elements as children of a target element.
     * @param elm Target element to append children to.
     * @param children Child elements to append.
     */
    public static appendChildren(elm: HTMLElement, children: HTMLElement[]): void {
        if(elm && children){
            children.forEach(c=> {
                elm.appendChild(c);
            });
        }
    }

    /**
     * Sets multiple attributes on an element. 
     * @param elm Element to add attributes to.
     * @param attr Attributes to add.
     */
    public static setAttributes(elm: HTMLElement, attr: { [key: string]: string }): void {
        if(elm && attr){
            Object.keys(attr).forEach(k => {
                elm.setAttribute(k, attr[k]);
            });
        }
    }

    private static isDateTimeSupported: boolean;

    /**
     * Tries and determines if the browser supports the individual date and the time input types. 
     */
    public static isDateTimeInputSupported(): boolean {
        const self = this;

        if(typeof self.isDateTimeSupported !== 'boolean'){
            //Create date and time input elements and pass in bad date to see if they correct it. 
            //If it doesn't then the browser is likely falling back to a textbox and doesn't support these elements yet.

            var invalidValue = 'not-a-valid-value';

            let input = <HTMLInputElement>self.createElm('input', {
                attr: {
                    type: 'date',
                    value: invalidValue
                }
            });
        
            const isDateSupported = (input.value !== invalidValue);

            input = <HTMLInputElement>self.createElm('input', {
                attr: {
                    type: 'time',
                    value: invalidValue
                }
            });

            const isTimeSupported = (input.value !== invalidValue);

            //This only ever needs to be determined once per session, so cache the findings for quicker checks later.
            self.isDateTimeSupported = isDateSupported && isTimeSupported;
        }

        return self.isDateTimeSupported;
    }

    /**
     * Gets a polygon from a shape, feature, or polyogn object.
     * @param shape The shape to get the polygon from.
     */
    public static getPolygon(shape: azmaps.data.Polygon | azmaps.data.MultiPolygon | azmaps.data.Feature<azmaps.data.Geometry, any> | azmaps.Shape): azmaps.data.Polygon | azmaps.data.MultiPolygon {
        let poly: azmaps.data.Polygon | azmaps.data.MultiPolygon;

        if(shape instanceof azmaps.Shape){
            //If the shape is a circle, create a polygon from its circle coordinates.
            if (shape.isCircle()) {
                poly = new azmaps.data.Polygon([shape.getCircleCoordinates()]);
            } else if (shape.getType().indexOf('Polygon') > -1){
                poly = <azmaps.data.Polygon>shape.toJson().geometry;
            }
        } else {      
            const f = <azmaps.data.Feature<azmaps.data.Geometry, any>>shape;

            if(f.type === 'Feature') {
                if(f.geometry.type === 'Point' && f.properties.subType === 'Circle' && typeof f.properties.radius === 'number'){
                    poly = new azmaps.data.Polygon(azmaps.math.getRegularPolygonPath((f.geometry as azmaps.data.Point).coordinates, f.properties.radius, 72, 'meters'))
                } else if(f.geometry.type.indexOf('Polygon') > -1) {
                    poly = <azmaps.data.Polygon>f.geometry;
                }
            } 
            
            if(f.type.indexOf('Polygon') !== -1) {
                poly = <azmaps.data.Polygon>shape;
            }
        }

        return poly;
    }

    /**
     * Retrieves the geometry of a shape. Circle is converted to a polygon feature.
     * @param shape Shape to retrieve geometry from.
     */
    public static getGeometry(shape: azmaps.data.Feature<azmaps.data.Geometry, any> | azmaps.Shape): azmaps.data.Geometry {
        if(shape instanceof azmaps.Shape){
            //If the shape is a circle, create a polygon from its circle coordinates.
            if (shape.isCircle()) {
                return new azmaps.data.Polygon([shape.getCircleCoordinates()]);
            }

            return shape.toJson().geometry;
        } else {
            let p = Utils.getPolygon(shape);

            if(p){
                return p;
            }

            return shape.geometry;
        }

        return null;
    }
}