/**
 * EscenaAnimada.js
 * 
 * Seminario AGM. Escena basica en three.js con interacción y animacion: 
 * Animacion coherente, GUI, picking, orbitacion
 * 
 * @author <rvivo@upv.es>, 2022
 * 
 */

// Modulos necesarios
import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {OrbitControls} from "../lib/OrbitControls.module.js";
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js";

// Variables estandar
let renderer, scene, camera;

// Otras globales
let cameraControls, effectController;
let angulo = 0;

// Objetos de la escena
let starDestroyer;
let imperialShip;
let deathStar;

//variables para la animacion
let dist = 40;
let centroEsfera = new THREE.Vector3(0,0,0);
let reloj = new THREE.Clock();
let velocidad = 0.00002;

// Varaiable para parar la animación
let animar = true;


// Acciones
init();
loadScene();
setupGUI();
render();

function init()
{
    // Instanciar el motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth,window.innerHeight);
    document.getElementById('container').appendChild( renderer.domElement );

    // Instanciar el nodo raiz de la escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.5,0.5,0.5);

    // Instanciar la camara
    camera= new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.01,500);
    camera.position.set(-24.50,-19,-0.11);
    cameraControls = new OrbitControls( camera, renderer.domElement );
    cameraControls.target.set(0,1,0);
    camera.lookAt(0,1,0);

    // Luces
    const luzAmbiente = new THREE.AmbientLight(0xFFFFFF,1.0);
    luzAmbiente.position.y = 25;
    scene.add(luzAmbiente);
    const luzDirec = new THREE.DirectionalLight(0xFFFFFF,0.5);
    luzDirec.position.set(5.00,14,24.9);
    scene.add(luzDirec);
    
}

function loadScene()
{
   //Importar modelo en gltf
//    const starloader = new GLTFLoader();

//     starloader.load( 'models/scene.gltf', function ( gltf ) {
//         gltf.scene.position.y = 0;
//         gltf.scene.rotation.y = -Math.PI/2;
//         gltf.scene.name = 'star-wars';
//         scene.add( gltf.scene );
    
//     }, undefined, function ( error ) {
//         console.error( error );
//     } );

    //Importar scena Galaxia gltf
    const galaxy = new GLTFLoader();

    galaxy.load('models/scenaGalaxia.gltf', function(gltf){
        gltf.scene.position.y = 0;
        //gltf.scene.rotation.y = -Math.PI/2;
        gltf.scene.name = 'galaxy';
        scene.add(gltf.scene);
    }, undefined, function (error){
        console.error(error);
    });
}

function setupGUI()
{
	// Definicion de los controles
	effectController = {
	mensaje: 'Star Wars Scene',
	giroY: 0.0,
	separacion: 0,
    play: function(){ animar = true; animate();},
    pause: function(){animar = false;},
    playLaserStar: function(){ dispararLaserStar();},
    playLaserNaves: function(){ dispararLaserNaves();}, 
	//colorsuelo: "rgb(150,150,150)"
	};

	// Creacion interfaz
	const gui = new GUI();

	// Construccion del menu
	const h = gui.addFolder("Control de la animacion");
    h.add(effectController, "play").name("Animar");
    h.add(effectController, "pause").name("Pausar");
    h.add(effectController, "playLaserStar").name("Disparar Estrella de la Muerte");
    h.add(effectController, "playLaserNaves").name("Disparar Naves");
}



