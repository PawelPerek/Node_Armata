class Cannon {
    constructor(first) {
        const HEIGHT = 50; this.HEIGHT = 50;

        this.first = first;
        let helper = new THREE.AxesHelper( 100 );
        let container = new THREE.Object3D();
        let geometry = new THREE.CylinderGeometry( 10, 10, HEIGHT, 32 );
        let material = new THREE.MeshBasicMaterial( {
            wireframe: false, 
            transparent: false, 
            color: 0x0000ff
        } );
        geometry.translate(0, HEIGHT / 2, 0)

        let lufa = new THREE.Mesh(geometry, material);

        this.barrel = lufa;

        let wheelGeometry = new THREE.CylinderGeometry( 20, 20, 10, 32 );
        let wheelMaterial = new THREE.MeshBasicMaterial( {
            wireframe: true, 
            transparent: false, 
            color: 0x222
        } );

        let w1 = new THREE.Mesh(wheelGeometry.clone(), wheelMaterial.clone());

        w1.position.x += 15;
        w1.rotation.z += Math.PI / 2;

        let w2 = new THREE.Mesh(wheelGeometry.clone(), wheelMaterial.clone());

        w2.position.x -= 15;
        w2.rotation.z += Math.PI / 2;

        this.wheels = [w1, w2];

        let ball = new CannonBall();

        this.ball = ball;

        container.add(lufa, w1, w2, helper)

        this.alpha = Math.PI / 4;
        lufa.rotation.x = Math.PI / 4;
        container.position.y += 20;
        if(first)
            container.position.z -= 50;
        else
            container.position.z += 50;
        this.container = container;

        this.phi = $("#angleX").attr("max") / 2;
        this.pi = 0;
        this.t = 0;

        this.container.rotation.y = Math.PI / 2 - this.pi;
    }
    get() {
        return this.container;
    }

    getBarrel() {
        return this.barrel;
    }

    ball() {
        return this.ball.get();
    }
    rotateX(value) {
        this.phi = value;
        this.barrel.rotation.x = Math.PI / 2 - value;
        this.setPos();
    }
    rotateY(value) {
        this.pi = value;        
        this.container.rotation.y = Math.PI / 2 - value;
        this.setPos();
    }

    setPos() {
        let tmp = 50;
        if(this.first)
            tmp = -50;

        this.ball.get().position.set(
            Math.cos(this.phi) * Math.cos(this.pi) * this.HEIGHT,
            Math.sin(this.phi) * this.HEIGHT + this.HEIGHT / 2 - 5,
            Math.cos(this.phi) * Math.sin(this.pi) * this.HEIGHT + tmp
        )
    }

    reject() {
        let iterator = 0;
        const MAX = 30;
        let id = setInterval(() => {
            if(iterator <= MAX / 2) {
                this.barrel.position.z--;
                for(let wheel of this.wheels) {
                    wheel.position.z--;
                    wheel.rotation.x-= 2;
                }
            }
            else {
                this.barrel.position.z++;
                for(let wheel of this.wheels) {
                    wheel.position.z++;
                    wheel.rotation.x+= 2;
                }
            }
            if(iterator > MAX)
                clearInterval(id); 
            iterator++;
        }, 1)
    }

    fire(isPlayer) {
        if(!this.fly) {
            this.shot = {
                pi: this.pi,
                phi: this.phi,
                ballPosition: this.ball.get().position.clone()
            }
            this.reject();
            this.fly = true;
            this.hitten = false;
            this.isPlayer = isPlayer;
        }
    }

    update(scene) {
        if(this.fly) {
            this.t += 0.1;
            let flyVector = new THREE.Vector3(
                v * this.t * Math.cos(this.shot.phi) * Math.cos(this.shot.pi),
                v * this.t * Math.sin(this.shot.phi) - ((g * this.t * this.t) / 2),
                v * this.t * Math.cos(this.shot.phi) * Math.sin(this.shot.pi)
            ).add(this.shot.ballPosition);
            this.ball.get().position.copy(flyVector);

            let oldt = this.t - 2;

            console.log(!this.hitten, this.isPlayer)

            if(!this.hitten && this.isPlayer) {
                let cameraPos = new THREE.Vector3(
                    v * oldt * Math.cos(this.shot.phi) * Math.cos(this.shot.pi),
                    v * oldt * Math.sin(this.shot.phi) - ((g * oldt * oldt) / 2),
                    v * oldt * Math.cos(this.shot.phi) * Math.sin(this.shot.pi)
                ).add(this.shot.ballPosition);
                console.log("XDD")

                camera.position.copy(cameraPos);
                camera.lookAt(this.ball.get().position.clone());
            }

            const curr = this.ball.get().position.clone();
            if(curr.x.isBetween(1000, 1050) && curr.y.isBetween(0, 10*50) && curr.z.isBetween(-10*50, 10*50)) {
                if(!this.hitten) {
                    let x =  Math.floor(curr.z/50);
                    let y =  Math.floor(curr.y/50);
                    if( scene.getObjectByName(`wall_${x}_${y}`) ) {
                        scene.getObjectByName(`wall_${x}_${y}`).material.color.setHex(0x0000ff);
                        wall.hit(x, y,  v * 0.1 * Math.cos(this.shot.phi) * Math.sin(this.shot.pi), this.isPlayer);
                        this.hitten = true;                
                    }
                }
            } else if(this.isPlayer) {
                    let cameraPos = new THREE.Vector3(
                        v * oldt * Math.cos(this.shot.phi) * Math.cos(this.shot.pi),
                        v * oldt * Math.sin(this.shot.phi) - ((g * oldt * oldt) / 2),
                        v * oldt * Math.cos(this.shot.phi) * Math.sin(this.shot.pi)
                    ).add(this.shot.ballPosition);
        
                    camera.position.copy(cameraPos);
                    camera.lookAt(this.ball.get().position.clone());
            }

            if (this.ball.get().position.clone().y < 0) {
                game.earthquake();
                this.setPos();
                this.fly = false;
                this.t = 0;
            }
        }
    }
}