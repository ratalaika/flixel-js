/**
 * This is a traditional tilemap display and collision class.
 * It takes a string of comma-separated numbers and then associates
 * those values with tiles from the sheet you pass in.
 * It also includes some handy static parsers that can convert
 * arrays or images into strings that can be loaded.
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author	Adam Atomic
 * @author	ratalaika / ratalaikaGames
 */

/**
 * The tilemap constructor just initializes some basic variables.
 */
Flixel.FlxTilemap = function()
{
	Flixel.FlxTilemap.parent.constructor.apply(this);

	this.auto = Flixel.FlxTilemap.OFF;
	this.widthInTiles = 0;
	this.heightInTiles = 0;
	this.totalTiles = 0;
	this._buffers = [];
	this._flashPoint = new Flixel.FlxPoint();
	this._flashRect = null;
	this._data = null;
	this._tileWidth = 0;
	this._tileHeight = 0;
	this._rects = null;
	this._tiles = null;
	this._tileObjects = null;
	this.immovable = true;
	this.moves = false;
	this.cameras = null;
	this._debugTileNotSolid = null;
	this._debugTilePartial = null;
	this._debugTileSolid = null;
	this._debugRect = null;
	this._lastVisualDebug = Flixel.FlxG.visualDebug;
	this._startingIndex = 0;
};
extend(Flixel.FlxTilemap, Flixel.FlxObject);

/**
 * No auto-tiling.
 */
Flixel.FlxTilemap.OFF = 0;
/**
 * Good for levels with thin walls that don'tile need interior corner art.
 */
Flixel.FlxTilemap.AUTO = 1;
/**
 * Better for levels with thick walls that look better with interior corner art.
 */
Flixel.FlxTilemap.ALT = 2;
/**
 * Set this flag to use one of the 16-tile binary auto-tile algorithms (OFF, AUTO, or ALT).
 */
Flixel.FlxTilemap.prototype.auto = 0;
/**
 * Read-only variable, do NOT recommend changing after the map is loaded!
 */
Flixel.FlxTilemap.prototype.widthInTiles = 0;
/**
 * Read-only variable, do NOT recommend changing after the map is loaded!
 */
Flixel.FlxTilemap.prototype.heightInTiles = 0;
/**
 * Read-only variable, do NOT recommend changing after the map is loaded!
 */
Flixel.FlxTilemap.prototype.totalTiles = 0;
/**
 * Rendering helper, minimize new object instantiation on repetitive methods.
 */
Flixel.FlxTilemap.prototype._flashPoint = null;
/**
 * Rendering helper, minimize new object instantiation on repetitive methods.
 */
Flixel.FlxTilemap.prototype._flashRect = null;
/**
 * Internal reference to the bitmap data object that stores the original tile graphics.
 */
Flixel.FlxTilemap.prototype._tiles = null;
/**
 * Internal list of buffers, one for each camera, used for drawing the tilemaps.
 */
Flixel.FlxTilemap.prototype._buffers = null;
/**
 * Internal representation of the actual tile data, as a large 1D array of integers.
 */
Flixel.FlxTilemap.prototype._data = null;
/**
 * Internal representation of rectangles, one for each tile in the entire tilemap, used to speed up drawing.
 */
Flixel.FlxTilemap.prototype._rects = null;
/**
 * Internal, the width of a single tile.
 */
Flixel.FlxTilemap.prototype._tileWidth = 0;
/**
 * Internal, the height of a single tile.
 */
Flixel.FlxTilemap.prototype._tileHeight = 0;
/**
 * Internal collection of tile objects, one for each type of tile in the map (NOTE one for every single tile in the whole map).
 */
Flixel.FlxTilemap.prototype._tileObjects = null;
/**
 * Internal, used for rendering the debug bounding box display.
 */
Flixel.FlxTilemap.prototype._debugTileNotSolid = null;
/**
 * Internal, used for rendering the debug bounding box display.
 */
Flixel.FlxTilemap.prototype._debugTilePartial = null;
/**
 * Internal, used for rendering the debug bounding box display.
 */
Flixel.FlxTilemap.prototype._debugTileSolid = null;
/**
 * Internal, used for rendering the debug bounding box display.
 */
Flixel.FlxTilemap.prototype._debugRect = null;
/**
 * Internal flag for checking to see if we need to refresh the tilemap display to show or hide the bounding boxes.
 */
Flixel.FlxTilemap.prototype._lastVisualDebug = false;
/**
 * Internal, used to sort of insert blank tiles in front of the tiles in the provided graphic.
 */
Flixel.FlxTilemap.prototype._startingIndex = 0;
/**
 * The texture X offset.
 */
Flixel.FlxTilemap.prototype.offsetX = 0;
/**
 * The texture Y offset.
 */
Flixel.FlxTilemap.prototype.offsetY = 0;

/**
 * Clean up memory.
 */
Flixel.FlxTilemap.prototype.destroy = function()
{
	this._flashPoint = null;
	this._flashRect = null;
	this._tiles = null;

	var i = 0;
	var l = 0;

	if (this._tileObjects !== null) {
		i = 0;
		l = this._tileObjects.length;
		while (i < l)
			this._tileObjects[i++].destroy();
		this._tileObjects = null;
	}

	if (this._buffers !== null) {
		i = 0;
		l = this._buffers.length;
		while (i < l)
			this._buffers[i++].destroy();
		this._buffers = null;
	}

	this._data = null;
	this._rects = null;
	this._debugTileNotSolid = null;
	this._debugTilePartial = null;
	this._debugTileSolid = null;
	this._debugRect = null;

	Flixel.FlxTilemap.parent.destroy.apply(this);
};

/**
 * Load the tilemap with string data and a tile graphic.
 * 
 * @param MapData
 *            A string of comma and line-return delineated indices indicating what order the tiles should go in.
 * @param TileGraphic
 *            All the tiles you want to use, arranged in a strip corresponding to the numbers in MapData.
 * @param TileWidth
 *            The width of your tiles (e.g. 8) - defaults to height of the tile graphic if unspecified.
 * @param TileHeight
 *            The height of your tiles (e.g. 8) - defaults to width if unspecified.
 * @param AutoTile
 *            Whether to load the map using an automatic tile placement algorithm. Setting this to either AUTO or ALT will override any values you put for StartingIndex, DrawIndex, or CollideIndex.
 * @param StartingIndex
 *            Used to sort of insert empty tiles in front of the provided graphic. Default is 0, usually safest ot leave it at that. Ignored if AutoTile is set.
 * @param DrawIndex
 *            Initializes all tile objects equal to and after this index as visible. Default value is 1. Ignored if AutoTile is set.
 * @param CollideIndex
 *            Initializes all tile objects equal to and after this index as allowCollisions = ANY. Default value is 1. Ignored if AutoTile is set. Can override and customize per-tile-type collision
 *            behavior using <code>setTileProperties()</code>.
 * 
 * @return A pointer this instance of FlxTilemap, for chaining as usual :)
 */
