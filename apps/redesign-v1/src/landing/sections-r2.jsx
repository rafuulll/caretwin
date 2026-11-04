import React, {useRef, useState} from 'react';
import {motion, useReducedMotion, useScroll, useTransform} from 'motion/react';
import {ArrowRight, ArrowUpRight, ArrowLeft, MoonStars, DownloadSimple} from '@phosphor-icons/react';
import {Button, Tabs, TabsList, TabsTrigger, TabsContent} from './components/ui';

const A = '/assets/';
const ease = [.16, 1, .3, 1];
function Arrow({size = 18}) {return <ArrowRight size={size} aria-hidden="true"/>;}
function BrandIcon({name, size = 24}) {return <img className="brand-icon" src={`${A}brand/icon-${name}.svg`} alt="" aria-hidden="true" width={size} height={size}/>;}

const moments = {
  dia: {title: 'Um passeio também conta.', text: 'A ida à feira, a volta no quarteirão, os passos pela casa. A pulseira registra o movimento que faz parte do seu dia.', detail: 'Passos no contexto da sua rotina', icon: 'movement', image: 'rotina-dia-r2.webp', alt: 'Cena editorial: pessoa mais velha caminhando ao ar livre com uma pulseira conceitual no pulso.'},
  noite: {title: 'A noite também conta uma história.', text: 'Enquanto você descansa, os movimentos registrados pela pulseira ajudam a estimar os períodos de sono. Mais contexto para acompanhar suas noites.', detail: 'Sono estimado a partir do movimento', icon: 'sleep', image: 'rotina-noite-r2.webp', alt: 'Cena editorial: mão e pulso com pulseira conceitual repousam sobre a roupa de cama, sob luz suave.'},
};
export function DayNight() {
  const [period, setPeriod] = useState('dia');
  return <section className="day-section section-pad" id="como-funciona"><div className="wrap">
    <div className="section-intro"><h2>O dia tem movimento.<br/>A noite, outro ritmo.</h2><p>O CareTwin acompanha os dois. E ajuda você a olhar para cada um com mais contexto.</p></div>
    <Tabs value={period} onValueChange={setPeriod} className="day-tabs">
      <TabsList aria-label="Explorar momentos da rotina"><TabsTrigger value="dia"><BrandIcon name="movement" size={21}/>Durante o dia</TabsTrigger><TabsTrigger value="noite"><BrandIcon name="sleep" size={21}/>Durante a noite</TabsTrigger></TabsList>
      <div className="day-composition">
        <div className="day-text">{Object.entries(moments).map(([key, data]) => <TabsContent value={key} key={key}><h3>{data.title}</h3><p>{data.text}</p><div className="plain-detail"><BrandIcon name={data.icon} size={22}/><span>{data.detail}</span></div></TabsContent>)}</div>
        <figure className={`day-photograph is-${period}`}><div className="day-photo-stage">{Object.entries(moments).map(([key, data]) => <img key={key} className={period === key ? 'moment-photo is-visible' : 'moment-photo'} src={A + data.image} alt={period === key ? data.alt : ''} aria-hidden={period !== key} loading="lazy" width="1448" height="1086"/>)}</div><figcaption>Cena ilustrativa gerada por IA. Pulseira conceitual.</figcaption></figure>
      </div>
    </Tabs>
    <div className="day-bottom"><span>O valor de um registro está no contexto.</span><a href="#seu-historico">Entenda a comparação <Arrow/></a></div>
  </div></section>;
}

