/** Load types for truck restrictions. */
export enum VehicleLoadTypes {
    /** Load type: Explosives */
    USHazmatClass1 = 'USHazmatClass1',

    /** Load type: Compressed gas */
    USHazmatClass2 = 'USHazmatClass2',

    /** Load type: Flammable liquids */
    USHazmatClass3 = 'USHazmatClass3',

    /** Load type: Flammable solids */
    USHazmatClass4 = 'USHazmatClass4',

    /** Load type: Oxidizers */
    USHazmatClass5 = 'USHazmatClass5',

    /** Load type: Poisons */
    USHazmatClass6 = 'USHazmatClass6',

    /** Load type: Radioactive */
    USHazmatClass7 = 'USHazmatClass7',

    /** Load type: Corrosives */
    USHazmatClass8 = 'USHazmatClass8',

    /** Load type: Miscellaneous */
    USHazmatClass9 = 'USHazmatClass9',

    /** Load type: Explosives */
    otherHazmatExplosive = 'otherHazmatExplosive',

    /** Load type: Miscellaneous */
    otherHazmatGeneral = 'otherHazmatGeneral',

    /** Load type: Harmful to water */
    otherHazmatHarmfulToWater = 'otherHazmatHarmfulToWater'
}