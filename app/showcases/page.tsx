"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";

interface SceneContainer {
  element: HTMLDivElement;
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  animate: (time: number) => void;
  cleanup: () => void;
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scenesRef = useRef<SceneContainer[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const createDemoScene = (
      title: string,
      description: string,
      sceneSetup: (
        scene: THREE.Scene,
        camera: THREE.Camera,
        renderer: THREE.WebGLRenderer,
        width: number,
        height: number,
      ) => (time: number) => void,
    ) => {
      // Create container section for this demo
      const section = document.createElement("div");
      section.className =
        "w-full h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black";

      // Title and description
      const header = document.createElement("div");
      header.className = "absolute top-8 left-8 z-10 pointer-events-none";
      header.innerHTML = `
        <h2 class="text-3xl font-bold text-white mb-2">${title}</h2>
        <p class="text-gray-300 max-w-md text-sm">${description}</p>
      `;
      section.appendChild(header);

      // Canvas container
      const canvasContainer = document.createElement("div");
      canvasContainer.className = "w-full h-full";
      section.appendChild(canvasContainer);

      containerRef.current?.appendChild(section);

      // THREE.js setup for this demo
      // Scene: The container for all 3D objects, lights, cameras
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);

      // Calculate dimensions for this canvas
      const width = canvasContainer.clientWidth;
      const height = canvasContainer.clientHeight;

      // Camera: Defines the viewing perspective (PerspectiveCamera mimics human eye, OrthographicCamera is flat)
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;

      // Renderer: Draws the scene to a canvas using WebGL
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      canvasContainer.appendChild(renderer.domElement);

      // Create animation loop
      const animateFn = sceneSetup(scene, camera, renderer, width, height);

      // Animation loop: requestAnimationFrame syncs with browser refresh (~60fps)
      const animate = (time: number) => {
        animateFn(time);
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };
      animate(0);

      return {
        element: section,
        scene,
        camera,
        renderer,
        animate: animateFn,
        cleanup: () => {
          renderer.dispose();
          canvasContainer.removeChild(renderer.domElement);
        },
      };
    };