const steps = [
  {label: 'Registrar', icon: 'movement', title: 'O cotidiano vira registro.', text: 'Os passos e os movimentos da noite são o começo. Cada registro ajuda a conhecer o dia de quem usa a pulseira.', diagramTitle: 'Um registro é um começo.', diagramText: 'Movimento e descanso, acompanhados ao longo do tempo.'},
  {label: 'Conhecer', icon: 'history', title: 'Os dias formam um histórico.', text: 'Com o tempo, os registros se conectam. O CareTwin forma uma referência a partir da rotina da própria pessoa.', diagramTitle: 'O conjunto dá contexto.', diagramText: 'A referência nasce do histórico pessoal.'},
  {label: 'Comparar', icon: 'link', title: 'Mudanças ganham contexto.', text: 'Os registros são comparados com esse histórico. Durante o dia, os passos são comparados até o mesmo horário.', diagramTitle: 'A comparação é pessoal.', diagramText: 'Seu dia é visto junto do seu próprio costume.'},
];
function RecordMark({x, y, active = false, accent = false}) {
  return <g transform={`translate(${x} ${y})`}>
    <rect x="0" y="0" width="50" height="88" rx="12" fill={accent ? '#2549d8' : active ? '#e7edff' : '#fff'} stroke={accent ? '#2549d8' : active ? '#a8bbed' : '#d9e1ef'} strokeWidth="1.5"/>
    <path d="M14 29h22M14 41h14M14 53h22" stroke={accent ? '#fff' : active ? '#2549d8' : '#a7b5cc'} strokeWidth="3" strokeLinecap="round"/>
    <circle cx="16" cy="70" r="3" fill={accent ? '#cbd9ff' : active ? '#2549d8' : '#c3cfdf'}/>
  </g>;
}
function RecordsDiagram({step}) {
  const reduced = useReducedMotion();
  const data = steps[step];
  return <div className={`records-diagram diagram-step-${step}`}>
    <div className="records-legend"><span><BrandIcon name="movement" size={18}/>Passos</span><span><BrandIcon name="sleep" size={18}/>Sono estimado</span></div>
    <svg className="records-canvas" viewBox="0 0 480 210" role="img" aria-label={data.diagramTitle + ' ' + data.diagramText}>
      <path d="M45 142H435" fill="none" stroke="#d9e2f0" strokeWidth="1.5"/>
      {[0, 1, 2, 3, 4, 5].map(n => <motion.g key={n} initial={false} animate={{opacity: step === 0 && n !== 2 ? .22 : 1, y: step === 1 ? [0, -6, 3, -2, 5, 0][n] : 0}} transition={{duration: reduced ? 0 : .3, ease}}><RecordMark x={48 + n * 64} y={49} active={step > 0} accent={step === 0 ? n === 2 : step === 2 && n === 5}/></motion.g>)}
      <motion.path d="M63 168H417" fill="none" stroke="#2549d8" strokeWidth="2" strokeLinecap="round" initial={false} animate={{pathLength: step === 0 ? 0 : step === 1 ? .75 : 1, opacity: step === 0 ? 0 : 1}} transition={{duration: reduced ? 0 : .45, ease}}/>
      {step === 2 && <><path d="M370 37v-9h50v9" fill="none" stroke="#2549d8" strokeWidth="1.5"/><circle cx="395" cy="22" r="4" fill="#2549d8"/></>}
    </svg>
    <div className="records-caption"><strong>{data.diagramTitle}</strong><span>{data.diagramText}</span></div>
    <span className="concept-label">Representação do processo, sem registros reais.</span>
  </div>;
}
export function History() {
  const [step, setStep] = useState('0');
  return <section className="history-section wrap" id="seu-historico">
    <div className="history-heading"><h2>A sua referência<br/>é você.</h2><p>Cada pessoa tem um costume.<br/>A comparação precisa respeitar isso.</p></div>
    <Tabs value={step} onValueChange={setStep} className="history-flow">
      <TabsList aria-label="Como a comparação pessoal funciona">{steps.map((data, i) => <TabsTrigger value={String(i)} key={data.label}><BrandIcon name={data.icon} size={25}/><span>{data.label}</span><Arrow size={17}/></TabsTrigger>)}</TabsList>
      {steps.map((data, i) => <TabsContent value={String(i)} key={data.label}>
        <div className="history-stage"><div className="history-explanation"><h3>{data.title}</h3><p>{data.text}</p><div className="ritmo-guide"><img src={A + 'ritmo-guia.webp'} alt="" width="1276" height="1276" loading="lazy"/><p>O seu costume é<br/>o ponto de partida.</p></div></div><RecordsDiagram step={i}/></div>
      </TabsContent>)}
    </Tabs>
  </section>;
}
export function Family() {
  const [perspective, setPerspective] = useState('voce');
  const target = useRef(null);
  const reduced = useReducedMotion();
  const {scrollYProgress} = useScroll({target, offset: ['start end', 'end start']});
  const crop = useTransform(scrollYProgress, [0, .32, 1], ['inset(3% 3% 3% 3% round 16px)', 'inset(0% 0% 0% 0% round 16px)', 'inset(0% 0% 0% 0% round 16px)']);
  return <section className="family-section" id="para-quem" ref={target}><div className="wrap family-layout">
    <figure className="family-art"><motion.img style={{clipPath: reduced ? 'inset(0% round 16px)' : crop}} src={A + 'familia-cotidiano-r2.webp'} alt="Cena editorial de uma mulher mais velha e uma familiar conversando à mesa, em um momento cotidiano." width="1448" height="1086" loading="lazy"/><figcaption>Cena editorial gerada por IA, sem representação de usuários reais.</figcaption></figure>
    <div className="family-copy"><h2>Estar perto também é dar espaço.</h2><p>Um olhar para a rotina de quem usa.<br/>Um jeito de acompanhar para quem se importa.</p>
      <Tabs value={perspective} onValueChange={setPerspective} className="family-tabs"><TabsList aria-label="Escolher perspectiva de uso"><TabsTrigger value="voce"><BrandIcon name="movement" size={20}/>Para quem usa</TabsTrigger><TabsTrigger value="familia"><BrandIcon name="family" size={20}/>Para a família</TabsTrigger></TabsList>
        <TabsContent value="voce"><h3>Sua rotina continua sendo sua.</h3><p>Veja seus passos, acompanhe a estimativa de sono e saiba quem participa da sua família.</p></TabsContent>
        <TabsContent value="familia"><h3>Acompanhar começa com um vínculo.</h3><p>Familiares com vínculo aprovado acompanham os registros e as mudanças da rotina.</p></TabsContent>
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
    <span>Primeira versão. Interface e funcionalidades ainda em desenvolvimento.</span>
  </div></section>;
}

