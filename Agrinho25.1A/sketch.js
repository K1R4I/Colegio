// --- Variáveis Globais do Jogo ---
const game = {
    resources: {
        money: 1000,
        food: 50,
        water: 50,
        materials: 20
    },
    // Definimos as propriedades dos terrenos no canvas
    landPlots: [
        { id: 1, type: "empty", content: null, x: 50, y: 50, w: 100, h: 100 },
        { id: 2, type: "empty", content: null, x: 170, y: 50, w: 100, h: 100 },
        { id: 3, type: "empty", content: null, x: 50, y: 170, w: 100, h: 100 },
        { id: 4, type: "empty", content: null, x: 170, y: 170, w: 100, h: 100 }
    ],
    citizenHappiness: 70,
    gameTime: 0,
    gameLoopInterval: null, // Para controlar o loop lógico do jogo
    dayDuration: 1000, // Duração de um "dia" em milissegundos (1 segundo)
    lastGameLoopTime: 0, // Guarda o último tempo em que o gameLoop foi executado
    selectedPlot: null // Para saber qual terreno está selecionado
};

// --- Configurações do p5.js ---
function setup() {
    createCanvas(600, 400); // Cria um canvas de 600x400 pixels
    console.log("Setup do p5.js concluído!");
    initializeGame();
}

function draw() {
    background(135, 206, 235); // Céu azul claro como fundo

    // Desenha os terrenos
    game.landPlots.forEach(plot => {
        if (plot.type === "empty") {
            fill(120, 180, 80); // Cor de grama para terrenos vazios
        } else if (plot.type === "farm") {
            fill(100, 150, 60); // Cor mais escura para fazendas
        }
        stroke(50);
        rect(plot.x, plot.y, plot.w, plot.h);

        // Desenha o conteúdo do terreno (texto simples por enquanto)
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(12);
        if (plot.content) {
            text(plot.content.name, plot.x + plot.w / 2, plot.y + plot.h / 2);
        } else {
            text("Vazio", plot.x + plot.w / 2, plot.y + plot.h / 2);
        }

        // Destaca o terreno selecionado
        if (game.selectedPlot && game.selectedPlot.id === plot.id) {
            noFill();
            stroke(255, 255, 0); // Amarelo
            strokeWeight(3);
            rect(plot.x, plot.y, plot.w, plot.h);
            strokeWeight(1); // Volta ao padrão
        }
    });

    // Lógica do loop principal do jogo (baseada no tempo)
    // Isso garante que o gameLoop seja chamado em intervalos fixos,
    // independentemente da taxa de quadros do p5.js.
    if (millis() - game.lastGameLoopTime > game.dayDuration) {
        gameLoop();
        game.lastGameLoopTime = millis();
    }

    updateUI(); // Atualiza os displays HTML
}

// --- Funções de Interação (p5.js) ---
function mousePressed() {
    // Verifica se o clique foi em um terreno
    for (let plot of game.landPlots) {
        if (mouseX > plot.x && mouseX < plot.x + plot.w &&
            mouseY > plot.y && mouseY < plot.y + plot.h) {
            game.selectedPlot = plot;
            console.log(`Terreno ${plot.id} selecionado.`);
            // Aqui você pode ativar um menu de ações para o terreno selecionado
            return; // Sai da função após encontrar o terreno clicado
        }
    }
    game.selectedPlot = null; // Se clicou fora de qualquer terreno, deseleciona
}

// --- Funções do Jogo (Mantendo a lógica principal) ---

function initializeGame() {
    console.log("Iniciando jogo Agro Urbano!");
    game.lastGameLoopTime = millis(); // Inicializa o tempo para o gameLoop
}

function gameLoop() {
    game.gameTime++;
    console.log(`Dia: ${game.gameTime}`);

    game.resources.food -= 2;
    game.resources.water -= 1;
    game.resources.money += 5;

    if (game.resources.food < 0) {
        game.resources.food = 0;
        game.citizenHappiness -= 5;
        console.warn("Falta de comida! Felicidade dos cidadãos diminuindo.");
    }

    game.citizenHappiness = constrain(game.citizenHappiness, 0, 100); // Limita entre 0 e 100

    if (game.citizenHappiness <= 0) {
        endGame("Sua cidade ficou infeliz e foi abandonada!");
    }

    // Lógica de produção das fazendas
    game.landPlots.forEach(plot => {
        if (plot.type === "farm" && plot.content && plot.content.production) {
            game.resources.food += plot.content.production.food;
        }
    });
}

function updateUI() {
    document.getElementById('moneyDisplay').textContent = game.resources.money;
    document.getElementById('foodDisplay').textContent = game.resources.food;
    document.getElementById('waterDisplay').textContent = game.resources.water;
    document.getElementById('materialsDisplay').textContent = game.resources.materials;
    document.getElementById('happinessDisplay').textContent = game.citizenHappiness;
    document.getElementById('gameTimeDisplay').textContent = game.gameTime;
    // Não precisamos atualizar os terrenos aqui, pois o draw() do p5.js já faz isso.
}

function buildFarm() {
    // Tenta encontrar o primeiro terreno vazio
    const emptyPlot = game.landPlots.find(p => p.type === "empty");

    if (emptyPlot) { // Se um terreno vazio foi encontrado
        if (game.resources.money >= 100 && game.resources.materials >= 10) {
            game.resources.money -= 100;
            game.resources.materials -= 10;
            emptyPlot.type = "farm"; // Altera o tipo do terreno encontrado
            emptyPlot.content = { name: "Fazenda", production: { food: 5 } };
            console.log(`Fazenda construída no terreno ${emptyPlot.id}!`);
            game.selectedPlot = null; // Desseleciona qualquer terreno após construir
        } else {
            console.log("Recursos insuficientes para construir uma fazenda.");
        }
    } else {
        console.log("Não há terrenos vazios disponíveis para construir.");
    }
}
function harvestFarm() {
    if (game.selectedPlot && game.selectedPlot.type === "farm") {
        if (game.selectedPlot.content && game.selectedPlot.content.production && game.selectedPlot.content.production.food) {
            game.resources.food += game.selectedPlot.content.production.food;
            console.log(`Alimentos colhidos da fazenda no terreno ${game.selectedPlot.id}!`);
            // Poderíamos adicionar um cooldown para colheita aqui, ou um sistema de "pronto para colher"
        }
    } else {
        console.log("Nenhuma fazenda selecionada para colher.");
    }
}

function endGame(message) {
    noLoop(); // Para o loop de desenho do p5.js
    alert(`Fim de Jogo! ${message}`);
    console.log(`Jogo finalizado: ${message}`);
}

// --- Event Listeners para botões HTML ---
document.addEventListener('DOMContentLoaded', () => {
    const buildFarmButton = document.getElementById('buildFarmButton');
    if (buildFarmButton) {
        buildFarmButton.addEventListener('click', buildFarm);
    }

    const harvestButton = document.getElementById('harvestButton');
    if (harvestButton) {
        harvestButton.addEventListener('click', harvestFarm);
    }
});