    // ===== DEMO 1: Basic Geometries =====
    scenesRef.current.push(
      createDemoScene(
        "1. Basic Geometries & Materials",
        "Demonstrates fundamental THREE.js geometries (Cube, Sphere, Cone, Torus) with different material types",
        (scene, camera, renderer, width, height) => {
          // BoxGeometry: Creates a cube with specified width, height, depth
          const cubeGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
          // MeshStandardMaterial: Physically-based material with metalness & roughness
          const cubeMat = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            metalness: 0.5,
            roughness: 0.4,
          });
          const cube = new THREE.Mesh(cubeGeo, cubeMat);
          cube.position.x = -4;
          scene.add(cube);

          // SphereGeometry: Creates a sphere with radius and segment count
          const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
          // MeshPhongMaterial: Simulates glossy surfaces with specular highlights
          const sphereMat = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            shininess: 100,
          });
          const sphere = new THREE.Mesh(sphereGeo, sphereMat);
          scene.add(sphere);

          // ConeGeometry: Creates a cone with radius, height, and radial segments
          const coneGeo = new THREE.ConeGeometry(1, 2, 32);
          // MeshLambertMaterial: Non-glossy material for flat appearance
          const coneMat = new THREE.MeshLambertMaterial({ color: 0x0000ff });
          const cone = new THREE.Mesh(coneGeo, coneMat);
          cone.position.x = 4;
          scene.add(cone);

          // TorusGeometry: Creates a donut shape with radius and tube diameter
          const torusGeo = new THREE.TorusGeometry(1.2, 0.4, 16, 100);
          // MeshBasicMaterial: Unlit material that doesn't respond to lights
          const torusMat = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            wireframe: false,
          });
          const torus = new THREE.Mesh(torusGeo, torusMat);
          torus.position.y = 3;
          scene.add(torus);

          // Lighting: AmbientLight provides uniform illumination
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
          scene.add(ambientLight);

          // DirectionalLight: Simulates sunlight, comes from a direction
          const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
          dirLight.position.set(5, 5, 5);
          scene.add(dirLight);

          return (time: number) => {
            cube.rotation.x = time / 1000;
            cube.rotation.y = time / 1500;
            sphere.rotation.y = time / 2000;
            cone.rotation.z = time / 1200;
            torus.rotation.x = time / 2500;
            torus.rotation.y = time / 1800;
          };
        },
      ),
    );

    // ===== DEMO 2: Lighting Types =====
    scenesRef.current.push(
      createDemoScene(
        "2. Advanced Lighting",
        "Showcases Ambient, Directional, Point, and Spot lights with shadows",
        (scene, camera, renderer, width, height) => {
          // Enable shadow map rendering
          renderer.shadowMap.enabled = true;

          // Create ground plane to receive shadows
          const groundGeo = new THREE.PlaneGeometry(20, 20);
          const groundMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
          const ground = new THREE.Mesh(groundGeo, groundMat);
          ground.rotation.x = -Math.PI / 2;
          ground.receiveShadow = true;
          scene.add(ground);

          // Create multiple spheres to show light interaction
          for (let i = 0; i < 5; i++) {
            const geoSphere = new THREE.SphereGeometry(0.8, 32, 32);
            const matSphere = new THREE.MeshStandardMaterial({
              color: new THREE.Color().setHSL(i / 5, 1, 0.5),
              metalness: 0.3,
              roughness: 0.4,
            });
            const meshSphere = new THREE.Mesh(geoSphere, matSphere);
            meshSphere.position.x = -4 + i * 2;
            meshSphere.position.y = 1;
            meshSphere.castShadow = true;
            meshSphere.receiveShadow = true;
            scene.add(meshSphere);
          }

          // AmbientLight: Global illumination, affects all objects equally
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
          scene.add(ambientLight);

          // DirectionalLight: Creates harsh shadows like sunlight
          const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
          dirLight.position.set(5, 10, 5);
          dirLight.castShadow = true;
          dirLight.shadow.mapSize.width = 2048;
          dirLight.shadow.mapSize.height = 2048;
          scene.add(dirLight);

          // PointLight: Radiates in all directions from a position (like a bulb)
          const pointLight = new THREE.PointLight(0x00ff00, 2, 20);
          pointLight.position.set(-5, 5, 0);
          pointLight.castShadow = true;
          scene.add(pointLight);

          // SpotLight: Cone-shaped light with angle and intensity falloff
          const spotLight = new THREE.SpotLight(
            0xff0000,
            2,
            30,
            Math.PI / 4,
            0.5,
            2,
          );
          spotLight.position.set(5, 5, 0);
          spotLight.castShadow = true;
          scene.add(spotLight);

          return (time: number) => {
            // Animate lights
            pointLight.position.x = Math.sin(time / 2000) * 5;
            spotLight.position.z = Math.cos(time / 2000) * 5;
          };
        },
      ),
    );

    // ===== DEMO 3: Textures & Colors =====
    scenesRef.current.push(
      createDemoScene(
        "3. Textures & Canvas-Based Patterns",
        "Demonstrates procedural texture generation using canvas and color manipulation",
        (scene, camera, renderer, width, height) => {
          // Create procedural texture using canvas
          const canvas = document.createElement("canvas");
          canvas.width = 256;
          canvas.height = 256;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Create checkerboard pattern
            for (let x = 0; x < 256; x += 32) {
              for (let y = 0; y < 256; y += 32) {
                const isEven = (x / 32 + y / 32) % 2 === 0;
                ctx.fillStyle = isEven ? "#ffffff" : "#000000";
                ctx.fillRect(x, y, 32, 32);
              }
            }
          }
          // Create THREE.Texture from canvas - textures map 2D images onto 3D objects
          const texture = new THREE.CanvasTexture(canvas);
          texture.magFilter = THREE.NearestFilter; // Pixelated look
          const texMat = new THREE.MeshStandardMaterial({ map: texture });

          // Create textured cube
          const texGeo = new THREE.BoxGeometry(2, 2, 2);
          const texMesh = new THREE.Mesh(texGeo, texMat);
          texMesh.position.x = -3;
          scene.add(texMesh);

          // Create gradient material using canvas
          const gradCanvas = document.createElement("canvas");
          gradCanvas.width = 256;
          gradCanvas.height = 256;
          const gradCtx = gradCanvas.getContext("2d");
          if (gradCtx) {
            const gradient = gradCtx.createLinearGradient(0, 0, 256, 256);
            gradient.addColorStop(0, "#ff0000");
            gradient.addColorStop(0.5, "#00ff00");
            gradient.addColorStop(1, "#0000ff");
            gradCtx.fillStyle = gradient;
            gradCtx.fillRect(0, 0, 256, 256);
          }
          const gradTexture = new THREE.CanvasTexture(gradCanvas);
          const gradMat = new THREE.MeshPhongMaterial({ map: gradTexture });

          // Sphere with gradient texture
          const gradSphereGeo = new THREE.SphereGeometry(1.2, 32, 32);
          const gradSphereMesh = new THREE.Mesh(gradSphereGeo, gradMat);
          scene.add(gradSphereMesh);

          // Create noise-like pattern
          const noiseCanvas = document.createElement("canvas");
          noiseCanvas.width = 256;
          noiseCanvas.height = 256;
          const noiseCtx = noiseCanvas.getContext("2d");
          if (noiseCtx) {
            const imageData = noiseCtx.createImageData(256, 256);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
              const val = Math.random() * 255;
              data[i] = val; // R
              data[i + 1] = val; // G
              data[i + 2] = val; // B
              data[i + 3] = 255; // A
            }
            noiseCtx.putImageData(imageData, 0, 0);
          }
          const noiseTexture = new THREE.CanvasTexture(noiseCanvas);
          const noiseMat = new THREE.MeshStandardMaterial({
            map: noiseTexture,
            metalness: 0.8,
            roughness: 0.2,
          });

          // Cone with noise texture
          const noiseConeGeo = new THREE.ConeGeometry(1, 2, 32);
          const noiseConeMesh = new THREE.Mesh(noiseConeGeo, noiseMat);
          noiseConeMesh.position.x = 3;
          scene.add(noiseConeMesh);

          // Lighting
          const ambLight = new THREE.AmbientLight(0xffffff, 0.7);
          scene.add(ambLight);
          const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
          dirLight.position.set(5, 5, 5);
          scene.add(dirLight);

          return (time: number) => {
            texMesh.rotation.x = time / 2000;
            texMesh.rotation.y = time / 1500;
            gradSphereMesh.rotation.y = time / 1800;
            noiseConeMesh.rotation.z = time / 1200;
          };
        },
      ),
    );

    // ===== DEMO 4: Particle System =====
    scenesRef.current.push(
      createDemoScene(
        "4. Particle System",
        "Shows efficient particle rendering using BufferGeometry and Points",
        (scene, camera, renderer, width, height) => {
          // BufferGeometry: Efficient geometry storage for large vertex counts (particles)
          const particleGeo = new THREE.BufferGeometry();

          // Create 5000 particles with random positions
          const particleCount = 5000;
          const positions = new Float32Array(particleCount * 3);
          const colors = new Float32Array(particleCount * 3);

          for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 20; // X
            positions[i + 1] = (Math.random() - 0.5) * 20; // Y
            positions[i + 2] = (Math.random() - 0.5) * 20; // Z

            colors[i] = Math.random(); // R
            colors[i + 1] = Math.random(); // G
            colors[i + 2] = Math.random(); // B
          }

          // Set position and color attributes on geometry
          particleGeo.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3),
          );
          particleGeo.setAttribute(
            "color",
            new THREE.BufferAttribute(colors, 3),
          );

          // PointsMaterial: Material for rendering vertices as points
          const pointsMat = new THREE.PointsMaterial({
            size: 0.3,
            sizeAttenuation: true,
            vertexColors: true, // Use color attribute for each point
            transparent: true,
            opacity: 0.8,
          });

          // Points: Renders each vertex as a point (more efficient than individual meshes)
          const points = new THREE.Points(particleGeo, pointsMat);
          scene.add(points);

          return (time: number) => {
            // Rotate particle system
            points.rotation.x = time / 5000;
            points.rotation.y = time / 3000;

            // Animate particle positions
            const posArray = particleGeo.attributes.position
              .array as Float32Array;
            for (let i = 0; i < posArray.length; i += 3) {
              posArray[i] += Math.sin(time / 1000 + i) * 0.01;
              posArray[i + 1] += Math.cos(time / 1000 + i) * 0.01;
            }
            particleGeo.attributes.position.needsUpdate = true;
          };
        },
      ),
    );

    // ===== DEMO 5: Wireframe & Groups =====
    scenesRef.current.push(
      createDemoScene(
        "5. Wireframe Rendering & Object Grouping",
        "Demonstrates wireframe materials and hierarchical object organization with Groups",
        (scene, camera, renderer, width, height) => {
          // Group: Container for multiple objects that move together (parent-child hierarchy)
          const group = new THREE.Group();

          // Create wireframe cube
          const wireGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
          const wireMat = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            wireframe: true, // Render only edges
            wireframeLinewidth: 2,
          });
          const wireMesh = new THREE.Mesh(wireGeo, wireMat);
          wireMesh.position.x = -2;
          group.add(wireMesh);

          // Create solid mesh inside wireframe
          const solidGeo = new THREE.SphereGeometry(0.7, 16, 16);
          const solidMat = new THREE.MeshPhongMaterial({ color: 0xff00ff });
          const solidMesh = new THREE.Mesh(solidGeo, solidMat);
          solidMesh.position.x = -2;
          group.add(solidMesh);

          // Create rotating octahedron
          const octaGeo = new THREE.OctahedronGeometry(1.2, 0);
          const octaMat = new THREE.MeshStandardMaterial({
            color: 0xffff00,
            metalness: 0.7,
            roughness: 0.3,
          });
          const octaMesh = new THREE.Mesh(octaGeo, octaMat);
          octaMesh.position.x = 2;
          group.add(octaMesh);

          // Create dodecahedron with wireframe overlay
          const dodecaGeo = new THREE.DodecahedronGeometry(1, 0);
          const dodecaMat = new THREE.MeshStandardMaterial({ color: 0x00ffff });
          const dodecaMesh = new THREE.Mesh(dodecaGeo, dodecaMat);
          dodecaMesh.position.x = 2;
          dodecaMesh.position.y = -2;
          group.add(dodecaMesh);

          scene.add(group);

          // Lighting
          const ambLight = new THREE.AmbientLight(0xffffff, 0.6);
          scene.add(ambLight);
          const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
          dirLight.position.set(5, 5, 5);
          scene.add(dirLight);

          return (time: number) => {
            // Rotate entire group
            group.rotation.y = time / 2000;
            wireMesh.rotation.x = time / 1500;
            octaMesh.rotation.z = time / 1200;
            dodecaMesh.rotation.x = time / 1800;
          };
        },
      ),
    );

    // ===== DEMO 6: Fog =====
    scenesRef.current.push(
      createDemoScene(
        "6. Fog Effects",
        "Shows Linear and Exponential fog for atmospheric depth perception",
        (scene, camera, renderer, width, height) => {
          // Fog: Adds atmospheric effect by fading distant objects
          // LinearFog: Fog density increases linearly with distance
          scene.fog = new THREE.Fog(0x000000, 10, 50);

          // Create many objects to show fog effect
          for (let i = 0; i < 20; i++) {
            const geoVariant = [
              new THREE.BoxGeometry(1, 1, 1),
              new THREE.SphereGeometry(0.7, 16, 16),
              new THREE.ConeGeometry(0.8, 1.5, 16),
            ][i % 3];

            const matVariant = new THREE.MeshStandardMaterial({
              color: new THREE.Color().setHSL(i / 20, 1, 0.5),
              metalness: 0.3,
              roughness: 0.4,
            });

            const mesh = new THREE.Mesh(geoVariant, matVariant);
            mesh.position.x = (Math.random() - 0.5) * 20;
            mesh.position.y = (Math.random() - 0.5) * 10;
            mesh.position.z = Math.random() * -30 - 5; // Spread along Z
            scene.add(mesh);
          }

          // Lighting
          const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
          scene.add(ambLight);
          const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
          dirLight.position.set(5, 5, 5);
          scene.add(dirLight);

          return (time: number) => {
            // Objects move through fog
            scene.children.forEach((child, index) => {
              if (child instanceof THREE.Mesh) {
                child.rotation.x = time / 2000;
                child.rotation.y = time / 1500;
                child.position.z += 0.1;

                // Wrap around when reaching camera
                if (child.position.z > 5) {
                  child.position.z = -50;
                }
              }
            });
          };
        },
      ),
    );

    // ===== DEMO 7: Custom Colors & Hue =====
    scenesRef.current.push(
      createDemoScene(
        "7. Color Manipulation & HSL",
        "Demonstrates dynamic color changes using HSL color space",
        (scene, camera, renderer, width, height) => {
          const meshes: THREE.Mesh[] = [];

          // Create color spectrum using HSL (Hue, Saturation, Lightness)
          for (let i = 0; i < 10; i++) {
            const hue = i / 10; // 0 to 1 maps to 0° to 360°
            const geoColor = new THREE.IcosahedronGeometry(0.8, 4);
            const matColor = new THREE.MeshStandardMaterial({
              // setHSL(hue, saturation, lightness) - easy color generation
              color: new THREE.Color().setHSL(hue, 1, 0.5),
              metalness: 0.4,
              roughness: 0.3,
            });
            const meshColor = new THREE.Mesh(geoColor, matColor);

            // Position in circle
            const angle = (i / 10) * Math.PI * 2;
            meshColor.position.x = Math.cos(angle) * 5;
            meshColor.position.y = Math.sin(angle) * 5;

            meshes.push(meshColor);
            scene.add(meshColor);
          }

          // Central rotating sphere
          const centerGeo = new THREE.SphereGeometry(1, 32, 32);
          const centerMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
          const centerMesh = new THREE.Mesh(centerGeo, centerMat);
          meshes.push(centerMesh);
          scene.add(centerMesh);

          // Lighting
          const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
          scene.add(ambLight);
          const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
          dirLight.position.set(0, 5, 5);
          scene.add(dirLight);

          return (time: number) => {
            meshes.forEach((mesh, index) => {
              if (index < 10) {
                // Orbit around center
                const angle = (index / 10) * Math.PI * 2 + time / 3000;
                mesh.position.x = Math.cos(angle) * 5;
                mesh.position.y = Math.sin(angle) * 5;
              }
              mesh.rotation.x = time / 2000;
              mesh.rotation.y = time / 1500;
            });
          };
        },
      ),
    );

    // ===== DEMO 8: Scale & Transform Animations =====
    scenesRef.current.push(
      createDemoScene(
        "8. Transformations & Scale",
        "Shows position, rotation, and scale transformations",
        (scene, camera, renderer, width, height) => {
          const transformMeshes: THREE.Mesh[] = [];

          // Create objects with different transformation animations
          for (let i = 0; i < 5; i++) {
            const geoTrans = new THREE.BoxGeometry(1, 1, 1);
            const matTrans = new THREE.MeshStandardMaterial({
              color: new THREE.Color().setHSL(i / 5, 0.7, 0.6),
            });
            const meshTrans = new THREE.Mesh(geoTrans, matTrans);
            meshTrans.position.x = -4 + i * 2;
            transformMeshes.push(meshTrans);
            scene.add(meshTrans);
          }

          // Lighting
          const ambLight = new THREE.AmbientLight(0xffffff, 0.6);
          scene.add(ambLight);
          const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
          dirLight.position.set(5, 5, 5);
          scene.add(dirLight);

          return (time: number) => {
            transformMeshes.forEach((mesh, index) => {
              const offset = (index / transformMeshes.length) * Math.PI * 2;

              // Scaling: Grow and shrink
              mesh.scale.x = 1 + Math.sin(time / 1000 + offset) * 0.5;
              mesh.scale.y = 1 + Math.cos(time / 1000 + offset) * 0.5;
              mesh.scale.z = 1 + Math.sin(time / 1200 + offset) * 0.5;

              // Rotation: Spin on multiple axes
              mesh.rotation.x = time / 2000 + offset;
              mesh.rotation.y = time / 1500 + offset;

              // Position: Move up/down
              mesh.position.y = Math.sin(time / 1500 + offset) * 2;
            });
          };
        },
      ),
    );

    // ===== DEMO 9: Instancing & Multiple Materials =====
    scenesRef.current.push(
      createDemoScene(
        "9. Multiple Materials & Mesh Composition",
        "Demonstrates applying different materials to different parts of geometry",
        (scene, camera, renderer, width, height) => {
          // Create compound object with multiple materials
          const group = new THREE.Group();

          // Core sphere with standard material
          const coreGeo = new THREE.SphereGeometry(1, 32, 32);
          const coreMat = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            metalness: 0.8,
            roughness: 0.2,
          });
          const coreMesh = new THREE.Mesh(coreGeo, coreMat);
          group.add(coreMesh);

          // Rotating rings around sphere
          for (let i = 0; i < 3; i++) {
            const ringGeo = new THREE.TorusGeometry(
              1.5 + i * 0.3,
              0.15,
              16,
              100,
            );
            const ringMat = new THREE.MeshStandardMaterial({
              color: new THREE.Color().setHSL(i / 3, 1, 0.5),
              metalness: 0.6,
              roughness: 0.4,
            });
            const ringMesh = new THREE.Mesh(ringGeo, ringMat);

            if (i === 0) ringMesh.rotation.x = Math.PI / 4;
            else if (i === 1) ringMesh.rotation.y = Math.PI / 4;
            else ringMesh.rotation.z = Math.PI / 4;

            group.add(ringMesh);
          }

          scene.add(group);

          // Lighting
          const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
          scene.add(ambLight);
          const pointLight1 = new THREE.PointLight(0x00ff00, 1.5, 20);
          pointLight1.position.set(5, 0, 5);
          scene.add(pointLight1);
          const pointLight2 = new THREE.PointLight(0x0000ff, 1.5, 20);
          pointLight2.position.set(-5, 0, -5);
          scene.add(pointLight2);

          return (time: number) => {
            group.rotation.x = time / 3000;
            group.rotation.y = time / 2000;

            // Animate individual rings
            group.children.forEach((child, index) => {
              if (index > 0 && child instanceof THREE.Mesh) {
                child.rotation.x += 0.002;
                child.rotation.y += 0.003;
              }
            });
          };
        },
      ),
    );

    // ===== DEMO 10: Mouse Raycasting & Interaction =====
    scenesRef.current.push(
      createDemoScene(
        "10. Mouse Interaction & Raycasting",
        "Shows mouse picking using raycasting to detect clicked objects",
        (scene, camera, renderer, width, height) => {
          const interactiveMeshes: THREE.Mesh[] = [];

          // Create clickable objects
          for (let i = 0; i < 8; i++) {
            const geoInteract = new THREE.SphereGeometry(0.8, 16, 16);
            const matInteract = new THREE.MeshStandardMaterial({
              color: new THREE.Color().setHSL(i / 8, 0.8, 0.5),
              metalness: 0.4,
              roughness: 0.3,
            });
            const meshInteract = new THREE.Mesh(geoInteract, matInteract);

            const angle = (i / 8) * Math.PI * 2;
            meshInteract.position.x = Math.cos(angle) * 4;
            meshInteract.position.y = Math.sin(angle) * 4;

            interactiveMeshes.push(meshInteract);
            scene.add(meshInteract);
          }

          // Raycaster: Casts rays and detects intersections with objects
          const raycaster = new THREE.Raycaster();
          const mouse = new THREE.Vector2();

          // Handle mouse clicks
          const onMouseClick = (event: MouseEvent) => {
            const rect = renderer.domElement.getBoundingClientRect();
            // Convert screen coordinates to normalized device coordinates (-1 to 1)
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            // Calculate ray from camera through mouse position
            raycaster.setFromCamera(mouse, camera);

            // Check for intersections with objects
            const intersects = raycaster.intersectObjects(interactiveMeshes);

            if (intersects.length > 0) {
              const hit = intersects[0].object as THREE.Mesh;
              // Scale clicked object
              hit.scale.multiplyScalar(1.2);
            }
          };

          renderer.domElement.addEventListener("click", onMouseClick);

          // Lighting
          const ambLight = new THREE.AmbientLight(0xffffff, 0.6);
          scene.add(ambLight);
          const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
          dirLight.position.set(5, 5, 5);
          scene.add(dirLight);

          return (time: number) => {
            interactiveMeshes.forEach((mesh, index) => {
              mesh.rotation.x = time / 2000;
              mesh.rotation.y = time / 1500;

              // Gradually shrink back to normal after clicking
              mesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.02);
            });
          };
        },
      ),
    );

    // ===== DEMO 11: Advanced Geometries =====
    scenesRef.current.push(
      createDemoScene(
        "11. Advanced Geometries",
        "Shows specialized geometries like Tetrahedron, Icosahedron, and Polyhedra",
        (scene, camera, renderer, width, height) => {
          const geometries = [
            { name: "Tetrahedron", geo: new THREE.TetrahedronGeometry(1.2, 0) },
            { name: "Octahedron", geo: new THREE.OctahedronGeometry(1.2, 0) },
            { name: "Icosahedron", geo: new THREE.IcosahedronGeometry(1.2, 4) },
            {
              name: "Dodecahedron",
              geo: new THREE.DodecahedronGeometry(1.2, 0),
            },
          ];

          const advMeshes: THREE.Mesh[] = [];

          geometries.forEach((geom, index) => {
            const matAdv = new THREE.MeshStandardMaterial({
              color: new THREE.Color().setHSL(
                index / geometries.length,
                1,
                0.5,
              ),
              flatShading: true, // Faceted appearance for polyhedra
              metalness: 0.5,
              roughness: 0.3,
            });
            const meshAdv = new THREE.Mesh(geom.geo, matAdv);

            const angle = (index / geometries.length) * Math.PI * 2;
            meshAdv.position.x = Math.cos(angle) * 4;
            meshAdv.position.y = Math.sin(angle) * 4;

            advMeshes.push(meshAdv);
            scene.add(meshAdv);
          });

          // Lighting (FlatShading benefits from directional light)
          const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
          scene.add(ambLight);
          const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
          dirLight.position.set(10, 10, 10);
          scene.add(dirLight);

          return (time: number) => {
            advMeshes.forEach((mesh, index) => {
              // Orbit center
              const angle =
                (index / advMeshes.length) * Math.PI * 2 + time / 3000;
              mesh.position.x = Math.cos(angle) * 4;
              mesh.position.y = Math.sin(angle) * 4;

              // Rotate on all axes
              mesh.rotation.x = time / 1500 + index;
              mesh.rotation.y = time / 2000 + index;
              mesh.rotation.z = time / 2500 + index;
            });
          };
        },
      ),
    );

    // ===== DEMO 12: Responsive & Shader Colors =====
    scenesRef.current.push(
      createDemoScene(
        "12. Responsive Canvas & Time-Based Colors",
        "Demonstrates canvas responsiveness and animated color transitions",
        (scene, camera, renderer, width, height) => {
          camera.position.z = 6;

          // Create gradient background
          const canvas = document.createElement("canvas");
          canvas.width = 256;
          canvas.height = 256;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 180);
            grad.addColorStop(0, "#ffffff");
            grad.addColorStop(0.5, "#ffff00");
            grad.addColorStop(1, "#ff0000");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 256, 256);
          }
          const gradTexture = new THREE.CanvasTexture(canvas);

          // Create animated central sphere
          const centerGeo = new THREE.SphereGeometry(2, 64, 64);
          const centerMat = new THREE.MeshPhongMaterial({
            map: gradTexture,
            shininess: 100,
          });
          const centerMesh = new THREE.Mesh(centerGeo, centerMat);
          scene.add(centerMesh);

          // Create orbiting elements
          const orbitMeshes: THREE.Mesh[] = [];
          for (let i = 0; i < 6; i++) {
            const orbitGeo = new THREE.IcosahedronGeometry(0.6, 2);
            const orbitMat = new THREE.MeshStandardMaterial({
              color: new THREE.Color().setHSL(i / 6, 0.8, 0.6),
              metalness: 0.7,
              roughness: 0.2,
            });
            const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat);
            orbitMeshes.push(orbitMesh);
            scene.add(orbitMesh);
          }

          // Lighting
          const ambLight = new THREE.AmbientLight(0xffffff, 0.7);
          scene.add(ambLight);
          const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
          dirLight.position.set(10, 10, 10);
          scene.add(dirLight);

          return (time: number) => {
            centerMesh.rotation.x = time / 3000;
            centerMesh.rotation.y = time / 2000;

            orbitMeshes.forEach((mesh, index) => {
              const angle =
                (index / orbitMeshes.length) * Math.PI * 2 + time / 2000;
              const distance = 4 + Math.sin(time / 3000) * 1;
              mesh.position.x = Math.cos(angle) * distance;
              mesh.position.y = Math.sin(angle) * distance;
              mesh.position.z = Math.cos(time / 2500 + index) * 0.5;
              mesh.rotation.x = time / 1500;
              mesh.rotation.y = time / 2000;
            });
          };
        },
      ),
    );

    // Start animation loop
    const animate = (time: number) => {
      scenesRef.current.forEach((scene) => {
        scene.renderer.render(scene.scene, scene.camera);
      });
      requestAnimationFrame(animate);
    };
    animate(0);

    // Cleanup on unmount
    return () => {
      scenesRef.current.forEach((scene) => {
        scene.cleanup();
      });
      scenesRef.current = [];
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-screen bg-black overflow-y-scroll snap-y snap-mandatory"
      style={{ height: "100vh" }}
    >
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black to-transparent p-8 pointer-events-none">
        <h1 className="text-5xl font-bold text-white mb-2">
          Three.js Patterns & Displays
        </h1>
        <p className="text-gray-400 text-lg">
          Scroll down to explore 12 different three.js implementations and
          patterns
        </p>
      </div>
    </div>
  );
}
