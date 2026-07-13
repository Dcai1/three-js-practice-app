"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";

export default function Home() {
  const mountRef = useRef<HTMLDivElement>(null);

  // Three.js setup running after the page renders
  useEffect(() => {
    if (!mountRef.current) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // create a red cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // move the camera back
    camera.position.z = 5;

    const animate = (time: number) => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);

      cube.rotation.x = time / 10000;
      cube.rotation.y = time / 2000;
    };

    animate(1);

    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      <div ref={mountRef} className="absolute inset-0" />
      <main className="relative z-10 flex mx-auto my-auto glass">
        <div className="content-center min-h-screen align-items-center justify-items-center min-w-screen glass">
          <h1 className="flex mx-auto my-auto text-3xl font-bold text-center">
            Hello world!
          </h1>
        </div>
      </main>
    </div>
  );
}
