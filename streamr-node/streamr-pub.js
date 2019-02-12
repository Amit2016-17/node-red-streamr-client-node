const StreamrClient = require('streamr-client')

module.exports = function (RED) {
    const webSocketDataApiUrl = 'wss://www.streamr.com/api/v1/ws'
    const httpsDataApiUrl = 'https://www.streamr.com/api/v1'
    function StreamrClientNode(config) {
        RED.nodes.createNode(this, config)
        this.status({
            fill: 'red', shape: 'ring', text: 'disconnected'
        })
        const node = this
        const { apiKey } = this.credentials
        const streamId = this.credentials.stream

        node.on('input', function (msg) {
            if (apiKey && streamId && msg) {
                const client = new StreamrClient({
                    apiKey: this.credentials.apiKey,
                    url: webSocketDataApiUrl,
                    restUrl: httpsDataApiUrl
                })

                client.getOrCreateStream({
                    name: streamId,
                }).then((stream) => {
                    stream.produce(msg.payload)
                        .catch((err) => {
                            console.log('Streamr node error:', err)
                        })
                })

                client.on('connected', () => {
                    this.status({
                        fill: 'green', shape: 'dot', text: 'connected'
                    })
                })

                client.on('error', () => {
                    this.status({
                        fill: 'red', shape: 'ring', text: 'Client error!'
                    })
                })

                client.on('disconnected', () => {
                    this.status({
                        fill: 'red', shape: 'ring', text: 'disconnected'
                    })
                })

                this.on('close', function () {
                    client.disconnect()
                    this.status({
                        fill: 'red', shape: 'ring', text: 'disconnected'
                    })
                })
            }
        })
    }
    RED.nodes.registerType('streamr-pub', StreamrClientNode, {
        credentials: {
            apiKey: {
                type: 'text', required: true
            },
            streamId: {
                type: 'text', required: true
            }
        }
    })
}