function animate(event)
{
    if (!animar) return;
    
    requestAnimationFrame(animate);
    // Capturar y normalizar
    // let x= event.clientX;
    // let y = event.clientY;
    // x = ( x / window.innerWidth ) * 2 - 1;
    // y = -( y / window.innerHeight ) * 2 + 1;

    // Objetos de la escena
    starDestroyer = scene.getObjectByName('StarShip');
    imperialShip = scene.getObjectByName('ImperialStarShip');

    // Posicion original de las naves
    let posStar = starDestroyer.position.clone();
    let posImperial = imperialShip.position.clone();

    // Angulo inicial de las naves
    let anguloStarInit = Math.atan2(posStar.z - centroEsfera.z, posStar.x - centroEsfera.x);
    let anguloImperialInit = Math.atan2(posImperial.z - centroEsfera.z, posImperial.x - centroEsfera.x);
   
    // Calcular el tiempo transcurrido
    let tiempo = reloj.getElapsedTime();

    // Si el tiempo excede el periodo de una rotación, reiniciar el reloj
    if (tiempo >= 1/velocidad) reloj.start();

    // Calcular el angulo de rotacion de los dos objetos (naves)
    let anguloRotacionStar = tiempo * 2 * Math.PI * velocidad + anguloStarInit;
    let anguloRotacionImperial = tiempo * 2 * Math.PI * velocidad + anguloImperialInit;

    //Calcular la nueva posicion del objeto starDestroyer
    var xs = centroEsfera.x + dist * Math.cos(anguloRotacionStar);
    var ys = centroEsfera.y;
    var zs = centroEsfera.z + dist * Math.sin(anguloRotacionStar);

    //Calcular la nueva posicion del objeto imperialShip
    var xi = centroEsfera.x + dist * Math.cos(anguloRotacionImperial);
    var yi = centroEsfera.y;
    var zi = centroEsfera.z + dist * Math.sin(anguloRotacionImperial);
    
    // Actualizar la posicion del objeto
    starDestroyer.position.set(xs,ys,zs);
    imperialShip.position.set(xi,yi,zi);

    // Las naves miran al centro de la esfera
    starDestroyer.lookAt(centroEsfera);
    imperialShip.lookAt(centroEsfera);

    // Guardar la rotación actual como un cuaternión
    let quaternionStar = starDestroyer.quaternion.clone();
    let quaternionImperial = imperialShip.quaternion.clone();

    // Crear un cuaternión para la rotación adicional
    let quaternionRotacion = new THREE.Quaternion();
    quaternionRotacion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (Math.PI / 2));

    // Combinar las rotaciones
    quaternionStar.multiply(quaternionRotacion);
    quaternionImperial.multiply(quaternionRotacion);

    // Aplicar la rotación combinada
    starDestroyer.quaternion.copy(quaternionStar);
    imperialShip.quaternion.copy(quaternionImperial);

    // Actualizar la rotación de la nave
    starDestroyer.rotation.y -= 2 * Math.PI / (1/velocidad);
    imperialShip.rotation.y -= 2 * Math.PI / (1/velocidad);

    renderer.render(scene,camera);
}

function crearLaser(origen) {
    let geometriaLaser = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 32);
    let materialLaser = new THREE.MeshBasicMaterial({color: 0xFF0000});
    let laser = new THREE.Mesh(geometriaLaser, materialLaser);

    // Posicionar el láser en el origen
    laser.position.copy(origen);

    // Hacer que el láser mire al centro de la esfera
    laser.lookAt(centroEsfera);

    return laser;
}

function crearLaserStar() {
    let geometriaLaser = new THREE.CylinderGeometry(10, 0.2, 1, 32);
    let materialLaser = new THREE.MeshBasicMaterial({color: 0xFF0000});
    let laser = new THREE.Mesh(geometriaLaser, materialLaser);

    // Posicionar el láser en el origen
    laser.position.copy(deathStar.position);

    // Hacer que el láser mire al centro de la esfera
    laser.lookAt(centroEsfera);

    return laser;
}

function dispararLaserStar(event){
    // Objetos de la escena
    deathStar = scene.getObjectByName('DeathStar');

    // Crear láser
    let laserStar = crearLaserStar(deathStar.position);

    // Añadir los láseres a la escena
    scene.add(laserStar);
}

function dispararLaserNaves(event){
    // Objetos de la escena
    starDestroyer = scene.getObjectByName('StarShip');
    imperialShip = scene.getObjectByName('ImperialStarShip');

    // Posicion actual de las naves
    let posStar = starDestroyer.position;
    let posImperial = imperialShip.position;

    // Crear un láser para cada nave
    let laserStar = crearLaser(posStar);
    let laserImperial = crearLaser(posImperial);

    starDestroyer.add(laserStar);
    imperialShip.add(laserImperial);

    // Añadir los láseres a la escena
    scene.add(laserStar);
    scene.add(laserImperial);
}

function update()
{
    // Mover los láseres hacia el centro de la esfera
    scene.children.forEach(function(objeto) {
        if (objeto instanceof THREE.Mesh && objeto.geometry instanceof THREE.CylinderGeometry) {
            objeto.position.lerp(centroEsfera, 0.01);
        }
    });
}

function render()
{
    requestAnimationFrame(render);
    update();
    renderer.render(scene,camera);
}

THREE.Vector3.prototype.rotateAround = function(origin, radians) {
    var x = this.x - origin.x;
    var z = this.z - origin.z;

    var cos = Math.cos(radians);
    var sin = Math.sin(radians);

    var nx = cos * x - sin * z;
    var nz = sin * x + cos * z;

    this.x = nx + origin.x;
    this.z = nz + origin.z;

    return this;
}