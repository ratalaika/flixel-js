/**
 * Static class with useful easer floats that can be used by Tweens.
 * 
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author	ratalaika / ratalaikaGames
 */

Flixel.plugin.tweens.util.Ease = function()
{
};

/** Quadratic in. */
Flixel.plugin.tweens.util.Ease.quadIn = function(t)
{
	return t * t;
};

/** Quadratic out. */
Flixel.plugin.tweens.util.Ease.quadOut = function(t)
{
	return -t * (t - 2);
};

/** Quadratic in and out. */
Flixel.plugin.tweens.util.Ease.quadInOut = function(t)
{
	return t <= 0.5 ? t * t * 2 : 1 - (--t) * t * 2;
};

/** Cubic in. */
Flixel.plugin.tweens.util.Ease.cubeIn = function(t)
{
	return t * t * t;
};

/** Cubic out. */
Flixel.plugin.tweens.util.Ease.cubeOut = function(t)
{
	return 1 + (--t) * t * t;
};

/** Cubic in and out. */
Flixel.plugin.tweens.util.Ease.cubeInOut = function(t)
{
	return t <= 0.5 ? t * t * t * 4 : 1 + (--t) * t * t * 4;
};

/** Quart in. */
Flixel.plugin.tweens.util.Ease.quartIn = function(t)
{
	return t * t * t * t;
};

/** Quart out. */
Flixel.plugin.tweens.util.Ease.quartOut = function(t)
{
	return 1 - (t -= 1) * t * t * t;
};

/** Quart in and out. */
Flixel.plugin.tweens.util.Ease.quartInOut = function(t)
{
	return t <= 0.5 ? t * t * t * t * 8 : (1 - (t = t * 2 - 2) * t * t * t) / 2 + 0.5;
};

/** Quint in. */
Flixel.plugin.tweens.util.Ease.quintIn = function(t)
{
	return t * t * t * t * t;
};

/** Quint out. */
Flixel.plugin.tweens.util.Ease.quintOut = function(t)
{
	return (t = t - 1) * t * t * t * t + 1;
};

/** Quint in and out. */
Flixel.plugin.tweens.util.Ease.quintInOut = function(t)
{
	return ((t *= 2) < 1) ? (t * t * t * t * t) / 2 : ((t -= 2) * t * t * t * t + 2) / 2;
};

/** Sine in. */
Flixel.plugin.tweens.util.Ease.sineIn = function(t)
{
	return -Math.cos(Flixel.plugin.tweens.util.Ease.PI2 * t) + 1;
};

/** Sine out. */
Flixel.plugin.tweens.util.Ease.sineOut = function(t)
{
	return Math.sin(Flixel.plugin.tweens.util.Ease.PI2 * t);
};

/** Sine in and out. */
Flixel.plugin.tweens.util.Ease.sineInOut = function(t)
{
	return -Math.cos(Flixel.plugin.tweens.util.Ease.PI * t) / 2 + 0.5;
};

/** Bounce in. */
Flixel.plugin.tweens.util.Ease.bounceIn = function(t)
{
	t = 1 - t;
	if (t < Flixel.plugin.tweens.util.Ease.B1)
		return 1 - 7.5625 * t * t;
	if (t < Flixel.plugin.tweens.util.Ease.B2)
		return 1 - (7.5625 * (t - Flixel.plugin.tweens.util.Ease.B3) * (t - Flixel.plugin.tweens.util.Ease.B3) + 0.75);
	if (t < Flixel.plugin.tweens.util.Ease.B4)
		return 1 - (7.5625 * (t - Flixel.plugin.tweens.util.Ease.B5) * (t - Flixel.plugin.tweens.util.Ease.B5) + 0.9375);
	return 1 - (7.5625 * (t - Flixel.plugin.tweens.util.Ease.B6) * (t - Flixel.plugin.tweens.util.Ease.B6) + 0.984375);
};

/** Bounce out. */
Flixel.plugin.tweens.util.Ease.bounceOut = function(t)
{
	if (t < Flixel.plugin.tweens.util.Ease.B1)
		return 7.5625 * t * t;
	if (t < Flixel.plugin.tweens.util.Ease.B2)
		return 7.5625 * (t - Flixel.plugin.tweens.util.Ease.B3) * (t - Flixel.plugin.tweens.util.Ease.B3) + 0.75;
	if (t < Flixel.plugin.tweens.util.Ease.B4)
		return 7.5625 * (t - Flixel.plugin.tweens.util.Ease.B5) * (t - Flixel.plugin.tweens.util.Ease.B5) + 0.9375;
	return 7.5625 * (t - Flixel.plugin.tweens.util.Ease.B6) * (t - Flixel.plugin.tweens.util.Ease.B6) + 0.984375;
};

