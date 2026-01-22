import { Point as FacePoint } from "face-api.js";
import { animate, motionValue } from "motion/react";
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
import { cameraState } from "~/state/camera-state";
import { faceStore } from "~/state/face-state";

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
uniform vec3 uColor;

uniform sampler2D uCamera;
uniform vec4 uCameraBounds;
uniform float uCameraOpacity;

uniform sampler2D uPlaceholder;
uniform vec4 uPlaceholderBounds;
uniform float uPlaceholderOpacity;

uniform vec2 uRes;
uniform float uFaded;
varying vec2 vUv;
void main() {
  vec2 camUv = vec2(vUv.x * uRes.x, vUv.y * uRes.y);
  camUv -= uCameraBounds.xy;
  camUv /= uCameraBounds.zw;
  camUv.x = 1.0 - camUv.x;

  vec2 placeholderUv = vec2(vUv.x * uRes.x, vUv.y * uRes.y);
  placeholderUv -= uPlaceholderBounds.xy;
  placeholderUv /= uPlaceholderBounds.zw;

  vec3 cam = texture2D(uCamera, camUv).rgb;
  vec3 placeholder = texture2D(uPlaceholder, placeholderUv).rgb;

  cam = mix(mix(vec3(0.5), placeholder, uPlaceholderOpacity), cam, uCameraOpacity);

  float brightness = (cam.r + cam.g + cam.b) / 3.0;
  vec3 faded = mix(vec3(0.871,0.875,1.0), vec3(0.957,0.961,1.0), brightness);
  // vec3 fx  = 0.5 + 0.3 * cos(vec3(vUv.x, vUv.y, vUv.x) + uTime) + uColor;
  
  gl_FragColor = vec4(mix(cam, faded, uFaded), 1.0);
  // gl_FragColor = vec4(placeholder, 1.0);
}
`;

export class MirrorCanvas {
  renderer = new Renderer({
    dpr: Math.min(2, window.devicePixelRatio || 1),
    alpha: true,
  });
  gl = this.renderer.gl;
  scene = new Transform();

  size = new Vec2(0, 0);

  cameraBounds = new Vec4(0, 0, 0, 0);
  cameraSize = new Vec2(0, 0);
  cameraTexture = new Texture(this.gl, {
    generateMipmaps: false,
    flipY: true,
  });
  cameraVideo?: HTMLVideoElement;

  placeholderBounds = new Vec4(0, 0, 0, 0);
  placeholderSize = new Vec2(0, 0);
  placeholderTexture = new Texture(this.gl, {
    generateMipmaps: false,
    flipY: true,
  });
  placeholderVideo = document.createElement("video");

  time = 0;
  raf = 0;

  abortController = new AbortController();

  overlayCanvas = document.createElement("canvas");
  overlayCtx = this.overlayCanvas.getContext("2d")!;

  uniforms = {
    uTime: { value: 0 },
    uColor: { value: new Color(0.902, 0.902, 1.0) },
    uRes: { value: this.size },
    uCameraOpacity: { value: 0.0 },
    uPlaceholderOpacity: { value: 0.0 },
    uFaded: { value: 0.0 },
    uCameraBounds: { value: this.cameraBounds },
    uPlaceholderBounds: { value: this.placeholderBounds },
    uCamera: { value: this.cameraTexture },
    uPlaceholder: { value: this.placeholderTexture },
  };

  anims = {
    cameraOpacity: motionValue(0),
    canvasBlur: motionValue(0),
    canvasBackground: motionValue(1),
    circlePresence: motionValue(0),
    circlePresenceSpring: motionValue(0),
    guideVisibility: motionValue(0),
    guideSetup: motionValue(1),
  };

  constructor(public container: HTMLElement) {
    container.appendChild(this.gl.canvas);
    this.gl.canvas.style.position = "absolute";
    container.appendChild(this.overlayCanvas);
    this.overlayCanvas.style.position = "absolute";
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

    this.anims.canvasBlur.on("change", (latest) => {
      this.gl.canvas.style.willChange = "filter";
      this.gl.canvas.style.filter = `blur(${latest}px)`;
    });
    this.anims.canvasBlur.set(20);

    this.setupPlaceholderVideo();

    this.onDispose(() => {
      cancelAnimationFrame(this.raf);
      this.gl.canvas.remove();
      ro.disconnect();
    });

    window.addEventListener("pointerdown", (e) => {
      this.placeholderVideo.play().catch(() => {});
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
    if (this.cameraTexture.image) {
      this.cameraTexture.needsUpdate = true;
    } else {
      this.placeholderTexture.needsUpdate = true;
    }

    this.updateBounds(this.cameraSize, this.cameraBounds, true);
    this.updateBounds(this.placeholderSize, this.placeholderBounds);

    this.renderer.render({ scene: this.scene });

    this.drawOverlay();
    // this.drawDebug();
  }

  private frame = (t: number) => {
    this.uniforms.uCameraOpacity.value = this.anims.cameraOpacity.get();
    this.uniforms.uFaded.value = this.anims.canvasBackground.get();

    this.time = t;
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

  setupPlaceholderVideo() {
    const video = this.placeholderVideo;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    Object.assign(video.style, {
      position: "absolute",
      top: "0",
    });

    const texture = this.placeholderTexture;

    video.addEventListener("loadedmetadata", () => {
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

      this.placeholderSize.set(video.videoWidth, video.videoHeight);
      this.updateBounds(this.placeholderSize, this.placeholderBounds);

      animate(
        this.uniforms.uPlaceholderOpacity,
        { value: 1 },
        {
          duration: 1,
          ease: "easeInOut",
        },
      );

      // this.uniforms.uPlaceholderAspect.value =
      //   video.videoWidth / video.videoHeight;
    });

    video.src = "/background.mp4";
    video.play().catch(() => {});
  }

  async setCameraVideo(video: HTMLVideoElement) {
    // Optional: keep it visible for debugging
    Object.assign(video.style, {
      position: "absolute",
      top: "0",
      right: "0",
      width: "200px",
    });
    // document.body.appendChild(video);
    const texture = this.cameraTexture;

    this.cameraVideo = video;
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

    animate(this.anims.cameraOpacity, 1, {
      duration: 1,
      ease: "easeInOut",
    });

    // Fade in camera
    // animate(
    //   this.uniforms.uCameraOpacity,
    //   {
    //     value: 1,
    //   },
    //   {
    //     duration: 1,
    //     ease: "easeInOut",
    //   }
    // );
    // animate(
    //   this.gl.canvas,
    //   {
    //     filter: 'blur(0px)'
    //   },
    //   {
    //     duration: 1,
    //     ease: "easeInOut",
    //   }
    // );
  }

  setBackgroundMode(enabled: boolean) {
    animate(this.anims.canvasBackground, enabled ? 1 : 0, {
      duration: 2,
      delay: 0.5,
      ease: "easeInOut",
      restDelta: 0.001,
    });

    animate(this.anims.canvasBlur, enabled ? 10 : 0.001, {
      duration: 2,
      delay: 0.5,
      ease: "easeInOut",
      restDelta: 0.001,
    });
  }

  setFailed() {
    animate(this.anims.canvasBackground, 1, {
      duration: 0.5,
      delay: 0,
      ease: "easeInOut",
      restDelta: 0.001,
    });
    animate(this.anims.canvasBlur, 10, {
      duration: 0.5,
      delay: 0,
      ease: "easeInOut",
      restDelta: 0.001,
    });
    animate(this.anims.guideVisibility, 0, {
      duration: 0.5,
      delay: 0.8,
      ease: "easeInOut",
      restDelta: 0.001,
    });
  }

  setGuideVisibility(visible: boolean) {
    animate(this.anims.guideVisibility, visible ? 1 : 0, {
      duration: 1,
      delay: 0.8,
      ease: "easeInOut",
      restDelta: 0.001,
    });
  }

  setChallengeStarted(started: boolean) {
    animate(this.anims.guideSetup, started ? 0 : 1, {
      duration: 1,
      ease: "easeInOut",
      restDelta: 0.001,
    });
  }

  setChallengeComplete() {
    animate(this.anims.guideSetup, 0, {
      duration: 1,
      ease: "easeInOut",
      restDelta: 0.001,
    });
    animate(this.anims.cameraOpacity, 0, {
      duration: 1,
      ease: "easeInOut",
      restDelta: 0.001,
    });
    animate(this.anims.canvasBackground, 0, {
      duration: 1,
      ease: "easeInOut",
      restDelta: 0.001,
    });
  }

  updateBounds(size: Vec2, bounds: Vec4, isFace?: boolean) {
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

    // Update the face camera bounds, to the rect from the camera that is within the bounds
    if (isFace) {
      faceStore.cameraBounds.x = (0 - bounds.x) * (size.x / bounds.z);
      faceStore.cameraBounds.y = (0 - bounds.y) * (size.y / bounds.w);
      faceStore.cameraBounds.w = viewport.x * (size.x / bounds.z);
      faceStore.cameraBounds.h = viewport.y * (size.y / bounds.w);
    }
  }

  resize() {
    this.renderer.setSize(this.size.x, this.size.y);
    this.overlayCanvas.width = this.size.x;
    this.overlayCanvas.height = this.size.y;
    this.draw();
  }

  drawOverlay() {
    const ctx = this.overlayCtx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (!cameraState.mediaStream) {
      return;
    }

    const opacity = this.anims.guideVisibility.get();

    ctx.save();
    ctx.globalAlpha = opacity;

    const faceCircleSize = faceStore.faceBoxSize;

    // ctx.strokeStyle = "red";
    // ctx.lineWidth = 4;
    // ctx.strokeRect(
    //   this.size.x / 2 - faceCircleSize.width / 2,
    //   this.size.y / 2 - faceCircleSize.height / 2,
    //   faceCircleSize.width,
    //   faceCircleSize.height
    // );

    const pitch = faceStore.facing.pitch.get();
    const yaw = -faceStore.facing.yaw.get();

    const faceAngle = Math.atan2(pitch, yaw);
    const faceDistance = Math.hypot(pitch, yaw);

    const numPills = 200;
    const rx = faceCircleSize.width / 2;
    const ry = faceCircleSize.height / 2;
    const circumference =
      Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
    ctx.fillStyle = "rgba(255,0,0,0.5)";
    for (let i = 0; i < numPills; i++) {
      const angle = (i / numPills) * Math.PI * 2;
      const x = Math.cos(angle) * rx + this.size.x / 2;
      const y = Math.sin(angle) * ry + this.size.y / 2;

      const errorAmount = Math.max(
        0,
        1 -
          Math.hypot(
            Math.sin(angle + Math.PI) - Math.sin(faceAngle) * faceDistance,
            Math.cos(angle + Math.PI) - Math.cos(faceAngle) * faceDistance,
          ),
      );

      // const offset =
      //   Math.sin((i / numPills) * Math.PI * 4 + (this.time / 1000) * 2) * 10;
      const offset = 0;
      const length = errorAmount * 20;
      ctx.lineWidth = (circumference / numPills) * 0.5;
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(255,255,255,1)";
      ctx.globalAlpha = opacity * errorAmount;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * offset, y + Math.sin(angle) * offset);
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      ctx.stroke();
    }

    ctx.globalAlpha = opacity * this.anims.guideSetup.get();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(
      this.size.x / 2,
      this.size.y / 2,
      faceCircleSize.width / 2,
      faceCircleSize.height / 2,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    ctx.restore();
  }

  drawDebug() {
    const parts = faceStore.faceParts;
    const ctx = this.overlayCtx;

    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 1.0;

    ctx.save();

    // Accomodate for the bounds of the camera
    ctx.translate(this.cameraBounds.x, this.cameraBounds.y);
    ctx.scale(
      this.cameraBounds.z / this.cameraSize.x,
      this.cameraBounds.w / this.cameraSize.y,
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
      const points = parts[part as keyof typeof parts];
      if (points) {
        drawPath(points);
      }
    }

    ctx.beginPath();
    const nose = faceStore.faceParts?.nose?.[3];
    if (nose) {
      ctx.arc(nose.x, nose.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "yellow";
      ctx.fill();
    }

    if (faceStore.hasFace) {
      ctx.beginPath();
      const centerX = faceStore.facing.posX.get() * this.cameraSize.x;
      const centerY = faceStore.facing.posY.get() * this.cameraSize.y;
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "red";
      ctx.fill();

      ctx.beginPath();
      const yaw = faceStore.facing.yaw.get();
      const pitch = faceStore.facing.pitch.get();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX - yaw * 100, centerY - pitch * 100);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
      ctx.strokeStyle = "blue";
      ctx.stroke();
      // console.log(this.cameraSize.x / 0.5, this.cameraSize.y / 0.5);
    }

    ctx.restore();
  }

  async captureImage(): Promise<HTMLImageElement | void> {
    if (!this.cameraVideo) return;

    const canvas = document.createElement("canvas");
    canvas.width = this.cameraSize.x;
    canvas.height = this.cameraSize.y;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(this.cameraVideo, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.src = canvas.toDataURL("image/png");
    });
  }
}
