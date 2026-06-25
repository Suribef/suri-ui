import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{Y as n}from"./iframe-HUIuvCOF.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i,t as a}from"./cn-BjA3phlr.js";function o(...e){return(0,s.useCallback)(t=>{e.forEach(e=>{e&&(typeof e==`function`?e(t):e.current=t)})},e)}var s,c=e((()=>{s=t(n(),1)})),l,u,d,f,p,m,h,g,_,v,y,b,x=e((()=>{l=`_wrapper_48l1v_1`,u=`_fullWidth_48l1v_7`,d=`_label_48l1v_10`,f=`_required_48l1v_18`,p=`_textarea_48l1v_21`,m=`_autoResize_48l1v_54`,h=`_textareaError_48l1v_60`,g=`_disabled_48l1v_77`,_=`_description_48l1v_83`,v=`_descriptionHelper_48l1v_91`,y=`_descriptionError_48l1v_92`,b={wrapper:l,fullWidth:u,label:d,required:f,textarea:p,"resize-none":`_resize-none_48l1v_47`,"resize-vertical":`_resize-vertical_48l1v_48`,"resize-horizontal":`_resize-horizontal_48l1v_49`,"resize-both":`_resize-both_48l1v_50`,autoResize:m,textareaError:h,disabled:g,description:_,descriptionHelper:v,descriptionError:y}})),S,C,w,T=e((()=>{S=t(n(),1),i(),c(),x(),C=r(),w=(0,S.forwardRef)(({label:e,helperText:t,error:n,fullWidth:r=!1,resize:i=`vertical`,autoResize:s=!1,disabled:c,required:l,id:u,rows:d=3,value:f,className:p,onChange:m,...h},g)=>{let _=(0,S.useId)(),v=u??_,y=`${v}-description`,x=n||t||void 0,w=(0,S.useRef)(null),T=o(w,g);return(0,S.useEffect)(()=>{if(!s||!w.current)return;let e=w.current;e.style.height=`auto`,e.style.height=`${e.scrollHeight}px`},[s,f]),(0,C.jsxs)(`div`,{className:a(b.wrapper,r&&b.fullWidth,c&&b.disabled),"data-fullwidth":r||void 0,"data-error":!!n||void 0,"data-disabled":c||void 0,children:[e&&(0,C.jsxs)(`label`,{htmlFor:v,className:b.label,children:[e,l&&(0,C.jsxs)(`span`,{"aria-hidden":`true`,className:b.required,children:[` `,`*`]})]}),(0,C.jsx)(`textarea`,{ref:T,id:v,rows:d,value:f,className:a(b.textarea,b[`resize-${i}`],s&&b.autoResize,n&&b.textareaError,p),disabled:c,required:l,"aria-required":l||void 0,"aria-invalid":!!n||void 0,"aria-describedby":y,onChange:m,...h}),(0,C.jsx)(`span`,{id:y,className:a(b.description,n?b.descriptionError:b.descriptionHelper),"aria-live":`polite`,"aria-atomic":`true`,children:x})]})}),w.displayName=`Textarea`,w.__docgenInfo={description:``,methods:[],displayName:`Textarea`,props:{label:{required:!1,tsType:{name:`string`},description:``},helperText:{required:!1,tsType:{name:`string`},description:``},error:{required:!1,tsType:{name:`string`},description:``},fullWidth:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}},resize:{required:!1,tsType:{name:`union`,raw:`'none' | 'vertical' | 'horizontal' | 'both'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'vertical'`},{name:`literal`,value:`'horizontal'`},{name:`literal`,value:`'both'`}]},description:``,defaultValue:{value:`'vertical'`,computed:!1}},autoResize:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}},rows:{defaultValue:{value:`3`,computed:!1},required:!1}},composes:[`TextareaHTMLAttributes`]}})),E,D,O,k,A;e((()=>{T(),E={title:`Components/Textarea`,component:w,tags:[`autodocs`],parameters:{layout:`centered`}},D={args:{label:`Mensaje`,placeholder:`Escribe tu mensaje aquí...`,rows:4}},O={args:{label:`Descripción`,error:`La descripción es requerida`,rows:3}},k={args:{label:`Notas`,autoResize:!0,placeholder:`Escribe y el campo crece automáticamente...`,rows:2},parameters:{docs:{description:{story:"`autoResize` calcula la altura via `scrollHeight`. Desactiva `resize` manual automáticamente para evitar conflictos visuales."}}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Mensaje',
    placeholder: 'Escribe tu mensaje aquí...',
    rows: 4
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Descripción',
    error: 'La descripción es requerida',
    rows: 3
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notas',
    autoResize: true,
    placeholder: 'Escribe y el campo crece automáticamente...',
    rows: 2
  },
  parameters: {
    docs: {
      description: {
        story: '\`autoResize\` calcula la altura via \`scrollHeight\`. ' + 'Desactiva \`resize\` manual automáticamente para evitar ' + 'conflictos visuales.'
      }
    }
  }
}`,...k.parameters?.docs?.source}}},A=[`Default`,`WithError`,`AutoResize`]}))();export{k as AutoResize,D as Default,O as WithError,A as __namedExportsOrder,E as default};