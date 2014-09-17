/**
 * An analog stick or thumbstick with callbacks.
 * It can easily be customized by overriding the parent methods.
 *
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author	Adam Atomic
 * @author	ratalaika / ratalaikaGames
 * @author	Ka Wing Chin
 */

/**
 * Class constructor.
 * 
 * @param X
 *            The X-coordinate of the point in space.
 * @param Y
 *            The Y-coordinate of the point in space.
 * @param radius
 *            The radius where the thumb can move. If 0, the background will be use as radius.
 * @param dragRadius
 *            The radius where the thumb can move. Default 0, the background * 1.25 will be used as radius.
 * @param ease
 *            The duration of the easing. The value must be between 0 and 1.
 */
Flixel.system.input.pads.FlxAnalog = function(x, y, radius, dragRadius, ease)
{
	x = (x === undefined) ? 0 : x;
	y = (y === undefined) ? 0 : y;
	radius = (radius === undefined) ? 0 : radius;
	dragRadius = (dragRadius === undefined) ? 0 : dragRadius;
	ease = (ease === undefined) ? 0.25 : ease;
	
	Flixel.system.input.pads.FlxAnalog.parent.constructor.apply(this);

	this.x = x;
	this.y = y;		
	this._radius = radius;
	this._dragRadius = dragRadius;
	this._ease = ease;
	this._terminated = false;

	Flixel.system.input.pads.FlxAnalog._analogs.push(this);

	this.status = Flixel.system.input.pads.FlxAnalog.NORMAL;
	this._direction = 0;
	this._amount = 0;
	this.acceleration = new Flixel.FlxPoint();
	this._point = new Flixel.FlxPoint();

	this.createBase();
	this.createThumb();
	this.createZone();
	this.createDragZone();
};
extend(Flixel.system.input.pads.FlxAnalog, Flixel.FlxGroup);

/**
 * Used with public variable <code>status</code>, means not highlighted or pressed.
 */
Flixel.system.input.pads.FlxAnalog.NORMAL = 0;
/**
 * Used with public variable <code>status</code>, means highlighted (usually from mouse over).
 */
Flixel.system.input.pads.FlxAnalog.HIGHLIGHT = 1;
/**
 * Used with public variable <code>status</code>, means pressed (usually from mouse click).
 */
Flixel.system.input.pads.FlxAnalog.PRESSED = 2;
/**
 * An list of analogs that are currently active.
 */
Flixel.system.input.pads.FlxAnalog._analogs = [];
/**
 * Shows the current state of the button.
 */
Flixel.system.input.pads.FlxAnalog.prototype.status = 0;
/**
 * X position of the upper left corner of this object in world space.
 */
Flixel.system.input.pads.FlxAnalog.prototype.x = 0;
/**
 * Y position of the upper left corner of this object in world space.
 */
Flixel.system.input.pads.FlxAnalog.prototype.y = 0;
/**
 * This is just a pre-allocated x-y point container to be used however you like
 */
Flixel.system.input.pads.FlxAnalog.prototype._point = null;
/**
 * This function is called when the button is released.
 */
Flixel.system.input.pads.FlxAnalog.prototype.onUp = null;
/**
 * This function is called when the button is pressed down.
 */
Flixel.system.input.pads.FlxAnalog.prototype.onDown = null;
/**
 * This function is called when the mouse goes over the button.
 */
Flixel.system.input.pads.FlxAnalog.prototype.onOver = null;
/**
 * This function is called when the button is hold down.
 */
Flixel.system.input.pads.FlxAnalog.prototype.onPressed = null;
/**
 * The area which the joystick will react.
 */
Flixel.system.input.pads.FlxAnalog.prototype._zone = null;
/**
 * The background of the joystick, also known as the base.
 */
Flixel.system.input.pads.FlxAnalog.prototype.bg = null;
/**
 * The thumb
 */
Flixel.system.input.pads.FlxAnalog.prototype.thumb = null;
/**
 * The radius where the thumb can move.
 */
Flixel.system.input.pads.FlxAnalog.prototype._radius = 0;
Flixel.system.input.pads.FlxAnalog.prototype._direction = 0;
Flixel.system.input.pads.FlxAnalog.prototype._amount = 0;
/**
 * The area which the touch is allowed to drag.
 */
Flixel.system.input.pads.FlxAnalog.prototype._dragZone = null;
/**
 * The radius where the touch can move while dragging the thumb.
 */
Flixel.system.input.pads.FlxAnalog.prototype._dragRadius = 0;
/**
 * How fast the speed of this object is changing.
 */
Flixel.system.input.pads.FlxAnalog.prototype.acceleration = null;
/**
 * The speed of easing when the thumb is released.
 */
Flixel.system.input.pads.FlxAnalog.prototype._ease = 0;
/**
 * If the analog is terminated or not.
 */
