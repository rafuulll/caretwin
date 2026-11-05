import React from 'react';
import {Clock, MoonStars, ShieldCheck, Check, ArrowRight, ArrowCounterClockwise, Eye, TextAa, UsersThree, BellSimple, Info, CaretDown} from '@phosphor-icons/react';
import {Button, Switch} from './ui';
import {scenario} from './data';
import {panelHref, isPlainClick} from './navigation';

export function MetricView({metric, p, hidden, learning, summary, onHelp, children}) {
  const sleep = metric === 'sleep';
  return <div className={`metric-view screen-content metric-${metric}`}>
    <div className="metric-summary-grid">
      {sleep ? <section className="night-summary panel" aria-labelledby="night-title">
        <div className="night-label"><MoonStars size={21} aria-hidden="true"/><h2 id="night-title">Última noite</h2><span>Noite encerrada</span></div>
        <div className="night-value">{hidden ? '••••' : <>{Math.floor(p.sleep / 60)}<small>h</small>{String(p.sleep % 60).padStart(2, '0')}<small>min</small></>}</div>
        <p>Sono estimado por movimento</p>
        <div className="night-origin"><Clock size={16} aria-hidden="true"/>Noite encerrada em 2 nov. 2026</div>
      </section> : summary}
      <section className="metric-context" aria-labelledby="metric-context-title">
        {sleep ? <MoonStars size={26} aria-hidden="true"/> : <Clock size={26} aria-hidden="true"/>}
        <h2 id="metric-context-title">{sleep ? 'Uma estimativa, com contexto.' : learning ? 'Conhecendo o seu costume.' : 'O mesmo horário. A sua referência.'}</h2>
        <p>{sleep ? 'Os movimentos registrados pela pulseira ajudam a estimar a duração do sono. Veja as noites ao longo do tempo.' : learning ? 'Os primeiros registros ajudam a formar uma referência da sua rotina. Por enquanto, seus passos aparecem sem comparação.' : `Hoje ainda está em andamento. Seus passos são comparados com o seu costume até as ${scenario.time}.`}</p>
        <p className="metric-context-note">{sleep ? 'Esta estimativa não identifica fases do sono nem avalia a qualidade da noite.' : learning ? 'A faixa pessoal aparece após o período inicial de registros.' : 'A faixa pessoal é uma referência da sua rotina, sem meta universal.'}</p>
        <button className="text-action" onClick={onHelp}>{sleep ? 'Como o sono é estimado' : 'Entender a faixa pessoal'}<ArrowRight size={17} aria-hidden="true"/></button>
      </section>
    </div>
    {children}
  </div>;
}

export function ChangesView({p, available, read, children}) {
  const hasChange = p.hasAlert && available;
  return <section className="changes-view screen-content" aria-labelledby="changes-title">
    <div className="changes-heading"><div><h2 id="changes-title">{hasChange ? 'Mudança nos últimos dias' : available ? 'Nenhuma mudança identificada' : 'Conhecendo a rotina'}</h2><p>{hasChange ? 'Registros de dias completos, até 1 nov.' : available ? 'Quando houver uma mudança em relação ao histórico pessoal, ela aparece aqui.' : 'A comparação fica disponível após o período inicial de registros.'}</p></div><span className={`change-state ${hasChange && !read ? 'is-new' : ''}`}><BellSimple size={17} aria-hidden="true"/>{hasChange ? read ? 'Lida pela família' : '1 não lida' : available ? 'Sem novas mudanças' : 'Em aprendizado'}</span></div>
    <div className="changes-layout">{children}<aside className="change-method"><ShieldCheck size={26} aria-hidden="true"/><h2>Primeiro, olhar o contexto.</h2><p>Uma mudança mostra o que ficou diferente em relação ao costume da pessoa. Ela não é um diagnóstico.</p><dl><div><dt>O que é comparado</dt><dd>Dias completos com o histórico pessoal.</dd></div><div><dt>Quem acompanha</dt><dd>A pessoa e sua família com vínculo aprovado.</dd></div><div><dt>Ao marcar como lida</dt><dd>A leitura fica compartilhada com a família.</dd></div></dl></aside></div>
  </section>;
}

export function FamilyView({people, selected, onView}) {
  const list = Object.values(people);
  return <section className="family-view screen-content panel" aria-labelledby="family-title">
    <div className="view-section-heading"><div><h2 id="family-title">Quem participa</h2><p>Escolha de quem você quer ver o acompanhamento.</p></div><span className="member-count"><UsersThree size={18} aria-hidden="true"/>{list.length} participantes</span></div>
    <ul className="member-list">{list.map(person => <li className="member-row" key={person.id}>
      <span className={`member-avatar ${person.id === 'maria' ? 'person-alt' : ''}`} aria-hidden="true">{person.initials}</span>
      <div className="member-identity"><h3>{person.full}</h3><p>{person.relation === 'Você' ? 'Você · pessoa que usa a pulseira' : 'Familiar · acompanhamento autorizado'}</p>{selected === person.id && <span className="member-current">Último acompanhamento aberto</span>}</div>
      <span className="member-approved"><Check size={15} aria-hidden="true"/>Vínculo aprovado</span>
      <a className="button button-secondary member-action" href={panelHref('overview', person.id)} aria-label={`Ver acompanhamento de ${person.full}`} onClick={event => {if (isPlainClick(event)) {event.preventDefault();onView(person.id);}}}>Ver acompanhamento<ArrowRight size={17} aria-hidden="true"/></a>
    </li>)}</ul>
    <div className="family-access"><ShieldCheck size={23} aria-hidden="true"/><div><h3>O acompanhamento começa com um vínculo aprovado.</h3><p>Convites e alterações de permissões não estão disponíveis por aqui.</p></div></div>
  </section>;
}

export function PreferencesView({large, hidden, onLargeChange, onHiddenChange, onReset}) {
  return <section className="preferences-view screen-content" aria-labelledby="preferences-title">
    <div className="preferences-intro"><h2 id="preferences-title">Do seu jeito de ler.</h2><p>Ajuste a leitura e a exibição dos valores no painel.</p></div>
    <div className="preferences-panel panel">
      <fieldset className="preference-group"><legend><TextAa size={21} aria-hidden="true"/>Leitura</legend><Switch label="Texto maior" description="Amplia os textos para uma leitura mais confortável." checked={large} onChange={onLargeChange}/></fieldset>
      <fieldset className="preference-group"><legend><Eye size={21} aria-hidden="true"/>Privacidade na tela</legend><Switch label="Ocultar valores" description="Esconde os números nos indicadores, gráficos e tabelas." checked={hidden} onChange={onHiddenChange}/></fieldset>
      <p className="preference-session"><Info size={16} aria-hidden="true"/>As escolhas valem durante esta sessão.</p>
    </div>

  </section>;
}
