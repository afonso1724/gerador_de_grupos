const defaultNames = [
  "Leonel José João",
  "Adelina Cassinda Catombela",
  "Adolfo Nunes Massaqui Tchipilica",
  "Afonso Daniel Cayombe Fernando",
  "Alberto Adolfo Ribas da Silva",
  "Aldair Benjamim da Silva Alegria",
  "Amaro Kamjunguulo Chimbaca",
  "André Caio Bonifácio Calelessa",
  "Áureo Baptista Inácio",
  "Batilson Correia da Piedade",
  "Clénildo Francisco Moniz",
  "Cristiano Dorivaldo Mateus de Mascarenhas",
  "Cristiano Pimentel Ferreira",
  "Cristina Francisco Cristóvão",
  "Dalton Mateus Bamba Domingos",
  "Dário Pascoal Teodoro Inácio",
  "Domingos Muanha Gunza",
  "Dumilda Patrícia Almada Coelho",
  "Elízio Pedro Kela",
  "Estefânia Letícia Alex",
  "José Olavo Lucas Gamboa",
  "Josemar Sambo Luamba",
  "Kiari Emanuel da Costa Narciso",
  "Kyami Baltazar Tavares da Silva Coelho",
  "Lênio Fernandes Francisco",
  "Márcio Henriques Monteiro",
  "Nádia Ana Nassipitali Nsoki Real",
  "Tiago Manuel de Brito Filipe",
  "Valdemiro Torres Francisco",
  "William Afonso Munguandja",
  "Wilson Cardoso José Francisco"
];

/* === Utilitários === */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

function getNames() {
  const txt = document.getElementById('names').value.trim();
  if (!txt) return defaultNames.slice();
  return txt.split('\n').map(s => s.trim()).filter(Boolean);
}

/* === Distribuição com regra Afonso + Elízio === */
function distribute(names, G, S) {
  const afonso = "Afonso Daniel Cayombe Fernando";
  const elizio = "Elízio Pedro Kela";

  // Remover ambos da lista
  let others = names.filter(n => n !== afonso && n !== elizio);
  shuffle(others);

  // Criar grupos vazios
  const groups = Array.from({ length: G }, () => []);

  // Distribuição inicial
  for (let i = 0; i < others.length; i++) {
    groups[i % G].push(others[i]);
  }

  // Garantir que ninguém fica sozinho
  for (let i = 0; i < groups.length; i++) {
    if (groups[i].length === 1 && groups.length > 1) {
      const aluno = groups[i].pop();
      if (i > 0) groups[i - 1].push(aluno);
      else groups[i + 1].push(aluno);
    }
  }

  // Inserir Afonso e Elízio juntos num grupo aleatório
  const grupoEscolhido = Math.floor(Math.random() * groups.length);
  groups[grupoEscolhido].push(afonso);
  groups[grupoEscolhido].push(elizio);

  return groups;
}

/* === Renderização === */
function renderGroups(groups) {
  const c = document.getElementById('groupsContainer');
  c.innerHTML = '';
  const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let total = 0;

  groups.forEach((g, i) => {
    const d = document.createElement('div');
    d.className = 'group-card';
    d.innerHTML =
      '<div class="group-title">Grupo ' + (L[i] || (i + 1)) + '</div>' +
      g.map((x, n) => '<div class="student">' + x + '<small>#' + (n + 1) + '</small></div>').join('');
    c.appendChild(d);
    total += g.length;
  });

  document.getElementById('totalCount').textContent = total;
}

/* === Inicialização === */
window.addEventListener('load', () => {
  const namesField = document.getElementById('names');
  if (!namesField.value.trim()) {
    namesField.value = defaultNames.join('\n');
  }
  document.getElementById('status').textContent =
    `Estado: ${defaultNames.length} nomes carregados automaticamente.`;
});

/* === Botões === */
document.getElementById('shuffle').onclick = function() {
  const n = getNames();
  const G = parseInt(document.getElementById('numGroups').value) || 6;
  const S = parseInt(document.getElementById('sizeGroup').value) || 6;
  renderGroups(distribute(n, G, S));
  document.getElementById('status').textContent = 'Grupos sorteados com sucesso.';
};

document.getElementById('reshuffle').onclick = function() {
  document.getElementById('shuffle').click();
};

document.getElementById('autoAdjust').onclick = function() {
  const names = getNames();
  const count = names.length;
  const S = parseInt(document.getElementById('sizeGroup').value) || 6;
  const G = Math.ceil(count / S);
  document.getElementById('numGroups').value = G;
  renderGroups(distribute(names, G, S));
  document.getElementById('status').textContent =
    `Grupos ajustados automaticamente (${G} grupos com até ${S} alunos).`;
};

document.getElementById('copyBtn').onclick = function() {
  const text = document.getElementById('groupsContainer').innerText;
  navigator.clipboard.writeText(text);
  document.getElementById('status').textContent = 'Grupos copiados para a área de transferência.';
};

/* === Gerar PDF === */
document.getElementById('csvBtn').onclick = async function() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const names = getNames();
  const G = parseInt(document.getElementById('numGroups').value) || 6;
  const S = parseInt(document.getElementById('sizeGroup').value) || 6;
  const groups = distribute(names, G, S);
  const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let y = 15;
  pdf.setFontSize(16);
  pdf.text("Distribuição de Grupos", 105, y, { align: "center" });
  y += 10;
  pdf.setFontSize(12);

  groups.forEach((g, i) => {
    pdf.setFont("helvetica", "bold");
    pdf.text(`Grupo ${L[i] || (i + 1)}`, 15, y);
    y += 7;
    pdf.setFont("helvetica", "normal");

    g.forEach((n, idx) => {
      pdf.text(`${idx + 1}. ${n}`, 20, y);
      y += 6;
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
    });

    y += 8;
  });

  pdf.save("grupos.pdf");
  document.getElementById('status').textContent = 'Arquivo PDF exportado com sucesso.';
};
