/**
 * A simple binding class that adds one-way binding to HTMLElements to a JSON object.
 */
export class SimpleBinding {
    private _target: object;
    private _events: any = {};//event = { elm, callback };

    /**
     * Adds one-way binding to HTMLElements to a JSON object.
     * @param target The target object to bind to. 
     */
    constructor(target: object){
        this._target = target;
    }

    /**
     * Disposes the bindings and frees the resources.
     */
    public dispose (): void { 
        const self = this;
        const e = self._events;

        //Event names
        const events = Object.keys(self._events);

        events.forEach(n => {
            (<HTMLInputElement>events[n].elm).removeEventListener(n, events[n].callack);
        });

        self._events = null;
        self._target = null;
    }

    /**
     * Binds ane element value to propery value in the object.
     * @param elm Element to bind to.
     * @param propName The property name to add the values to in the target object.
     * @param isCheckboxArray Specifies if the element is part of a group of checkbox inputs that should be grouped into a single property as an array of values.
     * @param onchange A callback function to trigger when a change occurs.
     */
    public bind(elm: HTMLElement, propName: string, isCheckboxArray?: boolean, onchange?: (vals: string | number | string[]) => void): SimpleBinding {
        const self = this;
        if(elm){
            
            self.addEvent(elm, 'onchange', () => {
                //@ts-ignore
                let val: any = elm.value;
                let e = elm;

                if(elm.tagName === 'LABEL'){
                    e = <HTMLElement>elm.firstChild;
                }

                if(e.tagName === 'INPUT'){
                    let input = <HTMLInputElement>e;
                    switch(input.type){
                        case 'number':
                            val = parseFloat(val);
                            break;
                        case 'checkbox':                           
                            if(isCheckboxArray){
                                let items: string[] = self._target[propName];
            
                                if(!items){
                                    items = [];
                                }
            
                                const idx = items.indexOf(input.value);
            
                                if(input.checked && idx === -1) {
                                    items.push(input.value);
                                } else if(!input.checked && idx > -1) {
                                    items = items.splice(idx, 1);
                                }
            
                                val = items;
                            } else {
                                val = input.checked;
                            }
                            break;
                    }
                }
                self._target[propName] = val;
                
                if(onchange){
                    onchange(val);
                }
            });
            elm.onchange(new Event('onchange'));
        }

        return self;
    }

    /**
     * Adds an event 
     * @param elm 
     * @param name 
     * @param callback 
     */
    private addEvent(elm: HTMLElement, name: string, callback: () => void): void {
        if(elm && name && callback){
            const e = this._events;

            if(!e[name]){
                e[name] = [];
            }

            e[name].push({
                elm: elm,
                callack: callback
            });

            elm.addEventListener(name, callback);
            elm[name] = callback;
        }
    }
}