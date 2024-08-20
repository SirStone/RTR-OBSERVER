function drawBackground() {
    bctx.clearRect(0, 0, bctx.canvas.width, bctx.canvas.height)
    bctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    bctx.fillRect(0, 0, bctx.canvas.width, bctx.canvas.height)
    bctx.fillStyle = 'lime'

    // north
    canvas_arrow(bctx, bctx.canvas.width/2, bctx.canvas.height/2, bctx.canvas.width/2, 20)
    bctx.fillText('270', bctx.canvas.width/2-8, 12)
    
    // south
    canvas_arrow(bctx, bctx.canvas.width/2, bctx.canvas.height/2, bctx.canvas.width/2, bctx.canvas.height-20)
    bctx.fillText('90', bctx.canvas.width/2-6, bctx.canvas.height-4)

    // west
    canvas_arrow(bctx, bctx.canvas.width/2, bctx.canvas.height/2, 20, bctx.canvas.height/2)
    bctx.fillText('180', 2, bctx.canvas.height/2+3)

    // east
    canvas_arrow(bctx, bctx.canvas.width/2, bctx.canvas.height/2, bctx.canvas.width-20, bctx.canvas.height/2)
    bctx.fillText('0', bctx.canvas.width-8, bctx.canvas.height/2+3)

    bctx.strokeStyle = "black"
    bctx.stroke()

    // axes
    canvas_arrow(bctx, 1, 1, 1, bctx.canvas.height-1) // Y
    canvas_arrow(bctx, 1, 1, bctx.canvas.width-1, 1) // X
    
    bctx.strokeStyle = "lime"
    bctx.stroke()
}

function clearBattlefield() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

function drawRadar(botstate, ratio, x, y, radarRadius) {
    var radar_radius = radarRadius * ratio

    var angle1 = botstate.radarDirection-botstate.radarSweep
    var angle2 = botstate.radarDirection

    if(angle1 > angle2) {
        var from_angle = angle1
        var to_angle = angle2
    }
    else {
        var from_angle = angle2
        var to_angle = angle1
    }

    // from
    var linetoX1 = radar_radius * Math.cos((from_angle) * oneDegree) + x
    var linetoY1 = radar_radius * Math.sin((from_angle) * oneDegree) + y

    // to
    var linetoX2 = radar_radius * Math.cos((to_angle) * oneDegree) + x
    var linetoY2 = radar_radius * Math.sin((to_angle) * oneDegree) + y

    // drawing
    ctx.beginPath()    
    ctx.moveTo(linetoX1, linetoY1)
    ctx.lineTo(x, y)
    ctx.lineTo(linetoX2, linetoY2)

    // style
    // ctx.setLineDash([5,4])
    ctx.strokeStyle = botstate.scanColor ? botstate.scanColor : 'white'

    // draw!
    ctx.stroke()
}

function drawHittingCircle(botstate, ratio, x, y) {
    var hittingCircle_radius = 18 * ratio
    ctx.beginPath()
    ctx.arc(x, y, hittingCircle_radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = botstate.bodyColor ? botstate.bodyColor : 'white'
    ctx.fill()
    return hittingCircle_radius
}

function drawGun(botstate, ratio, x, y, gun_radius) {
    var angle = botstate.gunDirection
    var linetoX = gun_radius * ratio * Math.cos((angle) * oneDegree) + x
    var linetoY = gun_radius * ratio * Math.sin((angle) * oneDegree) + y

    // drawing
    ctx.moveTo(x, y)
    ctx.lineTo(linetoX, linetoY)

    // style
    // ctx.setLineDash([])
    ctx.strokeStyle = botstate.gunColor ? botstate.gunColor : 'white'
    
    // draw!
    ctx.stroke()
}

function drawDirection(botstate, x, y, ratio) {
    ctx.moveTo(x, y)
    var angle = botstate.direction
    var linetoX = 50 * ratio * Math.cos((angle) * oneDegree) + x
    var linetoY = 50 * ratio * Math.sin((angle) * oneDegree) + y
    ctx.setLineDash([])
    ctx.strokeStyle = botstate.bodyColor ? botstate.bodyColor : 'white'
    canvas_arrow(ctx, x, y, linetoX, linetoY)
    ctx.stroke()
}

function drawBullet(bulletState, ratio) {
    var x = bulletState.x * ratio
    var y = bulletState.y * ratio

    var radius = 1+bulletState.power*ratio*2
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = bulletState.color ? bulletState.color : 'white'
    ctx.fill()
}

function drawId(botState, x, y, ratio, hittingCircle_radius) {
    ctx.fillStyle = botState.bodyColor ? 'white' : 'black'
    ctx.font = `${hittingCircle_radius}px Arial`
    var shift = (hittingCircle_radius*0.5)
    ctx.fillText(botState.id, x-shift, y+shift)
}

function canvas_arrow(context, fromx, fromy, tox, toy) {
    var headlen = 10; // length of head in pixels
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}