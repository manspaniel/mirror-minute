import { animate, springValue, transformValue } from "motion/react";
import {
  Color,
  Mesh,
  Program,
  Renderer,
  Texture,
  Transform,
  Triangle,
  Vec2,
  Vec4,
} from "ogl";
import {
  detectSingleFace,
  Point as FacePoint,
  loadFaceDetectionModel,
  loadFaceLandmarkModel,
  loadFaceLandmarkTinyModel,
  loadTinyFaceDetectorModel,
} from "face-api.js";

const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec3  uColor;
uniform sampler2D uCamera;
uniform vec2 uRes;
uniform vec4 uCameraBounds;
uniform float uCameraOpacity;
varying vec2 vUv;
void main() {
  vec2 camUv = vec2(vUv.x * uRes.x, vUv.y * uRes.y);
  camUv -= uCameraBounds.xy;
  camUv /= uCameraBounds.zw;

  vec3 cam = texture2D(uCamera, camUv).rgb * uCameraOpacity;
  vec3 fx  = 0.5 + 0.3 * cos(vec3(vUv.x, vUv.y, vUv.x) + uTime) + uColor;
  gl_FragColor = vec4(cam + fx * 0.3, 1.0);
}
`;

export class MirrorCanvas {
  renderer = new Renderer({ dpr: Math.min(2, window.devicePixelRatio || 1) });
  gl = this.renderer.gl;
  scene = new Transform();

  size = new Vec2(0, 0);

  cameraBounds = new Vec4(0, 0, 0, 0);
  cameraSize = new Vec2(0, 0);
  cameraTexture = new Texture(this.gl, {
    generateMipmaps: false,
    flipY: true,
  });

  time = 0;
  raf = 0;

  abortController = new AbortController();

  debugCanvas = document.createElement("canvas");
  debugCtx = this.debugCanvas.getContext("2d")!;

  uniforms = {
    uTime: { value: 0 },
    uColor: { value: new Color(0.3, 0.2, 0.5) },
    uRes: { value: this.size },
    uCameraOpacity: { value: 0.0 },
    uCameraBounds: { value: this.cameraBounds },
    uCamera: { value: this.cameraTexture },
  };

  constructor(public container: HTMLElement) {
    container.appendChild(this.gl.canvas);
    this.gl.canvas.style.position = "absolute";
    container.appendChild(this.debugCanvas);
    this.debugCanvas.style.position = "absolute";
    window.addEventListener("resize", () => this.resize());
    this.frame(0);

    const { width, height } = container.getBoundingClientRect();
    this.size.set(width, height);

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      this.size.set(width, height);
      this.resize();
    });
    ro.observe(container);
    this.resize();

    this.initScene();

    this.onDispose(() => {
      cancelAnimationFrame(this.raf);
      this.gl.canvas.remove();
      ro.disconnect();
    });
  }

  private initScene() {
    const geometry = new Triangle(this.gl);
    const program = new Program(this.gl, {
      vertex,
      fragment,
      uniforms: this.uniforms,
    });
    const mesh = new Mesh(this.gl, { geometry: geometry, program: program });

    this.scene.addChild(mesh);
  }

  onDispose(func: () => void) {
    this.abortController.signal.addEventListener("abort", func);
  }

  private draw() {
    // If a <video> has been set as `image`, this uploads the current frame.
    if (this.cameraTexture.image) this.cameraTexture.needsUpdate = true;

    this.updateBounds(this.cameraSize, this.cameraBounds);

    this.renderer.render({ scene: this.scene });
  }

  private frame = (t: number) => {
    this.draw();
    this.raf = requestAnimationFrame(this.frame);
  };

  dispose() {
    this.abortController.abort();
  }

  clearCameraVideo() {
    this.cameraTexture.image = undefined;
    this.cameraTexture.needsUpdate = true;
    this.cameraSize.set(0, 0);
    this.cameraBounds.set(0, 0, 0, 0);

    this.uniforms.uCameraOpacity.value = 0;

    // animate(
    //   this.shader!.uniforms.uCameraOpacity as { value: number },
    //   {
    //     value: 0,
    //   },
    //   {
    //     duration: 2,
    //   }
    // );
  }

  async setCameraVideo(video: HTMLVideoElement) {
    // Optional: keep it visible for debugging
    Object.assign(video.style, {
      position: "absolute",
      top: "0",
      right: "0",
      width: "200px",
    });
    document.body.appendChild(video);
    const texture = this.cameraTexture;

    texture.image = video;
    texture.needsUpdate = true;
    texture.width = video.videoWidth;
    texture.height = video.videoHeight;
    this.cameraSize.set(video.videoWidth, video.videoHeight);

    const gl = this.gl;
    texture.minFilter = gl.LINEAR;
    texture.magFilter = gl.LINEAR;
    texture.wrapS = gl.CLAMP_TO_EDGE;
    texture.wrapT = gl.CLAMP_TO_EDGE;

    // Fade in camera
    animate(
      this.uniforms.uCameraOpacity,
      {
        value: 1,
      },
      {
        duration: 1,
        ease: "easeInOut",
      }
    );
  }

  updateBounds(size: Vec2, bounds: Vec4) {
    const viewport = this.size;
    const viewportAspect = viewport.x / viewport.y;
    const aspect = size.x / size.y;
    let targetWidth = 0;
    let targetHeight = 0;
    if (viewportAspect > aspect) {
      targetWidth = viewport.x;
      targetHeight = viewport.x / aspect;
    } else {
      targetHeight = viewport.y;
      targetWidth = viewport.y * aspect;
    }
    bounds.x = viewport.x / 2 - targetWidth / 2;
    bounds.y = viewport.y / 2 - targetHeight / 2;
    bounds.z = targetWidth;
    bounds.w = targetHeight;
  }

  resize() {
    this.renderer.setSize(this.size.x, this.size.y);
    this.debugCanvas.width = this.size.x;
    this.debugCanvas.height = this.size.y;
    this.draw();
  }

  drawDebugFaceParts(parts: Record<string, FacePoint[] | undefined>) {
    const ctx = this.debugCtx;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();

    // Accomodate for the bounds of the camera
    ctx.translate(this.cameraBounds.x, this.cameraBounds.y);
    ctx.scale(
      this.cameraBounds.z / this.cameraSize.x,
      this.cameraBounds.w / this.cameraSize.y
    );

    function drawPath(path: FacePoint[]) {
      ctx.beginPath();
      for (const p of path) {
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    for (const part in parts) {
      const points = parts[part];
      if (points) {
        drawPath(points);
      }
    }

    ctx.restore();
  }
}
