let scene, camera, renderer, controls, model, secondModel, thingy, spiral, model_container, tube;
let rotationSpeed = 0.05;
let rotationDirection = 1;
let thingyOriginalPosition;

function createScene(backgroundColor, ambientLightColor, directionalLightColor) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    
    const ambientLight = new THREE.AmbientLight(ambientLightColor);
    scene.add(ambientLight);
    
    const createDirectionalLight = (x, y, z) => {
        const light = new THREE.DirectionalLight(directionalLightColor, 0.5);
        light.position.set(x, y, z);
        scene.add(light);
    };

    // Create multiple directional lights
    createDirectionalLight(2, 2, 10);
    createDirectionalLight(-2, 2, -10);
    createDirectionalLight(10, 5, 0);
    createDirectionalLight(-10, 5, 0);
    createDirectionalLight(0, 10, 0);
}

function createCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 40;
    camera.position.y = 0;
    camera.position.z = -80;
}

function createRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function createMovableCamera() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;
}

function loadModel(modelPath, scale = 1) {
    return new Promise((resolve, reject) => {
        const loader = new THREE.GLTFLoader();
        loader.load(
            modelPath,
            (gltf) => {
                const loadedModel = gltf.scene;
                loadedModel.scale.set(scale, scale, scale);
                scene.add(loadedModel);
                resolve(loadedModel);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('An error happened', error);
                reject(error);
            }
        );
    });
}

function fixModelMaterials(model) {
    model.traverse((child) => {
        if (child.isMesh && child.material) {
            child.material.side = THREE.DoubleSide;
            child.material.transparent = false;
            child.material.opacity = 1;
            child.material.depthWrite = true;
            if (child.material.map) {
                child.material.map.encoding = THREE.sRGBEncoding;
            }
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (model) {
        model.rotation.y += rotationSpeed * rotationDirection;
    }
    if (controls) controls.update();
    renderer.render(scene, camera);
}

function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function setupInputListeners() {
    window.addEventListener('resize', handleResize);
    
    document.getElementById('rotateotherdir').addEventListener('click', () => {
        rotationDirection *= -1;
    });
    
    document.getElementById('cleaningjet').addEventListener('click', () => {
        if (thingy) {
            thingy.position.y = 3;
            setTimeout(() => {
                thingy.position.y = thingyOriginalPosition.y;
            }, 2000);
        }
    });
    
    document.getElementById('vizualize').addEventListener('click', visualizeIce);
}

function visualizeIce() {
    // Function skeleton for the ice button
    console.log("Visualize Ice button clicked");
    // Add your ice visualization logic here
}

async function init() {
    createScene(0x87CEEB, 0xffffff, 0xffffff);
    createCamera();
    createRenderer();
    createMovableCamera();
    setupInputListeners();
    
    try {
        model = await loadModel('model.gltf', 0.6);
        console.log('First model loaded successfully');
        fixModelMaterials(model);
        
        secondModel = await loadModel('construction_3.gltf', 4);
        console.log('Second model loaded successfully');
        fixModelMaterials(secondModel);
        
        thingy = await loadModel('thingy.gltf', 4);
        fixModelMaterials(thingy);

        spiral = await loadModel('spiral.gltf', 1.3);

        tube = await loadModel('tube.gltf', 1);

        if (tube) {
            tube.position.set(30, 30, 30);
        }

        if (spiral) {
          spiral.position.set(47,-8,-18);
        }

        model_container = await loadModel('model_container.gltf', 4);
        if (model_container) {
          model_container.position.set(0, 0, -2);
          fixModelMaterials(model_container);
        }
        if (secondModel) {
            secondModel.position.set(0, 0, 0); // Adjust as needed
        }

        if (model) {
          model.position.set(38, -17, -20);
          model.scale.set(0.7, 1.8, 0.7);
          thingy.position.set(10, 0, 0); 
        }
        
        thingyOriginalPosition = thingy.position.clone();
    } catch (error) {
        console.error('Failed to load models:', error);
    }
    
    model.rotation.set(Math.PI, 0, 0); // 90 degrees in radians
    
    animate();
}

init();
