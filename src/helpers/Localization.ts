import * as localizationData from './localization.json'

/** Localization resource. */
export interface Resource {
    selectionControl: string;
    routeRangeControl: string;
    truckDimensionsToggle: string;
    truckDimensions: string;
    loadTypeToggle: string;
    travelMode: string;
    selectionArea: string;
    distance: string;
    lengthUnits: string;
    length: string;
    height: string;
    width: string;
    axleWeight: string;
    car: string;
    truck: string;
    pedestrian: string;
    bicycle: string;
    selectOrigin: string;
    time: string;
    travelTime: string;
    distanceUnits: string;
    meters: string;
    miles: string;
    kilometers: string;
    yards: string;
    feet: string;
    weightUnits: string;
    kilograms: string;
    longTon: string;
    metricTon: string;
    pounds: string;
    shortTon: string;
    loadType: string;
    avoid: string;
    search: string;
    cancel: string;
    borderCrossings: string;
    carpools: string;
    ferries: string;
    motorways: string;
    tollRoads: string;
    unpavedRoads: string;
    otherHazmatHarmfulToWater: string;
    USHazmatClass9: string;
    USHazmatClass5: string;
    USHazmatClass6: string;
    USHazmatClass7: string;
    USHazmatClass2: string;
    USHazmatClass8: string;
    USHazmatClass1: string;
    USHazmatClass3: string;
    USHazmatClass4: string;
    circleSelection: string;
    rectangleSelection: string;
    polygonSelection: string;
    routeRangeSelection: string;
    showArea  : string;
    traffic: string;
    considerTraffic: string;
    leaveAt: string;
    leaveAtDate: string;
    leaveAtTime: string;
    selectionModes: string; 
    selectMode: string; 
    avoidToggle: string;
    routeRangeError: string;   
}

export class Localization {
    private static _resxCache: Record<string, Resource>;

    /**
     * Retrieves localization resources for a specified language.
     * @param language The language to get resources for.
     */
    public static getResource(language: string): Resource {
        const self = this;

        if(language){
            language = language.toLowerCase();

            if (language.indexOf('-') > 0) {
                language = language.substring(0, language.indexOf('-'));
            }
        } else {
            language = 'en';
        }

        if(!self._resxCache){
            self._resxCache = {};
        }

        const loadedLanguages = Object.keys(self._resxCache);
        const supportedLanguages = Object.keys(localizationData.langs);

        if(loadedLanguages.indexOf(language) === -1){
            //Language isn't loaded yet. Check if it is supported, if not default to english.
            if(supportedLanguages.indexOf(language) === -1){
                language = 'en';
            }

            //Check that the language is loaded, if not, load it.
            if(loadedLanguages.indexOf(language) === -1){
                //@ts-ignore
                const r: Resource = {};

                localizationData.keys.forEach((k, i)=> {
                    r[k] = localizationData.langs[language][i];
                });

                //Cache the language resources.
                self._resxCache[language] = r;
            }
        }

        return self._resxCache[language];
    }
}