/** Bounce in and out. */
Flixel.plugin.tweens.util.Ease.bounceInOut = function(t)
{
	if (t < 0.5) {
		t = 1 - t * 2;
		if (t < Flixel.plugin.tweens.util.Ease.B1)
			return (1 - 7.5625 * t * t) / 2;
		if (t < Flixel.plugin.tweens.util.Ease.B2)
			return (1 - (7.5625 * (t - Flixel.plugin.tweens.util.Ease.B3) * (t - Flixel.plugin.tweens.util.Ease.B3) + 0.75)) / 2;
		if (t < Flixel.plugin.tweens.util.Ease.B4)
			return (1 - (7.5625 * (t - Flixel.plugin.tweens.util.Ease.B5) * (t - Flixel.plugin.tweens.util.Ease.B5) + 0.9375)) / 2;
		return (1 - (7.5625 * (t - Flixel.plugin.tweens.util.Ease.B6) * (t - Flixel.plugin.tweens.util.Ease.B6) + 0.984375)) / 2;
	}
	t = t * 2 - 1;
	if (t < Flixel.plugin.tweens.util.Ease.B1)
		return (7.5625 * t * t) / 2 + 0.5;
	if (t < Flixel.plugin.tweens.util.Ease.B2)
		return (7.5625 * (t - Flixel.plugin.tweens.util.Ease.B3) * (t - Flixel.plugin.tweens.util.Ease.B3) + 0.75) / 2 + 0.5;
	if (t < Flixel.plugin.tweens.util.Ease.B4)
		return (7.5625 * (t - Flixel.plugin.tweens.util.Ease.B5) * (t - Flixel.plugin.tweens.util.Ease.B5) + 0.9375) / 2 + 0.5;
	return (7.5625 * (t - Flixel.plugin.tweens.util.Ease.B6) * (t - Flixel.plugin.tweens.util.Ease.B6) + 0.984375) / 2 + 0.5;
};

/** Circle in. */
Flixel.plugin.tweens.util.Ease.circIn = function(t)
{
	return -(Math.sqrt(1 - t * t) - 1);
};

/** Circle out. */
Flixel.plugin.tweens.util.Ease.circOut = function(t)
{
	return Math.sqrt(1 - (t - 1) * (t - 1));
};

/** Circle in and out. */
Flixel.plugin.tweens.util.Ease.circInOut = function(t)
{
	return t <= 0.5 ? (Math.sqrt(1 - t * t * 4) - 1) / -2 : (Math.sqrt(1 - (t * 2 - 2) * (t * 2 - 2)) + 1) / 2;
};

/** Exponential in. */
Flixel.plugin.tweens.util.Ease.expoIn = function(t)
{
	return Math.pow(2, 10 * (t - 1));
};

/** Exponential out. */
Flixel.plugin.tweens.util.Ease.expoOut = function(t)
{
	return -Math.pow(2, -10 * t) + 1;
};

/** Exponential in and out. */
Flixel.plugin.tweens.util.Ease.expoInOut = function(t)
{
	return t < 0.5 ? Math.pow(2, 10 * (t * 2 - 1)) / 2 : (-Math.pow(2, -10 * (t * 2 - 1)) + 2) / 2;
};

/** Back in. */
Flixel.plugin.tweens.util.Ease.backIn = function(t)
{
	return t * t * (2.70158 * t - 1.70158);
};

/** Back out. */
Flixel.plugin.tweens.util.Ease.backOut = function(t)
{
	return 1 - (--t) * (t) * (-2.70158 * t - 1.70158);
};

/** Back in and out. */
Flixel.plugin.tweens.util.Ease.backInOut = function(t)
{
	t *= 2;
	if (t < 1)
		return t * t * (2.70158 * t - 1.70158) / 2;
	t--;
	return (1 - (--t) * (t) * (-2.70158 * t - 1.70158)) / 2 + 0.5;
};

// Easing constants.
Flixel.plugin.tweens.util.Ease.PI = Flixel.FlxU.PI;
Flixel.plugin.tweens.util.Ease.PI2 = Flixel.FlxU.HALF_PI;
// private static const EL = 2 * PI / 0.45;
Flixel.plugin.tweens.util.Ease.B1 = 1 / 2.75;
Flixel.plugin.tweens.util.Ease.B2 = 2 / 2.75;
Flixel.plugin.tweens.util.Ease.B3 = 1.5 / 2.75;
Flixel.plugin.tweens.util.Ease.B4 = 2.5 / 2.75;
Flixel.plugin.tweens.util.Ease.B5 = 2.25 / 2.75;
Flixel.plugin.tweens.util.Ease.B6 = 2.625 / 2.75;

/**
 * Operation o in/out easers:
 * 
 * in(t) return t; out(t) return 1 - in(1 - t); inOut(t) return (t <= .5) ? in(t *
 * 2) / 2 : out(t * 2 - 1) / 2 + .5;
 */
