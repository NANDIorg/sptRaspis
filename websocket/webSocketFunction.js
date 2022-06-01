const funcWbSocket = {
    ping (ws, metadata, body, clients) {
        console.log(body);
        [...clients.keys()].forEach((client) => {
            const metadata = clients.get(client)
            client.send(JSON.stringify({
                message : metadata.id
            }));
        });
    },
    async sendMessage(ws, metadata,body,clients) {
        if (!metadata.token) {
            return
        }
        clients.forEach(element => {
            console.log(element)
        });
        ws.send("s")
    }
}

module.exports = funcWbSocket