Flixel.system.input.pads.FlxAnalog.prototype._terminated = false;

/**
 * Creates the background of the analog stick. Override this to customize the background.
 */
Flixel.system.input.pads.FlxAnalog.prototype.createBase = function()
{
	this.bg = new Flixel.FlxSprite(this.x, this.y).loadGraphic(Flixel.data.FlxSystemAsset.ImgControlBase);
	this.bg.x += -this.bg.width * 0.5;
	this.bg.y += -this.bg.height * 0.5;
	this.bg.scrollFactor.x = this.bg.scrollFactor.y = 0;
	this.bg.setSolid(false);
	this.bg.ignoreDrawDebug = true;
	this.add(this.bg);	
};

/**
 * Creates the thumb of the analog stick. Override this to customize the thumb.
 */
Flixel.system.input.pads.FlxAnalog.prototype.createThumb = function()
{
	this.thumb = new Flixel.FlxSprite(this.x, this.y).loadGraphic(Flixel.data.FlxSystemAsset.ImgControlKnob);
	this.thumb.scrollFactor.x = this.thumb.scrollFactor.y = 0;
	this.thumb.setSolid(false);
	this.thumb.ignoreDrawDebug = true;
	this.add(this.thumb);
};

/**
 * Creates the touch zone. It's based on the size of the background. The thumb will react when the mouse is in the zone. Override this to customize
 * the zone.
 * 
 * @param contract
 *            Contract the size.
 */
Flixel.system.input.pads.FlxAnalog.prototype.createZone = function()
{
	if(this._radius === 0)
		this._radius = this.bg.width * 0.5;
	this._zone = new Flixel.system.input.pads.FlxAnalog.Circle(this.x, this.y, this._radius);
};

/**
 * Creates the move zone. The thumb can only move in this zone. It's based on the size of the background * 1.25. When the mouse is out the zone, the
 * thumb will be released. Override this to customize the drag zone.
 */
Flixel.system.input.pads.FlxAnalog.prototype.createDragZone = function()
{
	if(this._dragRadius === 0)
		this._dragRadius = this.bg.width * 1.25;
	this._dragZone = new Flixel.system.input.pads.FlxAnalog.Circle(this.x, this.y, this._dragRadius);
};

/**
 * Clean up memory.
 */
Flixel.system.input.pads.FlxAnalog.prototype.destroy = function()
{
	Flixel.system.input.pads.FlxAnalog.parent.destroy.apply(this);
	Flixel.system.input.pads.FlxAnalog._analogs.splice(Flixel.system.input.pads.FlxAnalog._analogs.indexOf(this), 1); // Remove our self from the array
	this.onUp = this.onDown = this.onOver = this.onPressed = null;
	this.acceleration = null;
	this._point = null;
	this.thumb = null;
	this._zone = null;
	this._dragZone = null;
	this.bg = null;
	this.thumb = null;
};

/**
 * Update the behavior.
 */
Flixel.system.input.pads.FlxAnalog.prototype.update = function()
{
	var offAll = true;
	var pointerId = 0;
	var	totalPointers = Flixel.FlxG.mouse.activePointers + 1;		

	while(pointerId < totalPointers)
	{	
		if(!this.updateAnalog(pointerId))
		{
			offAll = false;
			break;
		}
		++pointerId;
	}

	this.thumb.x = (this.x + Math.cos(this._direction) * this._amount * this._radius - (this.thumb.width * 0.5));
	this.thumb.y = (this.y + Math.sin(this._direction) * this._amount * this._radius - (this.thumb.height * 0.5));

	if(offAll)
		this.status = Flixel.system.input.pads.FlxAnalog.NORMAL;

	Flixel.system.input.pads.FlxAnalog.parent.update.apply(this);
};

/**
 * Update the analog according to a pointer id.
 * 
 * @param pointerId
 *            The desired pointer id.
 * @return If the analog was updated.
 */
