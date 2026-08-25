  const RAW_URL="https://raw.githubusercontent.com/capriccheti-cpu/lanches-capricche/main/abastecimento.json";
  const SETOR=new URLSearchParams(window.location.search).get("setor")||"ADM";
  const TOTAL_POTES=5;

  // Escapa qualquer valor vindo do JSON antes de injetar no HTML
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  // Ícones Lucide (inline, stroke)
  const icon=(paths,size=14)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const I={
    clock:   p=>icon('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',p),
    calendar:p=>icon('<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',p),
    user:    p=>icon('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',p),
    cookie:  p=>icon('<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/>',p),
    factory: p=>icon('<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>',p),
    clipboard:p=>icon('<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',p),
    alert:   p=>icon('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 20h16a2 2 0 0 0 1.73-2Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',p),
    refresh: p=>icon('<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',p),
    pin:     p=>icon('<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',p),
  };

  function dadosValidos(d){
    if(!d) return false;
    if(!d.abastecedor) return false;
    if(String(d.abastecedor).includes("<")) return false;
    return true;
  }

  function formatarData(str){
    if(!str) return "—";
    try{
      if(str.includes("T")){
        const d=new Date(str);
        return d.toLocaleDateString("pt-BR");
      }
      if(str.includes("-")){
        const [y,m,dia]=str.split("-");
        return `${dia}/${m}/${y}`;
      }
      return str;
    }catch(e){return str;}
  }

  // Verifica se um pote tem conteúdo válido (ignora vazio, "-" e "—")
  function poteTemConteudo(valor){
    if(!valor) return false;
    const v=String(valor).trim();
    return v!=="" && v!=="-" && v!=="—";
  }

  function marcarSync(){
    const el=document.getElementById("sync-info");
    if(el) el.textContent="Atualizado às "+new Date().toLocaleTimeString("pt-BR");
  }

  function renderAguardando(){
    document.getElementById("conteudo").innerHTML=`
      <div class="estado enter">
        <div class="icon-wrap">${I.clock(34)}</div>
        <h2>Aguardando abastecimento</h2>
        <p>A estação ainda não foi abastecida.<br/>Assim que o abastecedor registrar, as informações aparecem aqui automaticamente.</p>
      </div>`;
  }

  function renderErro(msg){
    document.getElementById("conteudo").innerHTML=`
      <div class="estado erro enter">
        <div class="icon-wrap">${I.alert(34)}</div>
        <h2>Não foi possível carregar</h2>
        <p>Verifique a conexão e tente novamente.<br/><span class="mono" style="font-size:12px">${esc(msg)}</span></p>
        <button type="button" class="btn-retry" onclick="carregar()">${I.refresh(16)} Tentar novamente</button>
      </div>`;
  }

  async function carregar(){
    try{
      const res=await fetch(RAW_URL+"?t="+Date.now());
      if(!res.ok) throw new Error("Erro "+res.status);
      const dados=await res.json();
      const d=dados[SETOR];

      document.getElementById("banner-setor").innerHTML=`${I.pin(14)} Setor ${esc(SETOR)}`;
      marcarSync();

      if(!dadosValidos(d)){
        renderAguardando();
        return;
      }

      // potes e linhas podem vir como objeto {1:..,2:..} ou string "a|b|c|d|e"
      let potes=d.potes||{};
      let linhas=d.linhas||{};
      if(typeof potes==="string") potes=potes.split("|");
      if(typeof linhas==="string") linhas=linhas.split("|");

      // Monta a lista apenas com os potes abastecidos (vazios não aparecem)
      const potesPreenchidos=Array.from({length:TOTAL_POTES},(_,idx)=>{
        const n=idx+1;
        const biscoito=(Array.isArray(potes)?potes[idx]:(potes[n]||potes[String(n)]))||"";
        const linha=(Array.isArray(linhas)?linhas[idx]:(linhas[n]||linhas[String(n)]))||"";
        return {n, biscoito, linha};
      }).filter(p=>poteTemConteudo(p.biscoito) && poteTemConteudo(p.linha));
      const qtdCheios=potesPreenchidos.length;

      const potesHTML=qtdCheios
        ? potesPreenchidos.map((p,i)=>`
          <div class="pote enter enter-${Math.min(i+2,6)}">
            <div class="pote-num" aria-label="Pote ${p.n}">${p.n}</div>
            <div class="pote-info">
              <span class="pote-nome">${esc(p.biscoito)}</span>
              ${poteTemConteudo(p.linha)?`<span class="pote-linha">${I.factory(12)} ${esc(p.linha)}</span>`:""}
            </div>
          </div>`).join("")
        : `<div class="sem-potes enter enter-2">${I.cookie(26)}Nenhum pote abastecido no momento.</div>`;

      const badge=qtdCheios>0
        ? `<span class="badge badge-ok">✓ Abastecida</span>`
        : `<span class="badge badge-warn">Sem potes abastecidos</span>`;

      document.getElementById("conteudo").innerHTML=`
        <div class="card enter">
          <div class="card-head">
            <span class="label">${I.clipboard(14)} Último abastecimento</span>
            ${badge}
          </div>
          <div class="summary">
            <div class="stat">
              <div class="stat-label">${I.clock(12)} Horário</div>
              <div class="stat-value big mono">${esc(d.horario)||"—"}</div>
            </div>
            <div class="stat">
              <div class="stat-label">${I.calendar(12)} Data</div>
              <div class="stat-value mono">${esc(formatarData(d.datahora||d.data))}</div>
            </div>
          <!--  
            <div class="stat">
              <div class="stat-label">${I.user(12)} Abastecedor</div>
              <div class="stat-value">${esc(d.abastecedor)||"—"}</div>
            </div> 
            -->
          </div>
        </div>

        <div class="section-head enter enter-1">
          <span class="label">${I.cookie(14)} Biscoitos nos potes</span>
          <span class="count mono">${qtdCheios}</span>
        </div>
        ${potesHTML}`;

    }catch(e){
      marcarSync();
      renderErro(e.message);
    }
  }

  // ── Modal "Sobre esta página" ─────────────────────────────────────
  const modal=document.getElementById("modal-info");
  const btnInfo=document.getElementById("btn-info");

  function abrirModal(){
    modal.hidden=false;
    document.body.style.overflow="hidden";
    document.getElementById("modal-fechar").focus();
  }
  function fecharModal(){
    modal.hidden=true;
    document.body.style.overflow="";
    btnInfo.focus();
  }

  btnInfo.addEventListener("click",abrirModal);
  document.getElementById("modal-fechar").addEventListener("click",fecharModal);
  document.getElementById("modal-ok").addEventListener("click",fecharModal);
  modal.addEventListener("click",e=>{ if(e.target===modal) fecharModal(); });
  document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&!modal.hidden) fecharModal(); });

  carregar();
  setInterval(carregar, 30000);
  document.addEventListener("visibilitychange",function(){
    if(document.visibilityState==="visible") carregar();
  });
