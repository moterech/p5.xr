import '../jsartoolkit/artoolkit.api.js';
import WebXRPolyfill from 'webxr-polyfill';
import p5vr from './p5xr/p5vr/p5vr.js';
import p5ar from './p5xr/p5ar/p5ar.js';
import ARMarkerTracker from './p5xr/p5ar/ARMarkerTracker.js';
import * as constants from './p5xr/core/constants.js';
import './p5xr/core/raycasting.js';

window.p5xr = {
  instance: null,
};

// attach constants to p5
for (const k in constants) {
  p5.prototype[k] = constants[k];
}

function polyfillIfRequired() {
  if (!('xr' in window.navigator)) {
    window.injectedPolyfill = true;
    window.polyfill = new WebXRPolyfill();
  } else {
    window.injectedPolyfill = false;
  }
}

polyfillIfRequired();

/**
 * starts the process of creating a VR-ready canvas
 * This actually just creates a button that will set into motion
 * the creation of a VR canvas and creates a new p5vr object.
 *  This should be called in `preload()` so
 * that the entire sketch can wait to start until the user has "entered VR"
 * via a button click gesture
 * @method createVRCanvas
 */
p5.prototype.createVRCanvas = function () {
  p5.prototype.noLoop();
  p5xr.instance = new p5vr();
  p5xr.instance.setPInst(this);
  p5xr.instance.initVR();
};
p5.prototype.registerPreloadMethod('createVRCanvas', p5.prototype);

/**
 * starts the process of creating a VR-ready canvas
 * This actually just creates a button that will set into motion
 * the creation of a AR canvas and creates a new p5ar object.
 * This should be called in `preload()` so
 * that the entire sketch can wait to start until the user has "entered AR"
 * via a button click gesture
 * @method createARCanvas
 */
p5.prototype.createARCanvas = function (mode) {
  if (mode === constants.MARKER) {
    p5xr.instance = new ARMarkerTracker();
    p5xr.instance.startMarkerSketch();
  } else if (mode === constants.ARCORE) {
    p5xr.instance = new p5ar();
    p5xr.instance.noLoop();
    p5xr.instance.init();
  } else {
    throw new Error('Cannot start AR without a MODE argument (either MARKER or ARCORE)');
  }
};

/**
 * Sets the clear color for VR-Mode. <br><br>
 * This has to happen separately from calls to background
 * to avoid clearing between drawing the eyes
 * @method setVRBackgroundColor
 * @param  {Number} r red value of background
 * @param  {Number} g green value of background
 * @param  {Number} b blue value of background
 */
p5.prototype.setVRBackgroundColor = function (r, g, b) {
  p5xr.instance.curClearColor = this.color(r, g, b);
};

p5.prototype.detectMarkers = function (cap) {
  if (!p5xr.instance.readyForDetection) { return; }
  if (typeof cap.elt === 'undefined') {
    console.error('Can only use detectMarkers() on p5.MediaElement');
  }
  p5xr.instance.arController.process(cap.elt);
};

p5.prototype.getTrackerMatrix = function (id) {
  return p5xr.instance.getTrackerMatrix(id);
};

p5.prototype.getSmoothTrackerMatrix = function (id) {
  return p5xr.instance.getSmoothTrackerMatrix(id);
};

p5.prototype.showVideoFeed = function (cap) {
  p5xr.instance.push();
  this._renderer.GL.disable(this._renderer.GL.DEPTH_TEST);
  this._renderer.GL.depthMask(false);

  p5xr.instance.texture(cap);
  rect(-width / 2, -height / 2, width, height);

  this._renderer.GL.enable(this._renderer.GL.DEPTH_TEST);
  this._renderer.GL.depthMask(true);
  p5xr.instance.pop();
};

p5.prototype.isMarkerVisible = function (id) {
  return p5xr.instance.isMarkerVisible(id);
};

p5.prototype.getMarkerById = function (id) {
  return p5xr.instance.getMarkerById(id);
};

p5.prototype.addMarker = function (patt, callback) {
  return p5xr.instance.addMarker(patt, callback);
};

p5.prototype.surroundTexture = function () {
  push();
  texture(tex);
  scale(-1, 1, 1);
  sphere(300, 60, 40);
  pop();
};

p5.prototype.createAnchor = function () {
  if (p5xr.instance.isVR) {
    return;
  }
  return p5xr.instance.createAnchor();
};