const assetGroups = [
  {name: 'Personagem', assets: [['ritmo-hero.webp', 'Ritmo em repouso', 'Cena principal'], ['ritmo-guia.webp', 'Ritmo apresenta', 'Guia 2D'], ['ritmo-oi-r2.webp', 'Ritmo dá um oi', 'Pose invertida, fundo transparente']]},
  {name: 'Cenas da rotina', assets: [['rotina-dia-r2.webp', 'O movimento do dia', 'Cena editorial conceitual'], ['rotina-noite-r2.webp', 'Uma noite de descanso', 'Cena editorial conceitual'], ['familia-cotidiano-r2.webp', 'Proximidade no cotidiano', 'Cena editorial conceitual']]},
  {name: 'Ícones CareTwin', assets: ['movement', 'sleep', 'history', 'family', 'link'].map((name, i) => [`brand/icon-${name}.svg`, ['Movimento', 'Sono estimado', 'Histórico', 'Família', 'Vínculo aprovado'][i], 'SVG vetorial editável'])},
];
export function Library() {
  const [dark, setDark] = useState(false);
  return <main className="library wrap"><div className="library-top"><a href="/" className="back-link"><ArrowLeft size={18}/>Voltar à landing</a><a className="brand" href="/">Care<span>Twin</span><span className="brand-dot"/></a></div>
    <div className="library-intro"><div><h1>Um jeito de<br/>ser CareTwin.</h1><p>Personagem, cenas e ícones.<br/>Uma biblioteca para manter a marca consistente.</p></div><button className={`library-toggle ${dark ? 'selected' : ''}`} onClick={() => setDark(!dark)} aria-pressed={dark}><MoonStars size={18}/>{dark ? 'Fundo escuro' : 'Testar fundo escuro'}</button></div>
    {assetGroups.map(group => <section className="library-group" key={group.name}><h2>{group.name}</h2><div className={`asset-grid ${dark ? 'asset-dark' : ''}`}>{group.assets.map(([file, name, type]) => <article className="asset-item" key={file}><div className={`asset-preview ${file.endsWith('.svg') ? 'icon-preview' : ''}`}><img src={A + file} alt={'Prévia de ' + name}/></div><div className="asset-meta"><div><h3>{name}</h3><span>{type}</span></div><a href={A + file} download aria-label={'Baixar ' + name}><DownloadSimple size={23}/></a></div></article>)}</div></section>)}
    <div className="library-notes"><h2>Uma família visual, com função.</h2><p>Azul, branco e tipografia clara. Cenas para explicar a rotina; Ritmo para acolher e orientar. Os ícones de interface continuam simples e reconhecíveis.</p><p>Cenas e personagem gerados por IA para este estudo. As imagens não representam usuários reais nem o desenho industrial final da pulseira. Ícones SVG autorais; arquivos anteriores preservados no histórico do projeto.</p></div>
  </main>;
}
