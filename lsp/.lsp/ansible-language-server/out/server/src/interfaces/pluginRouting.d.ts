export declare type IPluginRoutingByCollection = Map<string, IPluginRoutesByType>;
export declare type IPluginTypes = 'modules';
export declare type IPluginRoutesByType = Map<IPluginTypes, IPluginRoutesByName>;
export declare type IPluginRoutesByName = Map<string, IPluginRoute>;
export interface IPluginRoute {
    redirect?: string;
    deprecation?: {
        removalVersion?: string;
        removalDate?: string;
        warningText?: string;
    };
    tombstone?: {
        removalVersion?: string;
        removalDate?: string;
        warningText?: string;
    };
}
