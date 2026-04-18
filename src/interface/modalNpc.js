import dadosJogo from '../estado/dadosJogo.js';
import { iniciarDialogo, fazerProposta, getFala,
         iniciarDialogoTI, avancarDialogoTI, temAcaoBeneficaNoEntorno } from '../estado/npcs.js';

// ── Empréstimo ────────────────────────────────────────────────────────────────

export function mostrarModalEmprestimo() {
  document.getElementById('modal-npc')?.remove();
  const el = document.createElement('div');
  el.id = 'modal-npc';
  el.innerHTML = `
    <div class="modal-npc__card">
      <div class="modal-npc__cabecalho">
        <div class="modal-npc__avatar">🏦</div>
        <div><div class="modal-npc__nome">Empréstimo de Emergência</div></div>
      </div>
      <div class="modal-npc__fala">
        Seu saldo chegou a zero. Um financiamento de R$5.000 está disponível —
        10 parcelas de R$650 a cada 6 ciclos. Atenção: esta é sua única chance.
        Recusar significa encerrar o jogo.
      </div>
      <div class="modal-npc__opcoes">
        <button class="btn-primario" onclick="window.aceitarEmprestimo()">Aceitar R$5.000</button>
        <button class="btn-perigo"   onclick="window.recusarEmprestimo()">Recusar (Encerrar)</button>
      </div>
    </div>`;
  document.body.appendChild(el);
}

// ── Game Over ─────────────────────────────────────────────────────────────────

export function mostrarGameOver(tipo) {
  document.getElementById('modal-npc')?.remove();
  document.getElementById('game-over-overlay')?.remove();
  const titulos    = { financeiro: '💸 Falência', ecologico: '🌿 Colapso Ecológico', social: '🤝 Ruptura Social' };
  const descricoes = { financeiro: 'Os recursos acabaram e não há mais como financiar a restauração.',
                       ecologico:  'O território foi destruído além do ponto de recuperação.',
                       social:     'A Terra Indígena foi dizimada.' };
  const el = document.createElement('div');
  el.id = 'game-over-overlay';
  el.innerHTML = `
    <div class="modal-npc__card">
      <div class="modal-npc__cabecalho">
        <div class="modal-npc__nome">${titulos[tipo] || '💀 Fim de Jogo'}</div>
      </div>
      <div class="modal-npc__fala">${descricoes[tipo] || 'O jogo encerrou.'}</div>
      <div class="modal-npc__opcoes">
        <button class="btn-primario" onclick="window.location.reload()">Tentar Novamente</button>
      </div>
    </div>`;
  document.body.appendChild(el);
}

// ── Alertas ───────────────────────────────────────────────────────────────────

