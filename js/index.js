var container, scene, camera, renderer, controls;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock;

var movingCube;
var collideMeshList = [];
var cubes = [];
var message = document.getElementById("message");
var crash = false;
var score = 0;
var scoreText = document.getElementById("score");
var id = 0;
var crashId = " ";
var lastCrashId = " ";

init();
animate();

function init() {
    // Scene
    scene = new THREE.Scene();
    
    // Camera
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, screenWidth / screenHeight, 1, 20000);
    camera.position.set(0, 170, 400);

    // Renderer
    if (Detector.webgl) {
        renderer = new THREE.WebGLRenderer({ antialias: true });
    } else {
        renderer = new THREE.CanvasRenderer();
    }
    renderer.setSize(screenWidth * 0.85, screenHeight * 0.85);
    renderer.setClearColor(0xcc5200);
    
    container = document.getElementById("ThreeJS");
    container.appendChild(renderer.domElement);

    THREEx.WindowResize(renderer, camera);
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Join two straight lines
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-250, -1, -3000));
    geometry.vertices.push(new THREE.Vector3(-300, -1, 200));
    material = new THREE.LineBasicMaterial({
        color: 0x4d3319,
        linewidth: 5,
        fog: true
    });
    var line1 = new THREE.Line(geometry, material);
    scene.add(line1);
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(250, -1, -3000));
    geometry.vertices.push(new THREE.Vector3(300, -1, 200));
    var line2 = new THREE.Line(geometry, material);
    scene.add(line2);


    // Join the controlled cube
    var cubeGeometry = new THREE.CubeGeometry(50, 25, 60, 5, 5, 5);
    var sphereGeometry = new THREE.SphereGeometry(15, 10, 10);
    
    var wireMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true
    });
    
    var material = new THREE.MeshBasicMaterial({
        color: 0x00FFFF
    });

    movingCube = new THREE.Mesh(sphereGeometry, material); 

    movingCube.position.set(0, 25, -20);
    scene.add(movingCube);


}

function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);

}

function update() {
    var delta = clock.getDelta();
    var moveDistance = 200 * delta;
    
    if (keyboard.pressed("left") || keyboard.pressed("A")) {
        if (movingCube.position.x > -270)
            movingCube.position.x -= moveDistance;
    }
    if (keyboard.pressed("right") || keyboard.pressed("D")) {
        if (movingCube.position.x < 270)
            movingCube.position.x += moveDistance;
    }
    if (keyboard.pressed("up") || keyboard.pressed("W")) {
        movingCube.position.z -= moveDistance;
    }
    if (keyboard.pressed("down") || keyboard.pressed("S")) {
        movingCube.position.z += moveDistance;
    }

    var originPoint = movingCube.position.clone();

    for (var vertexIndex = 0; vertexIndex < movingCube.geometry.vertices.length; vertexIndex++) {
        // The original coordinates of the vertex
        var localVertex = movingCube.geometry.vertices[vertexIndex].clone();
        // The coordinates of the vertices after transformation
        var globalVertex = localVertex.applyMatrix4(movingCube.matrix);
        var directionVector = globalVertex.sub(movingCube.position);

        var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
        var collisionResults = ray.intersectObjects(collideMeshList);
        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
            crash = true;
            crashId = collisionResults[0].object.name;
            break;
        }
        crash = false;
    }

    if (crash) {
        //            message.innerText = "crash";
        movingCube.material.color.setHex(0x346386);
        console.log("Crash");
        if (crashId !== lastCrashId) {
            score -= 100;
            lastCrashId = crashId;
        }

        document.getElementById('explode_sound').play()
    } else {
        movingCube.material.color.setHex(0xffffe6);
    }

    if (Math.random() < 0.03 && cubes.length < 30) {
        makeRandomCube();
    }

    for (i = 0; i < cubes.length; i++) {
        if (cubes[i].position.z > camera.position.z) {
            scene.remove(cubes[i]);
            cubes.splice(i, 1);
            collideMeshList.splice(i, 1);
        } else {
            cubes[i].position.z += 10;
        }
    }
    
    //Menambah skor
    score += 0.1;
    scoreText.innerText = "Score:" + Math.floor(score);
    
    /*Perhitungan Skor*/
    //Jika skor 0, maka game selesai
    if (score < 0) { 
        clearTimeout(
            alert("Game Over!")
        );
        return score = 0;
    } 
    //Jika skor telah mencapai 100, maka menang
    else if (score > 101) {
        clearTimeout(
            alert("You Win!")
        );
        return score = 0;
    }

// Return a random number between min and max
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

// Return an integer random number between min and max
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


function makeRandomCube() {
    var a = 1 * 50,
        b = getRandomInt(1, 3) * 50,
        c = 1 * 50;
    var geometry = new THREE.CubeGeometry(a, b, c);
    var material = new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff,
        size: 3
    });


    var object = new THREE.Mesh(geometry, material);
    var box = new THREE.BoxHelper(object);
    box.material.color.setHex(0x4d2600);

    box.position.x = getRandomArbitrary(-250, 250);
    box.position.y = 1 + b / 2;
    box.position.z = getRandomArbitrary(-800, -1200);
    cubes.push(box);
    box.name = "box_" + id;
    id++;
    collideMeshList.push(box);

    scene.add(box);
}
