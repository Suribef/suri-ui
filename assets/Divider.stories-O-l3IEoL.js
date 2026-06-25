import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{n,t as r}from"./cn-BjA3phlr.js";var i,a,o,s,c=e((()=>{i=`_divider_a98c6_1`,a=`_horizontal_a98c6_7`,o=`_vertical_a98c6_13`,s={divider:i,horizontal:a,vertical:o}}));function l({decorative:e=!1,orientation:t=`horizontal`,label:n,className:i,...a}){let o=t===`vertical`;return e?(0,u.jsx)(`div`,{"aria-hidden":`true`,className:r(s.divider,o?s.vertical:s.horizontal,i),"data-orientation":t,"data-decorative":`true`,...a}):(0,u.jsx)(`hr`,{role:o?`separator`:void 0,"aria-orientation":o?`vertical`:void 0,"aria-label":n,className:r(s.divider,o?s.vertical:s.horizontal,i),"data-orientation":t,...a})}var u,d=e((()=>{n(),c(),u=t(),l.displayName=`Divider`,l.__docgenInfo={description:``,methods:[],displayName:`Divider`,props:{decorative:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}},orientation:{required:!1,tsType:{name:`union`,raw:`'horizontal' | 'vertical'`,elements:[{name:`literal`,value:`'horizontal'`},{name:`literal`,value:`'vertical'`}]},description:``,defaultValue:{value:`'horizontal'`,computed:!1}},label:{required:!1,tsType:{name:`string`},description:``}},composes:[`HTMLAttributes`]}})),f,p,m,h,g,_;e((()=>{d(),f=t(),p={title:`Components/Divider`,component:l,tags:[`autodocs`],parameters:{layout:`padded`}},m={render:()=>(0,f.jsxs)(`div`,{style:{width:300},children:[(0,f.jsx)(`p`,{children:`Sección A`}),(0,f.jsx)(l,{}),(0,f.jsx)(`p`,{children:`Sección B`})]}),parameters:{docs:{description:{story:'Usa `<hr>` semántico. Screen readers anuncian "separador".'}}}},h={render:()=>(0,f.jsxs)(`div`,{style:{width:300},children:[(0,f.jsx)(`p`,{children:`Elemento visual`}),(0,f.jsx)(l,{decorative:!0}),(0,f.jsx)(`p`,{children:`Otro elemento`})]}),parameters:{docs:{description:{story:'Modo decorativo: `aria-hidden="true"`. Invisible para lectores de pantalla.'}}}},g={render:()=>(0,f.jsxs)(`div`,{style:{display:`flex`,height:40,alignItems:`center`,gap:12},children:[(0,f.jsx)(`span`,{children:`Inicio`}),(0,f.jsx)(l,{orientation:`vertical`}),(0,f.jsx)(`span`,{children:`Acerca de`}),(0,f.jsx)(l,{orientation:`vertical`}),(0,f.jsx)(`span`,{children:`Contacto`})]})},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 300
  }}>\r
      <p>Sección A</p>\r
      <Divider />\r
      <p>Sección B</p>\r
    </div>,
  parameters: {
    docs: {
      description: {
        story: 'Usa \`<hr>\` semántico. Screen readers anuncian "separador".'
      }
    }
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 300
  }}>\r
      <p>Elemento visual</p>\r
      <Divider decorative />\r
      <p>Otro elemento</p>\r
    </div>,
  parameters: {
    docs: {
      description: {
        story: 'Modo decorativo: \`aria-hidden="true"\`. ' + 'Invisible para lectores de pantalla.'
      }
    }
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    height: 40,
    alignItems: 'center',
    gap: 12
  }}>\r
      <span>Inicio</span>\r
      <Divider orientation="vertical" />\r
      <span>Acerca de</span>\r
      <Divider orientation="vertical" />\r
      <span>Contacto</span>\r
    </div>
}`,...g.parameters?.docs?.source}}},_=[`Semantic`,`Decorative`,`Vertical`]}))();export{h as Decorative,m as Semantic,g as Vertical,_ as __namedExportsOrder,p as default};