Flixel.FlxTilemap.prototype.loadMap = function(MapData, TileGraphic, TileWidth, TileHeight, AutoTile, StartingIndex, DrawIndex, CollideIndex, offsetX, offsetY)
{
	TileWidth = TileWidth || 0;
	TileHeight = TileHeight || 0;
	StartingIndex = StartingIndex || 0;
	DrawIndex = (DrawIndex === undefined) ? 1 : DrawIndex;
	CollideIndex = (CollideIndex === undefined) ? 1 : CollideIndex;
	offsetX = offsetX || 0;
	offsetY = offsetY || 0;
	AutoTile = (AutoTile === undefined) ? Flixel.FlxTilemap.OFF : AutoTile;

	this.auto = AutoTile;
	this._startingIndex = (StartingIndex <= 0) ? 0 : StartingIndex;
	this.offsetX = offsetX;
	this.offsetY = offsetY;

	// Figure out the map dimensions based on the data string
	var columns;
	var rows = MapData.split("\n");
	this.heightInTiles = rows.length;
	this._data = [];
	var row = 0;
	var column;
	while (row < this.heightInTiles) {
		columns = rows[row++].split(",");
		if (columns.length <= 1) {
			this.heightInTiles = this.heightInTiles - 1;
			continue;
		}
		if (this.widthInTiles === 0)
			this.widthInTiles = columns.length;
		column = 0;
		while (column < this.widthInTiles)
			this._data.push(uint(columns[column++]));
	}

	// Pre-process the map data if it's auto-tiled
	var i;
	this.totalTiles = this.widthInTiles * this.heightInTiles;
	if (this.auto > Flixel.FlxTilemap.OFF) {
		this._startingIndex = 1;
		DrawIndex = 1;
		CollideIndex = 1;
		i = 0;
		while (i < this.totalTiles)
			this.autoTile(i++);
	}

	// Figure out the size of the tiles
	this._tiles = Flixel.FlxG.addBitmap(TileGraphic);
	this._tileWidth = TileWidth;
	if (this._tileWidth === 0)
		this._tileWidth = this._tiles.height;
	this._tileHeight = TileHeight;
	if (this._tileHeight === 0)
		this._tileHeight = this._tileWidth;

	// Create some tile objects that we'll use for overlap checks (one for each tile)
	i = 0;
	var l = ((this._tiles.width / (this._tileWidth + this.offsetX)) * (this._tiles.height / (this._tileHeight + this.offsetY))) + this._startingIndex;
	this._tileObjects = new Array(l);
	while (i < l) {
		this._tileObjects[i] = new Flixel.system.FlxTile(this, i, this._tileWidth, this._tileHeight, (i >= DrawIndex), (i >= CollideIndex) ? this.allowCollisions : Flixel.FlxObject.NONE);
		i++;
	}

	// Create debug tiles for rendering bounding boxes on demand
	this._debugTileNotSolid = this.makeDebugTile(Flixel.FlxG.BLUE);
	this._debugTilePartial = this.makeDebugTile(Flixel.FlxG.PINK);
	this._debugTileSolid = this.makeDebugTile(Flixel.FlxG.GREEN);
	this._debugRect = new Flixel.FlxRect(0, 0, this._tileWidth, this._tileHeight);

	// Then go through and create the actual map
	this.width = this.widthInTiles * this._tileWidth;
	this.height = this.heightInTiles * this._tileHeight;
	this._rects = new Array(this.totalTiles);
	i = 0;
	while (i < this.totalTiles)
		this.updateTile(i++);

	return this;
};

/**
 * Internal function to clean up the map loading code. Just generates a wireframe box the size of a tile with the specified color.
 */
Flixel.FlxTilemap.prototype.makeDebugTile = function(Color)
{
	var debugTile = new BitmapData(this._tileWidth, this._tileHeight, true, 0);

	var gfx = Flixel.FlxG.flashGfx;
	gfx.clearRect(0, 0, Flixel.FlxG.flashGfxSprite.width, Flixel.FlxG.flashGfxSprite.height);
	gfx.lineStyle = BitmapData.makeRGBA(Color);//(1, 0.5);
	gfx.beginPath();
	gfx.moveTo(0, 0);
	gfx.lineTo(this._tileWidth - 1, 0);
	gfx.lineTo(this._tileWidth - 1, this._tileHeight - 1);
	gfx.lineTo(0, this._tileHeight - 1);
	gfx.lineTo(0, 0);
	gfx.stroke();

	debugTile.copyPixels(Flixel.FlxG.flashGfxSprite, new Flixel.FlxRect(0, 0, this._tileWidth, this._tileHeight), new Flixel.FlxPoint(0, 0));
	return debugTile;
};

/**
 * Main logic loop for tilemap is pretty simple, just checks to see if visual debug got turned on. If it did, the tilemap is flagged as dirty so it will be redrawn with debug info on the next draw
 * call.
 */
Flixel.FlxTilemap.prototype.update = function()
{
	if (this._lastVisualDebug != Flixel.FlxG.visualDebug) {
		this._lastVisualDebug = Flixel.FlxG.visualDebug;
		this.setDirty();
	}
};

/**
 * Internal function that actually renders the tilemap to the tilemap buffer. Called by draw().
 * 
 * @param Buffer
 *            The <code>FlxTilemapBuffer</code> you are rendering to.
 * @param Camera
 *            The related <code>FlxCamera</code>, mainly for scroll values.
 */
Flixel.FlxTilemap.prototype.drawTilemap = function(Buffer, Camera)
{
	Buffer.fill();

	// Copy tile images into the tile buffer
	this._point.x = int(Camera.scroll.x * this.scrollFactor.x) - this.x; // modified from getScreenXY()
	this._point.y = int(Camera.scroll.y * this.scrollFactor.y) - this.y;
	var screenXInTiles = int((this._point.x + ((this._point.x > 0) ? 0.0000001 : -0.0000001)) / this._tileWidth);
	var screenYInTiles = int((this._point.y + ((this._point.y > 0) ? 0.0000001 : -0.0000001)) / this._tileHeight);
	var screenRows = Buffer.rows;
	var screenColumns = Buffer.columns;

	// Bound the upper left corner
	if (screenXInTiles < 0)
		screenXInTiles = 0;
	if (screenXInTiles > this.widthInTiles - screenColumns)
		screenXInTiles = this.widthInTiles - screenColumns;
	if (screenYInTiles < 0)
		screenYInTiles = 0;
	if (screenYInTiles > this.heightInTiles - screenRows)
		screenYInTiles = this.heightInTiles - screenRows;

	var rowIndex = screenYInTiles * this.widthInTiles + screenXInTiles;
	this._flashPoint.y = 0;
	var row = 0;
	var column;
	var columnIndex;
	var tile;
	var debugTile;
	while (row < screenRows) {
		columnIndex = rowIndex;
		column = 0;
		this._flashPoint.x = 0;
		while (column < screenColumns) {
			this._flashRect = this._rects[columnIndex];
			// Check if the rectangle is null
			if (this._flashRect !== null) {
				Buffer.getPixels().copyPixels(this._tiles, this._flashRect, this._flashPoint, null, null, true);
				// Render the visual debug tile
				if (Flixel.FlxG.visualDebug && !this.ignoreDrawDebug) {
					tile = this._tileObjects[this._data[columnIndex]];
					if (tile !== null) {
						if (tile.allowCollisions <= Flixel.FlxObject.NONE)
							debugTile = this._debugTileNotSolid; // blue
						else if (tile.allowCollisions != Flixel.FlxObject.ANY)
							debugTile = this._debugTilePartial; // pink
						else
							debugTile = this._debugTileSolid; // green
						this._flashPoint.x += tile.offset.x;
						this._flashPoint.y += tile.offset.y;
						Buffer.getPixels().copyPixels(debugTile, this._debugRect, this._flashPoint, null, null, true);
						this._flashPoint.x -= tile.offset.x;
						this._flashPoint.y -= tile.offset.y;
					}
				}
			}
			this._flashPoint.x += this._tileWidth;
			column++;
			columnIndex++;
		}
		rowIndex += this.widthInTiles;
		this._flashPoint.y += this._tileHeight;
		row++;
	}
	Buffer.x = screenXInTiles * this._tileWidth;
	Buffer.y = screenYInTiles * this._tileHeight;
};

/**
 * Draws the tilemap buffers to the cameras and handles flickering.
 */
