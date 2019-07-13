Number.prototype.isBetween = function(a, b) {
    return this > a && this < b;
}
let wall;
let camera;
let scene;
class Main {
    constructor(first, players) {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(
            45,
            $(document).width() / $(document).height(),
            0.1,
            1000000
        );
        var renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(0xffffff);
        renderer.setSize($(window).width(), $(window).height());
        $(window).on("resize", function () {
            renderer.setSize($(window).width(), $(window).height());
        })

        $("#root").append(renderer.domElement);

        var modelMaterial = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture("mats/bill.png"),
            morphTargets: true
        });

        var floorG = new THREE.PlaneGeometry(10000, 10000, 100, 100);
        var floorM = new THREE.MeshBasicMaterial({
            color: 0xAAAAAA,
            side: THREE.DoubleSide,
            wireframe: true,
            transparent: false,
            opacity: 1
        });
        var floor = new THREE.Mesh(floorG, floorM)
        floor.rotateX(Math.PI / 2);

        scene.add(floor);
        let offset = 50;
        if(first)
            offset = -50
        
        this.offset = offset

        camera.position.set(-300, 20, offset);
        let cannon = new Cannon(first);

        let shot = false;
        scene.add(cannon.get(), cannon.ball.get())

        $("#shot").on("click", function () {
            cannon.fire(true);
            net.shot();
        })

        camera.lookAt(cannon.get().position.clone());

        cannon.setPos();
        
        c = cannon;

        this.first = first;

        const PERFECT_CAMERA = camera.position.clone();

        let selected = false;

        let distanceX, distanceY;

        $(document).on("mousedown", e => {
            let raycaster = new THREE.Raycaster();
            let mouse = new THREE.Vector2();            

            mouse.x = (e.clientX / innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            let barrel = raycaster.intersectObject(cannon.getBarrel())[0];
            if(barrel) {
                barrel.object.material.color.set(0xff0000)
                selected = true;             
            }
        })

        $(document).on("mousemove", e => {
            if(selected) {
                distanceY = -((innerWidth / 2 - e.clientX) / 180) % 360;
                distanceX = ((innerHeight / 2 - e.clientY) / 180) % 360;
    
                cannon.rotateX(distanceX);
                net.rotate(distanceX);

                cannon.rotateY(distanceY);
                net.barrel(distanceY);

                camera.position.y = Math.sin(distanceX) * -50 + 20;
                camera.position.x = Math.cos(distanceX) * Math.cos(distanceY) * -50;
                camera.position.z = Math.cos(distanceX) * Math.sin(distanceY) * -50 + offset;

                camera.lookAt(cannon.get().position.clone())
            }
        })

        $(document).on("mouseup", e => {
            cannon.getBarrel().material.color.set(0x0000ff)
            let newPosition = new THREE.Vector3(
                Math.cos(distanceX) * Math.cos(distanceY) * -200,
                Math.sin(distanceX) * -200 + 20,
                Math.cos(distanceX) * Math.sin(distanceY) * -200 + offset,
            );
            if(selected) {
                camera.position.copy(newPosition);
                camera.lookAt(cannon.get().position.clone())
            }
            selected = false;            
        })

        $("#load").on("click", e => {
            camera.position.set(-300, 20, offset)
            camera.lookAt(cannon.get().position)
        })

        if(players == 2)
            this.draw();

        wall = new Wall()

        scene.add(wall.get())

        function render() {
            cannon.update(scene);
            if(this.enemyCannon)
                this.enemyCannon.update(scene);
            wall.update();
            
            requestAnimationFrame(render.bind(this));
            renderer.render(scene, camera);
        }
        (render.bind(this))();
    }
    
    earthquake() {
        let firstPosition = camera.position.clone();
        const MAX = 50;
        let i = 0;
        let id = setInterval(() => {
            let pos = new THREE.Vector3(
                Math.sin(i) * (MAX - i) + firstPosition.x,
                Math.sin(i) * (MAX - i) + firstPosition.y, 
                Math.cos(i) * (MAX - i) + firstPosition.z
            );
            camera.position.copy(pos);
            i++;
            if (i > MAX) {
                console.log("SUSH")
                clearInterval(id);
                camera.position.copy(firstPosition);
            }
        }, 10)
    }

    draw() {
        let cannon = new Cannon(!this.first);
        scene.add(cannon.get(), cannon.ball.get());
        cannon.setPos();
        this.enemyCannon = cannon;
    }

    rotate(value) {
        this.enemyCannon.rotateX(value);
    }

    barrel(value) {
        this.enemyCannon.rotateY(value);
    }

    fire() {
        this.enemyCannon.fire(false);
    }

    delete() {
        this.scene.remove(this.enemyCannon.get(), this.enemyCannon.ball.get());
    }
}

