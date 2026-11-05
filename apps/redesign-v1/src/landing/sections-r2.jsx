import React, {useEffect, useId, useRef, useState} from 'react';
import {animate, LayoutGroup, motion, useMotionValue, useReducedMotion} from 'motion/react';
import {ArrowUpRight, ArrowLeft, MoonStars, DownloadSimple} from '@phosphor-icons/react';
import {Button, Tabs, TabsList, TabsTrigger, TabsContent} from './components/ui';
import {Arrow, ScrollHeading, SegmentedTabs} from './interaction';
import {RoutineScene} from './routine-scene';
import {PhoneScene} from './phone-scene';

const A = '/assets/';
const ease = [.16, 1, .3, 1];
const historyRoute = 'M55 184V203Q55 214 66 214H350Q361 214 361 203';
const compareRoute = 'H408Q420 195 420 183V174';
function BrandIcon({name, size = 24}) {return <img className="brand-icon" src={`${A}brand/icon-${name}.svg`} alt="" aria-hidden="true" width={size} height={size}/>;}

const moments = {
  dia: {title: 'Um passeio também conta.', text: 'A ida à feira, a volta no quarteirão, os passos pela casa. A pulseira registra o movimento que faz parte do seu dia.', detail: 'Passos no contexto da sua rotina', icon: 'movement'},
  noite: {title: 'A noite também conta uma história.', text: 'Enquanto você descansa, os movimentos registrados pela pulseira ajudam a estimar os períodos de sono. Mais contexto para acompanhar suas noites.', detail: 'Sono estimado a partir do movimento', icon: 'sleep'},
};
export function DayNight() {
  const [period, setPeriod] = useState('dia');
  return <section className="day-section section-pad" id="como-funciona"><div className="wrap">
    <div className="section-intro"><ScrollHeading lines={['O dia tem movimento.', 'A noite, outro ritmo.']}/><p>O CareTwin acompanha os dois. E ajuda você a olhar para cada um com mais contexto.</p></div>
    <Tabs value={period} onValueChange={setPeriod} className="day-tabs">
      <SegmentedTabs value={period} onValueChange={setPeriod} label="Explorar momentos da rotina" items={[{value: 'dia', label: 'Durante o dia', icon: <BrandIcon name="movement" size={21}/>}, {value: 'noite', label: 'Durante a noite', icon: <BrandIcon name="sleep" size={21}/>} ]}/>
      <div className="day-composition">
        <div className="day-text">{Object.entries(moments).map(([key, data]) => <TabsContent value={key} key={key} forceMount aria-hidden={key !== period} tabIndex={key === period ? 0 : -1}><h3>{data.title}</h3><p>{data.text}</p><div className="plain-detail"><BrandIcon name={data.icon} size={22}/><span>{data.detail}</span></div></TabsContent>)}</div>
        <RoutineScene period={period}/>
      </div>
    </Tabs>
  </div></section>;
}

