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
  "Elizio Pedro Kela",
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

/* === Distribuição com regra Afonso + Elízio + Estefânia (Respeitando Limite) === */
function distribute(names, G, S) {
  const afonso = "Afonso Daniel Cayombe Fernando";
  const elizio = "Elizio Pedro Kela";
  const estefania = "Estefânia Letícia Alex";

  // 1. Separar o trio e embaralhar os outros
  let others = names.filter(n => n !== afonso && n !== elizio && n !== estefania);
  shuffle(others);

  // 2. Criar estrutura de grupos
  const groups = Array.from({ length: G }, () => []);

  // 3. Definir qual grupo receberá o trio e já colocar o trio lá
  const grupoTrioIdx = Math.floor(Math.random() * G);
  groups[grupoTrioIdx].push(afonso, elizio, estefania);

  // 4. Distribuir os restantes alunos respeitando o limite S de cada grupo
  let currentGroup = 0;
  while (others.length > 0) {
    // Se o grupo atual já estiver cheio (S), passa para o próximo
    if (groups[currentGroup].length >= S) {
      currentGroup++;
      // Se chegarmos ao fim dos grupos e ainda houver gente, 
      // adicionamos ao grupo que tiver menos gente para não perder alunos
      if (currentGroup >= G) currentGroup = 0; 
    }

    // Se após a verificação o grupo ainda tem vaga, adiciona um aluno
    if (groups[currentGroup].length < S) {
      groups[currentGroup].push(others.shift());
    } else {
      // Caso de segurança: se todos os grupos estão no limite mas sobrou gente, 
      // distribui onde couber (evita loop infinito se G * S < total de nomes)
      let smallestGroup = groups.reduce((prev, curr) => (prev.length < curr.length ? prev : curr));
      smallestGroup.push(others.shift());
    }
  }

  // 5. Garantir que ninguém fica sozinho (mínimo 2 por grupo)
  groups.forEach((g, i) => {
    if (g.length === 1 && G > 1) {
      const alunoSolitário = g.pop();
      const destino = i === 0 ? 1 : i - 1;
      groups[destino].push(alunoSolitário);
    }
  });

  // 6. BARALHAR INTERNAMENTE cada grupo
  // Isso garante que o trio não apareça em sequência (#1, #2, #3)
  groups.forEach(g => shuffle(g));

  return groups;
}

/* === Renderização === */
function renderGroups(groups) {
  const c = document.getElementById('groupsContainer');
  c.innerHTML = '';
  const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let total = 0;

  groups.filter(g => g.length > 0).forEach((g, i) => {
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
  if (namesField && !namesField.value.trim()) {
    namesField.value = defaultNames.join('\n');
  }
  const statusField = document.getElementById('status');
  if (statusField) {
    statusField.textContent = `Estado: ${defaultNames.length} nomes carregados automaticamente.`;
  }
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
    if (g.length === 0) return;
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
