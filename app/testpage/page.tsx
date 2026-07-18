"use client";
import * as THREE from "three";
import { useEffect, useRef } from "react";

export default function TestPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // blue cube spinning
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    const animate = (time: number) => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);

      // rotate the cube
      cube.rotation.x = time / 10000;
      cube.rotation.y = time / 2000;
    };

    animate(1);

    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <main className="">
      <div
        ref={containerRef}
        className="flex flex-col justify-between w-full min-h-screen text-center glass"
      >
        <h1 className="pt-2 text-3xl">A Placeholder Title</h1>
        <h3 className="mb-4 text-lg">A Placeholder Caption</h3>
      </div>
    </main>
  );
}
