import { Namespace } from "./helpers/Namespace";

/* Build the structure of the SDK */

//Merge the local controls into the 'atlas.control' namespace.
import * as baseControl from "./control";
const control = Namespace.merge("atlas.control", baseControl);

//Merge the map math static functions into the atlas.math namespace.
import * as baseMap from "./extensions/MapMath";
const math = Namespace.merge("atlas.math", baseMap.MapMath);

export { control, math };

// Enums
export { SelectionControlMode } from "./Enums/SelectionControlMode";
export { WeightUnits } from "./Enums/WeightUnits";