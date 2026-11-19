const STORAGE_KEY = 'hrmasters_funcionarios';
const DEPARTMENTS_KEY = 'hrmasters_departamentos';

// Datas ficam salvas no formato AAAA-MM-DD (o mesmo do <input type="date">)
const funcionariosIniciais = [
  { id: 1, nome: 'Mariana Souza', cpf: '123.456.789-00', email: 'mariana@hrmasters.com', telefone: '(11) 98765-4321', cargo: 'Analista de RH', departamento: 'Recursos Humanos', dataAdmissao: '2024-03-12', salario: 3500, status: 'ativo', dataCriacao: new Date().toISOString() },
  { id: 2, nome: 'Lucas Santos', cpf: '987.654.321-00', email: 'lucas@hrmasters.com', telefone: '(11) 98765-4321', cargo: 'Desenvolvedor', departamento: 'Tecnologia', dataAdmissao: '2023-07-08', salario: 8000, status: 'ativo', dataCriacao: new Date().toISOString() },
  { id: 3, nome: 'Camila Ferreira', cpf: '456.123.789-00', email: 'camila@hrmasters.com', telefone: '(11) 98765-4321', cargo: 'Assistente financeiro', departamento: 'Financeiro', dataAdmissao: '2025-01-21', salario: 4200, status: 'inativo', dataCriacao: new Date().toISOString() }
];

const departamentosIniciais = [
  { id: 1, nome: 'Recursos Humanos', cor: '#8a5be0' },
  { id: 2, nome: 'Financeiro', cor: '#21a36c' },
  { id: 3, nome: 'Tecnologia', cor: '#347fe8' },
  { id: 4, nome: 'Administrativo', cor: '#f0a44e' }
];

let editandoId = null;

/* ---------- Armazenamento ---------- */

function getFuncionarios() {
  const dados = localStorage.getItem(STORAGE_KEY);
  if (dados) return JSON.parse(dados);
  saveFuncionarios(funcionariosIniciais);
  return funcionariosIniciais.slice();
}

function saveFuncionarios(funcionarios) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(funcionarios));
}

function getDepartamentos() {
  const dados = localStorage.getItem(DEPARTMENTS_KEY);
  return dados ? JSON.parse(dados) : departamentosIniciais;
}

function saveDepartamentos(departamentos) {
  localStorage.setItem(DEPARTMENTS_KEY, JSON.stringify(departamentos));
}

function gerarId() {
  const funcs = getFuncionarios();
  return funcs.reduce((max, f) => Math.max(max, f.id), 0) + 1;
}

/* ---------- Utilitários ---------- */

function escapeHTML(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// AAAA-MM-DD -> DD/MM/AAAA (se já vier em DD/MM/AAAA, mantém)
function formatarData(valor) {
  if (!valor) return '-';
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [ano, mes, dia] = valor.split('-');
    return dia + '/' + mes + '/' + ano;
  }
  return valor;
}

// DD/MM/AAAA -> AAAA-MM-DD (para preencher o input de data)
function paraInputData(valor) {
  if (!valor) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
    const [dia, mes, ano] = valor.split('/');
    return ano + '-' + mes + '-' + dia;
  }
  return valor;
}

function iniciais(nome) {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : (partes[0][1] || '');
  return (primeira + ultima).toUpperCase();
}

/* ---------- Renderização ---------- */

function renderFuncionarios(filtrados = null) {
  const funcionarios = filtrados || getFuncionarios();
  const tabelaBody = document.querySelector('#funcionarios-table tbody');

  atualizarIndicadores();

  if (!tabelaBody) return;

  tabelaBody.innerHTML = '';

  if (funcionarios.length === 0) {
    tabelaBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:#8792a3;">Nenhum funcionário encontrado</td></tr>';
    return;
  }

  funcionarios.forEach(func => {
    const tr = document.createElement('tr');

    const statusClass = func.status === 'ativo' ? 'active' : 'inactive';
    const statusText = func.status === 'ativo' ? 'Ativo' : 'Inativo';
    const corAvatar = 'p' + (((func.id - 1) % 3) + 1);

    tr.innerHTML =
      '<td><span class="person"><i class="person-avatar ' + corAvatar + '">' + escapeHTML(iniciais(func.nome)) + '</i><b>' + escapeHTML(func.nome) + '</b></span></td>' +
      '<td>' + escapeHTML(func.cargo) + '</td>' +
      '<td>' + escapeHTML(func.departamento) + '</td>' +
      '<td>' + escapeHTML(formatarData(func.dataAdmissao)) + '</td>' +
      '<td><span class="badge ' + statusClass + '">' + statusText + '</span></td>' +
      '<td><div class="acoes">' +
        '<button type="button" class="btn-editar" data-id="' + func.id + '">Editar</button>' +
        '<button type="button" class="btn-excluir" data-id="' + func.id + '">Excluir</button>' +
      '</div></td>';

    tabelaBody.appendChild(tr);
  });
}

