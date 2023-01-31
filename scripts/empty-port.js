const net = require('net');

function find_empty_port(default_port = null) {
    let _port = default_port || 10000 + Math.floor(Math.random() * 1000);
    let port = parseInt(_port);

    let socket = new net.Socket();
    let server = new net.Server();


    const port_limit = parseInt(_port) + 10000;
    function loop() {
        if (port >= port_limit) {
            throw new Error(port_limit + ' 番まで空き port がありません');
        } else {
            port++;
        }

        socket.connect(port, '127.0.0.1', _ => {
            socket.destroy();
            loop();
        });
    };


    return new Promise((resolve) => {
        socket.connect(port, '127.0.0.1', _ => {
            socket.destroy();
            loop();
        });

        socket.on('error', (e) => {
            try {
                server.listen(port, '127.0.0.1');
                server.close();

                resolve(port);
            } catch(__) {
                loop();
            };
        });
    });
};


module.exports = find_empty_port;
