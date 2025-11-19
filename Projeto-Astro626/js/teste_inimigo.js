window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  // Ajusta o tamanho da tela
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Carrega a imagem da nave inimiga
  const inimigoAtiradorImg = new Image();
  inimigoAtiradorImg.src = "assets/img/nave_inimiga.png";

  // Mensagem de confirmação
  inimigoAtiradorImg.onload = () => {
    console.log("✅ Imagem da nave inimiga carregada!");
    iniciarTeste();
  };

  inimigoAtiradorImg.onerror = () => {
    console.error("❌ Erro ao carregar a imagem. Verifique o caminho ou o nome do arquivo.");
  };

  // Função principal de teste
  function iniciarTeste() {
    const inimigo = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      largura: 120,
      altura: 120,
      offset: Math.random() * Math.PI * 2
    };

    function desenhar() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animação de leve movimento
      inimigo.x += Math.sin(Date.now() / 500 + inimigo.offset) * 2;

      ctx.drawImage(
        inimigoAtiradorImg,
        inimigo.x - inimigo.largura / 2,
        inimigo.y - inimigo.altura / 2,
        inimigo.largura,
        inimigo.altura
      );

      ctx.fillStyle = "white";
      ctx.font = "24px Arial";
      ctx.fillText("Teste da nave inimiga", 30, 40);

      requestAnimationFrame(desenhar);
    }

    desenhar();
  }
});