function atualizarIndicadores() {
  const funcs = getFuncionarios();
  const total = funcs.length;
  const ativos = funcs.filter(f => f.status === 'ativo').length;
  const inativos = funcs.filter(f => f.status === 'inativo').length;

  const cards = document.querySelectorAll('.stat-number');
  if (cards[0]) cards[0].textContent = total;
  if (cards[1]) cards[1].textContent = ativos;
  if (cards[2]) cards[2].textContent = inativos;

  const resumo = document.querySelectorAll('.chart-summary strong');
  if (resumo[0]) resumo[0].textContent = total;
  if (resumo[1]) resumo[1].textContent = ativos;
  if (resumo[2]) resumo[2].textContent = inativos;
}

/* ---------- Formulário ---------- */

function sairDoModoEdicao(form) {
  editandoId = null;
  form.reset();
  form.querySelector('button[type="submit"]').textContent = 'Cadastrar funcionário';
  document.getElementById('btn-cancelar').hidden = true;
}

document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.employee-form');
  const tabela = document.querySelector('#funcionarios-table');
  const buscaInput = document.querySelector('.search-box input');
  const btnCancelar = document.getElementById('btn-cancelar');
  const campo = nome => form.elements[nome];

  renderFuncionarios();

  // Cadastrar / salvar edição
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const dados = {
      nome: campo('nome').value.trim(),
      cpf: campo('cpf').value.trim(),
      email: campo('email').value.trim(),
      telefone: campo('telefone').value.trim(),
      cargo: campo('cargo').value.trim(),
      departamento: campo('departamento').value,
      dataAdmissao: campo('dataAdmissao').value,
      salario: parseFloat(campo('salario').value) || 0,
      status: campo('status').value
    };

    if (!dados.nome || !dados.cpf || !dados.email || !dados.cargo || !dados.departamento) {
      alert('Por favor, preencha: Nome, CPF, E-mail, Cargo e Departamento.');
      return;
    }

    const funcs = getFuncionarios();

    if (editandoId !== null) {
      const indice = funcs.findIndex(f => f.id === editandoId);
      if (indice !== -1) {
        funcs[indice] = Object.assign({}, funcs[indice], dados);
      }
    } else {
      funcs.push(Object.assign({ id: gerarId(), dataCriacao: new Date().toISOString() }, dados));
    }

    saveFuncionarios(funcs);
    sairDoModoEdicao(form);
    if (buscaInput) buscaInput.value = '';
    renderFuncionarios();
  });

  btnCancelar.addEventListener('click', function () {
    sairDoModoEdicao(form);
  });

  // Busca
  if (buscaInput) {
    buscaInput.addEventListener('input', function (e) {
      const termo = e.target.value.toLowerCase();
      const filtrados = getFuncionarios().filter(f =>
        f.nome.toLowerCase().includes(termo) ||
        f.cargo.toLowerCase().includes(termo) ||
        f.departamento.toLowerCase().includes(termo)
      );
      renderFuncionarios(filtrados);
    });
  }

  // Editar / excluir
  tabela.addEventListener('click', function (e) {
    const botao = e.target.closest('button');
    if (!botao) return;

    const id = parseInt(botao.dataset.id, 10);

    if (botao.classList.contains('btn-excluir')) {
      if (confirm('Tem certeza que deseja excluir este funcionário?')) {
        const funcs = getFuncionarios().filter(f => f.id !== id);
        saveFuncionarios(funcs);
        if (editandoId === id) sairDoModoEdicao(form);
        renderFuncionarios();
      }
    }

    if (botao.classList.contains('btn-editar')) {
      const func = getFuncionarios().find(f => f.id === id);
      if (!func) return;

      editandoId = id;
      campo('nome').value = func.nome;
      campo('cpf').value = func.cpf;
      campo('email').value = func.email;
      campo('telefone').value = func.telefone;
      campo('cargo').value = func.cargo;
      campo('departamento').value = func.departamento;
      campo('dataAdmissao').value = paraInputData(func.dataAdmissao);
      campo('salario').value = func.salario;
      campo('status').value = func.status;

      form.querySelector('button[type="submit"]').textContent = 'Salvar alterações';
      btnCancelar.hidden = false;
      document.getElementById('cadastro').scrollIntoView({ behavior: 'smooth' });
    }
  });
});
