import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{n,t as r}from"./cn-BjA3phlr.js";var i,a,o,s,c,l,u,d,f,p=e((()=>{i=`_spinner_b9met_1`,a=`_sm_b9met_10`,o=`_md_b9met_11`,s=`_lg_b9met_12`,c=`_svg_b9met_15`,l=`_spin_b9met_1`,u=`_track_b9met_22`,d=`_head_b9met_28`,f={spinner:i,sm:a,md:o,lg:s,svg:c,spin:l,track:u,head:d}}));function m({size:e=`md`,label:t=`Cargando...`,"aria-live":n=`polite`,className:i,...a}){return(0,h.jsxs)(`span`,{role:`status`,"aria-live":n,className:r(f.spinner,f[e],i),...a,children:[(0,h.jsxs)(`svg`,{className:f.svg,viewBox:`0 0 24 24`,fill:`none`,xmlns:`http://www.w3.org/2000/svg`,"aria-hidden":`true`,focusable:`false`,children:[(0,h.jsx)(`circle`,{className:f.track,cx:`12`,cy:`12`,r:`10`,strokeWidth:`3`}),(0,h.jsx)(`path`,{className:f.head,d:`M12 2a10 10 0 0 1 10 10`,strokeWidth:`3`,strokeLinecap:`round`})]}),(0,h.jsx)(`span`,{className:`sui-sr-only`,children:t})]})}var h,g=e((()=>{n(),p(),h=t(),m.displayName=`Spinner`,m.__docgenInfo={description:``,methods:[],displayName:`Spinner`,props:{size:{required:!1,tsType:{name:`union`,raw:`'sm' | 'md' | 'lg'`,elements:[{name:`literal`,value:`'sm'`},{name:`literal`,value:`'md'`},{name:`literal`,value:`'lg'`}]},description:``,defaultValue:{value:`'md'`,computed:!1}},label:{required:!1,tsType:{name:`string`},description:``,defaultValue:{value:`'Cargando...'`,computed:!1}},"aria-live":{required:!1,tsType:{name:`union`,raw:`'polite' | 'assertive'`,elements:[{name:`literal`,value:`'polite'`},{name:`literal`,value:`'assertive'`}]},description:``,defaultValue:{value:`'polite'`,computed:!1}}},composes:[`HTMLAttributes`]}})),_,v,y,b,x,S;e((()=>{g(),_=t(),v={title:`Components/Spinner`,component:m,tags:[`autodocs`],parameters:{layout:`centered`}},y={args:{size:`md`,label:`Cargando...`}},b={render:()=>(0,_.jsxs)(`div`,{style:{display:`flex`,gap:`24px`,alignItems:`center`},children:[(0,_.jsx)(m,{size:`sm`,label:`Cargando`}),(0,_.jsx)(m,{size:`md`,label:`Cargando`}),(0,_.jsx)(m,{size:`lg`,label:`Cargando`})]}),parameters:{controls:{disable:!0}}},x={args:{size:`md`,label:`Procesando pago...`,"aria-live":`assertive`},parameters:{docs:{description:{story:'`aria-live="assertive"` interrumpe al lector de pantalla inmediatamente. Reservar para operaciones críticas e irreversibles (pagos, eliminaciones). Para carga en background usar `polite`.'}}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    label: 'Cargando...'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  }}>\r
      <Spinner size="sm" label="Cargando" />\r
      <Spinner size="md" label="Cargando" />\r
      <Spinner size="lg" label="Cargando" />\r
    </div>,
  parameters: {
    controls: {
      disable: true
    }
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    label: 'Procesando pago...',
    'aria-live': 'assertive'
  },
  parameters: {
    docs: {
      description: {
        story: '\`aria-live="assertive"\` interrumpe al lector de pantalla ' + 'inmediatamente. Reservar para operaciones críticas e irreversibles ' + '(pagos, eliminaciones). Para carga en background usar \`polite\`.'
      }
    }
  }
}`,...x.parameters?.docs?.source}}},S=[`Default`,`Sizes`,`CriticalOperation`]}))();export{x as CriticalOperation,y as Default,b as Sizes,S as __namedExportsOrder,v as default};