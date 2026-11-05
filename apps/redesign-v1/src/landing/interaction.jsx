import React, {useEffect, useId, useRef, useState} from 'react';
import {LayoutGroup, motion, useInView, useReducedMotion} from 'motion/react';
import {ArrowRight, List as Menu} from '@phosphor-icons/react';
import {Button, TabsList, TabsTrigger, Sheet, SheetTrigger, SheetContent, SheetClose, SheetTitle, SheetDescription} from './components/ui';

export function ScrollHeading({lines, className = ''}) {
  const root = useRef(null);
  const revealed = useInView(root, {once: true, amount: .2});
  const reduced = useReducedMotion();
  let word = 0;
  return <h2 ref={root} className={`scroll-heading ${className}`} data-revealed={revealed && !reduced ? 'true' : 'false'} aria-label={lines.join(' ')}>
    {lines.map((line, i) => <React.Fragment key={line}>{i > 0 && <br/>}{line.split(' ').map((text, j) => <React.Fragment key={j}>{j > 0 && ' '}<span className="heading-word" aria-hidden="true"><span className="heading-word-inner" style={{'--word': word++}}>{text}</span></span></React.Fragment>)}</React.Fragment>)}
  </h2>;
}

export function useInputModality() {
  useEffect(() => {
    const root = document.documentElement;
    const pointer = () => {root.dataset.input = 'pointer';};
    const keyboard = event => {if (['Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) root.dataset.input = 'keyboard';};
    root.dataset.input = 'pointer';
    document.addEventListener('pointerdown', pointer, true);
    document.addEventListener('keydown', keyboard, true);
    return () => {document.removeEventListener('pointerdown', pointer, true); document.removeEventListener('keydown', keyboard, true);};
  }, []);
}

export function SegmentedTabs({value, onValueChange, items, label}) {
  const id = useId();
  const reduced = useReducedMotion();
  return <LayoutGroup id={id}><TabsList className="animated-tabs-list" aria-label={label}>
    {items.map(item => <TabsTrigger key={item.value} value={item.value} className="animated-tab" onClick={() => onValueChange(item.value)}>
      {value === item.value && <motion.span className="tab-pill" layoutId="selected-pill" aria-hidden="true" initial={false} transition={{duration: reduced ? 0 : .36, ease: [.16, 1, .3, 1]}}/>}
      <span className="segmented-label">{item.icon}{item.label}</span>
    </TabsTrigger>)}
  </TabsList></LayoutGroup>;
}

export function Arrow({size = 18}) {
  return <span className="action-arrow" style={{width: size, height: size}} aria-hidden="true">
    <ArrowRight className="arrow-current" size={size}/><ArrowRight className="arrow-next" size={size}/>
  </span>;
}

export function Header({brand}) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState('');
  const root = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id === 'inicio' ? '' : entry.target.id);
    }, {rootMargin: '-18% 0px -65% 0px'});
    for (const id of ['inicio', 'como-funciona', 'seu-historico', 'para-quem', 'duvidas']) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let last = Math.max(0, window.scrollY), distance = 0, previousDirection = 0, frame = 0;
    function update() {
      frame = 0;
      const y = Math.max(0, window.scrollY), change = y - last;
      last = y;
      const keyboardFocus = root.current?.contains(document.activeElement) && document.activeElement?.matches(':focus-visible');
      if (y < 120 || open || keyboardFocus) {
        setHidden(false); distance = 0; return;
      }
      if (Math.abs(change) < 1) return;
      const direction = Math.sign(change);
      if (direction !== previousDirection) distance = 0;
      distance += change; previousDirection = direction;
      if (distance > 28) setHidden(true);
      if (distance < -10) setHidden(false);
    }
    function onScroll() {if (!frame) frame = requestAnimationFrame(update);}
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => {window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame);};
  }, [open]);
  return <header ref={root} className={`header-shell ${hidden && !open ? 'is-hidden' : ''}`} onFocusCapture={() => setHidden(false)}>
    <nav className="glass-nav" aria-label="Principal">{brand}
      <div className="desktop-links"><a href="#como-funciona" aria-current={['como-funciona', 'seu-historico'].includes(active) ? 'location' : undefined}>Como funciona</a><a href="#para-quem" aria-current={active === 'para-quem' ? 'location' : undefined}>Para quem</a><a href="#duvidas" aria-current={active === 'duvidas' ? 'location' : undefined}>Dúvidas</a></div>
      <Button asChild className="nav-cta"><a href="/painel/">Explorar o painel <Arrow size={16}/></a></Button>
      <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><button className="icon-button mobile-toggle" aria-label="Abrir menu"><Menu size={24}/></button></SheetTrigger>
        <SheetContent><SheetTitle className="sheet-title">CareTwin</SheetTitle><SheetDescription className="sheet-description">Encontre seu caminho.</SheetDescription>
          <div className="sheet-links">{[['#como-funciona', 'Como funciona'], ['#para-quem', 'Para quem'], ['#duvidas', 'Dúvidas']].map(([href, label]) => <SheetClose asChild key={href}><a href={href}>{label}<Arrow/></a></SheetClose>)}
            <SheetClose asChild><Button asChild><a href="/painel/">Explorar o painel <Arrow/></a></Button></SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  </header>;
}
