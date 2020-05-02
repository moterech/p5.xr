import p5xr from '../core/p5xr';

/**
 * p5vr class holds all state and methods that are specific to VR
 * @class
 *
 * @constructor
 *
 */

export default class p5vr extends p5xr {
  initVR() {
    this.init();
  }

  /**
   * This is where the actual p5 canvas is first created, and
   * the GL rendering context is accessed by p5vr. 
   * The current XRSession also gets a frame of reference and
   * base rendering layer. <br>
   * @param {XRSession}
   */
  startSketch(session) {
    this.xrSession = this.xrButton.session = session;
    this.xrSession.addEventListener('end', this.onSessionEnded.bind(this));
    if (typeof this.context.setup === 'function') {
      this.context.setup();
    }
    this.onRequestSession();
  }

  /**
   * `device.requestSession()` must be called within a user gesture event.
   * @param {XRDevice}
   */
  onXRButtonClicked(device) {
    console.log('requesting session with mode: immersive-vr');
    navigator.xr.requestSession('immersive-vr').then(this.startSketch.bind(this));
  }

  onRequestSession() {
    this.xrButton.setTitle(this.isVR ? 'EXIT VR' : 'EXIT AR');
    this.pInst._renderer._curCamera.cameraType = 'custom';
    this.gl = this.pInst.canvas.getContext('webgl', {
      xrCompatible: true
    });
    this.gl.makeXRCompatible().then(() => {
      // Use the p5's WebGL context to create a XRWebGLLayer and set it as the
      // sessions baseLayer. This allows any content rendered to the layer to
      // be displayed on the XRDevice;
      this.xrSession.updateRenderState({ baseLayer: new XRWebGLLayer(this.xrSession, this.gl) });

    });
    // Get a frame of reference, which is required for querying poses. In
    // this case an 'local' frame of reference means that all poses will
    // be relative to the location where the XRDevice was first detected.
    this.xrSession.requestReferenceSpace('local').
      then((refSpace) => {
        this.xrRefSpace = refSpace;
        // Inform the session that we're ready to begin drawing.
        this.xrSession.requestAnimationFrame(this.onXRFrame.bind(this));
      });
  }

  /**
   * clears the background based on the current clear color (`curClearColor`)
   */
  _clearVR() {
    if (this.curClearColor === null) {
      return;
    }
    this.pInst.background(this.curClearColor);
  }
}
