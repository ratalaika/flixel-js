/**
 * Represents a tiled map, adds the concept of tiles and tilesets.<br>
 * <br>
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author	ratalaika / ratalaikaGames
 */
/**
 * Class constructor.
 * 
 * @param source
 *            The XML of the map file.
 */
Flixel.plugin.tmx.TiledMap = function(source)
{
	// Read the map header
	this.version = source.version ? source.version : "unknown";
	this.orientation = source.orientation ? source.orientation : "orthogonal";
	this.width = source.width;
	this.height = source.height;
	this.tileWidth = source.tilewidth;
	this.tileHeight = source.tileheight;

	// Define the node and the i out side the fors JS lint error check likes this way ._.
	var node = null;
	var i = 0;

	// Read properties
	if(source.properties) {
		for (i = 0; i < source.properties.length; i++) {
			node = source.properties[i];
			this.properties = this.properties ? this.properties.extend(node) : new Flixel.plugin.tmx.MapProperties(node);
	
		}
	}

	// Count all the layers
	var k = 0;

	// Load tilesets
	if(source.tilesets) {
		for (i = 0; i < source.tilesets.length; i++) {
			node = source.tilesets[i];
			this.tileSets[node.name] = new Flixel.plugin.tmx.MapTileSet(node, this);
		}
	}

	// Load the map layers
	if(source.layers) {
		for (i = 0; i < source.layers.length; i++) {
			node = source.layers[i];

			// Check if it is data or object layer
			if(node.data) {
				this.tileLayers[node.name] = new Flixel.plugin.tmx.MapLayer(node, this);
				this.layers[k++] = this.tileLayers[node.name];
			} else if(node.objects) {
				this.objectGroups[node.name] = new Flixel.plugin.tmx.MapObjects(node, this);
				this.layers[k++] = this.objectGroups[node.name];
			}
		}
	}
};

/**
 * The map version.
 */
Flixel.plugin.tmx.TiledMap.prototype.version = null;
/**
 * The map orientation.<br>
 * Normally orthogonal or isometric.
 */
Flixel.plugin.tmx.TiledMap.prototype.orientation = null;
/**
 * The width of the map in tiles.
 */
Flixel.plugin.tmx.TiledMap.prototype.width = 0;
/**
 * The height of the map in tiles.
 */
Flixel.plugin.tmx.TiledMap.prototype.height = 0;
/**
 * The width of the map tiles, in pixels.
 */
Flixel.plugin.tmx.TiledMap.prototype.tileWidth = 0;
/**
 * The height of the map tiles, in pixels.
 */
Flixel.plugin.tmx.TiledMap.prototype.tileHeight = 0;
/**
 * The map properties.
 */
Flixel.plugin.tmx.TiledMap.prototype.properties = null;
/**
 * All the map tiled layers.
 */
Flixel.plugin.tmx.TiledMap.prototype.tileLayers = {};
/**
 * All the map tile sets.
 */
Flixel.plugin.tmx.TiledMap.prototype.tileSets = {};
/**
 * All the map object groups.
 */
Flixel.plugin.tmx.TiledMap.prototype.objectGroups = {};
/**
 * All the map layers.
 */
Flixel.plugin.tmx.TiledMap.prototype.layers = [];

/**
 * Return a map tileset.
 * 
 * @param name
 *            The tileset name.
 */
Flixel.plugin.tmx.TiledMap.prototype.getTileSet = function(name)
{
	return this.tileSets[name];
};

/**
 * Return a map layer.
 * 
 * @param name
 *            The name layer.
 */
Flixel.plugin.tmx.TiledMap.prototype.getLayer = function(name)
{
	return this.tileLayers[name];
};

/**
 * Return a map object group.
 * 
 * @param name
 *            The object group name.
 */
Flixel.plugin.tmx.TiledMap.prototype.getObjectGroup = function(name)
{
	return this.objectGroups[name];
};

/**
 * Return all the map layers. This includes object group layers aswell.
 */
Flixel.plugin.tmx.TiledMap.prototype.getLayers = function()
{
	return this.layers;
};

/**
 * Return a Tileset.
 * 
 * Wworks only after TmxTileSet has been initialized with an image.
 */
Flixel.plugin.tmx.TiledMap.prototype.getGidOwner = function(gid)
{
	for (var i = 0; i < this.tileSets.length; i++) {
		var tileSet = this.tileSets[i];
		if (tileSet.hasGid(gid))
			return tileSet;
	}
	return null;
};