Flixel.FlxTilemap.prototype.draw = function()
{
	if (this._flickerTimer !== 0) {
		this._flicker = !this._flicker;
		if (this.flicker)
			return;
	}

	var camera = Flixel.FlxG.activeCamera;
	if (this.cameras === null || this.cameras === undefined)
		this.cameras = Flixel.FlxG.cameras;
	if (this.cameras.indexOf(camera) == -1)
		return;

	var buffer;
	var i = this.cameras.indexOf(camera);
	if (this._buffers[i] === null || this._buffers[i] === undefined)
		this._buffers[i] = new Flixel.system.FlxTilemapBuffer(this._tileWidth, this._tileHeight, this.widthInTiles, this.heightInTiles, camera);
	buffer = this._buffers[i++];
	if (!buffer.dirty) {
		this._point.x = this.x - int(camera.scroll.x * this.scrollFactor.x) + buffer.x; // copied from getScreenXY()
		this._point.y = this.y - int(camera.scroll.y * this.scrollFactor.y) + buffer.y;
		buffer.dirty = (this._point.x > 0) || (this._point.y > 0) || (this._point.x + buffer.width < camera.width) || (this._point.y + buffer.height < camera.height);
	}
	
	if (buffer.dirty) {
		this.drawTilemap(buffer, camera);
		buffer.dirty = false;
	}
	if(Flixel.FlxG.keys.justPressed("Q"))
		console.log(this._flashPoint.x);

	this._flashPoint.x = this.x - int(camera.scroll.x * this.scrollFactor.x) + buffer.x; // copied from getScreenXY()
	this._flashPoint.y = this.y - int(camera.scroll.y * this.scrollFactor.y) + buffer.y;
	this._flashPoint.x += (this._flashPoint.x > 0) ? 0.0000001 : -0.0000001;
	this._flashPoint.y += (this._flashPoint.y > 0) ? 0.0000001 : -0.0000001;

	buffer.draw(camera, this._flashPoint);
	Flixel.FlxBasic.VISIBLECOUNT++;
};

/**
 * Fetches the tilemap data array.
 * 
 * @param Simple
 *            If true, returns the data as copy, as a series of 1s and 0s (useful for auto-tiling stuff). Default value is false, meaning it will return the actual data array (NOT a copy).
 * 
 * @return An array the size of the tilemap full of integers indicating tile placement.
 */
Flixel.FlxTilemap.prototype.getData = function(Simple)
{
	Simple = (Simple === undefined) ? false : Simple;

	if (!Simple)
		return this._data;

	var i = 0;
	var l = this._data.length;
	var data = new Array(l);
	while (i < l) {
		data[i] = (this._tileObjects[this._data[i]].allowCollisions > 0) ? 1 : 0;
		i++;
	}
	return data;
};

/**
 * Set the dirty flag on all the tilemap buffers. Basically forces a reset of the drawn tilemaps, even if it wasn'tile necessary.
 * 
 * @param Dirty
 *            Whether to flag the tilemap buffers as dirty or not.
 */
Flixel.FlxTilemap.prototype.setDirty = function(Dirty)
{
	Dirty = (Dirty === undefined) ? true : Dirty;
	var i = 0;
	var l = this._buffers.length;
	while (i < l)
		this._buffers[i++].dirty = Dirty;
};

/**
 * Find a path through the tilemap. Any tile with any collision flags set is treated as impassable. If no path is discovered then a null reference is returned.
 * 
 * @param Start
 *            The start point in world coordinates.
 * @param End
 *            The end point in world coordinates.
 * @param Simplify
 *            Whether to run a basic simplification algorithm over the path data, removing extra points that are on the same line. Default value is true.
 * @param RaySimplify
 *            Whether to run an extra raycasting simplification algorithm over the remaining path data. This can result in some close corners being cut, and should be used with care if at all (yet).
 *            Default value is false.
 * @param WideDiagonal
 *            Whether to require an additional tile to make diagonal movement. Default value is true;
 * @return A <code>FlxPath</code> from the start to the end. If no path could be found, then a null reference is returned.
 */
Flixel.FlxTilemap.prototype.findPath = function(Start, End, Simplify, RaySimplify, WideDiagonal)
{
	Simplify = (Simplify === undefined) ? true : Simplify;
	RaySimplify = (RaySimplify === undefined) ? false : RaySimplify;
	WideDiagonal = (WideDiagonal === undefined) ? true : WideDiagonal;

	// figure out what tile we are starting and ending on.
	var startIndex = int((Start.y - this.y) / this._tileHeight) * this.widthInTiles + int((Start.x - this.x) / this._tileWidth);
	var endIndex = int((End.y - this.y) / this._tileHeight) * this.widthInTiles + int((End.x - this.x) / this._tileWidth);
	
	// check that the start and end are clear.
	if ((this._tileObjects[this._data[startIndex]].allowCollisions > 0) || (this._tileObjects[this._data[endIndex]].allowCollisions > 0))
		return null;

	// figure out how far each of the tiles is from the starting tile
	var distances = this.computePathDistance(startIndex, endIndex, WideDiagonal);
	if (distances === null)
		return null;

	// then count backward to find the shortest path.
	var points = [];
	this.walkPath(distances, endIndex, points);

	// reset the start and end points to be exact
	var node;
	node = points[points.length - 1];
	node.x = Start.x;
	node.y = Start.y;
	node = points[0];
	node.x = End.x;
	node.y = End.y;

	// some simple path cleanup options
	if (Simplify)
		this.simplifyPath(points);
	if (RaySimplify)
		this.raySimplifyPath(points);

	// finally load the remaining points into a new path object and return it
	var path = new Flixel.FlxPath();
	var i = points.length - 1;
	while (i >= 0) {
		node = points[i--];
		if (node !== null)
			path.addPoint(node, true);
	}
	return path;
};

/**
 * Pathfinding helper function, strips out extra points on the same line.
 * 
 * @param Points
 *            An array of <code>FlxPoint</code> nodes.
 */
Flixel.FlxTilemap.prototype.simplifyPath = function(Points)
{
	var deltaPrevious;
	var deltaNext;
	var last = Points[0];
	var node;
	var i = 1;
	var l = Points.length - 1;
	while (i < l) {
		node = Points[i];
		deltaPrevious = (node.x - last.x) / (node.y - last.y);
		deltaNext = (node.x - Points[i + 1].x) / (node.y - Points[i + 1].y);
		if ((last.x == Points[i + 1].x) || (last.y == Points[i + 1].y) || (deltaPrevious == deltaNext))
			Points[i] = null;
		else
			last = node;
		i++;
	}
};

/**
 * Pathfinding helper function, strips out even more points by raycasting from one point to the next and dropping unnecessary points.
 * 
 * @param Points
 *            An array of <code>FlxPoint</code> nodes.
 */
Flixel.FlxTilemap.prototype.raySimplifyPath = function(Points)
{
	var source = Points[0];
	var lastIndex = -1;
	var node;
	var i = 1;
	var l = Points.length;
	while (i < l) {
		node = Points[i++];
		if (node === null)
			continue;
		if (this.ray(source, node, this._point)) {
			if (lastIndex >= 0)
				Points[lastIndex] = null;
		} else
			source = Points[lastIndex];
		lastIndex = i - 1;
	}
};

/**
 * Pathfinding helper function, floods a grid with distance information until it finds the end point. NOTE: Currently this process does NOT use any kind of fancy heuristic! It's pretty brute.
 * 
 * @param StartIndex
 *            The starting tile's map index.
 * @param EndIndex
 *            The ending tile's map index.
 * 
 * @return A Flash <code>Array</code> of <code>FlxPoint</code> nodes. If the end tile could not be found, then a null <code>Array</code> is returned instead.
 */
