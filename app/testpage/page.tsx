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

    const animate = (time: number) => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);

      // rotate the cube
      cube.rotation.x = time / 10000;
      cube.rotation.y = time / 2000;
    };

    animate(0);
  }, []);

  return (
    <main>
      <div className="flex flex-col w-full min-h-screen glass">
        <h1 className="text-3xl">A Placeholder Title</h1>
      </div>
    </main>
  );
}
