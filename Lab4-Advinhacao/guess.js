// Gera número aleatório entre 0 e 99
var numeroSecreto = Math.floor(Math.random() * 100);

function verificar() {
    var valor = document.getElementById("inputNumero").value;
    var msg = document.getElementById("mensagem");

    if (valor === "") {
        msg.innerHTML = "Digite um número!";
        return;
    }

    valor = Number(valor);

    if (valor === numeroSecreto) {
        msg.innerHTML = "Parabéns! Você acertou!";
        msg.style.setProperty("background-color", "green");
    } 
    else if (valor > numeroSecreto) {
        msg.innerHTML = "O número é menor!";
        msg.style.setProperty("background-color", "red");
    } 
    else {
        msg.innerHTML = "O número é maior!";
        msg.style.setProperty("background-color", "red");
    }
}

// Liga o botão à função
document.getElementById("btnVerificar").addEventListener("click", verificar);