Flixel.FlxTilemap.prototype.computePathDistance = function(StartIndex, EndIndex, WideDiagonal)
{
	// Create a distance-based representation of the tilemap.
	// All walls are flagged as -2, all open areas as -1.
	var mapSize = this.widthInTiles * this.heightInTiles;
	var distances = new Array(mapSize);
	var i = 0;
	while (i < mapSize) {
		if (this._tileObjects[this._data[i]].allowCollisions)
			distances[i] = -2;
		else
			distances[i] = -1;
		i++;
	}

	distances[StartIndex] = 0;
	var distance = 1;
	var neighbors;
	neighbors = []; // Moved to the bottom line due to a weird error on the semantic validator ._.
	neighbors.push(StartIndex);
	var current;
	var currentIndex;
	var left;
	var right;
	var up;
	var down;
	var currentLength;
	var foundEnd = false;
	while (neighbors.length > 0) {
		current = neighbors;
		neighbors = [];

		i = 0;
		currentLength = current.length;
		while (i < currentLength) {
			currentIndex = current[i++];
			if (currentIndex == EndIndex) {
				foundEnd = true;
				neighbors.length = 0;
				break;
			}

			// basic map bounds
			left = currentIndex % this.widthInTiles > 0;
			right = currentIndex % this.widthInTiles < this.widthInTiles - 1;
			up = currentIndex / this.widthInTiles > 0;
			down = currentIndex / this.widthInTiles < this.heightInTiles - 1;

			var index;
			if (up) {
				index = currentIndex - this.widthInTiles;
				if (distances[index] == -1) {
					distances[index] = distance;
					neighbors.push(index);
				}
			}
			if (right) {
				index = currentIndex + 1;
				if (distances[index] == -1) {
					distances[index] = distance;
					neighbors.push(index);
				}
			}
			if (down) {
				index = currentIndex + this.widthInTiles;
				if (distances[index] == -1) {
					distances[index] = distance;
					neighbors.push(index);
				}
			}
			if (left) {
				index = currentIndex - 1;
				if (distances[index] == -1) {
					distances[index] = distance;
					neighbors.push(index);
				}
			}
			if (up && right) {
				index = currentIndex - this.widthInTiles + 1;
				if (WideDiagonal && (distances[index] == -1) && (distances[currentIndex - this.widthInTiles] >= -1) && (distances[currentIndex + 1] >= -1)) {
					distances[index] = distance;
					neighbors.push(index);
				} else if (!WideDiagonal && (distances[index] == -1)) {
					distances[index] = distance;
					neighbors.push(index);
				}
			}
			if (right && down) {
				index = currentIndex + this.widthInTiles + 1;
				if (WideDiagonal && (distances[index] == -1) && (distances[currentIndex + this.widthInTiles] >= -1) && (distances[currentIndex + 1] >= -1)) {
					distances[index] = distance;
					neighbors.push(index);
				} else if (!WideDiagonal && (distances[index] == -1)) {
					distances[index] = distance;
					neighbors.push(index);
				}
			}
			if (left && down) {
				index = currentIndex + this.widthInTiles - 1;
				if (WideDiagonal && (distances[index] == -1) && (distances[currentIndex + this.widthInTiles] >= -1) && (distances[currentIndex - 1] >= -1)) {
					distances[index] = distance;
					neighbors.push(index);
				} else if (!WideDiagonal && (distances[index] == -1)) {
					distances[index] = distance;
					neighbors.push(index);
				}
			}
			if (up && left) {
				index = currentIndex - this.widthInTiles - 1;
				if (WideDiagonal && (distances[index] == -1) && (distances[currentIndex - this.widthInTiles] >= -1) && (distances[currentIndex - 1] >= -1)) {
					distances[index] = distance;
					neighbors.push(index);
				} else if (!WideDiagonal && (distances[index] == -1)) {
					distances[index] = distance;
					neighbors.push(index);
				}
			}
		}
		distance++;
	}
	if (!foundEnd)
		distances = null;
	return distances;
};

/**
 * Pathfinding helper function, recursively walks the grid and finds a shortest path back to the start.
 * 
 * @param Data
 *            A Flash <code>Array</code> of distance information.
 * @param Start
 *            The tile we're on in our walk backward.
 * @param Points
 *            A Flash <code>Array</code> of <code>FlxPoint</code> nodes composing the path from the start to the end, compiled in reverse order.
 */
Flixel.FlxTilemap.prototype.walkPath = function(Data, Start, Points)
{
	Points.push(new Flixel.FlxPoint(this.x + uint(Start % this.widthInTiles) * this._tileWidth + this._tileWidth * 0.5, this.y + uint(Start / this.widthInTiles) * this._tileHeight + this._tileHeight * 0.5));
	if (Data[Start] === 0)
		return;

	// basic map bounds
	var left = Start % this.widthInTiles > 0;
	var right = Start % this.widthInTiles < this.widthInTiles - 1;
	var up = Start / this.widthInTiles > 0;
	var down = Start / this.widthInTiles < this.heightInTiles - 1;

	var current = Data[Start];
	var i;
	if (up) {
		i = Start - this.widthInTiles;
		if ((Data[i] >= 0) && (Data[i] < current)) {
			this.walkPath(Data, i, Points);
			return;
		}
	}
	if (right) {
		i = Start + 1;
		if ((Data[i] >= 0) && (Data[i] < current)) {
			this.walkPath(Data, i, Points);
			return;
		}
	}
	if (down) {
		i = Start + this.widthInTiles;
		if ((Data[i] >= 0) && (Data[i] < current)) {
			this.walkPath(Data, i, Points);
			return;
		}
	}
	if (left) {
		i = Start - 1;
		if ((Data[i] >= 0) && (Data[i] < current)) {
			this.walkPath(Data, i, Points);
			return;
		}
	}
	if (up && right) {
		i = Start - this.widthInTiles + 1;
		if ((Data[i] >= 0) && (Data[i] < current)) {
			this.walkPath(Data, i, Points);
			return;
		}
	}
	if (right && down) {
		i = Start + this.widthInTiles + 1;
		if ((Data[i] >= 0) && (Data[i] < current)) {
			this.walkPath(Data, i, Points);
			return;
		}
	}
	if (left && down) {
		i = Start + this.widthInTiles - 1;
		if ((Data[i] >= 0) && (Data[i] < current)) {
			this.walkPath(Data, i, Points);
			return;
		}
	}
	if (up && left) {
		i = Start - this.widthInTiles - 1;
		if ((Data[i] >= 0) && (Data[i] < current)) {
			this.walkPath(Data, i, Points);
			return;
		}
	}
};

/**
 * Checks to see if some <code>FlxObject</code> overlaps this <code>FlxObject</code> object in world space. If the group has a LOT of things in it, it might be faster to use
 * <code>FlxG.overlaps()</code>. WARNING: Currently tilemaps do NOT support screen space overlap checks!
 * 
 * @param Object
 *            The object being tested.
 * @param InScreenSpace
 *            Whether to take scroll factors into account when checking for overlap.
 * @param Camera
 *            Specify which game camera you want. If null getScreenXY() will just grab the first global camera.
 * 
 * @return Whether or not the two objects overlap.
 */
Flixel.FlxTilemap.prototype.overlaps = function(ObjectOrGroup, InScreenSpace, Camera)
{
	InScreenSpace = (InScreenSpace === undefined) ? false : InScreenSpace;

	if (ObjectOrGroup instanceof Flixel.FlxGroup) {
		var results = false;
		var basic;
		var i = 0;
		var members = ObjectOrGroup.members;
		while (i < length) {
			basic = members[i++];
			if (basic instanceof Flixel.FlxObject) {
				if (this.overlapsWithCallback(basic))
					results = true;
			} else {
				if (this.overlaps(basic, InScreenSpace, Camera))
					results = true;
			}
		}
		return results;
	} else if (ObjectOrGroup instanceof Flixel.FlxObject)
		return this.overlapsWithCallback(ObjectOrGroup);
	return false;
};

