var rd;
function onload() {
    document.body.style.opacity = 1;
    rd = setup_reaction_diffusion(document.getElementById('canvas'), 200, 200);
    rd.start();
    var instructions = document.getElementById('instructions');
    instructions.innerText = '----- Key commands -----\n';
}
window.addEventListener('load', onload);

function setup_reaction_diffusion(canvas, gridWidth, gridHeight) {
    var vars = {};

    canvas.width = Math.max(window.innerWidth / 2, window.innerHeight);
    canvas.height = canvas.width;
    const ctx = canvas.getContext('2d');

    const colorBlack = 'rgb(0, 0, 0)';
    const colorWhite = 'rgb(255, 255, 255)';
    const colorGray = 'rgb(128, 128, 128)';

    const cellWidth = canvas.width / gridWidth;
    const cellHeight = canvas.height / gridHeight;
    var u = [];
    var v = [];

    var interval = 0;
    var show_u = true;

    const dt = 2.5;
    const h = 1.0;

    const r_u = 0.082;
    const r_v = 0.041;

    const alpha_u = r_u * dt / (h * h);
    const alpha_v = r_v * dt / (h * h);

    // Initialize the concentration grids with random concentrations
    vars.initialize_grids = function() {
        for (var y = 1; y < gridHeight + 1; y++) {
            u[y] = [];
            v[y] = [];
            for (var x = 1; x < gridWidth + 1; x++) {
                u[y][x] = Math.random();
                v[y][x] = Math.random();
            }
        }
        fill_boundary();
    }

    // Fill 1-cell boundary around the grid with adjacent values for Neumann
    // method, i.e. the derivative at the boundary is held constant
    function fill_boundary() {
        u[0] = [];
        v[0] = [];
        u[gridHeight + 1] = [];
        v[gridHeight + 1] = [];

        for (var x = 1; x < gridWidth + 1; x++) {
            u[0][x] = u[1][x];
            v[0][x] = v[1][x];

            u[gridHeight + 1][x] = u[gridHeight][x];
            v[gridHeight + 1][x] = v[gridHeight][x];
        }

        for (var y = 1; y < gridWidth + 1; y++) {
            u[y][0] = u[y][1];
            v[y][0] = v[y][1];

            u[y][gridWidth + 1] = u[y][gridWidth];
            v[y][gridWidth + 1] = v[y][gridWidth];
        }
    }

    // Start the sim
    vars.start = function() {
        interval = window.setInterval(loop, 75);
    }

    // Stop the sim
    vars.stop = function() {
        window.clearInterval(interval);
        interval = 0;
    }

    // Main sim loop
    function loop() {
        advance_sim();
        draw();
    }

    // Advance the reaction-diffusion sim one step
    function advance_sim() {
        diffusion();
        reaction();
        fill_boundary();
    }

    // Diffusion of concentration use simple forward Euler integration
    function diffusion() {
        var u_new = [];
        var v_new = [];

        for (var y = 1; y < gridHeight + 1; y++) {
            u_new[y] = [];
            v_new[y] = [];

            for (var x = 1; x < gridWidth + 1; x++) {
                const L_u = u[y - 1][x] + u[y + 1][x] + u[y][x - 1] + u[y][x + 1] - 4 * u[y][x];
                const L_v = v[y - 1][x] + v[y + 1][x] + v[y][x - 1] + v[y][x + 1] - 4 * v[y][x];

                u_new[y][x] = u[y][x] + alpha_u * L_u;
                v_new[y][x] = v[y][x] + alpha_v * L_v;
            }
        }

        u = u_new;
        v = v_new;
    }

    function reaction() {

    }

    // Draw the current state to the canvas
    function draw() {
        ctx.fillStyle = colorWhite;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        var c;
        if (show_u) {
            c = u;
        } else {
            c = v;
        }
        const min_max = get_min_max(c);
        const min = min_max[0];
        const max = min_max[1];
        const range = max - min;

        for (var y = 1; y < gridHeight + 1; y++) {
            for (var x = 1; x < gridWidth + 1; x++) {
                var intensity = (c[y][x] - min) / range * 255.0;
                ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
                ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
            }
        }
    }

    // Get the min and max value of a given concentration array
    function get_min_max(arr) {
        var min = arr[1][1];
        var max = arr[1][1];

        for (var y = 1; y < gridHeight + 1; y++) {
            for (var x = 1; x < gridWidth + 1; x++) {
                if (arr[y][x] < min) {
                    min = arr[y][x];
                } else if (arr[y][x] > max) {
                    max = arr[y][x];
                }
            }
        }

        if (min == max) {
            max += 1e-5;
        }

        return [min, max];
    }

    vars.initialize_grids();
    return vars;
}
