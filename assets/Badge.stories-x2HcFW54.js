import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{n,t as r}from"./Badge-DTFeEWdI.js";var i,a,o,s,c,l;e((()=>{n(),i=t(),a={title:`Components/Badge`,component:r,tags:[`autodocs`],parameters:{layout:`centered`}},o={args:{children:`Activo`,variant:`default`}},s={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,flexWrap:`wrap`},children:[(0,i.jsx)(r,{variant:`default`,children:`Default`}),(0,i.jsx)(r,{variant:`success`,children:`Success`}),(0,i.jsx)(r,{variant:`warning`,children:`Warning`}),(0,i.jsx)(r,{variant:`danger`,children:`Danger`}),(0,i.jsx)(r,{variant:`info`,children:`Info`})]}),parameters:{controls:{disable:!0}}},c={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`16px`,alignItems:`center`},children:[(0,i.jsx)(r,{dot:!0,variant:`success`,"aria-label":`Usuario activo`}),(0,i.jsx)(r,{dot:!0,variant:`warning`,"aria-label":`Atención requerida`}),(0,i.jsx)(r,{dot:!0,variant:`danger`,"aria-label":`Error crítico`})]}),parameters:{controls:{disable:!0},docs:{description:{story:"Modo dot para indicadores de estado. Requiere `aria-label` obligatorio — sin él, el indicador es invisible para lectores de pantalla."}}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Activo',
    variant: 'default'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  }}>\r
      <Badge variant="default">Default</Badge>\r
      <Badge variant="success">Success</Badge>\r
      <Badge variant="warning">Warning</Badge>\r
      <Badge variant="danger">Danger</Badge>\r
      <Badge variant="info">Info</Badge>\r
    </div>,
  parameters: {
    controls: {
      disable: true
    }
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  }}>\r
      <Badge dot variant="success" aria-label="Usuario activo" />\r
      <Badge dot variant="warning" aria-label="Atención requerida" />\r
      <Badge dot variant="danger" aria-label="Error crítico" />\r
    </div>,
  parameters: {
    controls: {
      disable: true
    },
    docs: {
      description: {
        story: 'Modo dot para indicadores de estado. ' + 'Requiere \`aria-label\` obligatorio — sin él, ' + 'el indicador es invisible para lectores de pantalla.'
      }
    }
  }
}`,...c.parameters?.docs?.source}}},l=[`Default`,`Variants`,`DotMode`]}))();export{o as Default,c as DotMode,s as Variants,l as __namedExportsOrder,a as default};