const STORAGE_KEY='hrmasters_funcionarios';
const DEPARTMENTS_KEY='hrmasters_departamentos';

const funcionariosIniciais = [
  { id: 1, nome: 'Mariana Souza', cpf: '123.456.789-00', email: 'mariana@hrmasters.com', telefone: '(11) 98765-4321', cargo: 'Analista de RH', departamento: 'Recursos Humanos', dataAdmissao: '12/03/2024', salario: 3500, status: 'ativo', dataCriacao: new Date().toISOString() },
  { id: 2, nome: 'Lucas Santos', cpf: '987.654.321-00', email: 'lucas@hrmasters.com', telefone: '(11) 98765-4321', cargo: 'Desenvolvedor', departamento: 'Tecnologia', dataAdmissao: '08/07/2023', salario: 8000, status: 'ativo', dataCriacao: new Date().toISOString() },
  { id: 3, nome: 'Camila Ferreira', cpf: '456.123.789-00', email: 'camila@hrmasters.com', telefone: '(11) 98765-4321', cargo: 'Assistente financeiro', departamento: 'Financeiro', dataAdmissao: '21/01/2025', salario: 4200, status: 'inativo', dataCriacao: new Date().toISOString() }
];

const departamentosIniciais = [
  { id: 1, nome: 'Recursos Humanos', cor: '#8a5be0' },
  { id: 2, nome: 'Financeiro', cor: '#21a36c' },
  { id: 3, nome: 'Tecnologia', cor: '#347fe8' },
  { id: 4, nome: 'Administrativo', cor: '#f0a44e' }
];

function getFuncionarios() {
  const dados = localStorage.getItem(STORAGE_KEY);
  return dados ? JSON.parse(dados) : funcionariosIniciais;
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
  const maxId = funcs.reduce((max, f) => Math.max(max, f.id), 0);
  return maxId + 1;
}

function renderFuncionarios(filtrados = null) {
  const funcionarios = filtrados || getFuncionarios();
  const tabelaBody = document.querySelector('#funcionarios-table tbody');

  if (!tabelaBody) return;

  tabelaBody.innerHTML = '';

  if (funcionarios.length === 0) {
    tabelaBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding: 20px; color: #8792a3;">Nenhum funcionário cadastrado</td></tr>';
    return;
  }

  funcionarios.forEach(func => {
    const tr = document.createElement('tr');

    const statusClass = func.status === 'ativo' ? 'active' : 'inactive';
    const statusText = func.status === 'ativo' ? 'Ativo' : 'Inativo';

    tr.innerHTML = '<td><span class="person"><i class="person-avatar p' + func.id + '">' + func.nome[0] + func.nome.split(' ').pop()[0] + '</i><b>' + func.nome + '</b></span></td>' +
                   '<td>' + func.cargo + '</td>' +
                   '<td>' + func.departamento + '</td>' +
                   '<td>' + func.dataAdmissao + '</td>' +
                   '<td><span class="badge ' + statusClass + '">' + statusText + '</span></td>' +
                   '<td><button class="btn-editar" data-id="' + func.id + '">Editar</button>' +
                   '<button class="btn-excluir" data-id="' + func.id + '">Excluir</button></td>';

    tabelaBody.appendChild(tr);
  });

  atualizarIndicadores();
}

function atualizarIndicadores() {
  const funcs = getFuncionarios();
  const total = funcs.length;
  const ativos = funcs.filter(f => f.status === 'ativo').length;
  const inativos = funcs.filter(f => f.status === 'inativo').length;
  const departs = getDepartamentos();

  const totalEl = document.querySelector('.stat-number');
  if (totalEl) totalEl.textContent = total;

  const ativosEl = document.querySelector('.stat-number + .stat-number');
  if (ativosEl) ativosEl.textContent = ativos;

  const inativosEl = document.querySelectorAll('.stat-number')[2];
  if (inativosEl) inativosEl.textContent = inativos;
}

document.addEventListener('DOMContentLoaded', function () {
  renderFuncionarios();

  const form = document.querySelector('.employee-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const nome = form.nome.value.trim();
      const cpf = form.cpf.value.trim();
      const email = form.email.value.trim();
      const telefone = form.telefone.value.trim();
      const cargo = form.cargo.value;
      const departamento = form.departamento.value;
      const dataAdmissao = form.dataAdmissao.value;
      const salario = form.salario.value;
      const status = form.status.value;

      if (!nome || !cpf || !email) {
        alert('Por favor, preencha os campos obrigatórios: Nome, CPF, E-mail');
        return;
      }

      const novoFuncionario = {
        id: gerarId(),
        nome: nome,
        cpf: cpf,
        email: email,
        telefone: telefone,
        cargo: cargo,
        departamento: departamento,
        dataAdmissao: dataAdmissao,
        salario: parseFloat(salario) || 0,
        status: status,
        dataCriacao: new Date().toISOString()
      };

      const funcs = getFuncionarios();
      funcs.push(novoFuncionario);
      saveFuncionarios(funcs);

      renderFuncionarios();
      form.reset();
    });
  }

  const buscaInput = document.querySelector('.search-box input');
  if (buscaInput) {
    buscaInput.addEventListener('input', function (e) {
      const termo = e.target.value.toLowerCase();
      const funcs = getFuncionarios();
      const filtrados = funcs.filter(f =>
        f.nome.toLowerCase().includes(termo) ||
        f.cargo.toLowerCase().includes(termo) ||
        f.departamento.toLowerCase().includes(termo)
      );
      renderFuncionarios(filtrados);
    });
  }

  document.querySelector('#funcionarios-table').addEventListener('click', function (e) {
    const id = parseInt(e.target.dataset.id);

    if (e.target.classList.contains('btn-excluir')) {
      if (confirm('Tem certeza que deseja excluir este funcionário?')) {
        let funcs = getFuncionarios();
        funcs = funcs.filter(f => f.id !== id);
        saveFuncionarios(funcs);
        renderFuncionarios();
      }
    }

    if (e.target.classList.contains('btn-editar')) {
      let funcs = getFuncionarios();
      const func = funcs.find(f => f.id === id);

      if (func) {
        form.nome.value = func.nome;
        form.cpf.value = func.cpf;
        form.email.value = func.email;
        form.telefone.value = func.telefone;
        form.cargo.value = func.cargo;
        form.departamento.value = func.departamento;
        form.dataAdmissao.value = func.dataAdmissao;
        form.salario.value = func.salario;
        form.status.value = func.status;

        form.onsubmit = function (e) {
          e.preventDefault();
          funcs = funcs.filter(f => f.id !== id);
          const novo = {
            nome: form.nome.value,
            cpf: form.cpf.value,
            email: form.email.value,
            telefone: form.telefone.value,
            cargo: form.cargo.value,
            departamento: form.departamento.value,
            dataAdmissao: form.dataAdmissao.value,
            salario: parseFloat(form.salario.value) || 0,
            status: form.status.value
          };
          funcs.push(novo);
          saveFuncionarios(funcs);
          renderFuncionarios();
          form.onsubmit = null;
        };
      }
    }
  });
});