/**
 * Checks to see if this <code>FlxObject</code> were located at the given position, would it overlap the <code>FlxObject</code> or <code>FlxGroup</code>? This is distinct from overlapsPoint(),
 * which just checks that point, rather than taking the object's size into account. WARNING: Currently tilemaps do NOT support screen space overlap checks!
 * 
 * @param X
 *            The X position you want to check. Pretends this object (the caller, not the parameter) is located here.
 * @param Y
 *            The Y position you want to check. Pretends this object (the caller, not the parameter) is located here.
 * @param ObjectOrGroup
 *            The object or group being tested.
 * @param InScreenSpace
 *            Whether to take scroll factors into account when checking for overlap. Default is false, or "only compare in world space."
 * @param Camera
 *            Specify which game camera you want. If null getScreenXY() will just grab the first global camera.
 * 
 * @return Whether or not the two objects overlap.
 */
Flixel.FlxTilemap.prototype.overlapsAt = function(X, Y, ObjectOrGroup, InScreenSpace, Camera)
{
	InScreenSpace = (InScreenSpace === undefined) ? false : InScreenSpace;

	if (ObjectOrGroup instanceof Flixel.FlxGroup) {
		var results = false;
		var basic;
		var i = 0;
		var members = ObjectOrGroup.members;
		while (i < length) {
			basic = members[i++];
			if (basic instanceof Flixel.FlxObject) {
				this._point.x = X;
				this._point.y = Y;
				if (this.overlapsWithCallback(basic, null, false, this._point))
					results = true;
			} else {
				if (this.overlapsAt(X, Y, basic, InScreenSpace, Camera))
					results = true;
			}
		}
		return results;
	} else if (ObjectOrGroup instanceof Flixel.FlxObject) {
		this._point.x = X;
		this._point.y = Y;
		return this.overlapsWithCallback(ObjectOrGroup, null, false, this._point);
	}
	return false;
};

/**
 * Checks if the Object overlaps any tiles with any collision flags set, and calls the specified callback function (if there is one). Also calls the tile's registered callback if the filter matches.
 * 
 * @param Object
 *            The <code>FlxObject</code> you are checking for overlaps against.
 * @param Callback
 *            An optional function that takes the form "myCallback(Object1:FlxObject,Object2:FlxObject)", where Object1 is a FlxTile object, and Object2 is the object passed in in the first parameter
 *            of this method.
 * @param FlipCallbackParams
 *            Used to preserve A-B list ordering from FlxObject.separate() - returns the FlxTile object as the second parameter instead.
 * @param Position
 *            Optional, specify a custom position for the tilemap (useful for overlapsAt()-type funcitonality).
 * 
 * @return Whether there were overlaps, or if a callback was specified, whatever the return value of the callback was.
 */
Flixel.FlxTilemap.prototype.overlapsWithCallback = function(Object, Callback, FlipCallbackParams, Position)
{
	FlipCallbackParams = (FlipCallbackParams === undefined) ? false : FlipCallbackParams;
	Position = (Position === undefined) ? null : Position;

	var results = false;

	var X = this.x;
	var Y = this.y;
	if (Position !== null) {
		X = Position.x;
		Y = Position.y;
	}

	// Figure out what tiles we need to check against
	var selectionX = Math.floor((Object.x - X) / this._tileWidth);
	var selectionY = Math.floor((Object.y - Y) / this._tileHeight);
	var selectionWidth = selectionX + (Math.ceil(Object.width / this._tileWidth)) + 1;
	var selectionHeight = selectionY + Math.ceil(Object.height / this._tileHeight) + 1;

	// Then bound these coordinates by the map edges
	if (selectionX < 0)
		selectionX = 0;
	if (selectionY < 0)
		selectionY = 0;
	if (selectionWidth > this.widthInTiles)
		selectionWidth = this.widthInTiles;
	if (selectionHeight > this.heightInTiles)
		selectionHeight = this.heightInTiles;

	// Then loop through this selection of tiles and call FlxObject.separate() accordingly
	var rowStart = selectionY * this.widthInTiles;
	var row = selectionY;
	var column;
	var tile;
	var overlapFound;
	var deltaX = X - this.last.x;
	var deltaY = Y - this.last.y;
	while (row < selectionHeight) {
		column = selectionX;
		while (column < selectionWidth) {
			overlapFound = false;
			tile = this._tileObjects[this._data[rowStart + column]];
			if (tile.allowCollisions) {
				tile.x = X + column * this._tileWidth + tile.offset.x;
				tile.y = Y + row * this._tileHeight + tile.offset.y;
				tile.last.x = tile.x - deltaX;
				tile.last.y = tile.y - deltaY;
				if (Callback !== null) {
					if (FlipCallbackParams)
						overlapFound = Callback(Object, tile);
					else
						overlapFound = Callback(tile, Object);
				} else
					overlapFound = (Object.x + Object.width > tile.x) && (Object.x < tile.x + tile.width) && (Object.y + Object.height > tile.y) && (Object.y < tile.y + tile.height);
				if (overlapFound) {
					if ((tile.callback !== null) && ((tile.filter === null) || (Object instanceof tile.filter))) {
						tile.mapIndex = rowStart + column;
						tile.callback(tile, Object);
					}
					results = true;
				}
			} else if ((tile.callback !== null) && ((tile.filter === null) || (Object instanceof tile.filter))) {
				tile.mapIndex = rowStart + column;
				tile.callback(tile, Object);
			}
			column++;
		}
		rowStart += this.widthInTiles;
		row++;
	}
	return results;
};

/**
 * Checks to see if a point in 2D world space overlaps this <code>FlxObject</code> object.
 * 
 * @param Point
 *            The point in world space you want to check.
 * @param InScreenSpace
 *            Whether to take scroll factors into account when checking for overlap.
 * @param Camera
 *            Specify which game camera you want. If null getScreenXY() will just grab the first global camera.
 * 
 * @return Whether or not the point overlaps this object.
 */
Flixel.FlxTilemap.prototype.overlapsPoint = function(Point, InScreenSpace, Camera)
{
	InScreenSpace = (InScreenSpace === undefined) ? false : InScreenSpace;

	if (!InScreenSpace)
		return this._tileObjects[this._data[uint(uint((Point.y - this.y) / this._tileHeight) * this.widthInTiles + (Point.x - this.x) / this._tileWidth)]].allowCollisions > 0;

	if (Camera === null)
		Camera = Flixel.FlxG.camera;
	Point.x = Point.x - Camera.scroll.x;
	Point.y = Point.y - Camera.scroll.y;
	this.getScreenXY(this._point, Camera);
	return this._tileObjects[this._data[uint(uint((Point.y - this._point.y) / this._tileHeight) * this.widthInTiles + (Point.x - this._point.x) / this._tileWidth)]].allowCollisions > 0;
};

/**
 * Check the value of a particular tile.
 * 
 * @param X
 *            The X coordinate of the tile (in tiles, not pixels).
 * @param Y
 *            The Y coordinate of the tile (in tiles, not pixels).
 * 
 * @return A uint containing the value of the tile at this spot in the array.
 */
Flixel.FlxTilemap.prototype.getTile = function(X, Y)
{
	return this._data[Y * this.widthInTiles + X];
};

/**
 * Get the value of a tile in the tilemap by index.
 * 
 * @param Index
 *            The slot in the data array (Y * widthInTiles + X) where this tile is stored.
 * 
 * @return A uint containing the value of the tile at this spot in the array.
 */
Flixel.FlxTilemap.prototype.getTileByIndex = function(Index)
{
	return this._data[Index];
};

