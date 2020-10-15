function trim(str) {
    str = str.replace(/^\s+/, '');
    for (var i = str.length - 1; i >= 0; i--) {
        if (/\S/.test(str.charAt(i))) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    return str;
}

var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
        if (xhr.status == 200 || xhr.status == 0) {
            var rep = xhr.response; // || xhr.mozResponseArrayBuffer;
            console.log(rep);
            parseStlBinary(rep);
            //parseStl(xhr.responseText);
            mesh.rotation.z = -1.58;
            mesh.position.z = 2000;
            // mesh.rotation.x = -0.9;
            mesh.position.x = -13500;
            mesh.position.y = 5000;
            console.log('done parsing');
        }
    }
}
xhr.onerror = function(e) {
    console.log(e);
}

// Notes:
// - STL file format: http://en.wikipedia.org/wiki/STL_(file_format)
// - 80 byte unused header
// - All binary STLs are assumed to be little endian, as per wiki doc
var parseStlBinary = function(stl) {
    var geo = new THREE.Geometry();
    var dv = new DataView(stl, 80); // 80 == unused header
    var isLittleEndian = true;
    var triangles = dv.getUint32(0, isLittleEndian);

    // console.log('arraybuffer length:  ' + stl.byteLength);
    // console.log('number of triangles: ' + triangles);

    var offset = 4;
    for (var i = 0; i < triangles; i++) {
        // Get the normal for this triangle
        var normal = new THREE.Vector3(
            dv.getFloat32(offset, isLittleEndian),
            dv.getFloat32(offset + 4, isLittleEndian),
            dv.getFloat32(offset + 8, isLittleEndian)
        );
        offset += 12;

        // Get all 3 vertices for this triangle
        for (var j = 0; j < 3; j++) {
            geo.vertices.push(
                new THREE.Vector3(
                    dv.getFloat32(offset, isLittleEndian),
                    dv.getFloat32(offset + 4, isLittleEndian),
                    dv.getFloat32(offset + 8, isLittleEndian)
                )
            );
            offset += 12
        }

        // there's also a Uint16 "attribute byte count" that we
        // don't need, it should always be zero.
        offset += 2;

        // Create a new face for from the vertices and the normal             
        geo.faces.push(new THREE.Face3(i * 3, i * 3 + 1, i * 3 + 2, normal));
    }

    // The binary STL I'm testing with seems to have all
    // zeroes for the normals, unlike its ASCII counterpart.
    // We can use three.js to compute the normals for us, though,
    // once we've assembled our geometry. This is a relatively 
    // expensive operation, but only needs to be done once.
    geo.computeFaceNormals();

    mesh = new THREE.Mesh(
        geo,
        // new THREE.MeshNormalMaterial({
        //     overdraw:true
        // }
        new THREE.MeshLambertMaterial({
            overdraw: true,
            color: 0xaaaaaa,
            shading: THREE.FlatShading
        }));
    scene.add(mesh);

    stl = null;
};

var parseStl = function(stl) {
    var state = '';
    var lines = stl.split('\n');
    var geo = new THREE.Geometry();
    var name, parts, line, normal, done, vertices = [];
    var vCount = 0;
    stl = null;

    for (var len = lines.length, i = 0; i < len; i++) {
        if (done) {
            break;
        }
        line = trim(lines[i]);
        parts = line.split(' ');
        switch (state) {
            case '':
                if (parts[0] !== 'solid') {
                    console.error(line);
                    console.error('Invalid state "' + parts[0] + '", should be "solid"');
                    return;
                } else {
                    name = parts[1];
                    state = 'solid';
                }
                break;
            case 'solid':
                if (parts[0] !== 'facet' || parts[1] !== 'normal') {
                    console.error(line);
                    console.error('Invalid state "' + parts[0] + '", should be "facet normal"');
                    return;
                } else {
                    normal = [
                        parseFloat(parts[2]),
                        parseFloat(parts[3]),
                        parseFloat(parts[4])
                    ];
                    state = 'facet normal';
                }
                break;
            case 'facet normal':
                if (parts[0] !== 'outer' || parts[1] !== 'loop') {
                    console.error(line);
                    console.error('Invalid state "' + parts[0] + '", should be "outer loop"');
                    return;
                } else {
                    state = 'vertex';
                }
                break;
            case 'vertex':
                if (parts[0] === 'vertex') {
                    geo.vertices.push(new THREE.Vector3(
                        parseFloat(parts[1]),
                        parseFloat(parts[2]),
                        parseFloat(parts[3])
                    ));
                } else if (parts[0] === 'endloop') {
                    geo.faces.push(new THREE.Face3(vCount * 3, vCount * 3 + 1, vCount * 3 + 2, new THREE.Vector3(normal[0], normal[1], normal[2])));
                    vCount++;
                    state = 'endloop';
                } else {
                    console.error(line);
                    console.error('Invalid state "' + parts[0] + '", should be "vertex" or "endloop"');
                    return;
                }
                break;
            case 'endloop':
                if (parts[0] !== 'endfacet') {
                    console.error(line);
                    console.error('Invalid state "' + parts[0] + '", should be "endfacet"');
                    return;
                } else {
                    state = 'endfacet';
                }
                break;
            case 'endfacet':
                if (parts[0] === 'endsolid') {
                    //mesh = new THREE.Mesh( geo, new THREE.MeshNormalMaterial({overdraw:true}));
                    mesh = new THREE.Mesh(
                        geo,
                        new THREE.MeshLambertMaterial({
                            overdraw: true,
                            color: 0xaa0000,
                            shading: THREE.FlatShading
                        }));
                    scene.add(mesh);
                    done = true;
                } else if (parts[0] === 'facet' && parts[1] === 'normal') {
                    normal = [
                        parseFloat(parts[2]),
                        parseFloat(parts[3]),
                        parseFloat(parts[4])
                    ];
                    if (vCount % 1000 === 0) {
                        console.log(normal);
                    }
                    state = 'facet normal';
                } else {
                    console.error(line);
                    console.error('Invalid state "' + parts[0] + '", should be "endsolid" or "facet normal"');
                    return;
                }
                break;
            default:
                console.error('Invalid state "' + state + '"');
                break;
        }
    }
};

function rand(min, max) {
    if (max === undefined) {
        max = min;
        min = 0;
    }
    return min + (max - min) * Math.random();
}

function randomColor() {
    return `hsl(${rand(360) | 0}, ${rand(50, 100) | 0}%, 50%)`;
}



// function getClicked3DPoint() {

//     const canvas = renderer.domElement;
//     const canvasPosition = $(canvas).position();
//     const rayCaster = new THREE.Raycaster();
//     let mousePosition = new THREE.Vector2();

//     mousePosition.x = ((evt.clientX - canvasPosition.left) / canvas.width) * 2 - 1;
//     mousePosition.y = -((evt.clientY - canvasPosition.top) / canvas.height) * 2 + 1;

//     rayCaster.setFromCamera(mousePosition, camera);
//     var intersects = rayCaster.intersectObjects(scene.getObjectByName('MyObj_s').children, true);

//     if (intersects.length > 0)
//         console.log(intersects[0].point);
//     return intersects[0].point;
// };