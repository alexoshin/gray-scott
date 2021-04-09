var rd;
function onload() {
    document.body.style.opacity = 1;
    rd = setup_reaction_diffusion(document.getElementById('canvas'), 200, 200);
    // rd.start();
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
    var grid = [];
}
