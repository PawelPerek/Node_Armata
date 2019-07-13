let http = require("http");
let fs = require("fs");
let socketio = require("socket.io");

const PORT = 80;
const filename = "public";

let app = http.createServer((req, res) => {
    if (req.method == "GET") {
        let content;
        if (req.url == "/") {
            res.writeHead(200, { "Content-Type": "text/html;charset=utf-8" });
            content = fs.readFileSync(`./${filename}/index.html`);
        }
        else if (req.url.includes("html")) {
            res.writeHead(200, { "Content-Type": "text/html" });
            content = fs.readFileSync(`./${filename}/${req.url}`);
        }
        else if (req.url.includes("js")) {
            res.writeHead(200, { "Content-Type": "application/javascript" });
            content = fs.readFileSync(`./${filename}/${req.url}`);
        }
        else if (req.url.includes("css")) {
            res.writeHead(200, { "Content-Type": "text/css" });
            content = fs.readFileSync(`./${filename}/${req.url}`);
        }
        else if (req.url.includes("img")) {
            res.writeHead(200, { "Content-Type": "image/jpeg" });
            content = fs.readFileSync(`./${filename}/${req.url}`);
        }
        res.end(content);
    }
})

app.listen(PORT, () => "Zahostowano na " + PORT);

let io = socketio.listen(app);
let players = 0;
let isFirst = false;

io.on("connection", client => {
    players++;
    console.log(players)
    let wasFirst = false;
    if(!isFirst) {
        isFirst = true;
        wasFirst = true;
    }

    client.emit("onconnect", {
        first: wasFirst,
        numberOfPlayers: players
    })

    client.broadcast.emit("conn");

    client.on("rotate barrel", data => {
        client.broadcast.emit("rotate barrel", {value: data.value})
    })

    client.on("rotate cannon", data => {
        client.broadcast.emit("rotate cannon", {value: data.value})
    })

    client.on("shot", data => {
        client.broadcast.emit("shot")
    })

    client.on("disconnect", () => {
        players--;
        if(wasFirst) {
            isFirst = false; 
        }
        client.broadcast.emit("disc");
    })
})