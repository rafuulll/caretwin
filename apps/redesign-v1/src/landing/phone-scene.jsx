import React from 'react';

const screens = [
  {value: 'voce', file: 'painel-antonio-r11.webp'},
  {value: 'familia', file: 'painel-maria-r11.webp'},
];

export function PhoneScene({perspective}) {
  const description = perspective === 'familia'
    ? 'iPhone mostrando o painel de Maria, na perspectiva de um familiar.'
    : 'iPhone mostrando o painel de Antônio, na perspectiva de quem usa a pulseira.';
  return <figure className="family-art phone-scene" role="img" aria-label={description}>
    <img className="phone-scene-backdrop" src="/assets/cenario-ritmo-r12.webp" alt="" width="1254" height="1254" loading="lazy"/>
    <div className="phone-device" aria-hidden="true">
      <div className="phone-bezel"><div className="phone-display">
        {screens.map(screen => <img key={screen.value}
          className={'phone-screen-capture' + (screen.value === perspective ? ' is-active' : '')}
          src={'/assets/' + screen.file} alt="" width="1170" height="2532" loading="lazy" draggable="false"/>)}
        <span className="phone-island"/>
      </div></div>
      <span className="phone-side-button"/>
    </div>
  </figure>;
}