const steps = [
  {label: 'Registrar', icon: 'movement', title: 'O cotidiano vira registro.', text: 'Os passos e os movimentos da noite são o começo. Cada dia reúne novos registros da rotina de quem usa a pulseira.', diagramTitle: 'Um dia de cada vez.', diagramText: 'Cada peça representa um dia de registros.'},
  {label: 'Conhecer', icon: 'history', title: 'Os dias formam um histórico.', text: 'Com o tempo, os registros se conectam. O CareTwin forma uma referência a partir da rotina da própria pessoa.', diagramTitle: 'Os dias, vistos em conjunto.', diagramText: 'É desse conjunto que nasce a referência pessoal.'},
  {label: 'Comparar', icon: 'link', title: 'Mudanças ganham contexto.', text: 'Os registros são comparados com esse histórico. Durante o dia, os passos são comparados até o mesmo horário.', diagramTitle: 'Hoje encontra o seu contexto.', diagramText: 'A comparação considera o histórico da própria pessoa.'},
];
function RecordsDiagram({step}) {
  const reduced = useReducedMotion();
  const route = useRef(null);
  const traceX = useMotionValue(55), traceY = useMotionValue(184), traceOpacity = useMotionValue(0);
  const data = steps[step];
  const duration = reduced ? 0 : .52;
  useEffect(() => {
    traceOpacity.set(0);
    if (step !== 2 || reduced || !route.current) return;
    const path = route.current, length = path.getTotalLength();
    const control = animate(0, 1, {duration: .95, delay: .2, ease: 'linear', onUpdate: progress => {
      const point = path.getPointAtLength(progress * length);
      traceX.set(point.x); traceY.set(point.y);
      traceOpacity.set(Math.min(1, progress / .08, (1 - progress) / .08));
    }, onComplete: () => traceOpacity.set(0)});
    return () => control.stop();
  }, [step, reduced, traceX, traceY, traceOpacity]);
  return <div className={'records-diagram diagram-step-' + step}>
    <svg className="records-canvas" viewBox="0 0 480 260" role="img" aria-label={data.diagramTitle + ' ' + data.diagramText + ' Dias anteriores à esquerda; hoje à direita.'}>
      <path d="M27 179H453" fill="none" stroke="#e1e7f2" strokeWidth="1.5"/>
      <motion.path className="history-connector" d={historyRoute + 'V184'} fill="none" stroke="#8fa5e9" strokeWidth="1.6" strokeLinecap="round" initial={false} animate={{pathLength: step > 0 ? 1 : 0, opacity: step > 0 ? 1 : 0}} transition={{duration, ease}}/>
      <motion.path className="compare-connection" d={'M361 195' + compareRoute} fill="none" stroke="#2549d8" strokeWidth="1.6" strokeLinecap="round" initial={false} animate={{opacity: step === 2 ? 1 : 0, pathLength: step === 2 ? 1 : 0}} transition={{duration, delay: reduced || step !== 2 ? 0 : .18, ease}}/>
      <motion.circle className="compare-endpoint" cx="420" cy="174" r="3" fill="#2549d8" initial={false} animate={{opacity: step === 2 ? 1 : 0, scale: step === 2 ? 1 : .5}} transition={{duration: reduced ? 0 : .25}}/>
      <path ref={route} className="reference-route" d={historyRoute + 'V195' + compareRoute} fill="none" stroke="none" aria-hidden="true"/>
      <motion.circle className="reference-trace" r="3.5" fill="#2549d8" cx={traceX} cy={traceY} style={{opacity: traceOpacity}}/>
      {Array.from({length: 6}, (_, n) => {
        const today = n === 5;
        const active = step > 0 || today;
        return <motion.g key={n} className={'day-record ' + (today ? 'record-today' : 'record-past')} initial={false} animate={{x: 27 + n * 73, y: today && step === 2 ? -12 : 0}} transition={{duration, ease}}>
          <text x="28" y="52" textAnchor="middle" className="record-day-label">{today ? 'Hoje' : 'Dia ' + (n + 1)}</text>
          <motion.rect x="0" y="70" width="56" height="103" rx="13" initial={false} animate={{fill: today ? '#2549d8' : active ? '#edf2ff' : '#fafbfe', stroke: today ? '#2549d8' : active ? '#a9bbed' : '#e2e8f3'}} transition={{duration: reduced ? 0 : .36, delay: reduced ? 0 : n * .025, ease}}/>
          <motion.g initial={false} animate={{opacity: active ? 1 : .4}} transition={{duration, ease}}>
            <path d="M15 101h26M15 113h18M15 125h26" fill="none" stroke={today ? '#fff' : '#8ea5d0'} strokeWidth="3" strokeLinecap="round"/>
            <circle cx="18" cy="151" r="3" fill={today ? '#cbd9ff' : '#a2b5db'}/>
          </motion.g>
        </motion.g>;
      })}
      <motion.text x="208" y="239" textAnchor="middle" className="record-group-label" initial={false} animate={{opacity: step > 0 ? 1 : 0}} transition={{duration: reduced ? 0 : .25}}>Histórico pessoal</motion.text>
    </svg>
    <div className="records-caption" key={step}><strong>{data.diagramTitle}</strong><span>{data.diagramText}</span></div>
  </div>;
}
export function History() {
  const [step, setStep] = useState('0');
  const id = useId();
  const reduced = useReducedMotion();
  return <section className="history-section wrap" id="seu-historico">
    <div className="history-heading"><ScrollHeading lines={['A sua referência', 'é você.']}/><p>Cada pessoa tem um costume.<br/>A comparação precisa respeitar isso.</p></div>
    <Tabs value={step} onValueChange={setStep} className="history-flow">
      <LayoutGroup id={id}><TabsList aria-label="Como a comparação pessoal funciona">{steps.map((data, i) => <TabsTrigger value={String(i)} key={data.label}><BrandIcon name={data.icon} size={25}/><span>{data.label}</span><Arrow size={17}/>{step === String(i) && <motion.span className="history-tab-line" layoutId="history-line" initial={false} transition={{duration: reduced ? 0 : .32, ease}} aria-hidden="true"/>}</TabsTrigger>)}</TabsList></LayoutGroup>
      <div className="history-stage"><div className="history-explanation"><div className="history-copy-panels">{steps.map((data, i) => <TabsContent value={String(i)} key={data.label} forceMount aria-hidden={String(i) !== step} tabIndex={String(i) === step ? 0 : -1}><h3>{data.title}</h3><p>{data.text}</p></TabsContent>)}</div>
        <div className="ritmo-guide"><img src={A + 'ritmo-guia.webp'} alt="" width="1276" height="1276" loading="lazy"/><p>O seu costume é<br/>o ponto de partida.</p></div>
      </div><RecordsDiagram step={Number(step)}/></div>
    </Tabs>
  </section>;
}
export function Family() {
  const [perspective, setPerspective] = useState('voce');
  return <section className="family-section" id="para-quem"><div className="wrap family-layout">
    <PhoneScene perspective={perspective}/>
    <div className="family-copy"><ScrollHeading lines={['Estar perto também', 'é dar espaço.']}/><p>Um olhar para a rotina de quem usa.<br/>Um jeito de acompanhar para quem se importa.</p>
      <Tabs value={perspective} onValueChange={setPerspective} className="family-tabs"><SegmentedTabs value={perspective} onValueChange={setPerspective} label="Escolher perspectiva de uso" items={[{value: 'voce', label: 'Para quem usa', icon: <BrandIcon name="movement" size={20}/>}, {value: 'familia', label: 'Para a família', icon: <BrandIcon name="family" size={20}/>} ]}/>
        <div className="family-copy-panels"><TabsContent value="voce" forceMount aria-hidden={perspective !== 'voce'} tabIndex={perspective === 'voce' ? 0 : -1}><h3>Sua rotina continua sendo sua.</h3><p>Veja seus passos, acompanhe a estimativa de sono e saiba quem participa da sua família.</p></TabsContent>
        <TabsContent value="familia" forceMount aria-hidden={perspective !== 'familia'} tabIndex={perspective === 'familia' ? 0 : -1}><h3>Acompanhar começa com um vínculo.</h3><p>Familiares com vínculo aprovado acompanham os registros e as mudanças da rotina.</p></TabsContent></div>
      </Tabs>
      <div className="permission-note"><BrandIcon name="link" size={21}/><span>O acompanhamento depende de vínculo aprovado.</span></div>
    </div>
  </div></section>;
}
export function Close() {
  return <section className="close-section"><div className="wrap close-content">
    <img className="close-ritmo" src={A + 'ritmo-oi-r2.webp'} alt="Ritmo aparece de cabeça para baixo para dar um oi." width="1536" height="1024" loading="lazy"/>
    <h2>Seu dia, com mais contexto.</h2><p>Entre para acompanhar sua rotina<br/>ou a de uma pessoa da sua família.</p>
    <Button asChild><a href="/painel/">Explorar o painel <Arrow/></a></Button>
    <a className="close-help" href="#duvidas">Tenho uma dúvida <ArrowUpRight size={16}/></a>
  </div></section>;
}

