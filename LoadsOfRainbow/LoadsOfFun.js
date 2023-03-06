window.onload = () => {
    const sec = 13;


    const btn = document.getElementById("btn");
    const cnv = document.getElementById("cnv");
    canvas1to1(cnv);
    const ctx = cnv.getContext("2d");
    const [ctrX, ctrY] = [parseInt(cnv.width/2), parseInt(cnv.height/2)];


    var id;
    var isLoading = false;
    var startT, lastT = 0, nowT = 0;
    const totalT = sec*1000;
    const deltaT = 1000;
    var counter = 0, pp = 0;


    id = loadBow();
    btn.addEventListener("click", () => {
        ctx.clearRect(0, 0, cnv.width, cnv.height);
        isLoading = true;
        startT = Date.now();
        btn.disabled = true;
        btn.textContent = "Good things take time..."
    });


    function canvas1to1(cnv, scale = 1) {
        // get size of parent element
        let dimW = cnv.parentElement.clientWidth;
        let dimH = cnv.parentElement.clientHeight;
        // minimum size
        let dimMin = dimW < dimH ? dimW : dimH;
        cnv.width = parseInt(dimMin * scale);
        cnv.height = cnv.width;
    }

    function drawRainbow(ctx, x, y, minRadius, maxRadius, colors, fromPi, toPi) {
        let rStep = (maxRadius - minRadius) / colors.length;
        ctx.strokeStyle = "transparent";
        for (let idx in colors) {
            ctx.fillStyle = colors[idx];

            if (idx == colors.length - 1) {
                ctx.strokeStyle = colors[idx];
            }
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.arc(x, y,  (colors.length-idx)*rStep, fromPi, toPi);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }

    function loadBow(ts) {
        nowT = Date.now();

        if (isLoading) {
            ctx.clearRect(0, 0, cnv.width, cnv.height);
            drawRainbow(ctx, ctrX, ctrY,
                        ctrX*0.15, ctrX*1,
                        ["#ff0000",
                         "#ff9900",
                         "#ffff00",
                         "#5dff00",
                         "#003eff",
                         "#bf36f9",
                         "#bee"],
                        1 * Math.PI,
                        (1 + pp) * Math.PI);
        }

        if (isLoading && (nowT - lastT) >= deltaT) {
            //console.log(counter, pp);
            counter++;
            pp = counter * (1 / (totalT / deltaT));
            lastT = nowT;
            if (pp > 1) {
                isLoading = false;
                pp = 0, counter = 0;
                //console.log(nowT - startT, pp);

                btn.textContent = "It is the beginning of something grand!";
                setTimeout(() => {
                    btn.textContent = "Searching for the end of the rainbow?";
                    btn.disabled = false;
                    ctx.clearRect(0, 0, cnv.width, cnv.height);
                }, 7000);
            }
        }
        id = window.requestAnimationFrame(loadBow);
    }

}