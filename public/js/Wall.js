class Wall {
    constructor() {
        let container = new THREE.Object3D();

        let material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            wireframe: false,
            color: 0xff3300
        })
        const CUBE_SIZE = 50;

        let geometry = new THREE.CubeGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, 1, 1, 1);

        this.arr = [];
        this.hitarr = [];
        this.fallarr = [];

        const COLS = 20;
        const ROWS = 10;
        const OFFSET = CUBE_SIZE * (COLS / 2) - (CUBE_SIZE / 2);

        for(let column of [...Array(COLS).keys()]){
            this.arr[column - (COLS / 2)] = []
            for(let row of [...Array(ROWS).keys()]) {
                let cube = new THREE.Mesh(geometry.clone(), material.clone())
                let position = new THREE.Vector3(
                    0,
                    row * CUBE_SIZE + (CUBE_SIZE / 2),
                    column * CUBE_SIZE - OFFSET,
                )
                cube.name = `wall_${column - (COLS / 2)}_${row}`;
                cube.userData.fall = 0;
                cube.position.copy(position);
                container.add(cube);
                this.arr[column - (COLS / 2)][row] = cube;
            }
        }

        container.position.set(1000, 0, 0)
        this.container = container;
    }

    get() {
        return this.container
    }

    hit(x, y, angle, isPlayer){
        scene.getObjectByName(`wall_${x}_${y}`).userData = {
            t: 0,
            h0: y * 50,
            v0:20,
            change: angle,
            fall: 0,
            hitByPlayer: isPlayer
        }
        this.hitarr.push(scene.getObjectByName(`wall_${x}_${y}`));

        scene.getObjectByName(`wall_${x}_${y}`).name = "";

        for(let i = y + 1; i < 10; i++)
        {            
            if(scene.getObjectByName(`wall_${x}_${i}`)) {
                scene.getObjectByName(`wall_${x}_${i}`).userData.fall += 50;
                this.fallarr.push(scene.getObjectByName(`wall_${x}_${i}`));
                scene.getObjectByName(`wall_${x}_${i}`).name = `wall_${x}_${i - 1}`;

            }
        }
    }

    update() {
        for(let cube of this.hitarr) {
            let isFalling = true;
            let isSliding = true;

            let o = cube.userData;
            o.t+=0.1;
            
            let v = o.v0 - (1 * o.t)            
            
            if(cube.position.y > 25)
                cube.position.y = o.h0 - (9 * o.t * o.t / 2);
            else  {
                cube.position.y = 25;
                v--;
                isFalling = false;
            }

            if(v > 0){
                cube.position.x += v;
                cube.position.z += o.change * (v / o.v0);
            }
            else
                isSliding = false;

            if(o.hitByPlayer) {
                let offset = new THREE.Vector3(100, 20, 100)
                camera.position.copy(cube.getWorldPosition().clone().add(offset))
                camera.lookAt(cube.getWorldPosition())
    
            }
            if(!isSliding && !isFalling)
                this.hitarr.splice(this.hitarr.indexOf(cube), 1)
        }
        for(let cube of this.fallarr) {
            if(cube.userData.fall > 0) {
                cube.position.y--;
                cube.userData.fall--;
            }
        }
    }
}