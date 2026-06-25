import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{Y as n}from"./iframe-HUIuvCOF.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i,t as a}from"./cn-BjA3phlr.js";var o,s,c,l,u,d,f,p,m,h,g,_,v=e((()=>{o=`_wrapper_1ny9q_1`,s=`_fullWidth_1ny9q_7`,c=`_label_1ny9q_10`,l=`_required_1ny9q_18`,u=`_selectWrapper_1ny9q_21`,d=`_select_1ny9q_21`,f=`_selectError_1ny9q_57`,p=`_disabled_1ny9q_74`,m=`_description_1ny9q_80`,h=`_descriptionHelper_1ny9q_88`,g=`_descriptionError_1ny9q_89`,_={wrapper:o,fullWidth:s,label:c,required:l,selectWrapper:u,select:d,selectError:f,disabled:p,description:m,descriptionHelper:h,descriptionError:g}}));function y(e){return`group`in e}var b,x,S,C=e((()=>{b=t(n(),1),i(),v(),x=r(),S=(0,b.forwardRef)(({options:e,label:t,placeholder:n,helperText:r,error:i,fullWidth:o=!1,disabled:s,required:c,id:l,className:u,...d},f)=>{let p=(0,b.useId)(),m=l??p,h=`${m}-description`,g=i||r||void 0;return(0,x.jsxs)(`div`,{className:a(_.wrapper,o&&_.fullWidth,s&&_.disabled),"data-fullwidth":o||void 0,"data-error":!!i||void 0,"data-disabled":s||void 0,children:[t&&(0,x.jsxs)(`label`,{htmlFor:m,className:_.label,children:[t,c&&(0,x.jsxs)(`span`,{"aria-hidden":`true`,className:_.required,children:[` `,`*`]})]}),(0,x.jsx)(`div`,{className:_.selectWrapper,children:(0,x.jsxs)(`select`,{ref:f,id:m,className:a(_.select,i&&_.selectError,u),disabled:s,required:c,"aria-required":c||void 0,"aria-invalid":!!i||void 0,"aria-describedby":h,...d,children:[n&&(0,x.jsx)(`option`,{value:``,disabled:!0,hidden:!0,children:n}),e.map(e=>y(e)?(0,x.jsx)(`optgroup`,{label:e.group,children:e.options.map(e=>(0,x.jsx)(`option`,{value:e.value,disabled:e.disabled,children:e.label},e.value))},e.group):(0,x.jsx)(`option`,{value:e.value,disabled:e.disabled,children:e.label},e.value))]})}),(0,x.jsx)(`span`,{id:h,className:a(_.description,i?_.descriptionError:_.descriptionHelper),"aria-live":`polite`,"aria-atomic":`true`,children:g})]})}),S.displayName=`Select`,S.__docgenInfo={description:``,methods:[],displayName:`Select`,props:{options:{required:!0,tsType:{name:`Array`,elements:[{name:`union`,raw:`SelectOption | SelectOptionGroup`,elements:[{name:`signature`,type:`object`,raw:`{
  value: string
  label: string
  disabled?: boolean
}`,signature:{properties:[{key:`value`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}},{key:`disabled`,value:{name:`boolean`,required:!1}}]}},{name:`signature`,type:`object`,raw:`{
  group: string
  options: SelectOption[]
}`,signature:{properties:[{key:`group`,value:{name:`string`,required:!0}},{key:`options`,value:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{
  value: string
  label: string
  disabled?: boolean
}`,signature:{properties:[{key:`value`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}},{key:`disabled`,value:{name:`boolean`,required:!1}}]}}],raw:`SelectOption[]`,required:!0}}]}}]}],raw:`SelectItem[]`},description:``},label:{required:!1,tsType:{name:`string`},description:``},placeholder:{required:!1,tsType:{name:`string`},description:``},helperText:{required:!1,tsType:{name:`string`},description:``},error:{required:!1,tsType:{name:`string`},description:``},fullWidth:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}}},composes:[`Omit`]}})),w,T,E,D,O,k,A;e((()=>{C(),w=[{value:`mx`,label:`México`},{value:`us`,label:`Estados Unidos`},{value:`ca`,label:`Canadá`}],T=[{group:`América`,options:[{value:`mx`,label:`México`},{value:`us`,label:`Estados Unidos`}]},{group:`Europa`,options:[{value:`es`,label:`España`},{value:`de`,label:`Alemania`}]}],E={title:`Components/Select`,component:S,tags:[`autodocs`],parameters:{layout:`centered`}},D={args:{label:`País`,options:w,placeholder:`Selecciona un país`}},O={args:{label:`País`,options:T,placeholder:`Selecciona un país`}},k={args:{label:`País`,options:w,placeholder:`Selecciona un país`,error:`Selecciona un país para continuar`}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'País',
    options: countries,
    placeholder: 'Selecciona un país'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'País',
    options: grouped,
    placeholder: 'Selecciona un país'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'País',
    options: countries,
    placeholder: 'Selecciona un país',
    error: 'Selecciona un país para continuar'
  }
}`,...k.parameters?.docs?.source}}},A=[`Default`,`Grouped`,`WithError`]}))();export{D as Default,O as Grouped,k as WithError,A as __namedExportsOrder,E as default};