const assetGroups = [
  {name: 'Personagem', assets: [['ritmo-hero.webp', 'Ritmo em repouso', 'Cena principal'], ['ritmo-guia.webp', 'Ritmo apresenta', 'Guia 2D'], ['ritmo-oi-r2.webp', 'Ritmo dá um oi', 'Pose invertida, fundo transparente']]},
  {name: 'Composições da marca', assets: [['cenario-ritmo-r12.webp', 'Onda em baixo-relevo', 'Cenário de estúdio para a seção do iPhone'], ['painel-antonio-r11.webp', 'Seu acompanhamento', 'Captura atual do painel de Antônio'], ['painel-maria-r11.webp', 'Uma pessoa da família', 'Captura atual do painel de Maria']]},
  {name: 'Ícones CareTwin', assets: ['movement', 'sleep', 'history', 'family', 'link'].map((name, i) => [`brand/icon-${name}.svg`, ['Movimento', 'Sono estimado', 'Histórico', 'Família', 'Vínculo aprovado'][i], 'SVG vetorial editável'])},
];
export function Library() {
  const [dark, setDark] = useState(false);
  return <main className="library wrap"><div className="library-top"><a href="/" className="back-link"><ArrowLeft size={18}/>Voltar à landing</a><a className="brand" href="/">Care<span>Twin</span><span className="brand-dot"/></a></div>
    <div className="library-intro"><div><h1>Um jeito de<br/>ser CareTwin.</h1><p>Personagem, cenas e ícones.<br/>Uma biblioteca para manter a marca consistente.</p></div><button className={`library-toggle ${dark ? 'selected' : ''}`} onClick={() => setDark(!dark)} aria-pressed={dark}><MoonStars size={18}/>{dark ? 'Fundo escuro' : 'Testar fundo escuro'}</button></div>
    {assetGroups.map(group => <section className="library-group" key={group.name}><h2>{group.name}</h2><div className={`asset-grid ${dark ? 'asset-dark' : ''}`}>{group.assets.map(([file, name, type]) => <article className="asset-item" key={file}><div className={`asset-preview ${file.endsWith('.svg') ? 'icon-preview' : ''}`}><img src={A + file} alt={'Prévia de ' + name}/></div><div className="asset-meta"><div><h3>{name}</h3><span>{type}</span></div><a href={A + file} download aria-label={'Baixar ' + name}><DownloadSimple size={23}/></a></div></article>)}</div></section>)}
    <div className="library-notes"><h2>Uma família visual, com função.</h2><p>Azul, branco e tipografia clara. Composições para explicar a rotina; Ritmo para acolher e orientar. Os ícones de interface continuam simples e reconhecíveis.</p><p>Personagem e composição 3D gerados por IA para este estudo. A pulseira e o celular são conceituais, sem representar o desenho industrial final. Ícones SVG e sol/lua vetoriais autorais. Estudos anteriores preservados nos arquivos, fora da composição atual.</p></div>
  </main>;
}
