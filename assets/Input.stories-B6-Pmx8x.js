import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{Y as n}from"./iframe-HUIuvCOF.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i,t as a}from"./cn-BjA3phlr.js";var o,s,c,l,u,d,f,p,m,h,g,_=e((()=>{o=`_wrapper_1cd3d_1`,s=`_fullWidth_1cd3d_7`,c=`_label_1cd3d_12`,l=`_required_1cd3d_20`,u=`_input_1cd3d_25`,d=`_inputError_1cd3d_51`,f=`_disabled_1cd3d_68`,p=`_description_1cd3d_74`,m=`_descriptionHelper_1cd3d_80`,h=`_descriptionError_1cd3d_84`,g={wrapper:o,fullWidth:s,label:c,required:l,input:u,inputError:d,disabled:f,description:p,descriptionHelper:m,descriptionError:h}})),v,y,b,x=e((()=>{v=t(n(),1),i(),_(),y=r(),b=(0,v.forwardRef)(({label:e,helperText:t,error:n,fullWidth:r=!1,disabled:i,required:o,id:s,className:c,...l},u)=>{let d=(0,v.useId)(),f=s??d,p=`${f}-description`,m=n||t||void 0;return(0,y.jsxs)(`div`,{className:a(g.wrapper,r&&g.fullWidth,i&&g.disabled),"data-fullwidth":r||void 0,"data-error":!!n||void 0,"data-disabled":i||void 0,children:[e&&(0,y.jsxs)(`label`,{htmlFor:f,className:g.label,children:[e,o&&(0,y.jsxs)(`span`,{"aria-hidden":`true`,className:g.required,children:[` `,`*`]})]}),(0,y.jsx)(`input`,{ref:u,id:f,className:a(g.input,n&&g.inputError,c),disabled:i,required:o,"aria-required":o||void 0,"aria-invalid":!!n||void 0,"aria-describedby":p,...l}),(0,y.jsx)(`span`,{id:p,className:a(g.description,n?g.descriptionError:g.descriptionHelper),"aria-live":`polite`,"aria-atomic":`true`,children:m})]})}),b.displayName=`Input`,b.__docgenInfo={description:``,methods:[],displayName:`Input`,props:{label:{required:!1,tsType:{name:`string`},description:``},helperText:{required:!1,tsType:{name:`string`},description:``},error:{required:!1,tsType:{name:`string`},description:``},fullWidth:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}}},composes:[`InputHTMLAttributes`]}})),S,C,w,T,E,D,O;e((()=>{x(),S={title:`Components/Input`,component:b,tags:[`autodocs`],parameters:{layout:`centered`}},C={args:{label:`Email`,placeholder:`usuario@ejemplo.com`}},w={args:{label:`Contraseña`,type:`password`,helperText:`Mínimo 8 caracteres, una mayúscula y un número`}},T={args:{label:`Email`,placeholder:`usuario@ejemplo.com`,value:`no-es-un-email`,error:`Ingresa un email válido`,onChange:()=>{}},parameters:{docs:{description:{story:"El error reemplaza al helperText y activa `aria-invalid`. El contenedor de descripción siempre está montado para que `aria-live` anuncie el error al aparecer dinámicamente."}}}},E={args:{label:`Nombre completo`,required:!0,placeholder:`Tu nombre`}},D={args:{label:`Email verificado`,value:`sergio@ejemplo.com`,disabled:!0,onChange:()=>{}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    placeholder: 'usuario@ejemplo.com'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Contraseña',
    type: 'password',
    helperText: 'Mínimo 8 caracteres, una mayúscula y un número'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Email',
    placeholder: 'usuario@ejemplo.com',
    value: 'no-es-un-email',
    error: 'Ingresa un email válido',
    onChange: () => {}
  },
  parameters: {
    docs: {
      description: {
        story: 'El error reemplaza al helperText y activa \`aria-invalid\`. ' + 'El contenedor de descripción siempre está montado para que ' + '\`aria-live\` anuncie el error al aparecer dinámicamente.'
      }
    }
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Nombre completo',
    required: true,
    placeholder: 'Tu nombre'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Email verificado',
    value: 'sergio@ejemplo.com',
    disabled: true,
    onChange: () => {}
  }
}`,...D.parameters?.docs?.source}}},O=[`Default`,`WithHelperText`,`WithError`,`Required`,`Disabled`]}))();export{C as Default,D as Disabled,E as Required,T as WithError,w as WithHelperText,O as __namedExportsOrder,S as default};