var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , fs = require('fs')

app.listen(3000);
io.set('log level', 1); 

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  var quads = [];
  var pacman = { x: 0, y: 0, w: 20, h: 20, vx: 5, vy: 5, radius: 10 };

  function collision(rect1, rect2) {
    var x1_1 = rect1.x;
    var y1_1 = rect1.y;
    var x2_1 = rect1.x + rect1.w;
    var y2_1 = rect1.y + rect1.h;    
    var x1_2 = rect2.x;
    var y1_2 = rect2.y;
    var x2_2 = rect2.x + rect2.w;
    var y2_2 = rect2.y + rect2.h;

    return (x1_1 < x2_2) && (x2_1 > x1_2) && (y1_1 < y2_2) && (y2_1 > y1_2);
  }

  socket.on('update', function (data) {
    var i, l, clicks;

    clicks = data.clicks;
    for(i = 0, l = clicks.length; i < l; i++) {
      quads.push({ x: clicks[i].x, y: clicks[i].y, w: 5, h: 5 });
    }

    pacman.x += pacman.vx;
    pacman.y += pacman.vy;

    if(pacman.x > 640 || pacman.x < 0) { pacman.vx = -pacman.vx; }
    if(pacman.y > 480 || pacman.y < 0) { pacman.vy = -pacman.vy; }

    for(i = 0, l = quads.length; i < l; i++) {
      if(collision(quads[i], pacman)) {
        delete quads[i];
        pacman.radius += 0.1;
        pacman.w = pacman.radius * 2;
        pacman.h = pacman.radius * 2;
      }
    }
    quads = quads.filter(function(element) { return element !== undefined });

    socket.emit('render', { quads: quads, pacman: pacman });
  });

  socket.emit('render', { quads: quads, pacman: pacman });
});
