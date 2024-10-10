let scene, camera, renderer, controls, model, secondModel, thingy, spiral, model_container, tube;
let rotationSpeed = 0.05;
let rotationDirection = 1;
let thingyOriginalPosition;
let modelOriginalPosition, model_containerOriginalPosition;

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
    if (spiral && spiral.visible) {
        spiral.rotation.y += rotationSpeed * rotationDirection;
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
        if (model && model_container && spiral && thingy) {
            // Move model and model_container
            model.position.set(48, -17, -20);
            model_container.position.setX(10);

            // Make spiral visible and set its position and scale
            

            // Move thingy after 1 second
            setTimeout(() => {
                thingy.position.y = 3;
                spiral.visible = true;
                spiral.position.set(49, -5, -20);
                spiral.scale.set(1.7, 1.7, 1.7);
            }, 2000);

            // After 5 seconds, return everything to original positions
            setTimeout(() => {
                model.position.copy(modelOriginalPosition);
                model_container.position.copy(model_containerOriginalPosition);
                thingy.position.copy(thingyOriginalPosition);
                spiral.visible = false;
            }, 20000);

            // After 7 seconds, reverse rotation
            setTimeout(() => {
                rotationDirection *= -1;
            }, 7000);
        }
    });
    
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

        spiral = await loadModel('spiral.gltf', 1);
        if (spiral) {
            spiral.visible = false;  // Initially invisible
        }

        tube = await loadModel('tube.gltf', 1);
        if (tube) {
            tube.position.set(30, 30, 30);
        }

        model_container = await loadModel('model_container.gltf', 4);
        if (model_container) {
            model_container.position.set(0, 0, -2);
            fixModelMaterials(model_container);
        }
        if (secondModel) {
            secondModel.position.set(0, 0, 0);
        }

        if (model) {
            model.position.set(38, -17, -20);
            model.scale.set(0.7, 1.8, 0.7);
            thingy.position.set(10, 0, 0); 
        }
        
        thingyOriginalPosition = thingy.position.clone();
        modelOriginalPosition = model.position.clone();
        model_containerOriginalPosition = model_container.position.clone();
    } catch (error) {
        console.error('Failed to load models:', error);
    }
    
    model.rotation.set(Math.PI, 0, 0);
    
    animate();
}

init();
