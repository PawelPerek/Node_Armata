class CannonBall {
    constructor() {
        let geometry = new THREE.SphereGeometry( 10, 32, 32 );
        let material = new THREE.MeshBasicMaterial( {
            color: 0xffff00,
            wireframe: true
        } );
        let sphere = new THREE.Mesh( geometry, material );
        this.container = sphere;
    }
    get() {
        return this.container;
    }
}