window.onload = function() {
    // ***********************
    // global var and const
    const n = 21; // number of petals
    const cnv = document.getElementById("cnv"); 
    setCanvas();
    const ctx = cnv.getContext("2d");
    const poem = document.getElementById("poem");
    const info = document.getElementById("info");
    var daisy, prophecy, li, verse = -1;
    var animation = {'isRunning': true, 'id': undefined};
    var verses = ['', 'not'];

    // ***********************
    // little helpers
    var coords = {
        ctrx: Math.round(ctx.canvas.width/2),
        ctry: Math.round(ctx.canvas.height/2),
        offx: cnv.getBoundingClientRect().left,
        offy: cnv.getBoundingClientRect().top,
        x0: NaN, y0: NaN,
        x1: NaN, y1: NaN,
        getRadFromBase: function() {
            // (-pi; +pi]
            return Math.atan2(this.y1 - this.ctry, this.x1 - this.ctrx);
            //return rad >= 0 ? rad: rad+2*Math.PI;
        },
        getDistFromCtr: function(x, y) {
            // dist center - (x, y)
            return Math.sqrt((Math.pow(x - this.ctrx, 2)) + (Math.pow(y - this.ctry, 2)));
        },
        ctrarea: 0,
        mindist: 0,
        diffpick: 50,
        lastpick: 0
    };
    function setCanvas(proportion = 0.7) {
        if (window.innerWidth < window.innerHeight) {
            cnv.width = (window.innerWidth*proportion);
            cnv.height = (window.innerWidth*proportion);
        }
        else {
            cnv.width = (window.innerHeight*proportion);
            cnv.height = (window.innerHeight*proportion);
        }
        if (cnv.width > window.innerHeight*0.6) {
            cnv.width *= 0.6;
            cnv.height *= 0.6
        }
        cnv.width = parseInt(cnv.width);
        cnv.height = parseInt(cnv.height);
    }
    function sum(arr) {
        let s = (arr.reduce(function (a, b) {
            return a + b;
            }, 0));
        return s;
    }
    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    function padString(string, len, padString="0") {
        string = string.toString();
        return string.length >= len ? string : padString.repeat(len-string.length) + string;
    }

    function getProphecy(p, n) {
        let prophecy = new Array(n).fill().map((i, idx) => ( idx < p ? 0: 1));
        prophecy = shuffle(prophecy);
        return prophecy;
    }
    function yourChoice() {
        prophecy = getProphecy(parseInt(document.getElementById('like').value), n);
        //console.log("prophecy", prophecy);
        li = document.querySelector('input[name="loveinterest"]:checked').value;
        if (li === "*") {
            let li00 = document.getElementById("li00").value;
            if (li00.length != 0) {
                li = li00;
            }
        }
        if (li == "them") { li += " love you "; }
        else { li += " loves you "; }
    }
    // ***********************
    // define daisy: a daisy is a daisy is a daisy...
    class Daisy {
        constructor(cnv, pos, scale, nPetal, lPetal, wPetal) {
            this.cnv = cnv;
            this.ctx = cnv.getContext("2d");
            this.x = pos[0];
            this.y = pos[1];
            this.scale = scale; // relative to canvas size
            this.n = nPetal;
            this.l = Math.min(ctx.canvas.width, ctx.canvas.height) * scale * 0.5;
            this.w = this.l*0.09;
            this.petal = this._createPetal(); // path
            this.rendered = new Array(nPetal).fill(true);
            this.angle = new Array(nPetal).fill().map((item, idx) => (idx*((Math.PI * 2) / this.n)) <=  Math.PI ? (idx*((Math.PI * 2) / this.n)): (idx*((Math.PI * 2) / this.n)) - Math.PI*2);
            this.petalCol = this.ctx.createLinearGradient(0, 0, this.l, 0);
            this.petalCol.addColorStop(0, "#ffffff");
            this.petalCol.addColorStop(0.86, "#ffffff");
            this.petalCol.addColorStop(0.99, "#d07");
            this.petalLineCol = "#d076";
            this.ctrCol = "#ffd000";
            
        }
        _createPetal() {
            let path = new Path2D();
            path.moveTo(0, 0);
            path.lineTo(this.l * 0.8, -this.w);
            path.lineTo(this.l * 0.9, -this.w);
            path.bezierCurveTo(this.l*1.1, -this.w*0.4, this.l*1.1, this.w*0.4, this.l*0.9, this.w);
            path.lineTo(this.l * 0.8, this.w);
            path.closePath();
            path.moveTo(0, 0);
            return path;
        }
        _drawPetal() {
            this.ctx.fillStyle = this.petalCol;
            this.ctx.strokeStyle = this.petalLineCol;
            this.ctx.lineWidth = 1;
            const step = (Math.PI * 2) / this.n;
            this.ctx.setTransform(1, 0, 0, 1, this.x, this.y);
            this.ctx.rotate(0);
            for (var i = 0; i < this.n; i++) {
                if (this.rendered[i]) {
                    this.ctx.fill(this.petal);
                    this.ctx.stroke(this.petal);
                }
                this.ctx.rotate(step);
            }
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        _drawCenter() {
            ctx.strokeStyle = this.ctrCol;
            ctx.fillStyle = this.ctrCol;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.l*0.23 , 0, Math.PI * 2);
            ctx.fill();
        }
        _findClosestPetal(rad) {
            let dist = new Array(this.n);
            for (let i=0; i < this.n; i++) {
                if (this.rendered) {
                    dist[i] = Math.abs(this.angle[i] - rad);
                }
                else {
                    dist[i] = NaN;
                }
            }
            return dist.indexOf(Math.min(...dist));
        }
        updateRenderer(rad) {
            let p = sum(this.rendered);
            let idx = 0;
            if (p > 1) {
                idx = this._findClosestPetal(rad); //console.log(idx, prophecy[idx], this.angle[idx]);
                this.rendered[idx] = false;
            }
            return idx; //p;
        }
        draw() {
            this._drawPetal();
            this._drawCenter();
        }
    }
    // ***********************
    // daisy in action
    function petalUp() {
        if (coords.getDistFromCtr(coords.x0, coords.y0) > coords.ctrarea) {
            coords.x0 = NaN;
            coords.y0 = NaN;
        }
    }
    function petalOff() {
        let pick = animation.id;
        let diff = pick - coords.lastpick;
        if (!isNaN(coords.x0) && (coords.getDistFromCtr(coords.x1, coords.y1) >= coords.mindist) && (diff > coords.diffpick)) {
            coords.lastpick = pick;
            let s0 = sum(daisy.rendered);
            verse = daisy.updateRenderer(coords.getRadFromBase());
            //verse--;
            let v = document.createElement('span');
            v.classList.add("verse");
            let s1 = sum(daisy.rendered);
            v.textContent = `${padString(s1+1, 2)}) ${li} ${verses[prophecy[verse]]}`;
            if (s0 != s1) poem.appendChild(v);
            v.scrollIntoView(0);
            if (s1 == 1) {
                animation.isRunning = false;
                removeCnvListener();
                verse = daisy.updateRenderer(coords.getRadFromBase());
                let v = document.createElement('span');
                v.classList.add("finally");
                v.textContent = `${padString(s1, 2)}) ${li} ${verses[prophecy[verse]]}`;
                setTimeout(function() {
                        poem.appendChild(v); v.scrollIntoView(0);
                        sendLetter(prophecy[verse]);
                    }, 1000);
            }
        }
        coords.x0 = NaN; coords.y0 = NaN;
    }
    function sendLetter(result) {
        let letterbtn = document.getElementById('letterbtn');
        let letter = document.getElementById('letter');
        let cl = document.getElementById('closeLetter');
        let emoji = document.getElementById('emoji');
        let msgs = letter.querySelectorAll('.modal-content');
        if (result == 1) {
            emoji.textContent = '\uD83D\uDC94';
            msgs[0].style.display = 'none';
        }
        else {
            emoji.textContent = '\uD83D\uDC8C';
            msgs[1].style.display = 'none';
        }
        letterbtn.addEventListener('click', function() { 
            document.getElementById('letter').style.display = 'block';
        });
        cl.addEventListener('click', function() {
            document.getElementById('letter').style.display = 'none';
        });
        letterbtn.style.display = 'block';
    }
    
    function startPick(e) {
        coords.x1 = NaN; coords.y1 = NaN;
        if (e.type == 'mousedown') {
            coords.x0 = e.pageX;
            coords.y0 = e.pageY;
        }
        else if (e.type == 'touchstart') {
            coords.x0 = e.changedTouches[0].pageX;
            coords.y0 = e.changedTouches[0].pageY;
        }
        coords.x0 = Math.round(coords.x0 - coords.offx);
        coords.y0 = Math.round(coords.y0 - coords.offy);
        petalUp();
    }
    function movePicking(e) {
        if (e.type == 'mousemove') {
            coords.x1 = e.pageX;
            coords.y1 = e.pageY;
        }
        else if (e.type == 'touchmove') {
            coords.x1 = e.changedTouches[0].pageX;
            coords.y1 = e.changedTouches[0].pageY;
        }
        coords.x1 = Math.round(coords.x1 - coords.offx);
        coords.y1 = Math.round(coords.y1 - coords.offy);
    }
    function endPick(e) {
        if (e.type == 'mouseup') {
            coords.x1 = e.pageX;
            coords.y1 = e.pageY;
        }
        else if (e.type == 'touchend') {
            coords.x1 = e.changedTouches[0].pageX;
            coords.y1 = e.changedTouches[0].pageY;
        }
        coords.x1 = Math.round(coords.x1 - coords.offx);
        coords.y1 = Math.round(coords.y1 - coords.offy);
        petalOff();
    }
    function addCnvListener() {
        ['mousedown', 'touchstart'].forEach( evt => 
            cnv.addEventListener(evt, startPick)
        );
        ['mousemove', 'touchmove'].forEach( evt => 
            cnv.addEventListener(evt, movePicking)
        );
        ['mouseup', 'touchend'].forEach( evt => 
            cnv.addEventListener(evt, endPick)
        );
    }
    function removeCnvListener() {
        ['mousedown', 'touchstart'].forEach( evt => 
            cnv.removeEventListener(evt, startPick)
        );
        ['mousemove', 'touchmove'].forEach( evt => 
            cnv.removeEventListener(evt, movePicking)
        );
        ['mouseup', 'touchend'].forEach( evt => 
            cnv.removeEventListener(evt, endPick)
        );
    }
    function drawPicking() {
        ctx.strokeStyle = "#ff9900";
        ctx.lineWidth = "3";
        ctx.beginPath();
        ctx.moveTo(coords.x0, coords.y0);
        ctx.lineTo(coords.x1, coords.y1);
        ctx.closePath();
        ctx.stroke();
    }
    // ***********************
    // animation loop: where the magic happens
    function animate(timestamp) {
        // draw
        ctx.clearRect(0, 0, cnv.width, cnv.height);
        daisy.draw();
        drawPicking();
        //
        animation.id = window.requestAnimationFrame(animate);
        if (!animation.isRunning) {
            window.cancelAnimationFrame(animation.id);
        }
    }
    
    // ***********************
    // run
    daisy = new Daisy(cnv, [coords.ctrx, coords.ctry], 0.9, n);
    coords.ctrarea = daisy.l*0.23;
    coords.mindist = daisy.l*0.7;
    daisy.draw();
    document.getElementById("consent").checked = false;
    document.getElementById('closeInfo').addEventListener('click', function() { info.style.display = 'none'; });
    document.getElementById('infobtn').addEventListener('click', function() { info.style.display = 'block'; });
    document.getElementById('closeSelect').addEventListener('click', function() { 
        if(document.getElementById("consent").checked) {
            document.getElementById('select').style.display = 'none'; 
            yourChoice();
            addCnvListener();
            animate();
        }
    });
    document.getElementById('select').style.display = 'block';
    document.getElementById('like').max = n-1;
    document.getElementById('like').value = Math.round((n-1)/2);
}