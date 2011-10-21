/*jshint evil: true */
/*global Request: true, EventWaiter: true */

/**
 * @class
 *
 * Imports assets into the game.
 *
 * @constructor
 * @param {String} resourcePath
 * @param {Function} defaultCallback
 */
function Importer( resourcePath, defaultCallback ) {
    if ( resourcePath[ resourcePath.length - 1 ] !== '/' ) {
        resourcePath += '/';
    }

    /**
     * @type String
     * The base path from which resources will be loaded.
     * This path will always be appended to URLs passed to {@link load}.
     */
    this.resourcePath = resourcePath;

    /**
     * @type Function
     * The callback to be used when no callback is passed to {@link load}.
     */
    this.defaultCallback = defaultCallback;
}

Importer.prototype = {
    constructor: Importer,
    /**
     * <p>Loads an asset.</p>
     *
     * <p>Determines the loader to be used from the extension of the filename of the asset.<br />
     * If no extension is recongnized, JSON extension is assumed.</p>
     *
     * @param {String} asset The path to the asset relative to resourcePath. If no extension is given (or not recognized), .json extension is assumed.
     * @param {Function} callback Callback that is called with the loaded object as a parameter.
     */
    load: function( asset, callback ) {
        var self = this, extension;

        if ( !callback ) {
            callback = this.defaultCallback;
        }

        extension = asset.slice( asset.lastIndexOf( '.' ) + 1 ).toLowerCase();
        if ( typeof Importer.loader[ extension ] == "undefined" || asset.indexOf( "." ) == -1 ) {
            extension = "json";
            asset += ".json";
        }

        asset = this.resourcePath + asset;

        // make sure you check cache after adding extension to avoid misses.
        if ( Importer.cache[ asset ] ) {
            callback( Importer.cache[ asset ], asset );
            return;
        }

        Importer.getLoader( extension ).load( asset, this, function( node ) {
            Importer.cache[ asset ] = node;
            callback( node, asset );
        } );
    }
};

/**
 * <p>Sets the loader to be used for a given extension.</p>
 *
 * <p>The loader must have a load method that gets three parameters:</p>
 * <ul>
 *  <li>the path to the asset</li>
 *  <li>the importer instance being used</li>
 *  <li>a callback</li>
 * </ul>
 * and calls the third parameter (callback) with the loaded object.
 */
Importer.setLoader = function( extension, loader ) {
    extension = extension.toLowerCase();
    if ( typeof Importer.loader[ extension ] != "undefined" ) {
        console.log( "Importer: overwriting loader for extension " + extension );
    }

    Importer.loader[ extension ] = loader;
};

/**
 * Get the loader used for loading an extension.
 */
Importer.getLoader = function( extension ) {
    return Importer.loader[ extension ];
};

/**
 * @private
 * Global cache used by Importer instances.
 */
Importer.cache = {};

Importer.loader = {};
