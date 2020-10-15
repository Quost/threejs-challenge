var camera, scene, renderer,
    geometry, material, mesh, light1, stats;

init();
animate();

function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 00000);
    camera.position.z = 15000;
    camera.position.y = 0;
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.x = 0;
    directionalLight.position.y = 0;
    directionalLight.position.z = 1;
    directionalLight.position.normalize();
    scene.add(directionalLight);

    var light = new THREE.AmbientLight(0x444444);
    scene.add(light);

    const arrayElements = new Array();
    const idToObject = {};

    xhr.open("GET", './assets/montagem-final.stl', true);

    xhr.responseType = "arraybuffer";
    //xhr.setRequestHeader("Accept","text/plain");
    //xhr.setRequestHeader("Content-Type","text/plain");
    //xhr.setRequestHeader('charset', 'x-user-defined');
    xhr.send(null);

    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            preencheArrayElementosTeste(this);
            posiciona(mesh, arrayElements, numObjects);
            console.log("done positioning");
        }
    }
    xhttp.onerror = function(e) {
        console.log(e);
    }
    xhttp.open("GET", "./assets/objects.xml", true);
    xhttp.send();

    let numObjects = 0;

    function preencheArrayElementosTeste(xml) {

        const infoElementos = xml.responseXML;

        // console.log(infoElementos);

        numObjects = (infoElementos.getElementsByTagName("titulo").length);

        // console.log("Numero objetos: " + numObjects);

        // numObjects = (infoElementos.getElementsByTagName("titulo").length);

        const titulos = (infoElementos.getElementsByTagName("titulo"));
        const posx = (infoElementos.getElementsByTagName("posx"));
        const posy = (infoElementos.getElementsByTagName("posy"));
        const posz = (infoElementos.getElementsByTagName("posz"));

        class elemento {
            constructor(id) {
                this.titulo = titulos[id].firstChild.nodeValue;
                console.log(this.titulo)
                this.posx = posx[id].firstChild.nodeValue;
                this.posy = posy[id].firstChild.nodeValue;
                this.posz = posz[id].firstChild.nodeValue;
            }
        }

        for (let i = 0; i < numObjects; i++) {
            arrayElements[i] = new elemento(i);
            // arrayElements[i].posx = posx[i].childNodes[0].nodeValue;
            // arrayElements[i].posy = posy[i].childNodes[0].nodeValue;
            // arrayElements[i].posz = posz[i].childNodes[0].nodeValue;
            // arrayElements[i].escx = escx[i].childNodes[0].nodeValue;
            // arrayElements[i].escy = escy[i].childNodes[0].nodeValue;
            // arrayElements[i].escz = escz[i].childNodes[0].nodeValue;
            // arrayElements[i].rotx = rotx[i].childNodes[0].nodeValue;
            // arrayElements[i].roty = roty[i].childNodes[0].nodeValue;
            // arrayElements[i].rotz = rotz[i].childNodes[0].nodeValue;
            // arrayElements[i].titulo = titulos[i].childNodes[0].nodeValue;
            // console.log(i);
            // requestAnimationFrame(render);
        }
    }

    // const labelContainerElem = document.querySelector('#labels');

    function posicionaElementosXML(numObjects, arrayElements, idToObject) {

        for (let i = 0; i < numObjects; ++i) {
            const id = i + 1;
            const material = new THREE.MeshPhongMaterial({
                color: randomColor()
            });


            cylinder.position.set(arrayElements[i].posx, arrayElements[i].posy, arrayElements[i].posz);
            cylinder.rotation.set(arrayElements[i].rotx, arrayElements[i].roty, arrayElements[i].rotz);
            cylinder.scale.set(arrayElements[i].escx, arrayElements[i].escy, arrayElements[i].escz);

            const elem = document.createElement('div');
            elem.textContent = arrayElements[i].titulo;
            labelContainerElem.appendChild(elem);

            const pickingMaterial = new THREE.MeshPhongMaterial({
                emissive: new THREE.Color(id),
                color: new THREE.Color(0, 0, 0),
                specular: new THREE.Color(0, 0, 0),
                map: texture,
                transparent: true,
                side: THREE.DoubleSide,
                alphaTest: 0.5,
                blending: THREE.NoBlending,
            });

            const pickingCube = new THREE.Mesh(geometry, pickingMaterial);
            pickingScene.add(pickingCube);
            pickingCube.position.copy(cube.position);
            pickingCube.rotation.copy(cube.rotation);
            pickingCube.scale.copy(cube.scale);
        }
    }

    renderer = new THREE.WebGLRenderer(); //new THREE.CanvasRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 5, 0);
    controls.update();

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);
}

function posiciona(mesh, arrayElements, numObjects) {
    // camera.lookAt(mesh);
    console.log("posiciona()");

    const radiusTop = 80;
    const radiusBottom = 80;
    const height = 130;
    const zinitial = 2120 + height;
    const xinitial = -13700;
    const yinitial = 4890;
    const rotxinitial = -1.58;
    const radialSegments = 100;
    const geometry = new THREE.CylinderBufferGeometry(radiusTop, radiusBottom, height, radialSegments);
    const cylinder = new Array();

    for (let i = 0; i < numObjects; i++) {
        const material = new THREE.MeshPhongMaterial({
            color: randomColor()
        });

        cylinder[i] = new THREE.Mesh(geometry, material);
        console.log("for do posiciona. i: " + i);
        console.log("arrayElements[" + i + "].posz: " + Number(arrayElements[i].posz));
        console.log("arrayElements[" + i + "].posx: " + Number(arrayElements[i].posx));
        console.log("arrayElements[" + i + "].posy: " + Number(arrayElements[i].posy));
        scene.add(cylinder[i]);
        cylinder[i].rotation.x = rotxinitial;
        cylinder[i].position.z = zinitial + (Number(arrayElements[i].posz));
        cylinder[i].position.x = xinitial + (Number(arrayElements[i].posx));
        cylinder[i].position.y = yinitial - (Number(arrayElements[i].posy));

        // console.log("cylinder[" + i + "].postion.z: " + cylinder[i].postion.z);
        // console.log("cylinder[" + i + "].postion.x: " + cylinder[i].postion.x);
        // console.log("cylinder[" + i + "].postion.y: " + cylinder[i].postion.y);

        // cylinder[i].position.z = zinitial + (i * 100);
        // cylinder[i].position.x = xinitial + (i * 100);
        // cylinder[i].position.y = yinitial + (i * -100);
    }

    // cylinder.position.y = 900;

}

function animate() {

    // note: three.js includes requestAnimationFrame shim
    requestAnimationFrame(animate);
    render();
    stats.update();

}


// window.addEventListener("click", getClicked3DPoint);

function render() {

    //mesh.rotation.x += 0.01;
    if (mesh) {
        // mesh.rotation.z += 0.02;
    }
    //light1.position.z -= 1;

    renderer.render(scene, camera);

}