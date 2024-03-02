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
let esferaCubo,cubo,esfera;
let angulo = 0;

//variables para la animacion
let dist = 100;
let centroEsfera = new THREE.Vector3(0,0,0);
let reloj = new THREE.Clock();

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
    camera= new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,1,100);
    camera.position.set(-20,5,7);
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


    // Eventos
    renderer.domElement.addEventListener('dblclick', animate );
}

function loadScene()
{
   //Importar modelo en gltf
   const starloader = new GLTFLoader();

    starloader.load( 'models/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 0;
        gltf.scene.rotation.y = -Math.PI/2;
        gltf.scene.name = 'star-wars';
        scene.add( gltf.scene );
    
    }, undefined, function ( error ) {
        console.error( error );
    } );
}

function setupGUI()
{
	// Definicion de los controles
	effectController = {
	mensaje: 'Star Wars Scene',
	giroY: 0.0,
	separacion: 0,
    play: function(){animate();} 
	//colorsuelo: "rgb(150,150,150)"
	};

	// Creacion interfaz
	const gui = new GUI();

	// Construccion del menu
	const h = gui.addFolder("Control de la animacion");
    h.add(effectController, "play").name("Animar");
	// h.add(effectController, "mensaje").name("Aplicacion");
	// h.add(effectController, "giroY", -180.0, 180.0, 0.025).name("Giro en Y");
	// h.add(effectController, "separacion", { 'Ninguna': 0, 'Media': 2, 'Total': 5 }).name("Separacion");
    // h.addColor(effectController, "colorsuelo").name("Color alambres");

}

function animate(event)
{
    requestAnimationFrame(animate);
    // Capturar y normalizar
    let x= event.clientX;
    let y = event.clientY;
    x = ( x / window.innerWidth ) * 2 - 1;
    y = -( y / window.innerHeight ) * 2 + 1;
    
    const starDestroyer = scene.getObjectByName('StarShip');
    const imperialShip = scene.getObjectByName('ImperialStarShip');
    const deathStar = scene.getObjectByName('DeathStar');
   
    // Calcular el tiempo transcurrido
    let tiempo = reloj.getElapsedTime();
    let anguloRotacion = tiempo * 2 * Math.PI;
    

    // var vector = new THREE.Vector3().subVectors( starDestroyer.position, centroEsfera );
    // vector.setLength(dist);

    // var vector2 = new THREE.Vector3().subVectors( imperialShip.position, centroEsfera );
    // vector2.setLength(dist);

    //Calcular la nueva posicion del objeto
    var xr = centroEsfera.x + dist * Math.cos(anguloRotacion);
    var yr = centroEsfera.y;
    var z = centroEsfera.z + dist * Math.sin(anguloRotacion);
    
    // Actualizar la posicion del objeto
    starDestroyer.position.set(xr,yr,z);
    imperialShip.position.set(xr,yr,z);

    renderer.render(scene,camera);
    // starDestroyer.position.rotateAround(centroEsfera,anguloRotacion);
    // imperialShip.position.rotateAround(centroEsfera,anguloRotacion);

    // Anima la estrella de la muerte para que gire sobre su eje
    // new TWEEN.Tween( deathStar.rotation ).
    // to( {x:[0,0],y:[0,Math.PI*2],z:[0,0]}, 5000 ).
    // interpolation( TWEEN.Interpolation.Bezier ).
    // easing( TWEEN.Easing.Bounce.Out ).
    // start();

}

function update()
{
    angulo += 0.01;
    //esferaCubo.rotation.y = angulo;

    // Lectura de controles en GUI (es mejor hacerlo con onChange)
	// cubo.position.set( -1-effectController.separacion/2, 0, 0 );
	// esfera.position.set( 1+effectController.separacion/2, 0, 0 );
	// cubo.material.setValues( { color: effectController.colorsuelo } );
	// esferaCubo.rotation.y = effectController.giroY * Math.PI/180;
    // TWEEN.update();
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