/**
 * Returns a new Flash <code>Array</code> full of every map index of the requested tile type.
 * 
 * @param Index
 *            The requested tile type.
 * 
 * @return An <code>Array</code> with a list of all map indices of that tile type.
 */
Flixel.FlxTilemap.prototype.getTileInstances = function(Index)
{
	var array = null;
	var i = 0;
	var l = this.widthInTiles * this.heightInTiles;
	while (i < l) {
		if (this._data[i] == Index) {
			if (array === null)
				array = [];
			array.push(i);
		}
		i++;
	}

	return array;
};

/**
 * Returns a new Flash <code>Array</code> full of every coordinate of the requested tile type.
 * 
 * @param Index
 *            The requested tile type.
 * @param Midpoint
 *            Whether to return the coordinates of the tile midpoint, or upper left corner. Default is true, return midpoint.
 * 
 * @return An <code>Array</code> with a list of all the coordinates of that tile type.
 */
Flixel.FlxTilemap.prototype.getTileCoords = function(Index, Midpoint)
{
	Midpoint = (Midpoint === undefined) ? true : Midpoint;
	var array = null;

	var point;
	var i = 0;
	var l = this.widthInTiles * this.heightInTiles;
	while (i < l) {
		if (this._data[i] == Index) {
			point = new Flixel.FlxPoint(this.x + uint(i % this.widthInTiles) * this._tileWidth, this.y + uint(i / this.widthInTiles) * this._tileHeight);
			if (Midpoint) {
				point.x += this._tileWidth * 0.5;
				point.y += this._tileHeight * 0.5;
			}
			if (array === null)
				array = [];
			array.push(point);
		}
		i++;
	}

	return array;
};

/**
 * Change the data and graphic of a tile in the tilemap.
 * 
 * @param X
 *            The X coordinate of the tile (in tiles, not pixels).
 * @param Y
 *            The Y coordinate of the tile (in tiles, not pixels).
 * @param Tile
 *            The new integer data you wish to inject.
 * @param UpdateGraphics
 *            Whether the graphical representation of this tile should change.
 * 
 * @return Whether or not the tile was actually changed.
 */
Flixel.FlxTilemap.prototype.setTile = function(X, Y, Tile, UpdateGraphics)
{
	if ((X >= this.widthInTiles) || (Y >= this.heightInTiles))
		return false;

	UpdateGraphics = (UpdateGraphics === undefined) ? true : UpdateGraphics;

	return this.setTileByIndex(Y * this.widthInTiles + X, Tile, UpdateGraphics);
};

/**
 * Change the data and graphic of a tile in the tilemap.
 * 
 * @param Index
 *            The slot in the data array (Y * widthInTiles + X) where this tile is stored.
 * @param Tile
 *            The new integer data you wish to inject.
 * @param UpdateGraphics
 *            Whether the graphical representation of this tile should change.
 * 
 * @return Whether or not the tile was actually changed.
 */
Flixel.FlxTilemap.prototype.setTileByIndex = function(Index, Tile, UpdateGraphics)
{
	UpdateGraphics = (UpdateGraphics === undefined) ? true : UpdateGraphics;

	if (Index >= this._data.length)
		return false;

	var ok = true;
	this._data[Index] = Tile;

	if (!UpdateGraphics)
		return ok;

	this.setDirty();

	if (this.auto == Flixel.FlxTilemap.OFF) {
		this.updateTile(Index);
		return ok;
	}

	// If this map is autotiled and it changes, locally update the arrangement
	var i;
	var row = int(Index / this.widthInTiles) - 1;
	var rowLength = row + 3;
	var column = Index % this.widthInTiles - 1;
	var columnHeight = column + 3;
	while (row < rowLength) {
		column = columnHeight - 3;
		while (column < columnHeight) {
			if ((row >= 0) && (row < this.heightInTiles) && (column >= 0) && (column < this.widthInTiles)) {
				i = row * this.widthInTiles + column;
				this.autoTile(i);
				this.updateTile(i);
			}
			column++;
		}
		row++;
	}

	return ok;
};

/**
 * Adjust collision settings and/or bind a callback function to a range of tiles. This callback function, if present, is triggered by calls to overlap() or overlapsWithCallback().
 * 
 * @param Tile
 *            The tile or tiles you want to adjust.
 * @param AllowCollisions
 *            Modify the tile or tiles to only allow collisions from certain directions, use FlxObject constants NONE, ANY, LEFT, RIGHT, etc. Default is "ANY".
 * @param Callback
 *            The function to trigger, e.g. <code>lavaCallback(Tile:FlxTile, Object:FlxObject)</code>.
 * @param CallbackFilter
 *            If you only want the callback to go off for certain classes or objects based on a certain class, set that class here.
 * @param Range
 *            If you want this callback to work for a bunch of different tiles, input the range here. Default value is 1.
 */
Flixel.FlxTilemap.prototype.setTileProperties = function(Tile, AllowCollisions, Callback, CallbackFilter, Range)
{
	AllowCollisions = AllowCollisions || 0x1111;
	Range = Range || 1;

	if (Range <= 0)
		Range = 1;
	var tile;
	var i = Tile;
	var l = Tile + Range;
	while (i < l) {
		tile = this._tileObjects[i++];
		tile.allowCollisions = AllowCollisions;
		tile.callback = Callback;
		tile.filter = CallbackFilter;
	}
};

/**
 * Call this function to lock the automatic camera to the map's edges.
 * 
 * @param Camera
 *            Specify which game camera you want. If null getScreenXY() will just grab the first global camera.
 * @param Border
 *            Adjusts the camera follow boundary by whatever number of tiles you specify here. Handy for blocking off deadends that are offscreen, etc. Use a negative number to add padding instead of
 *            hiding the edges.
 * @param UpdateWorld
 *            Whether to update the collision system's world size, default value is true.
 */
Flixel.FlxTilemap.prototype.follow = function(Camera, Border, UpdateWorld)
{
	Border = Border || 0;
	UpdateWorld = (UpdateWorld === undefined) ? true : UpdateWorld;

	if (Camera === null)
		Camera = Flixel.FlxG.camera;
	Camera.setBounds(this.x + Border * this._tileWidth, this.y + Border * this._tileHeight, this.width - Border * this._tileWidth * 2, this.height - Border * this._tileHeight * 2, UpdateWorld);
};

/**
 * Get the world coordinates and size of the entire tilemap as a <code>FlxRect</code>.
 * 
 * @param Bounds
 *            Optional, pass in a pre-existing <code>FlxRect</code> to prevent instantiation of a new object.
 * 
 * @return A <code>FlxRect</code> containing the world coordinates and size of the entire tilemap.
 */
Flixel.FlxTilemap.prototype.getBounds = function(Bounds)
{
	if (Bounds === null)
		Bounds = new Flixel.FlxRect();
	return Bounds.make(this.x, this.y, this.width, this.height);
};

/**
 * Shoots a ray from the start point to the end point. If/when it passes through a tile, it stores that point and returns false.
 * 
 * @param Start
 *            The world coordinates of the start of the ray.
 * @param End
 *            The world coordinates of the end of the ray.
 * @param Result
 *            A <code>Point</code> object containing the first wall impact.
 * @param Resolution
 *            Defaults to 1, meaning check every tile or so. Higher means more checks!
 * @return Returns true if the ray made it from Start to End without hitting anything. Returns false and fills Result if a tile was hit.
 */
