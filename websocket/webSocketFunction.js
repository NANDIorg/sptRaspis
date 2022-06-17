const funcWbSocket = {
    ping (ws, metadata, body, clients) {
        [...clients.keys()].forEach((client) => {
            const metadata = clients.get(client)
            client.send(JSON.stringify({
                message : metadata.id
            }));
        });
    }
}

module.exports = funcWbSocket