Flixel.system.input.pads.FlxAnalog.prototype.updateAnalog = function(pointerId)
{		
	var offAll = true;
	Flixel.FlxG.mouse.getScreenPosition(Flixel.FlxG.camera, this._point, pointerId);

	if(this._zone.contains(this._point.x, this._point.y) || (this._dragZone.contains(this._point.x, this._point.y) && this.status == Flixel.system.input.pads.FlxAnalog.PRESSED))
	{
		offAll = false;
		if(Flixel.FlxG.mouse.pressed(pointerId))
		{
			this.status = Flixel.system.input.pads.FlxAnalog.PRESSED;			
			if(Flixel.FlxG.mouse.justPressed(pointerId))
			{
				if(this.onDown !== null)
					this.onDown();
			}

			if(this.status == Flixel.system.input.pads.FlxAnalog.PRESSED)
			{
				if(this.onPressed !== null)
					this.onPressed();						

				var dx = this._point.x - this.x;
				var dy = this._point.y - this.y;

				var dist = Math.sqrt(dx * dx + dy * dy);
				if(dist < 1) 
					dist = 0;
				this._direction = Math.atan2(dy, dx);
				this._amount = Math.min(this._radius, dist) / this._radius;

				this.acceleration.x = (Math.cos(this._direction) * this._amount * this._radius);
				this.acceleration.y = (Math.sin(this._direction) * this._amount * this._radius);			
			}
		}
		else if(Flixel.FlxG.mouse.justReleased(pointerId) && this.status == Flixel.system.input.pads.FlxAnalog.PRESSED)
		{
			this.status = Flixel.system.input.pads.FlxAnalog.HIGHLIGHT;
			if(this.onUp !== null)
				this.onUp();
			this.acceleration.x = 0;
			this.acceleration.y = 0;
		}					

		if(this.status == Flixel.system.input.pads.FlxAnalog.NORMAL)
		{
			this.status = Flixel.system.input.pads.FlxAnalog.HIGHLIGHT;
			if(this.onOver !== null)
				this.onOver();
		}
	}
	if((this.status == Flixel.system.input.pads.FlxAnalog.HIGHLIGHT || this.status == Flixel.system.input.pads.FlxAnalog.NORMAL) && this._amount !== 0)
	{				
		this._amount *= this._ease;
		if(Math.abs(this._amount) < 0.1) 
			this._amount = 0;
	}
	return offAll;
};

/**
 * Returns the angle in degrees.
 * 
 * @return The angle.
 */
Flixel.system.input.pads.FlxAnalog.prototype.getAngle = function()
{
	return (Math.atan2(this.acceleration.y, this.acceleration.x) * Flixel.plugin.FlxMath.RADTODEG);
};

/**
 * Whether the thumb is pressed or not.
 */
Flixel.system.input.pads.FlxAnalog.prototype.pressed = function(name)
{
	if(name !== undefined || name !== null)
		return false;

	return this.status == Flixel.system.input.pads.FlxAnalog.PRESSED;
};

/**
 * Whether the thumb is just pressed or not.
 */
Flixel.system.input.pads.FlxAnalog.prototype.justPressed = function()
{
	return Flixel.FlxG.mouse.justPressed() && this.status == Flixel.system.input.pads.FlxAnalog.PRESSED;
};

/**
 * Whether the thumb is just released or not.
 */
Flixel.system.input.pads.FlxAnalog.prototype.justReleased = function()
{
	return Flixel.FlxG.mouse.justReleased() && this.status == Flixel.system.input.pads.FlxAnalog.HIGHLIGHT;
};

/**
 * Set <code>alpha</code> to a number between 0 and 1 to change the opacity of the analog.
 * 
 * @param Alpha
 */
Flixel.system.input.pads.FlxAnalog.prototype.setAlpha = function(Alpha)
{
	for(var i = 0; i < this.members.length; i++)
	{
		this.members[i].setAlpha(Alpha);
	}
};

/**
 * Show all the Analog PAD buttons.
 */
Flixel.system.input.pads.FlxAnalog.prototype.show = function()
{
	this.visible = true;
	this.active = true;
};

/**
 * Hide all the Analog PAD buttons.
 */
Flixel.system.input.pads.FlxAnalog.prototype.hide = function()
{
	this.visible = false;
	this.active = false;
};

/**
 * Terminate the whole Analog PAD.
 */
Flixel.system.input.pads.FlxAnalog.prototype.terminate = function()
{
	this._terminated = true;
};

/**
 * Tells the caller if the Analog PAD should be instanced again.
 * 
 * @return If the Analog PAD should be instanced again.
 */
Flixel.system.input.pads.FlxAnalog.prototype.isTerminated = function()
{
	return this._terminated;
};

Flixel.system.input.pads.FlxAnalog.prototype.justTouching = function(name) {
	return false;
};

Flixel.system.input.pads.FlxAnalog.prototype.justRemoved = function(name) {
	return false;
};


Flixel.system.input.pads.FlxAnalog.Circle = function(x, y, radius)
{
	this.x = x;
	this.y = y;
	this.radius = radius;
};

Flixel.system.input.pads.FlxAnalog.Circle.prototype.x = 0;
Flixel.system.input.pads.FlxAnalog.Circle.prototype.y = 0;
Flixel.system.input.pads.FlxAnalog.Circle.prototype.radius = 0;

/**
 * Whether this circle contains the point or not.
 * 
 * @param x
 *            The point X.
 * @param y
 *            The point Y.
 * @returns {Boolean} If the circle contains the point.
 */
Flixel.system.input.pads.FlxAnalog.Circle.prototype.contains = function(X, Y)
{
	X = this.x - X;
	Y = this.y - Y;
	return X * X + Y * Y <= this.radius * this.radius;
};