const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 13373 });
const clients = require('./client')
const WebSocketFuntion = require("./webSocketFunction")

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

wss.on('connection', (ws) => {
    const id = uuidv4();
    const color = Math.floor(Math.random() * 360);
    const metadata = { id, color };
    ws.send(JSON.stringify({body : "Вы подключены"}))
    clients.set(ws, metadata);

    ws.on("close",()=>{
        const metadataClose = clients.get(ws)
        console.log(`Чел с id : ${metadataClose.id} закрыл соеденение`);
        clients.delete(ws)
    })

    ws.on("message",(messageAsString)=>{
        let request = {};
        try {
            request = JSON.parse(messageAsString);
        } catch (e) {
            console.error('WS JSON parse error', messageAsString, e);
            ws.send('{"error": "JSON parse error"}');
            return;
        }

        const metadata = clients.get(ws);

        if (!request.method) {
            ws.send('{"error": "No method specified"}');
            return;
        }

        if (request.method === "setToken") {
            metadata.token = request.body.token
            clients.set(ws, metadata)
            console.log(metadata);
        } else if(!WebSocketFuntion[request.method]) {
            ws.send('{"error": "Unknown method"}');
            return;
        } else {
            WebSocketFuntion[request.method](ws, metadata, request.body, clients)
        }

        
    })
})