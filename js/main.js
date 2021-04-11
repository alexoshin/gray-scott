var rd;
function onload() {
    document.body.style.opacity = 1;
    rd = setup_reaction_diffusion(document.getElementById('canvas'), 200, 200);
    rd.start();
    var instructions = document.getElementById('instructions');
    instructions.innerText = '----- Key commands -----\n'
        + '1: change pattern - spots\n'
        + '2: change pattern - stripes\n'
        + '3: change pattern - waves\n'
        + '4: change pattern - varying\n'
        + 'r: reset simulation\n'
        + 'p: pause/unpause';
}
window.addEventListener('load', onload);

function setup_reaction_diffusion(canvas, gridWidth, gridHeight) {
    var vars = {};

    var candidate_size = Math.max(window.innerWidth / 2, window.innerHeight);
    const cellSize = Math.round(candidate_size / gridWidth);
    canvas.width = cellSize * gridWidth;
    canvas.height = canvas.width;

    const ctx = canvas.getContext('2d');

    const colorBlack = 'rgb(0, 0, 0)';
    const colorWhite = 'rgb(255, 255, 255)';
    const colorGray = 'rgb(128, 128, 128)';

    var u = [];
    var v = [];

    var interval = 0;
    var show_u = true;
    var type = 'spots';
    var sim_time = 0;
    const draw_every = 10;

    // Sim parameters
    const dt = 2.5;
    const h = 1.0;
    const max_noise = 0.2;

    // Reaction parameters
    var k = 0.0625;
    var f = 0.035;

    // Diffusion parameters
    const r_u = 0.082;
    const r_v = 0.041;
    const alpha_u = r_u * dt / (h * h);
    const alpha_v = r_v * dt / (h * h);

    var k_grid = [];
    var f_grid = [];
    const k_min = 0.03;
    const k_max = 0.07;
    const f_min = 0.0;
    const f_max = 0.08;
    const k_range = k_max - k_min;
    const f_range = f_max - f_min;
    for (var y = 1; y < gridHeight + 1; y++) {
        k_grid[y] = [];
        f_grid[y] = [];
        const f_val = f_max - ((y - 1) / (gridHeight - 1)) * f_range;
        for (var x = 1; x < gridWidth + 1; x++) {
            const k_val = k_min + ((x - 1) / (gridWidth - 1)) * k_range;
            k_grid[y][x] = k_val;
            f_grid[y][x] = f_val;
        }
    }

    // Initialize the concentration grids with random concentrations
    vars.initialize_grids = function() {
        var prob;
        if (type == 'waves') {
            prob = 0.1;
        } else {
            prob = 0.5;
        }
        for (var y = 1; y < gridHeight + 1; y++) {
            u[y] = [];
            v[y] = [];
            for (var x = 1; x < gridWidth + 1; x++) {
                if (Math.random() < prob) {
                    u[y][x] = 0.5 + Math.random() * max_noise - max_noise / 2;
                    v[y][x] = 0.25 + Math.random() * max_noise - max_noise / 2;
                } else {
                    u[y][x] = 1.0;
                    v[y][x] = 0.0;
                }
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
        interval = window.setInterval(loop, 5);
    }

    // Stop the sim
    vars.stop = function() {
        window.clearInterval(interval);
        interval = 0;
    }

    // Main sim loop
    function loop() {
        advance_sim();

        sim_time += 1;
        if (sim_time % draw_every == 0) {
            draw();
        }
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
        if (type == 'varying') {
            for (var y = 1; y < gridHeight + 1; y++) {
                for (var x = 1; x < gridWidth + 1; x++) {
                    const uvv = u[y][x] * v[y][x] * v[y][x];
                    u[y][x] = u[y][x] + (f_grid[y][x] * (1 - u[y][x]) - uvv) * dt;
                    v[y][x] = v[y][x] + (-(f_grid[y][x] + k_grid[y][x]) * v[y][x] + uvv) * dt;
                }
            }
        } else {
            for (var y = 1; y < gridHeight + 1; y++) {
                for (var x = 1; x < gridWidth + 1; x++) {
                    const uvv = u[y][x] * v[y][x] * v[y][x];
                    u[y][x] = u[y][x] + (f * (1 - u[y][x]) - uvv) * dt;
                    v[y][x] = v[y][x] + (-(f + k) * v[y][x] + uvv) * dt;
                }
            }
        }
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
                const intensity = ((c[y][x] - min) / range) * 255.0;
                ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
                ctx.fillRect((x - 1) * cellSize, (y - 1) * cellSize, cellSize, cellSize);
            }
        }

        ctx.strokeStyle = colorGray;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
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

    function keypress(event) {
        if (event.code == 'KeyR') {
            vars.initialize_grids();
        } else if (event.code == 'KeyP') {
            if (interval != 0) {
                vars.stop();
            } else {
                vars.start();
            }
        } else if (event.code == 'Digit1') {
            type = 'spots';
            k = 0.0625;
            f = 0.035;
            vars.initialize_grids();
        } else if (event.code == 'Digit2') {
            type = 'stripes';
            k = 0.06;
            f = 0.035;
            vars.initialize_grids();
        } else if (event.code == 'Digit3') {
            type = 'waves';
            k = 0.0475;
            f = 0.0118;
            vars.initialize_grids();
        } else if (event.code == 'Digit4') {
            type = 'varying';
            vars.initialize_grids();
        }
    }

    window.addEventListener('keypress', keypress);

    vars.initialize_grids();
    return vars;
}