function mostrarAlerta(msg) {
  document.getElementById('alerta-acao')?.remove();
  const el = Object.assign(document.createElement('div'), { id: 'alerta-acao', className: 'alerta' });
  el.innerHTML = `<span class="alerta__icone">⚠️</span><span class="alerta__titulo">${msg}</span>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ── Botões NPC genérico ───────────────────────────────────────────────────────

function botoesNpc(npc, cellId) {
  const id = `'${cellId}'`;
  if (npc.farol === 'verde') {
    return `<p>Parceria ativa ✓</p>
      <button class="btn-neutro" onclick="window.fecharModalNpc()">Fechar</button>`;
  }
  if (npc.farol === 'vermelho') {
    return `<button class="btn-primario" onclick="window.npcAcao('iniciarDialogo',${id})">Iniciar Conversa</button>
      <button class="btn-neutro" onclick="window.fecharModalNpc()">Fechar</button>`;
  }
  if (npc.tipo === 'pecuarista') {
    return `<button class="btn-primario" onclick="window.npcAcao('saf_parceiro',${id})">Propor SAF Parceiro — R$800</button>
      <button class="btn-primario" onclick="window.npcAcao('pecuaria_intensiva',${id})">Propor Pecuária Intensiva — R$400</button>
      <button class="btn-neutro" onclick="window.fecharModalNpc()">Fechar</button>`;
  }
  return `<button class="btn-primario" onclick="window.npcAcao('parceria_garimpo',${id})">Oferecer Parceria — R$${npc.custoParcearia}</button>
    <button class="btn-perigo" onclick="window.npcAcao('acionar_ibama',${id})">Acionar IBAMA — R$800</button>
    <button class="btn-neutro" onclick="window.fecharModalNpc()">Fechar</button>`;
}

// ── Botões NPC Terra Indígena ─────────────────────────────────────────────────

function botoesNpcTI(npc, cellId) {
  const id = `'${cellId}'`;
  if (npc.farol === 'verde') {
    return `<p>✓ Parceria Ativa — R$20/ciclo</p>
      <p>Brigadista Indígena disponível no painel</p>
      <button class="btn-neutro" onclick="window.fecharModalNpc()">Fechar</button>`;
  }
  if (npc.farol === 'vermelho') {
    const ok = dadosJogo.equipe.negociadores > 0 && temAcaoBeneficaNoEntorno(cellId);
    if (!ok) {
      return `<div class="menu-celula__acao-custo">⚠️ Requer Negociador e ação benéfica no entorno (restaurar célula vizinha primeiro)</div>
        <button class="btn-neutro" onclick="window.fecharModalNpc()">Fechar</button>`;
    }
    return `<button class="btn-primario" onclick="window.npcAcao('iniciar_ti',${id})">Iniciar Contato</button>
      <button class="btn-neutro" onclick="window.fecharModalNpc()">Fechar</button>`;
  }
  const btns = [];
  if (npc.passoDialogo <= 1)
    btns.push(`<button class="btn-primario" onclick="window.npcAcao('ti_apresentar',${id})">Apresentar Projeto (grátis)</button>`);
  if (npc.passoDialogo === 1)
    btns.push(`<button class="btn-primario" onclick="window.npcAcao('ti_castanhas',${id})">Comprar Castanhas — R$200</button>`);
  if (npc.passoDialogo >= 2)
    btns.push(`<button class="btn-primario" onclick="window.npcAcao('ti_parceria',${id})">Propor Parceria — R$400</button>`);
  btns.push(`<button class="btn-neutro" onclick="window.fecharModalNpc()">Fechar</button>`);
  return btns.join('');
}

// ── Diálogo principal ─────────────────────────────────────────────────────────

export function mostrarDialogoNpc(cellId) {
  document.getElementById('modal-npc')?.remove();
  const npc = dadosJogo.npcs[cellId];
  if (!npc) return;
  const fala     = getFala(npc.id, npc.farol);
  const botoesHTML = npc.tipo === 'indigena' ? botoesNpcTI(npc, cellId) : botoesNpc(npc, cellId);
  const el = document.createElement('div');
  el.id = 'modal-npc';
  el.innerHTML = `
    <div class="modal-npc__card">
      <div class="modal-npc__cabecalho">
        <div class="modal-npc__avatar">${npc.emoji}</div>
        <div>
          <div class="modal-npc__nome">${npc.nome}</div>
          <div class="modal-npc__perfil">${npc.tipo}</div>
        </div>
        <div class="modal-npc__farol modal-npc__farol--${npc.farol}"></div>
      </div>
      <div class="modal-npc__fala">${fala}</div>
      <div class="modal-npc__opcoes">${botoesHTML}</div>
    </div>`;
  document.body.appendChild(el);
}

// ── Globais ───────────────────────────────────────────────────────────────────

window.fecharModalNpc = () => { document.getElementById('modal-npc')?.remove(); };

const CUSTO_PROPOSTA = { saf_parceiro: 800, pecuaria_intensiva: 400 };

window.npcAcao = (acao, cellId) => {
  if (acao === 'iniciarDialogo') {
    iniciarDialogo(cellId);
    mostrarDialogoNpc(cellId);
    return;
  }
  if (acao === 'iniciar_ti') {
    const res = iniciarDialogoTI(cellId);
    if (res?.erro) { mostrarAlerta(res.erro); return; }
    mostrarDialogoNpc(cellId);
    return;
  }
  if (['ti_apresentar','ti_castanhas','ti_parceria'].includes(acao)) {
    const passoMap = { ti_apresentar: 'apresentar', ti_castanhas: 'comprar_castanhas', ti_parceria: 'propor_parceria' };
    const res = avancarDialogoTI(cellId, passoMap[acao]);
    window.fecharModalNpc();
    if (res?.resultado === 'erro') { mostrarAlerta(res.mensagem || 'Ação inválida'); return; }
    mostrarDialogoNpc(cellId);
    if (res?.mensagem) mostrarAlerta(res.mensagem);
    return;
  }
  if (acao === 'acionar_ibama') {
    if (dadosJogo.saldo < 800) { mostrarAlerta('Saldo insuficiente (R$800)'); return; }
    dadosJogo.saldo -= 800;
    const cell = dadosJogo.celulas.find(c => c.id === cellId);
    if (cell) cell.type = 'contaminado';
    delete dadosJogo.npcs[cellId];
    delete dadosJogo.estadoFarol[cellId];
    document.dispatchEvent(new CustomEvent('celulaAtualizada', { detail: { celulaId: cellId } }));
    window.fecharModalNpc();
    return;
  }
  const custo = CUSTO_PROPOSTA[acao] || dadosJogo.npcs[cellId]?.custoParcearia || 0;
  if (custo > 0 && dadosJogo.saldo < custo) { mostrarAlerta(`Saldo insuficiente (R$${custo})`); return; }
  if (custo > 0) dadosJogo.saldo -= custo;
  const res = fazerProposta(cellId, acao);
  mostrarDialogoNpc(cellId);
  if (res.resultado === 'rejeicao') {
    const falaEl = document.querySelector('#modal-npc .modal-npc__fala');
    if (falaEl) falaEl.innerText = '... Não dessa vez. Mas vou pensar.';
  }
};

export function mostrarAlertaEvento(tipo, mensagem) {
  const m = {incendio:['alerta--incendio','🔥'],seca:['alerta--seca','☀️'],
             praga:['alerta--incendio','🐛'],edital:['','📋'],seca_fim:['','🌧️']};
  const [cls, ic] = m[tipo] || ['','⚠️'];
  let s = document.getElementById('alertas-stack');
  if (!s) { s = document.createElement('div'); s.id='alertas-stack'; document.body.appendChild(s); }
  const el = document.createElement('div');
  el.className = 'alerta' + (cls ? ' '+cls : '');
  el.innerHTML = `<span class="alerta__icone">${ic}</span><span class="alerta__titulo">${mensagem}</span>`;
  s.appendChild(el); setTimeout(() => el.remove(), 5000);
}
