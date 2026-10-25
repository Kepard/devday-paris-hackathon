import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import './PhoneMockup.css';

const SCREEN = { width: 393, height: 852, physicalWidth: 66.5, physicalHeight: 144.6, z: 4.045 };
const CAMERA_Z = 340;
const CAMERA_FOV = 28;
const radians = THREE.MathUtils.degToRad;
const clamp = THREE.MathUtils.clamp;

function disposeModel(model) {
  if (!model) return;
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  model.traverse(object => {
    if (!object.isMesh) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (!material) continue;
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  geometries.forEach(geometry => geometry.dispose());
  materials.forEach(material => material.dispose());
  textures.forEach(texture => texture.dispose());
}

/**
 * Live 393 × 852 HTML inside the film's physically modelled iPhone 17.
 * The CSS and WebGL renderers share one camera and matching transforms.
 * Children stay ordinary DOM: buttons, keyboard focus and swipe gestures work.
 */
export default function PhoneMockup({ children, className = '', interactive = true, immersive = false }) {
  const stageRef = useRef(null);
  const fallbackScreenRef = useRef(null);
  const [screenElement, setScreenElement] = useState(null);
  const [rendererState, setRendererState] = useState('loading');

  useEffect(() => {
    const element = document.createElement('div');
    element.className = 'phone-mockup__screen';
    element.dataset.phoneScreen = '';
    setScreenElement(element);
    return () => element.remove();
  }, []);

  useEffect(() => {
    if (!screenElement) return;
    screenElement.inert = !interactive;
    screenElement.style.pointerEvents = interactive ? 'auto' : 'none';
  }, [interactive, screenElement]);

  useEffect(() => {
    const stage = stageRef.current;
    const fallbackScreen = fallbackScreenRef.current;
    if (!stage || !fallbackScreen || !screenElement) return undefined;

    let disposed = false;
    let unavailable = false;
    let ready = false;
    let visible = true;
    let pressed = false;
    let focused = false;
    let model;
    let renderer;
    let environment;
    let frame = 0;
    let lastTime = 0;
    let width = 0;
    let height = 0;
    const pointer = { x: 0, y: 0 };
    const cameraZ = immersive ? 310 : CAMERA_Z;
    const pose = { x: radians(immersive ? .5 : 1.8), y: radians(immersive ? -1 : -4), z: radians(immersive ? 0 : -.6), lift: 0 };
    const readingPose = { ...pose };
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

    screenElement.style.transform = '';
    fallbackScreen.appendChild(screenElement);
    setRendererState('loading');

    const scene = new THREE.Scene();
    const domScene = new THREE.Scene();
    const pivot = new THREE.Group();
    const domPivot = new THREE.Group();
    scene.add(pivot);
    domScene.add(domPivot);
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 0.5, 20, 1000);
    camera.position.z = cameraZ;

    const cssRenderer = new CSS3DRenderer();
    cssRenderer.domElement.className = 'phone-mockup__dom-layer';
    cssRenderer.domElement.style.pointerEvents = 'none';
    cssRenderer.domElement.style.overflow = 'visible';
    stage.appendChild(cssRenderer.domElement);
    const screenObject = new CSS3DObject(screenElement);
    screenElement.style.pointerEvents = screenElement.inert ? 'none' : 'auto';
    screenObject.position.z = SCREEN.z;
    screenObject.scale.set(SCREEN.physicalWidth / SCREEN.width, SCREEN.physicalHeight / SCREEN.height, 1);
    domPivot.add(screenObject);

    function restoreFallback() {
      unavailable = true;
      ready = false;
      cancelAnimationFrame(frame);
      frame = 0;
      screenElement.style.transform = '';
      fallbackScreen.appendChild(screenElement);
      cssRenderer.domElement.style.visibility = 'hidden';
      if (renderer) renderer.domElement.style.visibility = 'hidden';
      if (!disposed) setRendererState('fallback');
    }

    function renderNow(time = performance.now()) {
      if (disposed || !ready || !renderer || !visible || document.hidden) return;
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 1 / 30;
      lastTime = time;
      const rect = stage.getBoundingClientRect();
      const scroll = clamp((window.innerHeight * 0.5 - rect.top - rect.height * 0.5) / window.innerHeight, -1, 1);
      const isReading = pressed || focused;
      const still = reducedMotion.matches;
      const target = still || (immersive && isReading) ? { x: 0, y: 0, z: 0, lift: 0 } : immersive ? { x: radians(.4 - pointer.y * .25), y: radians(-.6 + pointer.x * .4), z: 0, lift: 0 } : isReading ? readingPose : {
        x: radians(1.8 + scroll * 1.6 - pointer.y * 1.1),
        y: radians(-4 + pointer.x * 2.8),
        z: radians(-0.6 + scroll * 0.4),
        lift: Math.sin(time * 0.00065) * 0.35,
      };
      const smoothing = still ? 1 : 1 - Math.exp(-delta * 7.5);
      for (const key of ['x', 'y', 'z', 'lift']) pose[key] += (target[key] - pose[key]) * smoothing;
      pivot.rotation.set(pose.x, pose.y, pose.z, 'XYZ');
      pivot.position.y = pose.lift;
      domPivot.rotation.copy(pivot.rotation);
      domPivot.position.copy(pivot.position);
      renderer.render(scene, camera);
      cssRenderer.render(domScene, camera);
    }

    function tick(time) {
      frame = 0;
      if (disposed || !ready || !visible || document.hidden) return;
      // Quiet device movement only needs 30fps; the actual app remains native DOM.
      if (!lastTime || time - lastTime >= 1000 / 30 - 1 || reducedMotion.matches) renderNow(time);
      if (!reducedMotion.matches) frame = requestAnimationFrame(tick);
    }

    function requestRender() {
      if (!frame && ready && visible && !document.hidden && !disposed) frame = requestAnimationFrame(tick);
    }

    function resize() {
      const rect = stage.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      cssRenderer.setSize(width, height);
      if (renderer) renderer.setSize(width, height, false);
      const scale = height / (2 * Math.tan(radians(CAMERA_FOV * 0.5))) / (cameraZ - SCREEN.z) * SCREEN.physicalWidth / SCREEN.width;
      stage.style.setProperty('--phone-fallback-scale', String(scale));
      requestRender();
    }

    function onPointerMove(event) {
      if (!canHover.matches || reducedMotion.matches || pressed) return;
      const rect = stage.getBoundingClientRect();
      pointer.x = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
      pointer.y = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
      requestRender();
    }
    function onPointerLeave() { pointer.x = 0; pointer.y = 0; requestRender(); }
    function onPointerDown() { Object.assign(readingPose, pose); pressed = true; requestRender(); }
    function onPointerUp() { pressed = false; requestRender(); }
    function onFocusIn() { if (!pressed) Object.assign(readingPose, pose); focused = true; requestRender(); }
    function onFocusOut() {
      requestAnimationFrame(() => {
        if (disposed) return;
        focused = screenElement.contains(document.activeElement);
        requestRender();
      });
    }
    function onVisibilityChange() {
      lastTime = 0;
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else requestRender();
    }
    function onMotionChange() { lastTime = 0; requestRender(); }
    function onContextLost(event) { event.preventDefault(); restoreFallback(); }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    const intersectionObserver = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      lastTime = 0;
      if (!visible) { cancelAnimationFrame(frame); frame = 0; }
      else requestRender();
    }, { rootMargin: '100px' });
    intersectionObserver.observe(stage);
    stage.addEventListener('pointermove', onPointerMove, { passive: true });
    stage.addEventListener('pointerleave', onPointerLeave, { passive: true });
    stage.addEventListener('pointerdown', onPointerDown, { passive: true, capture: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });
    window.addEventListener('blur', onPointerUp);
    screenElement.addEventListener('focusin', onFocusIn);
    screenElement.addEventListener('focusout', onFocusOut);
    document.addEventListener('visibilitychange', onVisibilityChange);
    reducedMotion.addEventListener('change', onMotionChange);
    resize();

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      renderer.setClearColor(0xffffff, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      renderer.domElement.className = 'phone-mockup__gl-layer';
      renderer.domElement.setAttribute('aria-hidden', 'true');
      renderer.domElement.addEventListener('webglcontextlost', onContextLost);
      stage.appendChild(renderer.domElement);

      const pmrem = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      environment = pmrem.fromScene(room, 0.035);
      scene.environment = environment.texture;
      scene.environmentIntensity = 0.65;
      room.dispose();
      pmrem.dispose();
      const key = new THREE.DirectionalLight(0xffffff, 4.2);
      key.position.set(-200, 250, 400);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xcce7ff, 1.3);
      fill.position.set(300, 100, 240);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xffffff, 2.4);
      rim.position.set(-150, -80, -250);
      scene.add(rim);

      new GLTFLoader().load('/assets/iphone17.glb', gltf => {
        if (disposed || unavailable) { disposeModel(gltf.scene); return; }
        model = gltf.scene;
        model.scale.setScalar(1000);
        const display = model.getObjectByName('DisplayScreen');
        if (display) display.visible = false;
        pivot.add(model);
        model.traverse(object => {
          if (object.isMesh && object.material && !Array.isArray(object.material)) object.material.envMapIntensity = 1;
        });
        ready = true;
        cssRenderer.domElement.style.visibility = 'visible';
        renderNow();
        setRendererState('webgl');
        requestRender();
      }, undefined, restoreFallback);
    } catch {
      restoreFallback();
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerleave', onPointerLeave);
      stage.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('blur', onPointerUp);
      screenElement.removeEventListener('focusin', onFocusIn);
      screenElement.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMotion.removeEventListener('change', onMotionChange);
      screenElement.style.transform = '';
      fallbackScreen.appendChild(screenElement);
      cssRenderer.domElement.remove();
      if (renderer) {
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
        renderer.dispose();
        renderer.domElement.remove();
      }
      environment?.dispose();
      disposeModel(model);
    };
  }, [screenElement, immersive]);

  return (
    <div ref={stageRef} className={`phone-mockup ${className}`} data-renderer={rendererState} data-immersive={immersive || undefined}>
      <div className="phone-mockup__shadow" aria-hidden="true" />
      <div className="phone-mockup__fallback">
        <div ref={fallbackScreenRef} className="phone-mockup__fallback-screen" />
      </div>
      {screenElement && createPortal(children, screenElement)}
    </div>
  );
}
