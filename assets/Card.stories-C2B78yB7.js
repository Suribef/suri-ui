import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{Y as n}from"./iframe-HUIuvCOF.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i,t as a}from"./cn-BjA3phlr.js";import{n as o,t as s}from"./Badge-DTFeEWdI.js";import{t as c}from"./Button-4eKPu8x4.js";import{t as l}from"./Button-BYNPVZPp.js";var u,d,f,p,m,h,g,_,v,y=e((()=>{u=`_card_l6w6d_4`,d=`_bordered_l6w6d_15`,f=`_fullWidth_l6w6d_19`,p=`_header_l6w6d_29`,m=`_headerDivided_l6w6d_33`,h=`_body_l6w6d_37`,g=`_footer_l6w6d_41`,_=`_footerDivided_l6w6d_45`,v={card:u,bordered:d,fullWidth:f,"shadow-sm":`_shadow-sm_l6w6d_24`,"shadow-md":`_shadow-md_l6w6d_25`,"shadow-lg":`_shadow-lg_l6w6d_26`,header:p,headerDivided:m,body:h,footer:g,footerDivided:_}}));function b({divided:e=!1,className:t,children:n,...r}){return(0,w.jsx)(`div`,{className:a(v.header,e&&v.headerDivided,t),"data-divided":e||void 0,...r,children:n})}function x({className:e,children:t,...n}){return(0,w.jsx)(`div`,{className:a(v.body,e),...n,children:t})}function S({divided:e=!1,className:t,children:n,...r}){return(0,w.jsx)(`div`,{className:a(v.footer,e&&v.footerDivided,t),"data-divided":e||void 0,...r,children:n})}var C,w,T,E,D=e((()=>{C=t(n(),1),i(),y(),w=r(),T=(0,C.forwardRef)(({as:e=`div`,shadow:t=`sm`,bordered:n=!0,fullWidth:r=!1,className:i,children:o,...s},c)=>(0,w.jsx)(e,{ref:c,className:a(v.card,t!==`none`&&v[`shadow-${t}`],n&&v.bordered,r&&v.fullWidth,i),"data-shadow":t,"data-bordered":n||void 0,"data-fullwidth":r||void 0,...s,children:o})),T.displayName=`Card`,b.displayName=`Card.Header`,x.displayName=`Card.Body`,S.displayName=`Card.Footer`,E=T,E.Header=b,E.Body=x,E.Footer=S,b.__docgenInfo={description:``,methods:[],displayName:`Card.Header`,props:{divided:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}}},composes:[`HTMLAttributes`]},x.__docgenInfo={description:``,methods:[],displayName:`Card.Body`},S.__docgenInfo={description:``,methods:[],displayName:`Card.Footer`,props:{divided:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}}},composes:[`HTMLAttributes`]},T.__docgenInfo={description:``,methods:[],displayName:`Card`,props:{as:{required:!1,tsType:{name:`union`,raw:`'div' | 'article' | 'section' | 'main'`,elements:[{name:`literal`,value:`'div'`},{name:`literal`,value:`'article'`},{name:`literal`,value:`'section'`},{name:`literal`,value:`'main'`}]},description:``,defaultValue:{value:`'div'`,computed:!1}},shadow:{required:!1,tsType:{name:`union`,raw:`'none' | 'sm' | 'md' | 'lg'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'sm'`},{name:`literal`,value:`'md'`},{name:`literal`,value:`'lg'`}]},description:``,defaultValue:{value:`'sm'`,computed:!1}},bordered:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`true`,computed:!1}},fullWidth:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}}},composes:[`HTMLAttributes`]}})),O=e((()=>{o()})),k,A,j,M,N,P,F;e((()=>{D(),l(),O(),k=r(),A={title:`Components/Card`,component:E,tags:[`autodocs`],parameters:{layout:`centered`}},j={render:()=>(0,k.jsxs)(E,{style:{width:320},children:[(0,k.jsx)(E.Header,{children:(0,k.jsx)(`strong`,{children:`Título de la tarjeta`})}),(0,k.jsx)(E.Body,{children:`Contenido principal de la tarjeta. Puede incluir texto, imágenes u otros componentes.`}),(0,k.jsx)(E.Footer,{children:(0,k.jsx)(c,{size:`sm`,children:`Acción`})})]})},M={render:()=>(0,k.jsx)(`div`,{style:{display:`flex`,gap:`24px`},children:[`none`,`sm`,`md`,`lg`].map(e=>(0,k.jsxs)(E,{shadow:e,style:{width:160,padding:16},children:[`shadow="`,e,`"`]},e))}),parameters:{controls:{disable:!0}}},N={render:()=>(0,k.jsxs)(E,{style:{width:320},children:[(0,k.jsx)(E.Header,{divided:!0,children:(0,k.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`},children:[(0,k.jsx)(`strong`,{children:`Perfil`}),(0,k.jsx)(s,{variant:`success`,children:`Activo`})]})}),(0,k.jsx)(E.Body,{children:`Información del perfil de usuario.`}),(0,k.jsx)(E.Footer,{divided:!0,children:(0,k.jsxs)(`div`,{style:{display:`flex`,gap:`8px`},children:[(0,k.jsx)(c,{size:`sm`,variant:`ghost`,children:`Cancelar`}),(0,k.jsx)(c,{size:`sm`,children:`Guardar`})]})})]}),parameters:{controls:{disable:!0}}},P={render:()=>(0,k.jsxs)(E,{as:`article`,style:{width:320},children:[(0,k.jsx)(E.Header,{children:(0,k.jsx)(`strong`,{children:`Post del blog`})}),(0,k.jsx)(E.Body,{children:`Cuando Card envuelve contenido autocontenido (posts, productos, perfiles), usar as="article" para semántica HTML correcta.`})]}),parameters:{docs:{description:{story:"La prop `as` permite elegir el elemento semántico correcto según el contexto. `article` para contenido autocontenido, `section` para secciones temáticas, `div` (default) para contenedores visuales sin semántica específica."}}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <Card style={{
    width: 320
  }}>\r
      <Card.Header>\r
        <strong>Título de la tarjeta</strong>\r
      </Card.Header>\r
      <Card.Body>\r
        Contenido principal de la tarjeta. Puede incluir texto,\r
        imágenes u otros componentes.\r
      </Card.Body>\r
      <Card.Footer>\r
        <Button size="sm">Acción</Button>\r
      </Card.Footer>\r
    </Card>
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '24px'
  }}>\r
      {(['none', 'sm', 'md', 'lg'] as const).map(shadow => <Card key={shadow} shadow={shadow} style={{
      width: 160,
      padding: 16
    }}>\r
          shadow="{shadow}"\r
        </Card>)}\r
    </div>,
  parameters: {
    controls: {
      disable: true
    }
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <Card style={{
    width: 320
  }}>\r
      <Card.Header divided>\r
        <div style={{
        display: 'flex',
        justifyContent: 'space-between'
      }}>\r
          <strong>Perfil</strong>\r
          <Badge variant="success">Activo</Badge>\r
        </div>\r
      </Card.Header>\r
      <Card.Body>Información del perfil de usuario.</Card.Body>\r
      <Card.Footer divided>\r
        <div style={{
        display: 'flex',
        gap: '8px'
      }}>\r
          <Button size="sm" variant="ghost">Cancelar</Button>\r
          <Button size="sm">Guardar</Button>\r
        </div>\r
      </Card.Footer>\r
    </Card>,
  parameters: {
    controls: {
      disable: true
    }
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <Card as="article" style={{
    width: 320
  }}>\r
      <Card.Header>\r
        <strong>Post del blog</strong>\r
      </Card.Header>\r
      <Card.Body>\r
        Cuando Card envuelve contenido autocontenido (posts, productos,\r
        perfiles), usar as="article" para semántica HTML correcta.\r
      </Card.Body>\r
    </Card>,
  parameters: {
    docs: {
      description: {
        story: 'La prop \`as\` permite elegir el elemento semántico correcto ' + 'según el contexto. \`article\` para contenido autocontenido, ' + '\`section\` para secciones temáticas, \`div\` (default) para ' + 'contenedores visuales sin semántica específica.'
      }
    }
  }
}`,...P.parameters?.docs?.source}}},F=[`Default`,`Elevations`,`WithDividers`,`AsArticle`]}))();export{P as AsArticle,j as Default,M as Elevations,N as WithDividers,F as __namedExportsOrder,A as default};