Flixel.FlxTilemap.prototype.ray = function(Start, End, Result, Resolution)
{
	Resolution = Resolution || 1;

	var step = this._tileWidth;
	if (this._tileHeight < this._tileWidth)
		step = this._tileHeight;
	step /= Resolution;
	var deltaX = End.x - Start.x;
	var deltaY = End.y - Start.y;
	var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	var steps = Math.ceil(distance / step);
	var stepX = deltaX / steps;
	var stepY = deltaY / steps;
	var curX = Start.x - stepX - this.x;
	var curY = Start.y - stepY - this.y;
	var tileX;
	var tileY;
	var i = 0;
	while (i < steps) {
		curX += stepX;
		curY += stepY;

		if ((curX < 0) || (curX > this.width) || (curY < 0) || (curY > this.height)) {
			i++;
			continue;
		}

		tileX = curX / this._tileWidth;
		tileY = curY / this._tileHeight;
		if (this._tileObjects[this._data[tileY * this.widthInTiles + tileX]].allowCollisions) {
			// Some basic helper stuff
			tileX *= this._tileWidth;
			tileY *= this._tileHeight;
			var rx = 0;
			var ry = 0;
			var q;
			var lx = curX - stepX;
			var ly = curY - stepY;

			// Figure out if it crosses the X boundary
			q = tileX;
			if (deltaX < 0)
				q += this._tileWidth;
			rx = q;
			ry = ly + stepY * ((q - lx) / stepX);
			if ((ry > tileY) && (ry < tileY + this._tileHeight)) {
				if (Result !== null) {
					Result.x = rx;
					Result.y = ry;
				}
				return false;
			}

			// Else, figure out if it crosses the Y boundary
			q = tileY;
			if (deltaY < 0)
				q += this._tileHeight;
			rx = lx + stepX * ((q - ly) / stepY);
			ry = q;
			if ((rx > tileX) && (rx < tileX + this._tileWidth)) {
				if (Result !== null) {
					Result.x = rx;
					Result.y = ry;
				}
				return false;
			}
			return true;
		}
		i++;
	}
	return true;
};

/**
 * Works exactly like ray() except it explicitly returns the hit result. Shoots a ray from the start point to the end point. If/when it passes through a tile, it returns that point. If it does not, it
 * returns null. Usage: FlxPoint hit = tilemap.rayHit(startPoint, endPoint); if (hit !== null) //code ;
 * 
 * @param Start
 *            The world coordinates of the start of the ray.
 * @param End
 *            The world coordinates of the end of the ray.
 * @param Resolution
 *            Defaults to 1, meaning check every tile or so. Higher means more checks!
 * @return Returns null if the ray made it from Start to End without hitting anything. Returns FlxPoint if a tile was hit.
 */
Flixel.FlxTilemap.prototype.rayHit = function(Start, End, Resolution)
{
	Resolution = Resolution || 1;

	var Result = null;
	var step = this._tileWidth;
	if (this._tileHeight < this._tileWidth)
		step = this._tileHeight;
	step /= Resolution;
	var deltaX = End.x - Start.x;
	var deltaY = End.y - Start.y;
	var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	var steps = Math.ceil(distance / step);
	var stepX = deltaX / steps;
	var stepY = deltaY / steps;
	var curX = Start.x - stepX - this.x;
	var curY = Start.y - stepY - this.y;
	var tileX;
	var tileY;
	var i = 0;
	while (i < steps) {
		curX += stepX;
		curY += stepY;

		if ((curX < 0) || (curX > this.width) || (curY < 0) || (curY > this.height)) {
			i++;
			continue;
		}

		tileX = curX / this._tileWidth;
		tileY = curY / this._tileHeight;
		if (this._tileObjects[this._data[tileY * this.widthInTiles + tileX]].allowCollisions) {
			// Some basic helper stuff
			tileX *= this._tileWidth;
			tileY *= this._tileHeight;
			var rx = 0;
			var ry = 0;
			var q;
			var lx = curX - stepX;
			var ly = curY - stepY;

			// Figure out if it crosses the X boundary
			q = tileX;
			if (deltaX < 0)
				q += this._tileWidth;
			rx = q;
			ry = ly + stepY * ((q - lx) / stepX);
			if ((ry > tileY) && (ry < tileY + this._tileHeight)) {
				if (Result !== null) {
					Result.x = rx;
					Result.y = ry;
				}
				return Result;
			}

			// Else, figure out if it crosses the Y boundary
			q = tileY;
			if (deltaY < 0) {
				q += this._tileHeight;
			}
			rx = lx + stepX * ((q - ly) / stepY);
			ry = q;
			if ((rx > tileX) && (rx < tileX + this._tileWidth)) {
				if (Result === null)
					Result = new Flixel.FlxPoint();

				Result.x = rx;
				Result.y = ry;
				return Result;
			}
			return null;
		}
		i++;
	}
	return null;
};

/**
 * Converts a one-dimensional array of tile data to a comma-separated string.
 * 
 * @param Data
 *            An array full of integer tile references.
 * @param Width
 *            The number of tiles in each row.
 * @param Invert
 *            Recommended only for 1-bit arrays - changes 0s to 1s and vice versa.
 * 
 * @return A comma-separated string containing the level data in a <code>FlxTilemap</code>-friendly format.
 */
Flixel.FlxTilemap.arrayToCSV = function(Data, Width, Invert)
{
	Invert = (Invert === undefined) ? false : Invert;

	var row = 0;
	var column;
	var csv = "";
	var Height = Data.length / Width;
	var index;
	while (row < Height) {
		column = 0;
		while (column < Width) {
			index = Data[row * Width + column];
			if (Invert) {
				if (index === 0)
					index = 1;
				else if (index == 1)
					index = 0;
			}

			if (column === 0) {
				if (row === 0)
					csv += index;
				else
					csv += "\n" + index;
			} else
				csv += ", " + index;
			column++;
		}
		row++;
	}
	return csv;
};

/**
 * Converts a <code>TiledMap</code> object to a comma-separated string.
 * 
 * @param Map
 *            A <code>TiledMap</code> instance.
 * @param Layer
 *            Which layer of the <code>TiledMap</code> to use.
 * 
 * @return A comma-separated string containing the level data in a <code>FlxTilemap</code>-friendly format.
 */
Flixel.FlxTilemap.tiledmapToCSV = function(map, layer, tileSet)
{
	var mapLayer = null;

	if (typeof layer === "string")
		mapLayer = map.getLayer(layer);
	else
		mapLayer = map.getLayers()[int(layer)];
	
	if(mapLayer === null || mapLayer === undefined)
		throw new Error("FlxTilemap: Layer " + layer + " do not exist in map!");

	var max = 0xFFFFFF;
	var offset = 0;
	if (tileSet) {
		offset = tileSet.firstGID;
		max = tileSet.numTiles - 1;
	}
	var result = "";
	for (var i = 0; i < mapLayer.tileGIDs.length; i++) {
		var row = mapLayer.tileGIDs[i];
		var chunk = "";
		var id = 0;
		for (var j = 0; j < row.length; j++) {
			id = row[j];
			id -= offset;
			if (id < 0 || id > max)
				id = 0;
			result += chunk;
			chunk = id + ",";
		}
		result += id + "\n";
	}
	return result;
};

/**
 * Converts a <code>BitmapData</code> object to a comma-separated string. Black pixels are flagged as 'solid' by default, non-black pixels are set as non-colliding. Black pixels must be PURE BLACK.
 * 
 * @param bitmapData
 *            A Flash <code>BitmapData</code> object, preferably black and white.
 * @param Invert
 *            Load white pixels as solid instead.
 * @param Scale
 *            Default is 1. Scale of 2 means each pixel forms a 2x2 block of tiles, and so on.
 * @param ColorMap
 *            An array of color values (uint 0xAARRGGBB) in the order they're intended to be assigned as indices
 * 
 * @return A comma-separated string containing the level data in a <code>FlxTilemap</code>-friendly format.
 */
