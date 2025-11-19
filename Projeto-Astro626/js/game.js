// =======================
//  STAR BLAZER — COLISÃO PRECISA + EXPLOSÃO ALINHADA (INIMIGOS ATIRADORES)
// =======================
window.addEventListener("DOMContentLoaded", () => {

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const startBtn = document.getElementById("startBtn");
  const fullscreenBtn = document.getElementById("fullscreenBtn");

  // --- IMAGENS ---
  const naveImg = new Image();
  naveImg.src = "assets/img/nave.png";

  const inimigoImg = new Image();
  inimigoImg.src = "assets/img/inimigo.png";

  const inimigoAtiradorImg = new Image();
  inimigoAtiradorImg.src = "assets/img/nave_inimiga.png";

  const pigImg = new Image();
  pigImg.src = "assets/img/pig.png";

  const laserInimigoImg = new Image();
  laserInimigoImg.src = "assets/img/laser_inimigo.png";

  // --- VARIÁVEIS ---
  let nave = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    largura: 150,
    altura: 280,
    velocidade: 0.5,
    angulo: 0,
    vx: 0,
    vy: 0,
    atrito: 0.94,
    escudo: false,
    tiroDuplo: false,
    boost: false
  };

  let teclas = {};
  let jogoAtivo = false;
  let tiros = [];
  let tirosInimigos = [];
  let inimigos = [];
  let inimigosAtiradores = [];
  let particulas = [];
  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  let pontuacao = 0;
  let nivel = 1;
  let dificuldadeBase = 1;
  let tempoJogo = 0;
  let ondaAtiva = false;
  let intervaloTiro;

  // --- CONTROLES ---
  document.addEventListener("keydown", (e) => (teclas[e.key] = true));
  document.addEventListener("keyup", (e) => (teclas[e.key] = false));

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  startBtn.addEventListener("click", iniciarJogo);
  fullscreenBtn.addEventListener("click", toggleFullScreen);
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "f") toggleFullScreen();
  });

  function ajustarCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", ajustarCanvas);
  ajustarCanvas();

  // --- INICIAR JOGO ---
  function iniciarJogo() {
    jogoAtivo = true;
    startBtn.style.display = "none";
    pontuacao = 0;
    nivel = 1;
    dificuldadeBase = 1;
    tiros = [];
    tirosInimigos = [];
    inimigos = [];
    inimigosAtiradores = [];
    particulas = [];
    nave.x = canvas.width / 2;
    nave.y = canvas.height / 2;
    nave.vx = nave.vy = 0;
    nave.escudo = nave.tiroDuplo = nave.boost = false;

    intervaloTiro = setInterval(() => {
      if (jogoAtivo) dispararTiro();
    }, 250);

    loop();
    gerarOnda();
    gerarInimigosAtiradores();
  }

  // --- LOOP ---
  function loop() {
    if (!jogoAtivo) return;
    atualizar();
    desenhar();
    requestAnimationFrame(loop);
  }

  // --- ATUALIZAR ---
  function atualizar() {
    tempoJogo++;
    const nivelDificuldade = 1 + Math.log10(1 + pontuacao / 200 + nivel * 2);

    // Movimento da nave
    let aceleracao = nave.boost ? nave.velocidade * 1.8 : nave.velocidade;
    if (teclas["ArrowLeft"] || teclas["a"]) nave.vx -= aceleracao;
    if (teclas["ArrowRight"] || teclas["d"]) nave.vx += aceleracao;
    if (teclas["ArrowUp"] || teclas["w"]) nave.vy -= aceleracao;
    if (teclas["ArrowDown"] || teclas["s"]) nave.vy += aceleracao;

    nave.vx *= nave.atrito;
    nave.vy *= nave.atrito;
    nave.x += nave.vx;
    nave.y += nave.vy;

    nave.x = Math.max(nave.largura / 2, Math.min(canvas.width - nave.largura / 2, nave.x));
    nave.y = Math.max(nave.altura / 2, Math.min(canvas.height - nave.altura / 2, nave.y));

    const dx = mouse.x - nave.x;
    const dy = mouse.y - nave.y;
    nave.angulo = Math.atan2(dy, dx);

    // Inimigos simples
    inimigos.forEach((enemy, i) => {
      enemy.x += Math.sin(enemy.offset + tempoJogo / 50) * 2;
      enemy.y += enemy.velocidade;
      if (enemy.y - enemy.altura / 2 > canvas.height) inimigos.splice(i, 1);

      tiros.forEach((tiro, j) => {
        const dist = Math.hypot(enemy.x - tiro.x, enemy.y - tiro.y);
        const raioColisao = enemy.largura * 0.25;
        if (dist < raioColisao) {
          criarExplosao(tiro.x, tiro.y, 20, "laranja"); // explosão no ponto do impacto
          inimigos.splice(i, 1);
          tiros.splice(j, 1);
          pontuacao += 15;
        }
      });
    });

    // Inimigos Atiradores (colisão refinada)
    inimigosAtiradores.forEach((enemy, i) => {
      enemy.x += Math.sin(tempoJogo / 40 + enemy.offset) * 1.5;
      enemy.y += Math.sin(tempoJogo / 60 + enemy.offset) * 0.8;

      // probabilidade de tiro ajustada pela dificuldade
      if (Math.random() < 0.004 * nivelDificuldade) {
        const ang = Math.atan2(nave.y - enemy.y, nave.x - enemy.x);
        tirosInimigos.push({
          x: enemy.x,
          y: enemy.y,
          velocidade: 5.5 + nivelDificuldade * 0.8,
          angulo: ang
        });
      }

      tiros.forEach((tiro, j) => {
        const dx = enemy.x - tiro.x;
        const dy = enemy.y - tiro.y;
        const dist = Math.hypot(dx, dy);
        const raioColisao = enemy.largura * 0.22; // 🔧 hitbox ajustada
        if (dist < raioColisao) {
          criarExplosao(tiro.x, tiro.y, 35, "azul"); // 💥 explosão no ponto de impacto real
          inimigosAtiradores.splice(i, 1);
          tiros.splice(j, 1);
          pontuacao += 30;
        }
      });
    });

    // Tiros jogador
    tiros.forEach((tiro, i) => {
      tiro.x += tiro.velocidade * Math.cos(tiro.angulo);
      tiro.y += tiro.velocidade * Math.sin(tiro.angulo);
      if (tiro.x < -50 || tiro.x > canvas.width + 50 || tiro.y < -50 || tiro.y > canvas.height + 50)
        tiros.splice(i, 1);
    });

    // Tiros inimigos
    tirosInimigos.forEach((tiro, i) => {
      tiro.x += tiro.velocidade * Math.cos(tiro.angulo);
      tiro.y += tiro.velocidade * Math.sin(tiro.angulo);
      const dist = Math.hypot(tiro.x - nave.x, tiro.y - nave.y);
      const raioNave = Math.min(nave.largura, nave.altura) * 0.25;
      if (dist < raioNave) {
        criarExplosao(tiro.x, tiro.y, 15, "vermelho");
        if (nave.escudo) {
          nave.escudo = false;
          tirosInimigos.splice(i, 1);
        } else {
          criarExplosao(nave.x, nave.y, 50, "branco");
          fimDeJogo();
        }
      }
      if (tiro.x < 0 || tiro.x > canvas.width || tiro.y < 0 || tiro.y > canvas.height)
        tirosInimigos.splice(i, 1);
    });

    if (inimigos.length === 0 && !ondaAtiva) {
      ondaAtiva = true;
      setTimeout(() => gerarOnda(), 3000);
    }

    particulas.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vida -= 0.02;
      if (p.vida <= 0) particulas.splice(i, 1);
    });
  }

  // --- DESENHAR ---
  function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000011";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particulas.forEach(p => {
      ctx.fillStyle = `rgba(${p.cor}, ${p.vida})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.tamanho, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.save();
    ctx.translate(nave.x, nave.y);
    ctx.rotate(nave.angulo + Math.PI / 2);
    ctx.drawImage(naveImg, -nave.largura / 2, -nave.altura / 2, nave.largura, nave.altura);
    ctx.restore();

    inimigos.forEach(enemy => {
      ctx.drawImage(inimigoImg, enemy.x - enemy.largura / 2, enemy.y - enemy.altura / 2, enemy.largura * 1.3, enemy.altura * 1.3);
    });

    inimigosAtiradores.forEach(enemy => {
      ctx.drawImage(inimigoAtiradorImg, enemy.x - enemy.largura / 2, enemy.y - enemy.altura / 2, enemy.largura * 1.6, enemy.altura * 1.6);
    });

    tiros.forEach(tiro => {
      ctx.save();
      ctx.translate(tiro.x, tiro.y);
      ctx.rotate(tiro.angulo + Math.PI / 2);
      ctx.drawImage(pigImg, -25, -25, 50, 50);
      ctx.restore();
    });

    tirosInimigos.forEach(tiro => {
      ctx.save();
      ctx.translate(tiro.x, tiro.y);
      ctx.rotate(tiro.angulo + Math.PI / 2);
      ctx.drawImage(laserInimigoImg, -15, -15, 30, 30);
      ctx.restore();
    });

    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText(`Pontos: ${pontuacao}`, 20, 30);
    ctx.fillText(`Nível: ${nivel}`, 20, 55);
  }

  // --- SUPORTE ---
  function criarExplosao(x, y, intensidade, corNome = "laranja") {
    const cores = {
      laranja: "255,150,50",
      azul: "80,200,255",
      vermelho: "255,60,60",
      branco: "255,255,255"
    };
    const cor = cores[corNome] || "255,200,100";
    for (let i = 0; i < intensidade; i++) {
      particulas.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        vida: 1,
        tamanho: Math.random() * 3 + 1,
        cor
      });
    }
  }

  function gerarOnda() {
    const nivelDificuldade = 1 + Math.log10(1 + pontuacao / 200 + nivel);
    const quantidade = 4 + Math.floor(nivel / 2);
    const velocidadeBase = 3 + nivelDificuldade;
    for (let i = 0; i < quantidade; i++) {
      const x = Math.random() * (canvas.width - 200) + 100;
      const y = -Math.random() * 200 - 100;
      inimigos.push({
        x,
        y,
        largura: 100,
        altura: 100,
        velocidade: velocidadeBase + Math.random(),
        offset: Math.random() * Math.PI * 2
      });
    }
    nivel++;
    ondaAtiva = false;
  }

  function gerarInimigosAtiradores() {
    if (!jogoAtivo) return;
    const qtd = 1 + Math.floor(nivel / 3);
    for (let i = 0; i < qtd; i++) {
      inimigosAtiradores.push({
        x: Math.random() * (canvas.width - 400) + 200,
        y: Math.random() * 200 + 100,
        largura: 200,
        altura: 200,
        offset: Math.random() * Math.PI * 2
      });
    }
    setTimeout(gerarInimigosAtiradores, 12000 / (1 + nivel * 0.3));
  }

  function dispararTiro() {
    if (!jogoAtivo) return;
    const offsetFrontal = nave.altura / 2.8;
    const criarTiro = (anguloOffset = 0) => {
      const anguloFinal = nave.angulo + anguloOffset;
      tiros.push({
        x: nave.x + Math.cos(anguloFinal) * offsetFrontal,
        y: nave.y + Math.sin(anguloFinal) * offsetFrontal,
        velocidade: 14,
        angulo: anguloFinal
      });
    };
    if (nave.tiroDuplo) {
      criarTiro(0.12);
      criarTiro(-0.12);
    } else criarTiro(0);
  }

  function fimDeJogo() {
    if (!jogoAtivo) return;
    jogoAtivo = false;
    clearInterval(intervaloTiro);
    setTimeout(() => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 42px Arial";
      ctx.fillText("💥 GAME OVER 💥", canvas.width / 2 - 160, canvas.height / 2 - 40);
      ctx.font = "26px Arial";
      ctx.fillText(`Pontuação Final: ${pontuacao}`, canvas.width / 2 - 110, canvas.height / 2 + 10);
      ctx.fillText(`Nível Alcançado: ${nivel}`, canvas.width / 2 - 100, canvas.height / 2 + 45);
      startBtn.innerText = "Tentar Novamente";
      startBtn.style.display = "block";
    }, 500);
  }

  function toggleFullScreen() {
    if (!document.fullscreenElement) canvas.requestFullscreen();
    else document.exitFullscreen();
  }

});
