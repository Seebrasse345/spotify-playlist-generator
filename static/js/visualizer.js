let scene, camera, renderer, sphere, light;
let analyser, dataArray;
const particleCount = 2000;
let particles;

function initVisualizer() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('background-animation').appendChild(renderer.domElement);

    // Create sphere
    const geometry = new THREE.SphereGeometry(10, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: 0x0077be,
        wireframe: true,
        emissive: 0x0077be,
        emissiveIntensity: 0.5,
        shininess: 100
    });
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Add particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
        particlePositions[i] = (Math.random() - 0.5) * 50;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Add light
    light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);

    // Set up audio analyzer (mock data for now)
    analyser = {
        getAverageFrequency: () => Math.random() * 128
    };
    dataArray = new Uint8Array(128);

    window.addEventListener('resize', onWindowResize, false);
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate sphere
    sphere.rotation.x += 0.005;
    sphere.rotation.y += 0.005;

    // Rotate particles
    particles.rotation.x += 0.001;
    particles.rotation.y += 0.001;

    // Update colors based on "audio" data
    const frequency = analyser.getAverageFrequency();
    const hue = frequency / 128;
    const color = new THREE.Color().setHSL(hue, 1, 0.5);
    sphere.material.color.set(color);
    sphere.material.emissive.set(color);
    light.color.set(color);

    // Pulse the sphere
    const scale = 1 + frequency / 1000;
    sphere.scale.set(scale, scale, scale);

    renderer.render(scene, camera);
}

initVisualizer();