Flixel.FlxTilemap.bitmapToCSV = function(bitmapData, Invert, Scale, ColorMap)
{
	Invert = (Invert === undefined) ? false : Invert;
	Scale = Scale || 1;

	// Import and scale image if necessary
	if (Scale > 1) {
		var bd = bitmapData;
		bitmapData = new BitmapData(bitmapData.width * Scale, bitmapData.height * Scale);
		var mtx = new Matrix();
		mtx.scale(Scale, Scale);
		bitmapData.draw(bd, mtx);
	}

	// Walk image and export pixel values
	var row = 0;
	var column;
	var pixel;
	var csv = "";
	var bitmapWidth = bitmapData.width;
	var bitmapHeight = bitmapData.height;
	while (row < bitmapHeight) {
		column = 0;
		while (column < bitmapWidth) {
			// Decide if this pixel/tile is solid (1) or not (0)
			pixel = bitmapData.getPixel(column, row);
			if (ColorMap !== null)
				pixel = ColorMap.indexOf(pixel);
			else if ((Invert && (pixel > 0)) || (!Invert && (pixel === 0)))
				pixel = 1;
			else
				pixel = 0;

			// Write the result to the string
			if (column === 0) {
				if (row === 0)
					csv += pixel;
				else
					csv += "\n" + pixel;
			} else
				csv += ", " + pixel;
			column++;
		}
		row++;
	}
	return csv;
};

/**
 * Converts a resource image file to a comma-separated string. Black pixels are flagged as 'solid' by default, non-black pixels are set as non-colliding. Black pixels must be PURE BLACK.
 * 
 * @param ImageFile
 *            An embedded graphic, preferably black and white.
 * @param Invert
 *            Load white pixels as solid instead.
 * @param Scale
 *            Default is 1. Scale of 2 means each pixel forms a 2x2 block of tiles, and so on.
 * 
 * @return A comma-separated string containing the level data in a <code>FlxTilemap</code>-friendly format.
 */
Flixel.FlxTilemap.imageToCSV = function(ImageFile, Invert, Scale)
{
	var tmp = BitmapData.fromImage(ImageFile);
	Invert = (Invert === undefined) ? false : Invert;
	Scale = Scale || 1;
	return this.bitmapToCSV(tmp, Invert, Scale);
};

/**
 * An internal function used by the binary auto-tilers.
 * 
 * @param Index
 *            The index of the tile you want to analyze.
 */
Flixel.FlxTilemap.prototype.autoTile = function(Index)
{
	if (this._data[Index] === 0)
		return;

	this._data[Index] = 0;
	if ((Index - this.widthInTiles < 0) || (this._data[Index - this.widthInTiles] > 0)) // UP
		this._data[Index] += 1;
	if ((Index % this.widthInTiles >= this.widthInTiles - 1) || (this._data[Index + 1] > 0)) // RIGHT
		this._data[Index] += 2;
	if ((Index + this.widthInTiles >= this.totalTiles) || (this._data[Index + this.widthInTiles] > 0)) // DOWN
		this._data[Index] += 4;
	if ((Index % this.widthInTiles <= 0) || (this._data[Index - 1] > 0)) // LEFT
		this._data[Index] += 8;

	// The alternate algo checks for interior corners
	if ((this.auto == Flixel.FlxTilemap.ALT) && (this._data[Index] == 15)) {
		if ((Index % this.widthInTiles > 0) && (Index + this.widthInTiles < this.totalTiles) && (this._data[Index + this.widthInTiles - 1] <= 0))
			this._data[Index] = 1; // BOTTOM LEFT OPEN
		if ((Index % this.widthInTiles > 0) && (Index - this.widthInTiles >= 0) && (this._data[Index - this.widthInTiles - 1] <= 0))
			this._data[Index] = 2; // TOP LEFT OPEN
		if ((Index % this.widthInTiles < this.widthInTiles - 1) && (Index - this.widthInTiles >= 0) && (this._data[Index - this.widthInTiles + 1] <= 0))
			this._data[Index] = 4; // TOP RIGHT OPEN
		if ((Index % this.widthInTiles < this.widthInTiles - 1) && (Index + this.widthInTiles < this.totalTiles) && (this._data[Index + this.widthInTiles + 1] <= 0))
			this._data[Index] = 8; // BOTTOM RIGHT OPEN
	}
	this._data[Index] += 1;
};

/**
 * Internal function used in setTileByIndex() and the constructor to update the map.
 * 
 * @param Index
 *            The index of the tile you want to update.
 */
Flixel.FlxTilemap.prototype.updateTile = function(Index)
{
	var tile = this._tileObjects[this._data[Index]];
	if ((tile === null || tile === undefined) || !tile.visible) {
		this._rects[Index] = null;
		return;
	}
	var rx = (this._data[Index] - this._startingIndex) * (this._tileWidth + this.offsetX);
	var ry = 0;
	if (rx >= this._tiles.width) {
		ry = uint(rx / this._tiles.width) * (this._tileHeight + this.offsetY);
		rx %= this._tiles.width;
	}
	this._rects[Index] = new Flixel.FlxRect(rx, ry, this._tileWidth, this._tileHeight);
};

/**
 * Returns the tile collision info.
 * 
 * @param index
 *            The index of the tile you want the info.
 */
Flixel.FlxTilemap.prototype.getTileCollision = function(index)
{
	var tile = null;
	if (this._data[index] < this._tileObjects.size)
		tile = this._tileObjects[this._data[index]];
	if ((tile === null) || !tile.visible) {
		return Flixel.FlxObject.NONE;
	}
	return tile.allowCollisions;
};

/**
 * Change a particular tile to FlxSprite. Or just copy the graphic if you don't want any changes to map data itself.
 * 
 * @link http://forums.flixel.org/index.php/topic,5398.0.html
 * @param X
 *            The X coordinate of the tile (in tiles, not pixels).
 * @param Y
 *            The Y coordinate of the tile (in tiles, not pixels).
 * @param NewTile
 *            New tile to the mapdata. Use -1 if you dont want any changes. Default = 0 (empty)
 * @return FlxSprite.
 */
Flixel.FlxTilemap.prototype.tileToFlxSprite = function(X, Y, NewTile)
{
	var rowIndex = X + (Y * this.widthInTiles);

	var tile = this._tileObjects[this._data[rowIndex]];
	var rect = null;
	if ((tile === null || tile === undefined) || !tile.visible) {
		// Nothing to do here: rect object should stay null.
	} else {
		var rx = (this._data[rowIndex] - this._startingIndex) * this._tileWidth;
		var ry = 0;
		if (rx >= this._tiles.width) {
			ry = uint(rx / this._tiles.width) * this._tileHeight;
			rx %= this._tiles.width;
		}
		rect = new Flixel.FlxRect(rx, ry, this._tileWidth, this._tileHeight);
	}

	var tileSprite = new Flixel.FlxSprite();
	tileSprite.makeGraphic(this._tileWidth, this._tileHeight, 0x00000000, true);

	tileSprite.x = X * this._tileWidth + this.x;
	tileSprite.y = Y * this._tileHeight + this.y;
	if (rect !== null)
		tileSprite.getPixels().copyPixels(this._tiles, rect, new Flixel.FlxPoint());
	tileSprite.dirty = true;

	if (NewTile >= 0)
		this.setTile(X, Y, NewTile);

	return tileSprite;
};

/**
 * Return the tile width.
 */
Flixel.FlxTilemap.prototype.getTileWidth = function()
{
	return this._tileWidth;
};

/**
 * Return the tile height.
 */
Flixel.FlxTilemap.prototype.getTileHeight = function()
{
	return this._tileHeight;
};

/**
 * Return a tile object
 */
Flixel.FlxTilemap.prototype.getTileObject = function(tile)
{
	return this._tileObjects[tile];
};

/**
 * Returns the class name.
 */
Flixel.FlxTilemap.prototype.toString = function()
{
	return "FlxTilemap";
};