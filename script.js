const form = document.getElementById('formulario');
const lista = document.getElementById('lista');
const botao = document.getElementById('botao');

let funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
let editando = null;

function salvar() {
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
}

function mostrar() {
    lista.innerHTML = '';
    funcionarios.forEach(function (f, i) {
        lista.innerHTML += `
            <tr>
                <td>${f.nome}</td>
                <td>${f.email}</td>
                <td>${f.telefone}</td>
                <td>${f.cargo}</td>
                <td>${f.departamento}</td>
                <td>R$ ${f.salario}</td>
                <td class="${f.ativo ? 'ativo' : 'arquivado'}">${f.ativo ? 'Ativo' : 'Arquivado'}</td>
                <td>
                    <button onclick="editar(${i})">Editar</button>
                    <button onclick="arquivar(${i})">${f.ativo ? 'Arquivar' : 'Reativar'}</button>
                </td>
            </tr>`;
    });
}

function editar(i) {
    const f = funcionarios[i];
    form.nome.value = f.nome;
    form.email.value = f.email;
    form.telefone.value = f.telefone;
    form.cargo.value = f.cargo;
    form.departamento.value = f.departamento;
    form.salario.value = f.salario;
    editando = i;
    botao.textContent = 'Salvar alterações';
}

function arquivar(i) {
    funcionarios[i].ativo = !funcionarios[i].ativo;
    salvar();
    mostrar();
}

form.addEventListener('submit', function (e) {
    e.preventDefault();
    const dados = Object.fromEntries(new FormData(form));

    if (editando === null) {
        dados.ativo = true;
        funcionarios.push(dados);
    } else {
        dados.ativo = funcionarios[editando].ativo;
        funcionarios[editando] = dados;
        editando = null;
        botao.textContent = 'Cadastrar';
    }

    salvar();
    mostrar();
    form.reset();
});

mostrar();
