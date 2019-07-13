class Net {
    constructor(client) {
        this.io = client;
        
        this.io.on("conn", data => {
            game.draw();
        })

        this.io.on("disc", () => {
            game.delete();
        })

        this.io.on("rotate cannon", data => {
            game.rotate(data.value);
        })

        this.io.on("rotate barrel", data => {
            game.barrel(data.value);
        })
        this.io.on("shot", () => {
            game.fire();
        })
    }

    rotate(value) {
        this.io.emit("rotate cannon", {
            value: value
        })
    }

    barrel(value) {
        this.io.emit("rotate barrel",{
            value: value
        })
    }

    shot(value) {
        this.io.emit("shot")
    }
}