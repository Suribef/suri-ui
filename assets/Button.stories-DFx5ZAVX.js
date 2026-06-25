import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{n,t as r}from"./Button-4eKPu8x4.js";var i,a,o,s,c,l,u,d;e((()=>{n(),i=t(),a={title:`Components/Button`,component:r,tags:[`autodocs`],parameters:{layout:`centered`},argTypes:{variant:{control:`select`,options:[`primary`,`secondary`,`ghost`,`danger`],description:`Variante visual del botón`},size:{control:`select`,options:[`sm`,`md`,`lg`],description:`Tamaño del botón`},loading:{control:`boolean`,description:`Estado de carga. Usa aria-disabled (no disabled nativo) para mantener el botón en el tab order.`},disabled:{control:`boolean`,description:`Deshabilita el botón nativamente. A diferencia de loading, lo saca del tab order.`},fullWidth:{control:`boolean`,description:`Ocupa el 100% del ancho del contenedor`}}},o={args:{children:`Botón primario`,variant:`primary`,size:`md`}},s={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`12px`,flexWrap:`wrap`},children:[(0,i.jsx)(r,{variant:`primary`,children:`Primary`}),(0,i.jsx)(r,{variant:`secondary`,children:`Secondary`}),(0,i.jsx)(r,{variant:`ghost`,children:`Ghost`}),(0,i.jsx)(r,{variant:`danger`,children:`Danger`})]}),parameters:{controls:{disable:!0}}},c={args:{children:`Guardando...`,loading:!0},parameters:{docs:{description:{story:"En estado `loading`, el botón usa `aria-disabled` en lugar de `disabled` nativo. Permanece en el tab order para que usuarios de teclado puedan navegar hasta él y leer el estado."}}}},l={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`12px`,alignItems:`center`},children:[(0,i.jsx)(r,{size:`sm`,children:`Small`}),(0,i.jsx)(r,{size:`md`,children:`Medium`}),(0,i.jsx)(r,{size:`lg`,children:`Large`})]}),parameters:{controls:{disable:!0}}},u={args:{children:`No disponible`,disabled:!0}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Botón primario',
    variant: 'primary',
    size: 'md'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  }}>\r
      <Button variant="primary">Primary</Button>\r
      <Button variant="secondary">Secondary</Button>\r
      <Button variant="ghost">Ghost</Button>\r
      <Button variant="danger">Danger</Button>\r
    </div>,
  parameters: {
    controls: {
      disable: true
    }
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Guardando...',
    loading: true
  },
  parameters: {
    docs: {
      description: {
        story: 'En estado \`loading\`, el botón usa \`aria-disabled\` en lugar de ' + '\`disabled\` nativo. Permanece en el tab order para que usuarios ' + 'de teclado puedan navegar hasta él y leer el estado.'
      }
    }
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  }}>\r
      <Button size="sm">Small</Button>\r
      <Button size="md">Medium</Button>\r
      <Button size="lg">Large</Button>\r
    </div>,
  parameters: {
    controls: {
      disable: true
    }
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'No disponible',
    disabled: true
  }
}`,...u.parameters?.docs?.source}}},d=[`Default`,`Variants`,`Loading`,`Sizes`,`Disabled`]}))();export{o as Default,u as Disabled,c as Loading,l as Sizes,s as Variants,d as __namedExportsOrder,a as default};