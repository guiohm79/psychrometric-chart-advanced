/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,e$2=t$1.ShadowRoot&&(void 0===t$1.ShadyCSS||t$1.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$3=new WeakMap;let n$2 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$2&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$3.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$3.set(s,t));}return t}toString(){return this.cssText}};const r$2=t=>new n$2("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$2(o,t,s$2)},S$1=(s,o)=>{if(e$2)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$1.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$2?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$2(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$1,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$1,getOwnPropertySymbols:o$2,getPrototypeOf:n$1}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$1(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$1(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$1(t),...o$2(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,i$1=t=>t,s$1=t.trustedTypes,e=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$1=`lit$${Math.random().toFixed(9).slice(2)}$`,n="?"+o$1,r=`<${n}>`,l=document,c=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e?e.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p):void 0!==u[3]&&(c=p):c===p?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p:'"'===u[3]?$:g):c===$||c===g?c=p:c===_||c===m?c=v:(c=p,n=void 0);const x=c===p&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$1+x):s+o$1+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$1),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$1)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$1),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$1,t+1));)d.push({type:7,index:l}),t+=o$1.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$1(t).nextSibling;i$1(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t.litHtmlPolyfillSupport;B?.(S,k),(t.litHtmlVersions??=[]).push("3.3.3");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o=s.litElementPolyfillSupport;o?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.2");

/**
 * Psychrometric Calculations Helper
 * Contains pure functions for psychrometric conversions and calculations.
 * All temperatures are in Celsius internally.
 */
/**
 * Motifs de pointillés des tracés, en pixels CSS avant mise à l'échelle du canvas.
 * Partagés avec l'éditeur, qui en tire la liste des styles proposés : une seule
 * table évite qu'un style offert dans l'éditeur soit inconnu de la carte.
 */
const LINE_STYLES = {
    solid: [],
    dashed: [5, 5],
    dotted: [1.5, 3.5],
    dashdot: [7, 3, 1.5, 3],
};

/** Style de trait par défaut de chaque famille de tracés. */
const DEFAULT_LINE_STYLES = {
    gridLineStyle: 'dashed',
    curveLineStyle: 'solid',
    enthalpyLineStyle: 'dotted',
    wetBulbLineStyle: 'dotted',
    comfortLineStyle: 'solid',
    pointLineStyle: 'dashed',
};

/**
 * Choisit le pas de graduation d'un axe pour que ses étiquettes ne se chevauchent pas.
 *
 * Les polices du canvas sont bornées à un minimum lisible : en dessous d'une certaine
 * taille de carte, elles cessent de rétrécir alors que la zone de tracé, elle, continue.
 * Garder un pas fixe faisait alors se recouvrir les étiquettes. On remonte donc le pas
 * sur une échelle de multiples jusqu'à ce que l'espacement tienne la largeur (ou la
 * hauteur) d'une étiquette.
 * @param {number} range - Étendue de l'axe, dans son unité (ex. 60 pour -10..50 °C)
 * @param {number} availablePx - Longueur de l'axe en pixels CSS
 * @param {number} labelPx - Encombrement minimal d'une étiquette, en pixels CSS
 * @param {number} baseStep - Pas de référence, dans l'unité de l'axe
 * @param {number[]} [multipliers] - Multiples autorisés du pas de référence, croissants
 * @returns {number} Pas à utiliser, toujours un multiple de `baseStep`
 */
function pickAxisStep(range, availablePx, labelPx, baseStep, multipliers = [1, 2, 4, 10]) {
    // Une entrée non exploitable (canvas pas encore mesuré, axe dégénéré) ne doit pas
    // produire un pas nul ou négatif : la boucle de tracé ne se terminerait jamais.
    if (!(range > 0) || !(availablePx > 0) || !(labelPx > 0) || !(baseStep > 0)) return baseStep;

    // Espacement = availablePx * step / range, d'où le pas minimal admissible.
    const minStep = (labelPx * range) / availablePx;
    for (const multiplier of multipliers) {
        if (baseStep * multiplier >= minStep) return baseStep * multiplier;
    }
    return baseStep * multipliers[multipliers.length - 1];
}

/**
 * Aligne deux séries temporelles échantillonnées indépendamment.
 *
 * L'historique de Home Assistant n'enregistre un état que lorsqu'il change : les
 * horodatages de la température et de l'humidité ne coïncident jamais. Apparier les
 * échantillons par index donnerait des couples de valeurs prises à des instants
 * différents — donc un point de rosée faux. On reporte donc la dernière valeur connue
 * de chaque série (LOCF) sur l'union des deux axes de temps.
 * @param {Array<{time: number, value: number}>} a - Première série, triée par temps
 * @param {Array<{time: number, value: number}>} b - Seconde série, triée par temps
 * @returns {Array<{time: number, a: number, b: number}>} Couples alignés
 */
function alignSeries(a = [], b = []) {
    if (!a?.length || !b?.length) return [];

    const aligned = [];
    let i = 0;
    let j = 0;
    let lastA = null;
    let lastB = null;
    let previousTime = null;

    while (i < a.length || j < b.length) {
        const timeA = i < a.length ? a[i].time : Infinity;
        const timeB = j < b.length ? b[j].time : Infinity;
        const time = Math.min(timeA, timeB);

        // Les échantillons simultanés des deux séries sont consommés ensemble.
        while (i < a.length && a[i].time === time) lastA = a[i++].value;
        while (j < b.length && b[j].time === time) lastB = b[j++].value;

        // Avant le premier échantillon de l'une des séries, aucune valeur n'est connue :
        // extrapoler vers l'arrière inventerait des données.
        if (lastA === null || lastB === null) continue;
        if (time === previousTime) aligned[aligned.length - 1] = { time, a: lastA, b: lastB };
        else aligned.push({ time, a: lastA, b: lastB });
        previousTime = time;
    }

    return aligned;
}

/**
 * Part du temps passée hors d'un intervalle, sur une série irrégulière.
 *
 * Compter les échantillons hors bornes donnerait un résultat faux : un capteur
 * enregistre beaucoup de points quand la valeur bouge et presque aucun quand elle est
 * stable. Chaque échantillon pèse donc la durée qui le sépare du suivant.
 * @param {Array<{time: number, value: number}>} samples - Série triée par temps
 * @param {number} min - Borne basse de l'intervalle
 * @param {number} max - Borne haute de l'intervalle
 * @param {number} [endTime] - Fin de la période, pour peser le dernier échantillon
 * @returns {number|null} Fraction entre 0 et 1, ou null si la durée totale est nulle
 */
function timeOutsideRange(samples, min, max, endTime) {
    if (!Array.isArray(samples) || samples.length === 0) return null;

    let total = 0;
    let outside = 0;
    for (let i = 0; i < samples.length; i++) {
        const start = samples[i].time;
        const end = i + 1 < samples.length
            ? samples[i + 1].time
            : (Number.isFinite(endTime) ? endTime : start);
        const duration = end - start;
        if (!(duration > 0)) continue;

        total += duration;
        const value = samples[i].value;
        if (value < min || value > max) outside += duration;
    }

    return total > 0 ? outside / total : null;
}

class PsychrometricCalculations {

    // ========================================
    // COLOR GENERATION
    // ========================================

    /**
     * Convert an HSL color to RGB components.
     * @param {number} h - Hue, normalized to 0-1
     * @param {number} s - Saturation, normalized to 0-1
     * @param {number} l - Lightness, normalized to 0-1
     * @returns {number[]} [r, g, b] in the 0-255 range
     */
    static hslToRgb(h, s, l) {
        if (s === 0) {
            const v = Math.round(l * 255);
            return [v, v, v];
        }
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        return [
            hue2rgb(p, q, h + 1 / 3),
            hue2rgb(p, q, h),
            hue2rgb(p, q, h - 1 / 3),
        ].map(v => Math.round(v * 255));
    }

    /**
     * Generate a deterministic color based on a string hash.
     * Ensures the same input string always produces the same color.
     * @param {string} str - Input string (e.g., entity ID)
     * @returns {string} Hex color code
     */
    static generateColorFromHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }

        const hue = Math.abs(hash % 360) / 360;
        const saturation = (70 + (Math.abs(hash) % 30)) / 100;
        const lightness = (45 + (Math.abs(hash) % 20)) / 100;

        return this.rgbToHex(this.hslToRgb(hue, saturation, lightness));
    }

    // ========================================
    // COLOR PARSING UTILITIES
    // ========================================

    /**
     * Extract the RGB components of a CSS color (3/6/8-digit hex, rgb() or rgba()).
     * @param {string} color - CSS color
     * @returns {number[]} [r, g, b], defaults to [0, 0, 0] when unparseable
     */
    static colorToRgb(color) {
        if (typeof color === 'string') {
            const value = color.trim();
            if (value.startsWith('#')) {
                const body = value.slice(1);
                if (body.length === 3) {
                    return [0, 1, 2].map(i => parseInt(body[i] + body[i], 16));
                }
                if (body.length >= 6) {
                    return [0, 2, 4].map(i => parseInt(body.slice(i, i + 2), 16));
                }
            }
            const match = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
            if (match) return [1, 2, 3].map(i => parseInt(match[i], 10));
        }
        return [0, 0, 0];
    }

    /**
     * Extract the opacity of a CSS color.
     * @param {string} color - CSS color
     * @returns {number} Opacity between 0 and 1, defaults to 1
     */
    static colorToAlpha(color) {
        if (typeof color === 'string') {
            const value = color.trim();
            if (value.startsWith('#') && value.length === 9) {
                return parseInt(value.slice(7, 9), 16) / 255;
            }
            const match = value.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/);
            if (match) return parseFloat(match[1]);
        }
        return 1;
    }

    /**
     * Nom de l'option d'opacité associée à une option de couleur.
     *
     * Opacité et couleur sont deux clés distinctes : tant qu'elles partageaient une
     * seule chaîne `rgba()`, bouger le curseur d'opacité figeait aussi la couleur du
     * mode courant, et la bascule clair/sombre restait sans effet ensuite.
     * @param {string} colorKey - Option de couleur (ex. 'bgColor')
     * @returns {string} Option d'opacité correspondante (ex. 'bgOpacity')
     */
    static opacityKey(colorKey) {
        return String(colorKey).replace(/Color$/, 'Opacity');
    }

    /**
     * Indique si une couleur CSS est analysable par colorToRgb.
     * Un mot-clé (`white`), un dégradé ou une variable non résolue ne le sont pas :
     * colorToRgb y répondrait [0, 0, 0], c'est-à-dire du noir.
     * @param {*} color - Couleur CSS
     * @returns {boolean} Vrai si la couleur est un hex ou un rgb()/rgba()
     */
    static isParsableColor(color) {
        return typeof color === 'string' && /^(#|rgba?\()/.test(color.trim());
    }

    /**
     * Convert RGB components to a hex color.
     * @param {number[]} rgb - [r, g, b]
     * @returns {string} Hex color (#rrggbb)
     */
    static rgbToHex(rgb) {
        const [r, g, b] = Array.isArray(rgb) ? rgb : [0, 0, 0];
        return `#${[r, g, b]
            .map(v => Math.max(0, Math.min(255, Math.round(v || 0))).toString(16).padStart(2, '0'))
            .join('')}`;
    }

    /**
     * Recompose a CSS color from RGB components and an opacity.
     * Returns a hex string at full opacity, an rgba() string otherwise.
     * @param {number[]} rgb - [r, g, b]
     * @param {number} alpha - Opacity between 0 and 1
     * @returns {string} CSS color
     */
    static rgbToCss(rgb, alpha) {
        if (!(alpha < 1)) return this.rgbToHex(rgb);
        const [r, g, b] = Array.isArray(rgb) ? rgb : [0, 0, 0];
        return `rgba(${r}, ${g}, ${b}, ${Number(Math.max(0, alpha).toFixed(2))})`;
    }

    // ========================================
    // AXIS SCALING
    // ========================================

    /**
     * Build an axis scale snapped to round values.
     *
     * A naive `min + i/steps * range` produces unreadable ticks (26.1, 28.1, 30.1…);
     * this snaps the step to 1, 2, 2.5, 5 or 10 times a power of ten, and returns the
     * decimal count needed to render every tick without rounding them into a scale
     * that only looks irregular.
     * @param {number} min - Smallest data value
     * @param {number} max - Largest data value
     * @param {number} targetTicks - Desired number of gridlines
     * @returns {{min: number, max: number, step: number, decimals: number}} Axis definition
     */
    static niceScale(min, max, targetTicks) {
        const span = (max - min) || 1;
        const rawStep = span / Math.max(1, targetTicks - 1);
        const exponent = Math.floor(Math.log10(rawStep));
        const magnitude = Math.pow(10, exponent);

        const multiple = [1, 2, 2.5, 5, 10].find(m => m * magnitude >= rawStep) ?? 10;
        const step = multiple * magnitude;

        // Les décimales se déduisent de la puissance de dix, pas du pas lui-même :
        // log10(2.5) vaut 0.39, dont la partie entière est nulle — un pas de 2.5
        // s'afficherait alors arrondi à l'entier (-5, -3, 0, 3, 5, 8).
        const decimals = Math.max(0, -exponent + (multiple === 2.5 ? 1 : 0));

        const niceMin = Math.floor(min / step) * step;
        const niceMax = Math.ceil(max / step) * step;

        return { min: niceMin, max: niceMax === niceMin ? niceMin + step : niceMax, step, decimals };
    }

    // ========================================
    // TEMPERATURE CONVERSION UTILITIES
    // ========================================

    /**
     * Convert Fahrenheit to Celsius
     * @param {number} tempF - Temperature in Fahrenheit
     * @returns {number} Temperature in Celsius
     */
    static fahrenheitToCelsius(tempF) {
        return (tempF - 32) * 5 / 9;
    }

    /**
     * Convert Celsius to Fahrenheit
     * @param {number} tempC - Temperature in Celsius
     * @returns {number} Temperature in Fahrenheit
     */
    static celsiusToFahrenheit(tempC) {
        return (tempC * 9 / 5) + 32;
    }

    // ========================================
    // PSYCHROMETRIC CALCULATION METHODS
    // All calculations work in Celsius internally
    // ========================================

    /**
     * Atmospheric pressure at sea level, in kPa.
     * @type {number}
     */
    static get ATMOSPHERIC_PRESSURE() {
        return 101.325;
    }

    /**
     * Calculate the saturation vapor pressure (Magnus-Tetens).
     * Single source of truth: every other formula must go through this one
     * rather than inlining the `0.61078 * exp(17.27 t / (t + 237.3))` expression.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @returns {number} Saturation vapor pressure in kPa
     */
    static calculateSaturationPressure(temp) {
        return 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
    }

    /**
     * Calculate Dew Point temperature.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} humidity - Relative humidity in %
     * @returns {number} Dew point temperature in Celsius
     */
    static calculateDewPoint(temp, humidity) {
        const A = 17.27;
        const B = 237.3;
        const alpha = ((A * temp) / (B + temp)) + Math.log(humidity / 100);
        return (B * alpha) / (A - alpha);
    }

    /**
     * Calculate Water Content (Mixing Ratio).
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} humidity - Relative humidity in %
     * @returns {number} Water content in kg/kg (dry air)
     */
    static calculateWaterContent(temp, humidity) {
        const P = this.ATMOSPHERIC_PRESSURE;
        const P_v = (humidity / 100) * this.calculateSaturationPressure(temp);
        return 0.622 * (P_v / (P - P_v));
    }

    /**
     * Convert a water content (mixing ratio) back to a vapor pressure.
     * @param {number} waterContent - Water content in kg/kg (dry air)
     * @returns {number} Vapor pressure in kPa
     */
    static waterContentToVaporPressure(waterContent) {
        return (waterContent * this.ATMOSPHERIC_PRESSURE) / (0.622 + waterContent);
    }

    /**
     * Calculate the water content of moist air along a constant wet bulb line (ASHRAE).
     * Replaces the brute-force search that used to scan `calculateWetBulbTemp` over a
     * temperature/humidity grid: this is a direct, closed-form evaluation.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} wetBulb - Wet bulb temperature in Celsius
     * @returns {number} Water content in kg/kg (dry air)
     */
    static calculateWaterContentFromWetBulb(temp, wetBulb) {
        const Ws = this.calculateWaterContent(wetBulb, 100);
        return ((2501 - 2.326 * wetBulb) * Ws - 1.006 * (temp - wetBulb))
            / (2501 + 1.86 * temp - 4.186 * wetBulb);
    }

    /**
     * Calculate Enthalpy.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} waterContent - Water content in kg/kg
     * @returns {number} Enthalpy in kJ/kg
     */
    static calculateEnthalpy(temp, waterContent) {
        return 1.006 * temp + waterContent * (2501 + 1.84 * temp);
    }

    /**
     * Calculate Absolute Humidity.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} rh - Relative humidity in %
     * @returns {number} Absolute humidity in g/m³
     */
    static calculateAbsoluteHumidity(temp, rh) {
        const P_v_Pa = this.calculateVaporPressure(temp, rh) * 1000;
        const absHumidity_kg = P_v_Pa / (461.5 * (temp + 273.15));
        return absHumidity_kg * 1000;
    }

    /**
     * Calculate Wet Bulb Temperature.
     *
     * Inverts the ASHRAE constant-wet-bulb relation by bisection rather than using
     * Stull's closed-form approximation: Stull is only valid for 5-99 % RH and drifts
     * by up to ~1 °C (nearly 5 points of RH around 10 °C), which would put the value
     * shown on a point out of step with the iso-wet-bulb lines drawn on the chart —
     * both now come from `calculateWaterContentFromWetBulb`.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} rh - Relative humidity in %
     * @returns {number} Wet bulb temperature in Celsius
     */
    static calculateWetBulbTemp(temp, rh) {
        const target = this.calculateWaterContent(temp, rh);

        // La température humide est bornée par le point de rosée et la température sèche.
        let low = this.calculateDewPoint(temp, Math.max(rh, 0.01));
        let high = temp;
        if (!(low < high)) return temp; // air saturé

        // W est strictement croissante en tw : la bissection converge toujours.
        for (let i = 0; i < 60; i++) {
            const mid = (low + high) / 2;
            if (this.calculateWaterContentFromWetBulb(temp, mid) < target) {
                low = mid;
            } else {
                high = mid;
            }
        }
        return (low + high) / 2;
    }

    /**
     * Calculate Vapor Pressure.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} rh - Relative humidity in %
     * @returns {number} Vapor pressure in kPa
     */
    static calculateVaporPressure(temp, rh) {
        return this.calculateSaturationPressure(temp) * (rh / 100);
    }

    /**
     * Calculate Specific Volume, per kilogram of dry air.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} rh - Relative humidity in %
     * @returns {number} Specific volume in m³/kg (dry air)
     */
    static calculateSpecificVolume(temp, rh) {
        // Rd exprimé en kJ/(kg·K) pour rester homogène avec une pression en kPa.
        const Rd = 0.287058;
        const T = temp + 273.15;
        const W = this.calculateWaterContent(temp, rh);
        // v = Rd·T·(1 + 1.6078·W) / P : le facteur (1 + 1.6078·W) porte déjà tout
        // l'effet de la vapeur, la pression au dénominateur est donc la pression totale.
        return (Rd * T * (1 + 1.6078 * W)) / this.ATMOSPHERIC_PRESSURE;
    }

    /**
     * Calculate the apparent ("felt") temperature — Steadman's formula.
     *
     * Retenue plutôt que l'indice de chaleur ou l'humidex, qui ne sont définis que par
     * temps chaud (respectivement ~27 °C et ~20 °C) et renverraient la température sèche
     * le reste de l'année : celle-ci reste valable du froid au chaud, donc aussi bien
     * pour un point intérieur à 21 °C que pour un point extérieur à 2 °C.
     *
     * L'air intérieur est supposé immobile : la carte n'a pas de capteur de vent, et
     * `windSpeed` reste donc à 0 sauf si un appelant en fournit un.
     * @param {number} temp - Dry bulb temperature in Celsius
     * @param {number} rh - Relative humidity in %
     * @param {number} [windSpeed=0] - Wind speed in m/s
     * @returns {number} Apparent temperature in Celsius
     */
    static calculateApparentTemperature(temp, rh, windSpeed = 0) {
        // La formule attend la pression de vapeur en hPa, calculateVaporPressure la
        // donne en kPa (convention du fichier) : d'où le facteur 10.
        const e = this.calculateVaporPressure(temp, rh) * 10;
        return temp + 0.33 * e - 0.70 * windSpeed - 4.00;
    }

    /**
     * Calculate Mold Risk based on temperature and humidity.
     * @param {number} temp - Temperature in Celsius
     * @param {number} humidity - Relative humidity in %
     * @returns {number} Risk level (0-6)
     */
    static calculateMoldRisk(temp, humidity) {
        let risk = 0;

        if (temp < 5) {
            risk += 0;
        } else if (temp >= 5 && temp < 15) {
            risk += 1;
        } else if (temp >= 15 && temp < 20) {
            risk += 2;
        } else if (temp >= 20 && temp < 25) {
            risk += 3;
        } else if (temp >= 25) {
            risk += 2.5;
        }

        if (humidity < 60) {
            risk += 0;
        } else if (humidity >= 60 && humidity < 70) {
            risk += 1;
        } else if (humidity >= 70 && humidity < 80) {
            risk += 2;
        } else if (humidity >= 80 && humidity < 90) {
            risk += 2.5;
        } else if (humidity >= 90) {
            risk += 3;
        }

        const dewPoint = this.calculateDewPoint(temp, humidity);
        if (dewPoint > 12) {
            risk += 0.5;
        }

        return Math.min(risk, 6);
    }

    /**
     * Calculate PMV (Predicted Mean Vote) thermal comfort index, per ISO 7730 / Fanger.
     * @param {number} temp - Dry bulb (air) temperature in Celsius
     * @param {number} humidity - Relative humidity in %
     * @param {Object} [options] - Comfort model parameters
     * @param {number} [options.clo=0.7] - Clothing insulation, in clo
     * @param {number} [options.met=1.2] - Metabolic rate, in met
     * @param {number} [options.vel=0.1] - Relative air velocity, in m/s
     * @param {number} [options.tr=temp] - Mean radiant temperature in Celsius
     * @returns {number} PMV index, clamped to -3..+3
     */
    static calculatePMV(temp, humidity, options = {}) {
        const { clo = 0.7, met = 1.2, vel = 0.1, tr = temp } = options;
        const ta = temp;

        // Pression partielle de vapeur, en Pa (l'équation de Fanger l'exige en Pa).
        const pa = this.calculateVaporPressure(ta, humidity) * 1000;

        const icl = 0.155 * clo;      // isolation vestimentaire, m²K/W
        const m = met * 58.15;        // métabolisme, W/m²
        const w = 0;                  // travail mécanique externe, négligé
        const mw = m - w;

        const fcl = icl <= 0.078 ? 1.0 + 1.29 * icl : 1.05 + 0.645 * icl;
        const hcf = 12.1 * Math.sqrt(vel);
        const taa = ta + 273;
        const tra = tr + 273;

        // Température de surface du vêtement : résolue par itération, l'équation
        // étant implicite (tcl apparaît des deux côtés via rayonnement et convection).
        const tcla = taa + (35.5 - ta) / (3.5 * (icl + 0.1));
        const p1 = icl * fcl;
        const p2 = p1 * 3.96;
        const p3 = p1 * 100;
        const p4 = p1 * taa;
        const p5 = 308.7 - 0.028 * mw + p2 * Math.pow(tra / 100, 4);

        let xn = tcla / 100;
        let xf = xn;
        let hc = hcf;
        for (let i = 0; i < 150; i++) {
            xf = (xf + xn) / 2;
            const hcn = 2.38 * Math.pow(Math.abs(100 * xf - taa), 0.25);
            hc = hcf > hcn ? hcf : hcn;
            xn = (p5 + p4 * hc - p2 * Math.pow(xf, 4)) / (100 + p3 * hc);
            if (Math.abs(xn - xf) <= 0.00015) break;
        }
        const tcl = 100 * xn - 273;

        // Composantes de la déperdition thermique
        const hl1 = 3.05 * 0.001 * (5733 - 6.99 * mw - pa);          // diffusion cutanée
        const hl2 = mw > 58.15 ? 0.42 * (mw - 58.15) : 0;            // sudation
        const hl3 = 1.7 * 0.00001 * m * (5867 - pa);                 // respiration latente
        const hl4 = 0.0014 * m * (34 - ta);                          // respiration sensible
        const hl5 = 3.96 * fcl * (Math.pow(xn, 4) - Math.pow(tra / 100, 4)); // rayonnement
        const hl6 = fcl * hc * (tcl - ta);                           // convection

        const ts = 0.303 * Math.exp(-0.036 * m) + 0.028;
        const pmv = ts * (mw - hl1 - hl2 - hl3 - hl4 - hl5 - hl6);

        return Math.max(-3, Math.min(3, pmv));
    }

    /**
     * Calculate ideal setpoint to reach comfort zone with minimal energy.
     * @param {number} temp - Current temperature in Celsius
     * @param {number} humidity - Current humidity in %
     * @param {Object} comfortRange - Comfort range definition
     * @returns {Object} Ideal setpoint {temp, humidity}
     */
    static calculateIdealSetpoint(temp, humidity, comfortRange) {
        let idealTemp = temp;
        let idealHumidity = humidity;

        if (temp < comfortRange.tempMin) {
            idealTemp = comfortRange.tempMin;
        } else if (temp > comfortRange.tempMax) {
            idealTemp = comfortRange.tempMax;
        }

        if (humidity < comfortRange.rhMin) {
            idealHumidity = comfortRange.rhMin;
        } else if (humidity > comfortRange.rhMax) {
            idealHumidity = comfortRange.rhMax;
        }

        const isSummer = temp > 23;

        if (idealTemp === temp && idealHumidity === humidity) {
            if (isSummer) {
                idealTemp = Math.min(temp, comfortRange.tempMax);
                idealHumidity = Math.max(comfortRange.rhMin, Math.min(humidity, comfortRange.rhMin + 5));
            } else {
                idealTemp = Math.max(temp, comfortRange.tempMin);
                idealHumidity = Math.min(comfortRange.rhMax, Math.max(humidity, comfortRange.rhMax - 5));
            }
        }

        return { temp: idealTemp, humidity: idealHumidity };
    }

    /**
     * Calculate heating power required.
     * @param {number} temp - Current temperature
     * @param {number} targetTemp - Target temperature
     * @param {number} massFlowRate - Air mass flow rate
     * @returns {number} Power in Watts
     */
    static calculateHeatingPower(temp, targetTemp, massFlowRate) {
        const cp = 1.006;
        return massFlowRate * cp * (targetTemp - temp) * 1000;
    }

    /**
     * Calculate cooling power required.
     * @param {number} temp - Current temperature
     * @param {number} targetTemp - Target temperature
     * @param {number} massFlowRate - Air mass flow rate
     * @returns {number} Power in Watts
     */
    static calculateCoolingPower(temp, targetTemp, massFlowRate) {
        return Math.abs(this.calculateHeatingPower(temp, targetTemp, massFlowRate));
    }

    /**
     * Calculate power required for humidification/dehumidification.
     * @param {number} temp - Current temperature
     * @param {number} humidity - Current humidity
     * @param {number} targetHumidity - Target humidity
     * @param {number} massFlowRate - Air mass flow rate
     * @returns {number} Power in Watts
     */
    static calculateHumidityPower(temp, humidity, targetHumidity, massFlowRate) {
        const W_actual = this.calculateWaterContent(temp, humidity);
        const W_target = this.calculateWaterContent(temp, targetHumidity);

        const deltaW = W_target - W_actual;
        const latentHeat = 2501;

        return Math.abs(deltaW * massFlowRate * latentHeat * 1000);
    }
}

/**
 * Éditeur visuel de la carte Psychrometric Chart Advanced.
 *
 * Suit le standard des éditeurs de cartes Home Assistant :
 * LitElement + `ha-form` alimenté par un schéma déclaratif de selectors.
 * Les composants natifs de HA (ha-form, ha-selector, ha-expansion-panel,
 * ha-icon-button) chargent leurs propres dépendances : aucune attente
 * manuelle de `customElements.whenDefined` n'est nécessaire.
 */

/**
 * Déclenche un événement personnalisé (helper standard des cartes HA).
 * @param {HTMLElement} node - Élément émetteur
 * @param {string} type - Type d'événement
 * @param {Object} detail - Charge utile
 * @param {Object} options - Options de l'événement
 * @returns {Event} L'événement émis
 */
const fireEvent = (node, type, detail = {}, options = {}) => {
    const event = new CustomEvent(type, {
        bubbles: options.bubbles === undefined ? true : options.bubbles,
        cancelable: Boolean(options.cancelable),
        composed: options.composed === undefined ? true : options.composed,
        detail,
    });
    node.dispatchEvent(event);
    return event;
};

/** Champs affichables par point, dans l'ordre de la carte. */
const DETAIL_FIELDS = [
    'dewPoint', 'wetBulb', 'apparentTemp', 'enthalpy', 'absHumidity', 'waterContent',
    'specificVolume', 'pmvIndex', 'moldRisk', 'action',
];

/** Champs affichés par défaut quand `details` n'est pas configuré (cf. _shouldShowField). */
const DEFAULT_DETAILS = ['dewPoint', 'wetBulb', 'apparentTemp', 'enthalpy', 'pmvIndex'];

/** Zone de confort par défaut (identique à celle de la carte). */
const DEFAULT_COMFORT_RANGE = { tempMin: 20, tempMax: 26, rhMin: 40, rhMax: 60 };

/** Clés de couleur globales exposées, avec alpha. */
const COLOR_KEYS = ['bgColor', 'textColor', 'gridColor', 'curveColor', 'enthalpyColor', 'comfortColor'];

/** Options de style de trait, dans l'ordre du selector. Tirées de la table de la carte. */
const LINE_STYLE_KEYS = Object.keys(LINE_STYLES);

/** Familles de tracés dont le style est configurable, dans l'ordre d'affichage. */
const LINE_STYLE_OPTIONS = Object.keys(DEFAULT_LINE_STYLES);

/** Domaines proposés dans les sélecteurs d'entités. */
const SENSOR_DOMAINS = ['sensor', 'input_number', 'number'];

const editorTranslations = {
    fr: {
        general: "Général",
        chartTitle: "Titre",
        language: "Langue de la carte",
        languageHelp: "Langue des textes affichés sur la carte (l'éditeur suit la langue de Home Assistant).",
        measurementPoints: "Points de mesure",
        point: "Point",
        newPoint: "Nouveau point",
        noPoints: "Aucun point configuré. Ajoutez-en un pour commencer.",
        delete: "Supprimer le point",
        moveUp: "Déplacer vers le haut",
        moveDown: "Déplacer vers le bas",
        label: "Label",
        temp: "Température (entité)",
        humidity: "Humidité (entité)",
        color: "Couleur",
        icon: "Icône",
        details: "Champs affichés",
        dewPoint: "Point de rosée",
        wetBulb: "Temp. humide",
        apparentTemp: "Temp. ressentie",
        enthalpy: "Enthalpie",
        absHumidity: "Humidité abs.",
        waterContent: "Teneur en eau",
        specificVolume: "Vol. spécifique",
        pmvIndex: "Indice PMV",
        moldRisk: "Moisissure",
        action: "Action/Puissance",
        addPoint: "Ajouter un point",
        comfort: "Zone de confort",
        comfortRange: "Bornes de confort",
        tempMin: "Température min",
        tempMax: "Température max",
        rhMin: "Humidité min",
        rhMax: "Humidité max",
        massFlowRate: "Débit massique d'air",
        massFlowRateHelp: "Sert au calcul des puissances de chauffage, refroidissement et humidification.",
        appearance: "Apparence",
        theme: "Thème visuel",
        themeModern: "Moderne",
        themeClassic: "Classique",
        themeCompact: "Compact",
        bgColor: "Couleur de fond",
        textColor: "Couleur du texte",
        gridColor: "Couleur de la grille",
        curveColor: "Couleur des courbes",
        enthalpyColor: "Couleur des enthalpies",
        comfortColor: "Couleur zone confort",
        opacity: "Opacité",
        resetColor: "Suivre le thème",
        lineStyles: "Styles de trait",
        gridLineStyle: "Trait de la grille",
        curveLineStyle: "Trait des courbes d'humidité",
        enthalpyLineStyle: "Trait des enthalpies",
        wetBulbLineStyle: "Trait des temp. humides",
        comfortLineStyle: "Trait de la zone de confort",
        pointLineStyle: "Trait des projections de points",
        lineSolid: "Continu",
        lineDashed: "Tirets",
        lineDotted: "Pointillés",
        lineDashdot: "Tiret-point",
        tempSubdivisions: "Sous-multiples des températures sèches",
        tempSubdivisionsHelp: "Traits intermédiaires entre deux graduations de l'axe des températures. 1 n'en ajoute aucun ; 5 découpe chaque pas de 5 °C en degrés.",
        displayOptions: "Options d'affichage",
        displayMode: "Niveau de détail",
        displayModeHelp: "Personnalisé applique les champs cochés sur chaque point. Minimal n'affiche que température, humidité et confort ; Détaillé affiche tous les champs.",
        displayCustom: "Personnalisé",
        displayMinimal: "Minimal",
        temperatureUnit: "Unité de température",
        unitAuto: "Automatique (Home Assistant)",
        unitCelsius: "Celsius (°C)",
        unitFahrenheit: "Fahrenheit (°F)",
        showChart: "Afficher le graphique",
        showChartHelp: "Décochez pour n'afficher que les cartes de données, sans le diagramme.",
        chartHeight: "Hauteur du graphique (px)",
        chartHeightHelp: "Vide : le graphique suit la place disponible. Une valeur fixe la hauteur, que seule une carte trop courte comprime encore.",
        chartAspectRatio: "Rapport largeur/hauteur",
        chartAspectRatioHelp: "Utilisé quand aucune hauteur n'est imposée : 1.33 = 4:3, 2 = deux fois plus large que haut.",
        showEnthalpy: "Afficher Enthalpie",
        showVaporPressure: "Afficher Pression Vapeur",
        showDewPoint: "Afficher Point de Rosée",
        showWetBulb: "Afficher Temp. Humide",
        showPointLabels: "Afficher les labels des points",
        showLegend: "Afficher Légende",
        showCalculatedData: "Afficher Données Calculées",
        themeMode: "Thème de couleurs",
        themeModeHelp: "Automatique suit le thème clair/sombre de Home Assistant.",
        themeAuto: "Automatique (Home Assistant)",
        themeLight: "Clair",
        themeDark: "Sombre",
        displayDetailed: "Détaillé",
        zoomPan: "Bornes du graphique (optionnel)",
        zoom_temp_min: "Température min",
        zoom_temp_max: "Température max",
        zoom_humidity_min: "Humidité min",
        zoom_humidity_max: "Humidité max",
    },
    en: {
        general: "General",
        chartTitle: "Title",
        language: "Card language",
        languageHelp: "Language of the texts shown on the card (the editor follows the Home Assistant language).",
        measurementPoints: "Measurement points",
        point: "Point",
        newPoint: "New point",
        noPoints: "No point configured. Add one to get started.",
        delete: "Delete point",
        moveUp: "Move up",
        moveDown: "Move down",
        label: "Label",
        temp: "Temperature (entity)",
        humidity: "Humidity (entity)",
        color: "Color",
        icon: "Icon",
        details: "Displayed fields",
        dewPoint: "Dew point",
        wetBulb: "Wet bulb",
        apparentTemp: "Feels like",
        enthalpy: "Enthalpy",
        absHumidity: "Abs. humidity",
        waterContent: "Water content",
        specificVolume: "Specific vol.",
        pmvIndex: "PMV index",
        moldRisk: "Mold risk",
        action: "Action/Power",
        addPoint: "Add point",
        comfort: "Comfort zone",
        comfortRange: "Comfort bounds",
        tempMin: "Min temperature",
        tempMax: "Max temperature",
        rhMin: "Min humidity",
        rhMax: "Max humidity",
        massFlowRate: "Air mass flow rate",
        massFlowRateHelp: "Used to compute heating, cooling and humidification power.",
        appearance: "Appearance",
        theme: "Visual theme",
        themeModern: "Modern",
        themeClassic: "Classic",
        themeCompact: "Compact",
        bgColor: "Background color",
        textColor: "Text color",
        gridColor: "Grid color",
        curveColor: "Curve color",
        enthalpyColor: "Enthalpy color",
        comfortColor: "Comfort zone color",
        opacity: "Opacity",
        resetColor: "Follow the theme",
        lineStyles: "Line styles",
        gridLineStyle: "Grid line",
        curveLineStyle: "Humidity curve line",
        enthalpyLineStyle: "Enthalpy line",
        wetBulbLineStyle: "Wet bulb line",
        comfortLineStyle: "Comfort zone outline",
        pointLineStyle: "Point projection line",
        lineSolid: "Solid",
        lineDashed: "Dashed",
        lineDotted: "Dotted",
        lineDashdot: "Dash-dot",
        tempSubdivisions: "Dry-bulb temperature subdivisions",
        tempSubdivisionsHelp: "Minor lines drawn between two graduations of the temperature axis. 1 adds none; 5 splits each 5 °C step into degrees.",
        displayOptions: "Display options",
        displayMode: "Detail level",
        displayModeHelp: "Custom applies the fields ticked on each point. Minimal only shows temperature, humidity and comfort; Detailed shows every field.",
        displayCustom: "Custom",
        displayMinimal: "Minimal",
        temperatureUnit: "Temperature unit",
        unitAuto: "Automatic (Home Assistant)",
        unitCelsius: "Celsius (°C)",
        unitFahrenheit: "Fahrenheit (°F)",
        showChart: "Show chart",
        showChartHelp: "Uncheck to show only the data cards, without the diagram.",
        chartHeight: "Chart height (px)",
        chartHeightHelp: "Empty: the chart follows the space available. A value pins the height, which only a too-short card still compresses.",
        chartAspectRatio: "Width/height ratio",
        chartAspectRatioHelp: "Used when no height is imposed: 1.33 = 4:3, 2 = twice as wide as tall.",
        showEnthalpy: "Show enthalpy",
        showVaporPressure: "Show vapor pressure",
        showDewPoint: "Show dew point",
        showWetBulb: "Show wet bulb",
        showPointLabels: "Show point labels",
        showLegend: "Show legend",
        showCalculatedData: "Show calculated data",
        themeMode: "Colour theme",
        themeModeHelp: "Automatic follows the Home Assistant light/dark theme.",
        themeAuto: "Automatic (Home Assistant)",
        themeLight: "Light",
        themeDark: "Dark",
        displayDetailed: "Detailed",
        zoomPan: "Chart bounds (optional)",
        zoom_temp_min: "Min temperature",
        zoom_temp_max: "Max temperature",
        zoom_humidity_min: "Min humidity",
        zoom_humidity_max: "Max humidity",
    },
    es: {
        general: "General",
        chartTitle: "Título",
        language: "Idioma de la tarjeta",
        languageHelp: "Idioma de los textos de la tarjeta (el editor sigue el idioma de Home Assistant).",
        measurementPoints: "Puntos de medición",
        point: "Punto",
        newPoint: "Nuevo punto",
        noPoints: "No hay puntos configurados. Añade uno para empezar.",
        delete: "Eliminar punto",
        moveUp: "Mover arriba",
        moveDown: "Mover abajo",
        label: "Etiqueta",
        temp: "Temperatura (entidad)",
        humidity: "Humedad (entidad)",
        color: "Color",
        icon: "Icono",
        details: "Campos mostrados",
        dewPoint: "Punto de rocío",
        wetBulb: "Temp. húmeda",
        apparentTemp: "Sensación térmica",
        enthalpy: "Entalpía",
        absHumidity: "Humedad abs.",
        waterContent: "Contenido de agua",
        specificVolume: "Vol. específico",
        pmvIndex: "Índice PMV",
        moldRisk: "Riesgo de moho",
        action: "Acción/Potencia",
        addPoint: "Añadir punto",
        comfort: "Zona de confort",
        comfortRange: "Límites de confort",
        tempMin: "Temp. mín",
        tempMax: "Temp. máx",
        rhMin: "Humedad mín",
        rhMax: "Humedad máx",
        massFlowRate: "Caudal másico de aire",
        massFlowRateHelp: "Se usa para calcular las potencias de calefacción, refrigeración y humidificación.",
        appearance: "Apariencia",
        theme: "Tema visual",
        themeModern: "Moderno",
        themeClassic: "Clásico",
        themeCompact: "Compacto",
        bgColor: "Color de fondo",
        textColor: "Color del texto",
        gridColor: "Color de la cuadrícula",
        curveColor: "Color de las curvas",
        enthalpyColor: "Color de las entalpías",
        comfortColor: "Color zona confort",
        opacity: "Opacidad",
        resetColor: "Seguir el tema",
        lineStyles: "Estilos de línea",
        gridLineStyle: "Línea de la cuadrícula",
        curveLineStyle: "Línea de las curvas de humedad",
        enthalpyLineStyle: "Línea de las entalpías",
        wetBulbLineStyle: "Línea de temp. húmedas",
        comfortLineStyle: "Contorno de la zona de confort",
        pointLineStyle: "Línea de proyección de los puntos",
        lineSolid: "Continua",
        lineDashed: "Discontinua",
        lineDotted: "Punteada",
        lineDashdot: "Raya-punto",
        tempSubdivisions: "Subdivisiones de las temperaturas secas",
        tempSubdivisionsHelp: "Líneas intermedias entre dos graduaciones del eje de temperaturas. 1 no añade ninguna; 5 divide cada paso de 5 °C en grados.",
        displayOptions: "Opciones de visualización",
        displayMode: "Nivel de detalle",
        displayModeHelp: "Personalizado aplica los campos marcados en cada punto. Mínimo solo muestra temperatura, humedad y confort; Detallado muestra todos los campos.",
        displayCustom: "Personalizado",
        displayMinimal: "Mínimo",
        temperatureUnit: "Unidad de temperatura",
        unitAuto: "Automática (Home Assistant)",
        unitCelsius: "Celsius (°C)",
        unitFahrenheit: "Fahrenheit (°F)",
        showChart: "Mostrar el gráfico",
        showChartHelp: "Desmarca para mostrar solo las tarjetas de datos, sin el diagrama.",
        chartHeight: "Altura del gráfico (px)",
        chartHeightHelp: "Vacío: el gráfico sigue el espacio disponible. Un valor fija la altura, que solo una tarjeta demasiado corta comprime.",
        chartAspectRatio: "Relación ancho/alto",
        chartAspectRatioHelp: "Se usa cuando no se impone ninguna altura: 1.33 = 4:3, 2 = el doble de ancho que de alto.",
        showEnthalpy: "Mostrar entalpía",
        showVaporPressure: "Mostrar presión de vapor",
        showDewPoint: "Mostrar punto de rocío",
        showWetBulb: "Mostrar temp. húmeda",
        showPointLabels: "Mostrar etiquetas de los puntos",
        showLegend: "Mostrar leyenda",
        showCalculatedData: "Mostrar datos calculados",
        themeMode: "Tema de colores",
        themeModeHelp: "Automático sigue el tema claro/oscuro de Home Assistant.",
        themeAuto: "Automático (Home Assistant)",
        themeLight: "Claro",
        themeDark: "Oscuro",
        displayDetailed: "Detallado",
        zoomPan: "Límites del gráfico (opcional)",
        zoom_temp_min: "Temp. mín",
        zoom_temp_max: "Temp. máx",
        zoom_humidity_min: "Humedad mín",
        zoom_humidity_max: "Humedad máx",
    },
    de: {
        general: "Allgemein",
        chartTitle: "Titel",
        language: "Sprache der Karte",
        languageHelp: "Sprache der Texte auf der Karte (der Editor folgt der Home-Assistant-Sprache).",
        measurementPoints: "Messpunkte",
        point: "Punkt",
        newPoint: "Neuer Punkt",
        noPoints: "Keine Punkte konfiguriert. Fügen Sie einen hinzu.",
        delete: "Punkt löschen",
        moveUp: "Nach oben verschieben",
        moveDown: "Nach unten verschieben",
        label: "Beschriftung",
        temp: "Temperatur (Entität)",
        humidity: "Feuchtigkeit (Entität)",
        color: "Farbe",
        icon: "Symbol",
        details: "Angezeigte Felder",
        dewPoint: "Taupunkt",
        wetBulb: "Feuchtkugeltemp.",
        apparentTemp: "Gefühlte Temp.",
        enthalpy: "Enthalpie",
        absHumidity: "Abs. Feuchtigkeit",
        waterContent: "Wassergehalt",
        specificVolume: "Spezifisches Vol.",
        pmvIndex: "PMV-Index",
        moldRisk: "Schimmelrisiko",
        action: "Aktion/Leistung",
        addPoint: "Punkt hinzufügen",
        comfort: "Komfortzone",
        comfortRange: "Komfortgrenzen",
        tempMin: "Min. Temperatur",
        tempMax: "Max. Temperatur",
        rhMin: "Min. Feuchtigkeit",
        rhMax: "Max. Feuchtigkeit",
        massFlowRate: "Luftmassenstrom",
        massFlowRateHelp: "Dient zur Berechnung der Heiz-, Kühl- und Befeuchtungsleistung.",
        appearance: "Aussehen",
        theme: "Visuelles Thema",
        themeModern: "Modern",
        themeClassic: "Klassisch",
        themeCompact: "Kompakt",
        bgColor: "Hintergrundfarbe",
        textColor: "Textfarbe",
        gridColor: "Gitterfarbe",
        curveColor: "Kurvenfarbe",
        enthalpyColor: "Enthalpiefarbe",
        comfortColor: "Komfortzonenfarbe",
        opacity: "Deckkraft",
        resetColor: "Dem Thema folgen",
        lineStyles: "Linienstile",
        gridLineStyle: "Gitterlinie",
        curveLineStyle: "Feuchtekurvenlinie",
        enthalpyLineStyle: "Enthalpielinie",
        wetBulbLineStyle: "Feuchtkugellinie",
        comfortLineStyle: "Umriss der Komfortzone",
        pointLineStyle: "Projektionslinie der Punkte",
        lineSolid: "Durchgezogen",
        lineDashed: "Gestrichelt",
        lineDotted: "Gepunktet",
        lineDashdot: "Strichpunkt",
        tempSubdivisions: "Unterteilungen der Trockentemperaturen",
        tempSubdivisionsHelp: "Zwischenlinien zwischen zwei Graduierungen der Temperaturachse. 1 fügt keine hinzu; 5 unterteilt jeden 5-°C-Schritt in Grad.",
        displayOptions: "Anzeigeoptionen",
        displayMode: "Detailgrad",
        displayModeHelp: "Benutzerdefiniert wendet die pro Punkt angehakten Felder an. Minimal zeigt nur Temperatur, Luftfeuchte und Komfort; Detailliert zeigt alle Felder.",
        displayCustom: "Benutzerdefiniert",
        displayMinimal: "Minimal",
        temperatureUnit: "Temperatureinheit",
        unitAuto: "Automatisch (Home Assistant)",
        unitCelsius: "Celsius (°C)",
        unitFahrenheit: "Fahrenheit (°F)",
        showChart: "Diagramm anzeigen",
        showChartHelp: "Abwählen, um nur die Datenkarten ohne Diagramm anzuzeigen.",
        chartHeight: "Diagrammhöhe (px)",
        chartHeightHelp: "Leer: Das Diagramm folgt dem verfügbaren Platz. Ein Wert legt die Höhe fest, die nur eine zu kurze Karte noch staucht.",
        chartAspectRatio: "Verhältnis Breite/Höhe",
        chartAspectRatioHelp: "Gilt, wenn keine Höhe vorgegeben ist: 1.33 = 4:3, 2 = doppelt so breit wie hoch.",
        showEnthalpy: "Enthalpie anzeigen",
        showVaporPressure: "Dampfdruck anzeigen",
        showDewPoint: "Taupunkt anzeigen",
        showWetBulb: "Feuchtkugeltemp. anzeigen",
        showPointLabels: "Punktbeschriftungen anzeigen",
        showLegend: "Legende anzeigen",
        showCalculatedData: "Berechnete Daten anzeigen",
        themeMode: "Farbschema",
        themeModeHelp: "Automatisch folgt dem hellen/dunklen Thema von Home Assistant.",
        themeAuto: "Automatisch (Home Assistant)",
        themeLight: "Hell",
        themeDark: "Dunkel",
        displayDetailed: "Detailliert",
        zoomPan: "Diagrammgrenzen (optional)",
        zoom_temp_min: "Min. Temperatur",
        zoom_temp_max: "Max. Temperatur",
        zoom_humidity_min: "Min. Feuchtigkeit",
        zoom_humidity_max: "Max. Feuchtigkeit",
    },
};

class PsychrometricChartEditor extends i {
    static get properties() {
        return {
            hass: { attribute: false },
            _config: { state: true },
        };
    }

    constructor() {
        super();
        this._config = null;
        // Références stables : évite que Lit ne recrée les sous-arbres de ha-form à chaque rendu.
        this._computeLabel = (schema) => this.t(schema.name);
        this._computeHelper = (schema) => this.t(`${schema.name}Help`, '');
    }

    /**
     * Applique la configuration fournie par Lovelace.
     * La config est traitée comme immuable : aucune copie profonde n'est nécessaire.
     * @param {Object} config - Configuration de la carte
     */
    setConfig(config) {
        this._config = config || {};
    }

    /**
     * Langue de l'interface de l'éditeur.
     * Suit la langue de Home Assistant (standard), avec repli sur la langue de la carte puis le français.
     * @returns {string} Code de langue supporté
     */
    get _lang() {
        const haLang = this.hass?.locale?.language || this.hass?.language;
        if (haLang && editorTranslations[haLang]) return haLang;
        const cfgLang = this._config?.language;
        if (cfgLang && editorTranslations[cfgLang]) return cfgLang;
        return 'fr';
    }

    /**
     * Traduit une clé dans la langue de l'éditeur.
     * @param {string} key - Clé de traduction
     * @param {string} [fallback] - Valeur si la clé est absente (défaut : la clé elle-même)
     * @returns {string} Texte traduit
     */
    t(key, fallback) {
        return editorTranslations[this._lang]?.[key]
            ?? editorTranslations.fr[key]
            ?? (fallback !== undefined ? fallback : key);
    }

    get _points() {
        return this._config?.points || [];
    }

    // ========================================
    // COULEURS
    // ========================================

    /**
     * Couleur par défaut affichée quand la config ne définit pas la clé.
     * Reproduit exactement les valeurs de repli de la carte, mode sombre inclus.
     * @param {string} key - Clé de couleur
     * @returns {string} Couleur CSS
     */
    _colorFallback(key) {
        // L'aperçu doit refléter le mode réellement rendu par la carte : même règle
        // que son _isDark(), où `darkMode` n'est plus lu.
        const mode = this._config?.themeMode ?? 'auto';
        const dark = mode === 'dark'
            || (mode !== 'light' && Boolean(this.hass?.themes?.darkMode));
        switch (key) {
            case 'bgColor': return dark ? '#1c1c1c' : '#ffffff';
            case 'textColor': return dark ? '#e0e0e0' : '#333333';
            case 'gridColor': return dark ? '#444444' : '#cccccc';
            case 'curveColor': return dark ? '#4fc3f7' : '#1f77b4';
            case 'comfortColor': return dark ? 'rgba(100, 200, 100, 0.3)' : 'rgba(144, 238, 144, 0.5)';
            case 'enthalpyColor': return dark ? 'rgba(255, 165, 0, 0.7)' : 'rgba(255, 99, 71, 0.7)';
            default: return '#000000';
        }
    }

    // ========================================
    // SCHÉMAS ha-form
    // ========================================

    _generalSchema() {
        return [
            { name: 'chartTitle', selector: { text: {} } },
            {
                name: 'language',
                selector: {
                    select: {
                        mode: 'dropdown',
                        options: [
                            { value: 'fr', label: 'Français' },
                            { value: 'en', label: 'English' },
                            { value: 'es', label: 'Español' },
                            { value: 'de', label: 'Deutsch' },
                        ],
                    },
                },
            },
            {
                name: 'temperatureUnit',
                selector: {
                    select: {
                        mode: 'dropdown',
                        options: [
                            { value: 'auto', label: this.t('unitAuto') },
                            { value: 'celsius', label: this.t('unitCelsius') },
                            { value: 'fahrenheit', label: this.t('unitFahrenheit') },
                        ],
                    },
                },
            },
        ];
    }

    _pointSchema() {
        return [
            { name: 'label', selector: { text: {} } },
            {
                type: 'grid',
                name: '',
                schema: [
                    { name: 'temp', selector: { entity: { filter: { domain: SENSOR_DOMAINS } } } },
                    { name: 'humidity', selector: { entity: { filter: { domain: SENSOR_DOMAINS } } } },
                ],
            },
            {
                type: 'grid',
                name: '',
                schema: [
                    { name: 'icon', selector: { icon: {} } },
                    { name: 'color', selector: { color_rgb: {} } },
                ],
            },
            {
                name: 'details',
                selector: {
                    select: {
                        multiple: true,
                        mode: 'list',
                        options: DETAIL_FIELDS.map(field => ({ value: field, label: this.t(field) })),
                    },
                },
            },
        ];
    }

    _comfortSchema() {
        const pct = { min: 0, max: 100, step: 1, mode: 'box', unit_of_measurement: '%' };
        return [
            {
                type: 'expandable',
                name: 'comfortRange',
                title: this.t('comfortRange'),
                schema: [
                    {
                        type: 'grid',
                        name: '',
                        schema: [
                            { name: 'tempMin', selector: { number: { min: 0, max: 40, step: 0.5, mode: 'box' } } },
                            { name: 'tempMax', selector: { number: { min: 0, max: 40, step: 0.5, mode: 'box' } } },
                            { name: 'rhMin', selector: { number: pct } },
                            { name: 'rhMax', selector: { number: pct } },
                        ],
                    },
                ],
            },
            {
                name: 'massFlowRate',
                selector: { number: { min: 0.01, max: 20, step: 0.01, mode: 'box', unit_of_measurement: 'kg/s' } },
            },
        ];
    }

    _displaySchema() {
        return [
            {
                name: 'theme',
                selector: {
                    select: {
                        mode: 'dropdown',
                        options: [
                            { value: 'modern', label: this.t('themeModern') },
                            { value: 'classic', label: this.t('themeClassic') },
                            { value: 'compact', label: this.t('themeCompact') },
                        ],
                    },
                },
            },
            {
                name: 'themeMode',
                selector: {
                    select: {
                        mode: 'dropdown',
                        options: [
                            { value: 'auto', label: this.t('themeAuto') },
                            { value: 'light', label: this.t('themeLight') },
                            { value: 'dark', label: this.t('themeDark') },
                        ],
                    },
                },
            },
            {
                name: 'displayMode',
                selector: {
                    select: {
                        mode: 'dropdown',
                        options: [
                            { value: 'minimal', label: this.t('displayMinimal') },
                            { value: 'custom', label: this.t('displayCustom') },
                            { value: 'detailed', label: this.t('displayDetailed') },
                        ],
                    },
                },
            },
            { name: 'showChart', selector: { boolean: {} } },
            // Taille du graphique : sans objet quand il est masqué.
            ...(this._config?.showChart === false ? [] : [
                {
                    type: 'grid',
                    name: '',
                    schema: [
                        {
                            name: 'chartHeight',
                            selector: { number: { min: 150, max: 1200, step: 10, mode: 'box', unit_of_measurement: 'px' } },
                        },
                        {
                            name: 'chartAspectRatio',
                            selector: { number: { min: 0.5, max: 4, step: 0.05, mode: 'box' } },
                        },
                    ],
                },
            ]),
            {
                type: 'grid',
                name: '',
                schema: [
                    // Ces options ne pilotent que le tracé : les proposer alors que le
                    // graphique est masqué afficherait des cases sans effet.
                    ...(this._config?.showChart === false ? [] : [
                        { name: 'showEnthalpy', selector: { boolean: {} } },
                        { name: 'showVaporPressure', selector: { boolean: {} } },
                        { name: 'showDewPoint', selector: { boolean: {} } },
                        { name: 'showWetBulb', selector: { boolean: {} } },
                        { name: 'showPointLabels', selector: { boolean: {} } },
                        { name: 'showLegend', selector: { boolean: {} } },
                    ]),
                    { name: 'showCalculatedData', selector: { boolean: {} } },
                ],
            },
        ];
    }

    /**
     * Styles de trait, une ligne par famille de tracés.
     * Les options viennent de LINE_STYLES : un style proposé ici est forcément
     * connu de la carte.
     * @returns {Array<Object>} Schéma ha-form
     */
    _lineStyleSchema() {
        const options = LINE_STYLE_KEYS.map(style => ({
            value: style,
            label: this.t(`line${style.charAt(0).toUpperCase()}${style.slice(1)}`),
        }));
        return [
            {
                type: 'grid',
                name: '',
                schema: LINE_STYLE_OPTIONS.map(name => ({
                    name,
                    selector: { select: { mode: 'dropdown', options } },
                })),
            },
            {
                name: 'tempSubdivisions',
                selector: { number: { min: 1, max: 10, step: 1, mode: 'box' } },
            },
        ];
    }

    _zoomSchema() {
        return [
            {
                type: 'grid',
                name: '',
                schema: [
                    { name: 'zoom_temp_min', selector: { number: { step: 'any', mode: 'box' } } },
                    { name: 'zoom_temp_max', selector: { number: { step: 'any', mode: 'box' } } },
                    { name: 'zoom_humidity_min', selector: { number: { min: 0, max: 100, step: 'any', mode: 'box' } } },
                    { name: 'zoom_humidity_max', selector: { number: { min: 0, max: 100, step: 'any', mode: 'box' } } },
                ],
            },
        ];
    }

    // ========================================
    // DONNÉES DE FORMULAIRE
    // ========================================

    /**
     * Construit les données passées à ha-form.
     * Les valeurs par défaut de la carte y sont pré-remplies afin que l'éditeur
     * montre ce que la carte affiche réellement, et non des champs vides ou décochés.
     * @returns {Object} Données du formulaire
     */
    _formData() {
        const config = this._config || {};
        // Styles de trait : le défaut de la carte, sinon les selectors s'ouvriraient
        // vides alors qu'un style est bien appliqué au graphique.
        const lineStyles = {};
        for (const [name, fallback] of Object.entries(DEFAULT_LINE_STYLES)) {
            lineStyles[name] = config[name] ?? fallback;
        }
        return {
            ...config,
            ...lineStyles,
            tempSubdivisions: config.tempSubdivisions ?? 1,
            chartTitle: config.chartTitle ?? 'Diagramme Psychrométrique',
            language: config.language ?? 'fr',
            temperatureUnit: config.temperatureUnit ?? 'auto',
            theme: config.theme ?? 'modern',
            themeMode: config.themeMode ?? 'auto',
            // `standard` est l'ancien nom de `custom` : le normaliser ici évite un
            // sélecteur vide sur une config existante, et fait disparaître la valeur
            // périmée du YAML dès la première modification dans l'éditeur.
            displayMode: config.displayMode === 'standard' ? 'custom' : (config.displayMode ?? 'custom'),
            massFlowRate: config.massFlowRate ?? 0.5,
            showChart: config.showChart !== false,
            // `chartHeight` n'a volontairement pas de défaut : le champ vide signifie
            // « le graphique suit la place disponible », qui est le comportement normal.
            chartAspectRatio: config.chartAspectRatio ?? 1.33,
            comfortRange: { ...DEFAULT_COMFORT_RANGE, ...(config.comfortRange || {}) },
            showEnthalpy: config.showEnthalpy !== false,
            showVaporPressure: config.showVaporPressure !== false,
            showDewPoint: config.showDewPoint !== false,
            showWetBulb: config.showWetBulb !== false,
            showPointLabels: config.showPointLabels !== false,
            showLegend: config.showLegend !== false,
            showCalculatedData: config.showCalculatedData !== false,
        };
    }

    /**
     * Construit les données de formulaire d'un point.
     * `details` et `color` sont pré-remplis avec ce que la carte utilise réellement,
     * pour que l'édition d'un point n'altère jamais implicitement les autres.
     * @param {Object} point - Point de configuration
     * @returns {Object} Données du formulaire
     */
    _pointFormData(point) {
        const fallbackColor = PsychrometricCalculations.generateColorFromHash(`${point.temp}_${point.humidity}`);
        return {
            ...point,
            label: point.label ?? '',
            icon: point.icon || 'mdi:thermometer',
            color: PsychrometricCalculations.colorToRgb(point.color || fallbackColor),
            details: Array.isArray(point.details) ? point.details : [...DEFAULT_DETAILS],
        };
    }

    // ========================================
    // ÉMISSION DE LA CONFIGURATION
    // ========================================

    /**
     * Retire les valeurs vides de la configuration afin de ne pas polluer le YAML
     * avec des clés comme `zoom_temp_min: ""`.
     * @param {Object} config - Configuration brute
     * @returns {Object} Configuration nettoyée
     */
    _clean(config) {
        const cleaned = {};
        for (const [key, value] of Object.entries(config)) {
            if (value === '' || value === null || value === undefined) continue;
            // `darkMode` est remplacé par `themeMode` et n'est plus lu par la carte :
            // le laisser dans le YAML ferait croire qu'il pilote encore le thème.
            if (key === 'darkMode') continue;
            cleaned[key] = value;
        }
        return cleaned;
    }

    /**
     * Publie une nouvelle configuration vers Lovelace.
     * @param {Object} rawConfig - Configuration à publier
     */
    _emit(rawConfig) {
        const config = this._clean(rawConfig);
        this._config = config;
        fireEvent(this, 'config-changed', { config });
    }

    _valueChanged(ev) {
        ev.stopPropagation();
        if (!this._config) return;
        this._emit(ev.detail.value);
    }

    _pointChanged(index, ev) {
        ev.stopPropagation();
        if (!this._config) return;
        const value = { ...ev.detail.value };
        value.color = PsychrometricCalculations.rgbToHex(value.color);
        const points = [...this._points];
        points[index] = value;
        this._emit({ ...this._formData(), points });
    }

    /**
     * Opacité affichée pour une couleur, en pourcentage.
     * L'option dédiée prime ; à défaut on lit l'alpha éventuellement intégré à la
     * couleur, ce qui couvre les configurations écrites avant leur séparation.
     * @param {string} key - Option de couleur
     * @returns {number} Opacité entre 0 et 100
     */
    _opacityOf(key) {
        const stored = this._config?.[PsychrometricCalculations.opacityKey(key)];
        if (stored !== undefined && stored !== null && stored !== '') {
            const percent = parseFloat(stored);
            if (Number.isFinite(percent)) return Math.min(100, Math.max(0, percent));
        }
        const color = this._config?.[key] || this._colorFallback(key);
        return Math.round(PsychrometricCalculations.colorToAlpha(color) * 100);
    }

    /**
     * Écrit la teinte seule, sans alpha.
     * L'opacité éventuellement portée par l'ancienne valeur `rgba()` est reportée
     * dans l'option dédiée, pour que l'aspect ne saute pas au premier réglage.
     * @param {string} key - Option de couleur
     * @param {CustomEvent} ev - Événement du sélecteur
     */
    _colorChanged(key, ev) {
        ev.stopPropagation();
        const current = this._config?.[key] || this._colorFallback(key);
        const rgb = ev.detail.value ?? PsychrometricCalculations.colorToRgb(current);
        this._emit({
            ...this._formData(),
            [key]: PsychrometricCalculations.rgbToHex(rgb),
            [PsychrometricCalculations.opacityKey(key)]: this._opacityOf(key),
        });
    }

    /**
     * Écrit l'opacité seule, sans jamais figer la teinte.
     * C'est la raison d'être de l'option séparée : régler la transparence ne doit pas
     * enregistrer la couleur du mode courant, sinon la bascule clair/sombre se trouve
     * neutralisée et il faut passer par l'éditeur YAML pour s'en sortir.
     * @param {string} key - Option de couleur
     * @param {CustomEvent} ev - Événement du sélecteur
     */
    _opacityChanged(key, ev) {
        ev.stopPropagation();
        this._emit({
            ...this._formData(),
            [PsychrometricCalculations.opacityKey(key)]: ev.detail.value ?? 100,
        });
    }

    /**
     * Rend une couleur au thème : les deux options sont retirées de la configuration.
     * @param {string} key - Option de couleur
     */
    _resetColor(key) {
        this._emit({
            ...this._formData(),
            [key]: undefined,
            [PsychrometricCalculations.opacityKey(key)]: undefined,
        });
    }

    _addPoint() {
        const points = [...this._points, { temp: '', humidity: '', label: this.t('newPoint') }];
        this._emit({ ...this._formData(), points });
    }

    _deletePoint(index) {
        const points = [...this._points];
        points.splice(index, 1);
        this._emit({ ...this._formData(), points });
    }

    _movePoint(index, offset) {
        const target = index + offset;
        const points = [...this._points];
        if (target < 0 || target >= points.length) return;
        [points[index], points[target]] = [points[target], points[index]];
        this._emit({ ...this._formData(), points });
    }

    // ========================================
    // RENDU
    // ========================================

    _renderColorRow(key) {
        const value = this._config?.[key] || this._colorFallback(key);
        // Une couleur « suit le thème » tant qu'aucune des deux options n'est posée.
        const overridden = Boolean(this._config?.[key])
            || this._config?.[PsychrometricCalculations.opacityKey(key)] !== undefined;
        return b`
            <div class="color-row">
                <span class="color-label">${this.t(key)}</span>
                <ha-selector
                    class="color-picker"
                    .hass=${this.hass}
                    .selector=${{ color_rgb: {} }}
                    .value=${PsychrometricCalculations.colorToRgb(value)}
                    @value-changed=${(ev) => this._colorChanged(key, ev)}
                ></ha-selector>
                <ha-selector
                    class="color-opacity"
                    .hass=${this.hass}
                    .selector=${{ number: { min: 0, max: 100, step: 1, mode: 'slider', unit_of_measurement: '%' } }}
                    .label=${this.t('opacity')}
                    .value=${this._opacityOf(key)}
                    @value-changed=${(ev) => this._opacityChanged(key, ev)}
                ></ha-selector>
                <ha-icon-button
                    class="color-reset"
                    .label=${this.t('resetColor')}
                    title=${this.t('resetColor')}
                    ?disabled=${!overridden}
                    @click=${() => this._resetColor(key)}
                ><ha-icon icon="mdi:restore"></ha-icon></ha-icon-button>
            </div>
        `;
    }

    _renderPoint(point, index) {
        const title = point.label || `${this.t('point')} ${index + 1}`;
        return b`
            <ha-expansion-panel outlined>
                <div slot="header" class="point-header">
                    <ha-icon .icon=${point.icon || 'mdi:thermometer'}></ha-icon>
                    <span>${title}</span>
                </div>
                <div class="point-content">
                    <ha-form
                        .hass=${this.hass}
                        .data=${this._pointFormData(point)}
                        .schema=${this._pointSchema()}
                        .computeLabel=${this._computeLabel}
                        @value-changed=${(ev) => this._pointChanged(index, ev)}
                    ></ha-form>
                    <div class="point-actions">
                        <ha-icon-button
                            .label=${this.t('moveUp')}
                            .disabled=${index === 0}
                            @click=${() => this._movePoint(index, -1)}
                        ><ha-icon icon="mdi:arrow-up"></ha-icon></ha-icon-button>
                        <ha-icon-button
                            .label=${this.t('moveDown')}
                            .disabled=${index === this._points.length - 1}
                            @click=${() => this._movePoint(index, 1)}
                        ><ha-icon icon="mdi:arrow-down"></ha-icon></ha-icon-button>
                        <ha-icon-button
                            class="delete"
                            .label=${this.t('delete')}
                            @click=${() => this._deletePoint(index)}
                        ><ha-icon icon="mdi:delete"></ha-icon></ha-icon-button>
                    </div>
                </div>
            </ha-expansion-panel>
        `;
    }

    render() {
        if (!this._config || !this.hass) return b``;
        const data = this._formData();

        return b`
            <div class="card-config">
                <div class="section">
                    <span class="section-title">${this.t('general')}</span>
                    <ha-form
                        .hass=${this.hass}
                        .data=${data}
                        .schema=${this._generalSchema()}
                        .computeLabel=${this._computeLabel}
                        .computeHelper=${this._computeHelper}
                        @value-changed=${this._valueChanged}
                    ></ha-form>
                </div>

                <div class="section">
                    <span class="section-title">${this.t('measurementPoints')}</span>
                    ${this._points.length
                ? this._points.map((point, index) => this._renderPoint(point, index))
                : b`<div class="empty">${this.t('noPoints')}</div>`}
                    <div class="actions">
                        <ha-button @click=${this._addPoint}>
                            <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
                            ${this.t('addPoint')}
                        </ha-button>
                    </div>
                </div>

                <div class="section">
                    <span class="section-title">${this.t('comfort')}</span>
                    <ha-form
                        .hass=${this.hass}
                        .data=${data}
                        .schema=${this._comfortSchema()}
                        .computeLabel=${this._computeLabel}
                        .computeHelper=${this._computeHelper}
                        @value-changed=${this._valueChanged}
                    ></ha-form>
                </div>

                <div class="section">
                    <span class="section-title">${this.t('displayOptions')}</span>
                    <ha-form
                        .hass=${this.hass}
                        .data=${data}
                        .schema=${this._displaySchema()}
                        .computeLabel=${this._computeLabel}
                        .computeHelper=${this._computeHelper}
                        @value-changed=${this._valueChanged}
                    ></ha-form>
                </div>

                <div class="section">
                    <span class="section-title">${this.t('appearance')}</span>
                    ${COLOR_KEYS.map(key => this._renderColorRow(key))}
                    <span class="subsection-title">${this.t('lineStyles')}</span>
                    <ha-form
                        .hass=${this.hass}
                        .data=${data}
                        .schema=${this._lineStyleSchema()}
                        .computeLabel=${this._computeLabel}
                        .computeHelper=${this._computeHelper}
                        @value-changed=${this._valueChanged}
                    ></ha-form>
                </div>

                <div class="section">
                    <span class="section-title">${this.t('zoomPan')}</span>
                    <ha-form
                        .hass=${this.hass}
                        .data=${data}
                        .schema=${this._zoomSchema()}
                        .computeLabel=${this._computeLabel}
                        @value-changed=${this._valueChanged}
                    ></ha-form>
                </div>
            </div>
        `;
    }

    static get styles() {
        return i$3`
            .card-config {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            .section {
                border: 1px solid var(--divider-color, #e0e0e0);
                border-radius: 8px;
                padding: 16px;
            }
            .section-title {
                display: block;
                margin-bottom: 12px;
                font-weight: 500;
                font-size: 1.05em;
                color: var(--primary-text-color);
            }
            .subsection-title {
                display: block;
                margin: 20px 0 8px;
                font-weight: 500;
                color: var(--secondary-text-color);
            }
            ha-form {
                display: block;
            }
            ha-expansion-panel {
                margin-bottom: 8px;
            }
            .point-header {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 500;
                color: var(--primary-text-color);
            }
            .point-content {
                padding: 8px 4px 4px;
            }
            .point-actions {
                display: flex;
                justify-content: flex-end;
                gap: 4px;
                margin-top: 8px;
            }
            .point-actions .delete {
                color: var(--error-color, #f44336);
            }
            .actions {
                display: flex;
                justify-content: flex-end;
                margin-top: 8px;
            }
            .color-row {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 8px;
            }
            .color-label {
                flex: 1;
                color: var(--primary-text-color);
            }
            .color-picker {
                width: 80px;
            }
            .color-opacity {
                flex: 1;
                min-width: 140px;
            }
            .color-reset {
                flex: 0 0 auto;
                color: var(--secondary-text-color);
            }
            .color-reset[disabled] {
                opacity: 0.3;
                pointer-events: none;
            }
            .empty {
                padding: 8px 0;
                color: var(--secondary-text-color);
                font-style: italic;
            }
        `;
    }
}

customElements.define("psychrometric-chart-editor", PsychrometricChartEditor);

/**
 * Taille de police minimale du canvas, en pixels CSS. En dessous, les étiquettes
 * deviennent illisibles : c'est la densité des graduations qui doit céder, pas la
 * police (voir `_chartLayout()` et `pickAxisStep`).
 */
const MIN_AXIS_FONT = 10;

/** Hauteur minimale du graphique, en pixels CSS. */
const MIN_CHART_HEIGHT = 150;

/** Rapport largeur/hauteur du graphique quand la carte n'impose pas de hauteur. */
const DEFAULT_CHART_RATIO = 4 / 3;

/**
 * Largeur approchée d'un texte Arial, en pixels CSS.
 *
 * `measureText` serait exact mais exige un contexte de canvas : la mise en page doit
 * rester calculable hors dessin, puisque `tempToX`/`humidityToY` la reconstruisent
 * pour le test de survol. Une approximation stable vaut mieux que deux géométries
 * divergentes — 0,55 em est l'avance moyenne des chiffres et minuscules en Arial.
 * @param {string} text - Texte à mesurer
 * @param {number} fontSize - Taille de police en pixels CSS
 * @returns {number} Largeur estimée en pixels CSS
 */
function estimateTextWidth(text, fontSize) {
    return text.length * fontSize * 0.55;
}

/**
 * Psychrometric Chart Enhanced
 * A Home Assistant custom card that displays a psychrometric chart with real-time entity data.
 * Built with LitElement for performance.
 */
class PsychrometricChartEnhanced extends i {
    static get properties() {
        return {
            /** Home Assistant object */
            hass: { attribute: false },
            /** Card configuration */
            config: { attribute: false },
            /** State for history modal visibility */
            _modalOpen: { state: true },
            /** State for history data */
            _historyData: { state: true },
            /** Currently selected entity for history */
            _selectedEntity: { state: true },
            /** Currently selected type (temperature/humidity) */
            _selectedType: { state: true },
            /** Canvas width in CSS pixels, driven by the resize observer */
            _canvasWidth: { state: true },
            /** Canvas height in CSS pixels, driven by the resize observer */
            _canvasHeight: { state: true },
            /** Pointer position on the history chart, if any */
            _historyCursor: { state: true },
            /** Series keys hidden through the history legend */
            _historyHidden: { state: true },
            /** Point currently hovered on the canvas, if any */
            _hoveredPoint: { state: true },
            /** Viewport position of the tooltip */
            _tooltipPos: { state: true },
        };
    }

    static get styles() {
        return i$3`
            :host {
                display: block;
            }
            /* Sans surcharge explicite, ha-card garde le fond et le texte du thème HA. */
            ha-card {
                overflow: hidden;
                display: flex;
                flex-direction: column;
                height: 100%;
                color: var(--primary-text-color);
            }
            .card-header {
                padding: 16px;
                font-size: 1.5rem;
                font-weight: 500;
                text-align: center;
                color: inherit;
            }
            /*
             * La hauteur de repos est posée en style en ligne (voir _chartContainerStyle) ;
             * flex 1 1 auto la fait ensuite grandir pour remplir une carte plus haute que
             * son contenu, et min-height 0 autorise la compression quand Home Assistant
             * impose une carte plus courte — sans quoi le graphique débordait sur la
             * carte suivante.
             */
            .chart-container {
                position: relative;
                width: 100%;
                flex: 1 1 auto;
                min-height: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
            }
            canvas {
                max-width: 100%;
                cursor: crosshair;
            }
            
            /* Enhanced Data Display Styles */
            .psychro-data {
                margin-top: 20px;
                text-align: left;
                font-size: 14px;
                max-width: 100%;
                padding: 0 20px 20px;
                margin-left: auto;
                margin-right: auto;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
                gap: 20px;
            }

            .data-box {
                padding: 15px;
                border-radius: 15px;
                border-left-width: 5px;
                border-left-style: solid;
                backdrop-filter: blur(10px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
                position: relative;
                overflow: hidden;
            }

            .data-box:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }

            .data-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                font-weight: bold;
                font-size: 1.1em;
            }

            .status-badge {
                padding: 4px 10px;
                border-radius: 15px;
                font-size: 11px;
                color: white;
                font-weight: bold;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }

            .data-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                font-size: 0.9em;
            }

            .data-row {
                display: flex;
                align-items: center;
                gap: 5px;
                padding: 5px;
                border-radius: 5px;
                transition: background 0.2s;
            }

            .data-row:hover {
                background: rgba(127, 127, 127, 0.15);
            }

            .action-box {
                margin-top: 15px;
                padding-top: 10px;
                border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
                font-size: 0.9em;
            }

            .action-icon {
                margin-right: 5px;
                font-weight: bold;
            }

            /* Animations */
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                animation: fadeIn 0.3s ease;
            }
            .modal-content {
                border-radius: 20px;
                padding: 30px;
                max-width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                position: relative;
                width: 800px;
            }
            .modal-close {
                position: absolute;
                top: 15px;
                right: 15px;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                font-size: 24px;
                cursor: pointer;
                transition: all 0.2s;
                background: rgba(127, 127, 127, 0.2);
                color: inherit;
            }
            .modal-close:hover {
                transform: rotate(90deg);
                background: rgba(127, 127, 127, 0.35);
            }
            /* Le graphique porte un calque de curseur : c'est lui le repère de position. */
            .history-chart-wrap {
                position: relative;
                margin-top: 16px;
                /* Le survol doit rester possible sans bloquer le défilement vertical
                   de la modale au doigt. */
                touch-action: pan-y;
            }
            .history-chart,
            .history-cursor {
                width: 100%;
                /* Hauteur adaptative : 300 px en dur débordaient d'une modale de mobile. */
                height: clamp(200px, 38vh, 320px);
                display: block;
            }
            .history-cursor {
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
            }
            /*
             * L'infobulle se pose dans le coin haut opposé au curseur plutôt que de le
             * suivre : collée au trait, elle masquait la courbe qu'on cherchait à lire.
             */
            .history-tooltip {
                position: absolute;
                top: 4px;
                z-index: 1;
                pointer-events: none;
                padding: 8px 10px;
                border-radius: 10px;
                font-size: 12px;
                white-space: nowrap;
                border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
                box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
            }
            .history-tooltip.at-left {
                left: 8px;
            }
            .history-tooltip.at-right {
                right: 8px;
            }
            .history-tooltip-time {
                font-weight: bold;
                margin-bottom: 4px;
                opacity: 0.75;
            }
            .history-tooltip-row {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .history-tooltip-label {
                opacity: 0.75;
            }
            .history-tooltip-value {
                margin-left: auto;
                font-weight: bold;
                padding-left: 10px;
            }
            .history-legend {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 15px;
            }
            .history-legend-item {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 5px 10px;
                border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
                border-radius: 15px;
                background: rgba(127, 127, 127, 0.12);
                color: inherit;
                font: inherit;
                font-size: 12px;
                cursor: pointer;
                transition: opacity 0.2s;
            }
            .history-legend-item.off {
                opacity: 0.4;
            }
            .history-legend-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                flex: 0 0 auto;
            }
            /* Le point de rosée est tracé en pointillés : la pastille le rappelle. */
            .history-legend-dot.dashed {
                border-radius: 2px;
                height: 4px;
                width: 14px;
                mask-image: repeating-linear-gradient(90deg, #000 0 4px, transparent 4px 7px);
                -webkit-mask-image: repeating-linear-gradient(90deg, #000 0 4px, transparent 4px 7px);
            }
            .history-stats-caption {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-top: 15px;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                opacity: 0.7;
            }
            .history-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
                gap: 10px;
                margin-top: 8px;
            }
            .history-stat {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                padding: 10px;
                border-radius: 10px;
                background: rgba(127, 127, 127, 0.12);
            }
            .history-stat-label {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                opacity: 0.7;
            }
            .history-stat-value {
                font-size: 1.2em;
                font-weight: 600;
            }
            .history-empty {
                padding: 30px 0;
                text-align: center;
                opacity: 0.7;
            }
            .card-message {
                padding: 24px 16px 32px;
                text-align: center;
                opacity: 0.8;
            }
            .tooltip {
                position: fixed;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 10px 15px;
                border-radius: 8px;
                font-size: 13px;
                z-index: 10000;
                pointer-events: none;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                border-left: 3px solid transparent;
            }
            .tooltip-title {
                font-weight: bold;
                margin-bottom: 5px;
            }
            .tooltip-hint {
                margin-top: 5px;
                font-size: 11px;
                opacity: 0.8;
            }
            .legend-box {
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 12px;
                border-radius: 10px;
                text-align: left;
                pointer-events: none;
                color: inherit;
                border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.35));
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
            }
            .legend-title {
                margin-bottom: 8px;
                font-weight: bold;
                font-size: 13px;
            }
            .legend-item {
                display: flex;
                align-items: center;
                margin-bottom: 4px;
            }
            .legend-color {
                width: 12px;
                height: 12px;
                display: inline-block;
                margin-right: 8px;
                border-radius: 50%;
            }
            /* La zone de confort est une surface, pas un point : carré plutôt que pastille. */
            .legend-comfort {
                border-radius: 3px;
                border: 1px solid rgba(127, 127, 127, 0.5);
            }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @media (max-width: 768px) {
                .psychro-data { grid-template-columns: 1fr !important; }
                .modal-content { padding: 20px; max-width: 95%; }
            }

            /* === THEME: CLASSIC === */
            .theme-classic .data-box {
                border-radius: 4px;
                border: 1px solid var(--divider-color, #e0e0e0);
                backdrop-filter: none;
                background: var(--card-background-color, #fff);
                box-shadow: none;
            }
            .theme-classic .data-box:hover {
                transform: none;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            .theme-classic .status-badge {
                border-radius: 4px;
                box-shadow: none;
            }
            .theme-classic .legend-box {
                backdrop-filter: none;
                border: 1px solid var(--divider-color, #e0e0e0);
                box-shadow: none;
            }

            /* === THEME: COMPACT === */
            .theme-compact .psychro-data {
                gap: 8px;
                padding: 0 10px 10px;
            }
            .theme-compact .data-box {
                padding: 8px;
                border-radius: 8px;
                backdrop-filter: none;
            }
            .theme-compact .data-box:hover {
                transform: translateY(-2px);
            }
            .theme-compact .data-header {
                margin-bottom: 6px;
                font-size: 1em;
            }
            .theme-compact .data-grid {
                gap: 4px;
                font-size: 0.85em;
            }
            .theme-compact .data-row {
                padding: 2px;
            }
            .theme-compact .action-box {
                margin-top: 8px;
                padding-top: 6px;
            }
            .theme-compact .legend-box {
                padding: 6px;
                backdrop-filter: none;
            }
            .theme-compact .card-header {
                padding: 10px;
                font-size: 1.2rem;
            }
        `;
    }

    constructor() {
        super();
        this._canvasWidth = 800;
        this._canvasHeight = 600;
        this.resizeObserver = null;
        this._resizeTarget = null;
        this._resizeDebounceTimer = null;
        this._language = 'fr';
        this._temperatureUnit = null;
        this._currentPoints = [];
        this._currentLayout = null;
        this._hoveredPoint = null;
        this._tooltipPos = { x: 0, y: 0 };
        // Modale d'historique
        this._historyCursor = null;
        this._historyHidden = [];
        this._historyPoint = null;
        this._historyEnd = null;
        this._historyResizeObserver = null;
        this._historyResizeTarget = null;
        this._historyPlot = null;
        // Références stables pour pouvoir retirer les écouteurs au démontage.
        this._onMouseMove = this._handleMouseMove.bind(this);
        this._onMouseLeave = this._handleMouseLeave.bind(this);
        this._onCanvasClick = this._handleCanvasClick.bind(this);
        this._onHistoryPointer = this._handleHistoryPointer.bind(this);
        this._onHistoryPointerLeave = () => { this._historyCursor = null; };
        this._onModalKeyDown = this._handleModalKeyDown.bind(this);

        this.translations = {
            fr: {
                noPointsConfigured: 'Aucun point ou entité configuré dans la carte !',
                noValidEntity: 'Aucune entité valide trouvée. Vérifiez votre configuration.',
                temperature: 'Température',
                humidity: 'Humidité',
                dewPoint: 'Point de rosée',
                enthalpy: 'Enthalpie',
                absHumidity: 'Humidité abs.',
                waterContent: 'Teneur en eau',
                specificVolume: 'Volume spécifique',
                pmvIndex: 'Indice PMV',
                apparentTemp: 'Temp. ressentie',
                wetBulb: 'Temp. humide',
                moldRisk: 'Moisissure',
                action: 'Action',
                power: 'Puissance totale',
                humidification: 'Humidification',
                dehumidification: 'Déshumidification',
                idealSetpoint: 'Consigne idéale',
                comfortOptimal: 'Confort optimal',
                comfortTooHot: 'Trop chaud',
                comfortTooCold: 'Trop froid',
                comfortTooHumid: 'Trop humide',
                comfortTooDry: 'Trop sec',
                outOfComfort: 'Hors confort',
                comfortZone: 'Zone de confort',
                legend: 'Légende',
                clickToViewHistory: 'Cliquez pour voir l\'historique',
                warm: 'Réchauffer',
                cool: 'Refroidir',
                andHumidify: 'et Humidifier',
                andDehumidify: 'et Déshumidifier',
                historyLast24h: 'Historique des dernières 24h',
                historyLoading: 'Chargement…',
                historyEmpty: 'Aucune donnée sur les dernières 24h.',
                statMin: 'Min',
                statMax: 'Max',
                statAvg: 'Moyenne',
                statTrend: 'Tendance',
                statOutOfComfort: 'Hors confort',
                close: 'Fermer',
                moldRiskNone: 'Aucun',
                moldRiskVeryLow: 'Très faible',
                moldRiskLow: 'Faible',
                moldRiskModerate: 'Modéré',
                moldRiskHigh: 'Élevé',
                moldRiskVeryHigh: 'Très élevé',
                moldRiskCritical: 'Critique'
            },
            en: {
                noPointsConfigured: 'No points or entities configured in the card!',
                noValidEntity: 'No valid entity found. Check your configuration.',
                temperature: 'Temperature',
                humidity: 'Humidity',
                dewPoint: 'Dew point',
                enthalpy: 'Enthalpy',
                absHumidity: 'Abs. humidity',
                waterContent: 'Water content',
                specificVolume: 'Specific volume',
                pmvIndex: 'PMV Index',
                apparentTemp: 'Feels like',
                wetBulb: 'Wet bulb',
                moldRisk: 'Mold risk',
                action: 'Action',
                power: 'Total power',
                humidification: 'Humidification',
                dehumidification: 'Dehumidification',
                idealSetpoint: 'Ideal setpoint',
                comfortOptimal: 'Optimal comfort',
                comfortTooHot: 'Too hot',
                comfortTooCold: 'Too cold',
                comfortTooHumid: 'Too humid',
                comfortTooDry: 'Too dry',
                outOfComfort: 'Out of comfort',
                comfortZone: 'Comfort zone',
                legend: 'Legend',
                clickToViewHistory: 'Click to view history',
                warm: 'Warm up',
                cool: 'Cool down',
                andHumidify: 'and Humidify',
                andDehumidify: 'and Dehumidify',
                historyLast24h: 'History of the last 24 hours',
                historyLoading: 'Loading…',
                historyEmpty: 'No data for the last 24 hours.',
                statMin: 'Min',
                statMax: 'Max',
                statAvg: 'Average',
                statTrend: 'Trend',
                statOutOfComfort: 'Out of comfort',
                close: 'Close',
                moldRiskNone: 'No risk',
                moldRiskVeryLow: 'Very low',
                moldRiskLow: 'Low',
                moldRiskModerate: 'Moderate',
                moldRiskHigh: 'High',
                moldRiskVeryHigh: 'Very high',
                moldRiskCritical: 'Critical'
            },
            es: {
                noPointsConfigured: '¡No hay puntos o entidades configuradas en la tarjeta!',
                noValidEntity: '¡No se encontraron entidades válidas!',
                temperature: 'Temperatura',
                humidity: 'Humedad',
                dewPoint: 'Punto de rocío',
                enthalpy: 'Entalpía',
                absHumidity: 'Humedad abs.',
                waterContent: 'Contenido de agua',
                specificVolume: 'Volumen específico',
                pmvIndex: 'Índice PMV',
                apparentTemp: 'Sensación térmica',
                wetBulb: 'Temp. húmeda',
                moldRisk: 'Moho',
                action: 'Acción',
                power: 'Potencia total',
                humidification: 'Humidificación',
                dehumidification: 'Deshumidificación',
                idealSetpoint: 'Consigna ideal',
                comfortOptimal: 'Confort óptimo',
                comfortTooHot: 'Demasiado calor',
                comfortTooCold: 'Demasiado frío',
                comfortTooHumid: 'Demasiado húmedo',
                comfortTooDry: 'Demasiado seco',
                outOfComfort: 'Fuera de confort',
                comfortZone: 'Zona de confort',
                legend: 'Leyenda',
                clickToViewHistory: 'Haga clic para ver el historial',
                warm: 'Calentar',
                cool: 'Enfriar',
                andHumidify: 'y Humidificar',
                andDehumidify: 'y Deshumidificar',
                historyLast24h: 'Historial de las últimas 24 horas',
                historyLoading: 'Cargando…',
                historyEmpty: 'Sin datos en las últimas 24 horas.',
                statMin: 'Mín',
                statMax: 'Máx',
                statAvg: 'Media',
                statTrend: 'Tendencia',
                statOutOfComfort: 'Fuera de confort',
                close: 'Cerrar',
                moldRiskNone: 'Sin riesgo',
                moldRiskVeryLow: 'Muy bajo',
                moldRiskLow: 'Bajo',
                moldRiskModerate: 'Moderado',
                moldRiskHigh: 'Alto',
                moldRiskVeryHigh: 'Muy alto',
                moldRiskCritical: 'Crítico'
            },
            de: {
                noPointsConfigured: 'Keine Punkte oder Entitäten in der Karte konfiguriert!',
                noValidEntity: 'Keine gültigen Entitäten gefunden!',
                temperature: 'Temperatur',
                humidity: 'Luftfeuchtigkeit',
                dewPoint: 'Taupunkt',
                enthalpy: 'Enthalpie',
                absHumidity: 'Abs. Feuchtigkeit',
                waterContent: 'Wassergehalt',
                specificVolume: 'Spezifisches Volumen',
                pmvIndex: 'PMV-Index',
                apparentTemp: 'Gefühlte Temp.',
                wetBulb: 'Feuchtkugeltemp.',
                moldRisk: 'Schimmel',
                action: 'Aktion',
                power: 'Gesamtleistung',
                humidification: 'Befeuchtung',
                dehumidification: 'Entfeuchtung',
                idealSetpoint: 'Idealer Sollwert',
                comfortOptimal: 'Optimaler Komfort',
                comfortTooHot: 'Zu heiß',
                comfortTooCold: 'Zu kalt',
                comfortTooHumid: 'Zu feucht',
                comfortTooDry: 'Zu trocken',
                outOfComfort: 'Außerhalb Komfort',
                comfortZone: 'Komfortzone',
                legend: 'Legende',
                clickToViewHistory: 'Zum Anzeigen des Verlaufs klicken',
                warm: 'Erwärmen',
                cool: 'Abkühlen',
                andHumidify: 'und Befeuchten',
                andDehumidify: 'und Entfeuchten',
                historyLast24h: 'Verlauf der letzten 24 Stunden',
                historyLoading: 'Wird geladen…',
                historyEmpty: 'Keine Daten für die letzten 24 Stunden.',
                statMin: 'Min',
                statMax: 'Max',
                statAvg: 'Mittelwert',
                statTrend: 'Tendenz',
                statOutOfComfort: 'Außerhalb Komfort',
                close: 'Schließen',
                moldRiskNone: 'Kein Risiko',
                moldRiskVeryLow: 'Sehr niedrig',
                moldRiskLow: 'Niedrig',
                moldRiskModerate: 'Mäßig',
                moldRiskHigh: 'Hoch',
                moldRiskVeryHigh: 'Sehr hoch',
                moldRiskCritical: 'Kritisch'
            }
        };
    }

    /**
     * Set the configuration for the card.
     * @param {Object} config - The configuration object
     */
    setConfig(config) {
        if (config.points !== undefined && !Array.isArray(config.points)) {
            throw new Error("`points` doit être une liste. / `points` must be a list.");
        }
        // Une liste vide n'est pas une erreur de configuration mais une carte en cours
        // de réglage : render() affiche alors `noPointsConfigured` plutôt qu'une erreur
        // rouge, ce qui est aussi l'état du stub servi au sélecteur de cartes.

        const language = config.language || 'fr';
        // Une langue inconnue ne doit pas faire planter chaque appel à t().
        this._language = this.translations[language] ? language : 'fr';

        const bounds = this._resolveBounds(config);
        if (bounds.minTemp >= bounds.maxTemp) {
            throw new Error(`zoom_temp_min (${bounds.minTemp}) doit être strictement inférieur à zoom_temp_max (${bounds.maxTemp}).`);
        }
        if (bounds.minHum >= bounds.maxHum) {
            throw new Error(`zoom_humidity_min (${bounds.minHum}) doit être strictement inférieur à zoom_humidity_max (${bounds.maxHum}).`);
        }

        // Une hauteur ou un rapport d'aspect non numérique donnerait un conteneur de
        // taille NaN, donc un canvas invisible : le dire plutôt que d'afficher un vide.
        if (config.chartHeight !== undefined && config.chartHeight !== null && config.chartHeight !== '') {
            const chartHeight = parseFloat(config.chartHeight);
            if (!Number.isFinite(chartHeight) || chartHeight <= 0) {
                throw new Error(`chartHeight (${config.chartHeight}) doit être un nombre de pixels positif.`);
            }
        }
        if (config.chartAspectRatio !== undefined && config.chartAspectRatio !== null && config.chartAspectRatio !== '') {
            const ratio = parseFloat(config.chartAspectRatio);
            if (!Number.isFinite(ratio) || ratio <= 0) {
                throw new Error(`chartAspectRatio (${config.chartAspectRatio}) doit être un nombre positif.`);
            }
        }

        this.config = config;
        // L'unité peut changer avec la config : forcer une nouvelle détection.
        this._temperatureUnit = null;
        this._wetBulbCache = null;
        // Les bornes de zoom entrent dans la mise en page (largeur des étiquettes).
        this._currentLayout = null;
    }

    /**
     * Get the card size (height in rows).
     *
     * Une unité vaut ~50 px pour Home Assistant, qui s'en sert à équilibrer les colonnes
     * de la vue masonry. La valeur était figée à 3 (~150 px) pour une carte qui en fait
     * couramment 600 : les colonnes se remplissaient de travers. On annonce désormais la
     * hauteur réelle — graphique plus une carte de données par point.
     * @returns {number} The size of the card
     */
    getCardSize() {
        const pointCount = this.config?.points?.length ?? 0;
        const dataRows = this.config?.showCalculatedData === false ? 0 : pointCount * 3;
        // Sans le graphique, la carte se réduit aux cartes de données : annoncer la
        // même hauteur laisserait un grand vide dans les mises en page en colonnes.
        if (this.config?.showChart === false) return Math.max(1, dataRows);
        return Math.max(3, Math.ceil(this._chartBaseHeight() / 50) + dataRows);
    }

    /**
     * Placement par défaut dans la vue « sections ».
     *
     * Sans cette méthode, Home Assistant ne connaît ni la largeur ni la hauteur
     * minimales de la carte : `grid_options.rows` pouvait l'écraser jusqu'au
     * chevauchement, et rien n'empêchait de la réduire à une colonne. `rows: auto`
     * laisse la carte dicter sa hauteur (graphique + cartes de données) ; l'utilisateur
     * qui fixe un nombre de lignes obtient un graphique qui s'y adapte, puisque le
     * conteneur du canvas grandit et rétrécit avec la place disponible.
     * @returns {Object} Options de grille reconnues par la vue sections
     */
    getGridOptions() {
        return {
            // 12 colonnes = toute la largeur d'une section, exprimé en nombre plutôt
            // qu'avec le mot-clé « full » que les versions plus anciennes ignorent.
            columns: 12,
            rows: 'auto',
            min_columns: 6,
            min_rows: this.config?.showChart === false ? 1 : 3,
        };
    }

    /**
     * Create the configuration element for the editor.
     * @returns {HTMLElement} The editor element
     */
    static getConfigElement() {
        return document.createElement("psychrometric-chart-editor");
    }

    /**
     * Get the default configuration stub.
     *
     * Aucune couleur n'y figure : `textColor: '#333333'` y était codé en dur, si bien
     * que toute carte créée depuis le sélecteur naissait avec un texte gris foncé
     * illisible sur un thème sombre, et que `_palette()` ne pouvait plus résoudre la
     * variable du thème. Sans clé de couleur, la carte suit Home Assistant.
     * @returns {Object} Default configuration
     */
    static getStubConfig() {
        return {
            chartTitle: "Diagramme Psychrométrique",
            points: [],
            showEnthalpy: true,
            showDewPoint: true,
            showWetBulb: true,
            showVaporPressure: true,
            themeMode: "auto"
        };
    }

    /**
     * Lifecycle method called after the first update.
     * Initializes the resize observer. Les écouteurs du canvas sont posés par le
     * template Lit : le canvas peut apparaître ou disparaître avec `showChart`,
     * et un accrochage manuel ici ne serait joué qu'une fois.
     */
    firstUpdated() {
        this._observeResize();
    }

    connectedCallback() {
        super.connectedCallback();
        // firstUpdated ne rejoue pas après un remontage : ré-observer explicitement.
        this._observeResize();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
        this._resizeTarget = null;
        clearTimeout(this._resizeDebounceTimer);
        this._resizeDebounceTimer = null;
        this._hoveredPoint = null;
        // La modale d'historique pose un écouteur sur la fenêtre : le retirer, sinon il
        // survivrait au démontage de la carte.
        window.removeEventListener('keydown', this._onModalKeyDown);
        this._historyResizeObserver?.disconnect();
        this._historyResizeObserver = null;
        this._historyResizeTarget = null;
        clearTimeout(this._historyResizeTimer);
        this._historyResizeTimer = null;
    }

    /**
     * Observe la zone du graphique et tient le canvas à la taille réellement disponible.
     *
     * C'est le conteneur qui est mesuré, et non la carte : sa hauteur est décidée par le
     * flux flex — hauteur de repos issue de `_chartBaseHeight()`, puis étirement ou
     * compression selon la place que Home Assistant accorde à la carte (`grid_options`).
     * Mesurer la carte ne donnait que sa largeur, d'où une hauteur toujours déduite de
     * celle-ci : le graphique débordait d'une carte trop courte et ne remplissait pas
     * une carte trop haute.
     *
     * Pas de boucle de rétroaction : la hauteur de repos ne dépend que de la largeur du
     * conteneur, que le canvas — dessiné à la taille exacte du conteneur, sans mise à
     * l'échelle CSS — ne peut pas modifier.
     */
    _observeResize() {
        const target = this.shadowRoot?.querySelector('.chart-container');
        if (!target || this._resizeTarget === target) return;

        this.resizeObserver?.disconnect();
        this._resizeTarget = target;
        this.resizeObserver = new ResizeObserver(entries => {
            clearTimeout(this._resizeDebounceTimer);
            this._resizeDebounceTimer = setTimeout(() => {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect;
                    if (width > 0 && height > 0) {
                        this._canvasWidth = width;
                        this._canvasHeight = height;
                        // La géométrie dépend des deux dimensions : la recalculer.
                        this._currentLayout = null;
                    }
                }
            }, 100);
        });
        this.resizeObserver.observe(target);
    }

    /**
     * Entity IDs the card actually depends on.
     * @returns {string[]} List of entity IDs
     */
    _watchedEntityIds() {
        if (!this.config?.points) return [];
        const ids = [];
        for (const point of this.config.points) {
            if (point.temp) ids.push(point.temp);
            if (point.humidity) ids.push(point.humidity);
        }
        return ids;
    }

    /**
     * Home Assistant replaces `hass` on every state change of *any* entity in the
     * installation. Without this gate the whole chart would be recomputed and
     * redrawn dozens of times per second for entities the card never displays.
     * @param {Map} changedProperties - Map of changed properties
     * @returns {boolean} True when the card must re-render
     */
    shouldUpdate(changedProperties) {
        if (!changedProperties.has('hass')) return true;
        if (changedProperties.size > 1) return true;

        const oldHass = changedProperties.get('hass');
        if (!oldHass || !this.config) return true;

        // Le thème et la locale changent le rendu sans qu'aucune entité ne bouge :
        // sans ces deux gardes, basculer Home Assistant en sombre laisserait la carte
        // figée dans sa palette claire jusqu'au prochain relevé de capteur.
        if (oldHass.themes !== this.hass.themes) return true;
        if (oldHass.locale !== this.hass.locale) return true;

        return this._watchedEntityIds().some(id => oldHass.states[id] !== this.hass.states[id]);
    }

    /**
     * Lifecycle method called before update.
     * Computes the points once per cycle, for both `render()` and `_drawChart()`.
     * @param {Map} changedProperties - Map of changed properties
     */
    willUpdate(changedProperties) {
        if (changedProperties.has('hass') || changedProperties.has('config') || !this._currentPoints) {
            this._currentPoints = this._calculatePoints();
        }
        // Masquer le graphique retire le canvas sous le curseur : sans cela, une
        // infobulle ouverte à cet instant resterait affichée faute de `mouseleave`.
        if (changedProperties.has('config') && this.config?.showChart === false && this._hoveredPoint) {
            this._hoveredPoint = null;
        }
    }

    /**
     * Lifecycle method called when properties change.
     * Triggers chart redraw if relevant properties change.
     * @param {Map} changedProperties - Map of changed properties
     */
    updated(changedProperties) {
        // Le conteneur du graphique apparaît et disparaît avec `showChart` : il faut
        // ré-observer celui qui est réellement dans le DOM, sinon la carte resterait
        // dimensionnée d'après un élément détruit.
        this._observeResize();

        if (changedProperties.has('hass') || changedProperties.has('config')
            || changedProperties.has('_canvasWidth') || changedProperties.has('_canvasHeight')) {
            this._drawChart();
        }

        if (this._modalOpen && this._historyData
            && (changedProperties.has('_modalOpen') || changedProperties.has('_historyData')
                || changedProperties.has('_historyHidden'))) {
            // Une frame d'attente pour que la modale soit mise en page et que
            // offsetWidth soit exploitable (remplace un setTimeout arbitraire).
            requestAnimationFrame(() => {
                this._drawHistoryChart();
                this._drawHistoryCursor();
            });
        }

        // Le curseur vit sur son propre calque : le déplacer ne redessine pas les courbes.
        if (changedProperties.has('_historyCursor')) this._drawHistoryCursor();

        if (this._modalOpen) this._observeHistoryResize();
    }

    /**
     * Redraw the history chart when the modal is resized.
     *
     * Aucune boucle possible : la taille de rendu du canvas vient du CSS, le dessin ne
     * touchant que ses attributs `width`/`height` (la définition du bitmap).
     */
    _observeHistoryResize() {
        const target = this.shadowRoot?.querySelector('.history-chart-wrap');
        if (!target || this._historyResizeTarget === target) return;

        this._historyResizeObserver?.disconnect();
        this._historyResizeTarget = target;
        this._historyResizeObserver = new ResizeObserver(() => {
            clearTimeout(this._historyResizeTimer);
            this._historyResizeTimer = setTimeout(() => {
                this._drawHistoryChart();
                this._drawHistoryCursor();
            }, 100);
        });
        this._historyResizeObserver.observe(target);
    }

    /**
     * Translate a key to the current language.
     * @param {string} key - Translation key
     * @returns {string} Translated text
     */
    t(key) {
        return this.translations[this._language]?.[key] ?? this.translations.fr[key] ?? key;
    }

    /**
     * Whether the card must render its dark palette.
     *
     * `themeMode` est l'unique commande : sans lui, la carte suit le thème de Home
     * Assistant. L'ancien booléen `darkMode` n'est volontairement plus lu — tant qu'il
     * l'était, une config l'ayant hérité (la documentation l'annonçait comme « force le
     * mode sombre ») figeait la carte en sombre à vie, et basculer Home Assistant en
     * clair n'avait aucun effet. Qui veut réellement forcer le sombre pose
     * `themeMode: dark`.
     * @returns {boolean} True when the dark palette applies
     */
    _isDark() {
        const mode = this.config?.themeMode;
        if (mode === 'dark') return true;
        if (mode === 'light') return false;
        return Boolean(this.hass?.themes?.darkMode);
    }

    /**
     * Resolve every colour the card draws with, once per use.
     *
     * Defaults come from the Home Assistant theme variables so the card blends into
     * any theme — the canvas needs concrete colour strings, which CSS variables
     * cannot provide directly, hence the computed-style read. Explicit config
     * colours always win.
     * @returns {Object} Resolved palette
     */
    _palette() {
        const dark = this._isDark();
        // `themeMode: light`/`dark` force un mode qui peut contredire celui de Home
        // Assistant : dans ce cas les variables CSS du thème sont ignorées, sinon
        // choisir « clair » sous un thème HA sombre laissait le fond et le texte
        // sombres — le mode clair semblait sans effet.
        const forced = this.config?.themeMode === 'light' || this.config?.themeMode === 'dark';
        const styles = getComputedStyle(this);
        /**
         * Reads a CSS custom property, falling back when the theme does not define it.
         * @param {string} name - Custom property name
         * @param {string} fallback - Value to use when unset
         * @returns {string} Resolved colour
         */
        const readVar = (name, fallback) => (forced ? fallback : (styles.getPropertyValue(name).trim() || fallback));

        /**
         * Résout une couleur : surcharge de configuration si présente, défaut sinon,
         * puis applique l'opacité indépendante `<clé>Opacity` quand elle est réglée.
         *
         * L'opacité est volontairement une clé distincte : intégrée à la couleur, elle
         * obligeait à figer aussi la teinte du mode courant, si bien qu'un simple
         * réglage de transparence bloquait ensuite la bascule clair/sombre.
         * @param {string} key - Option de couleur (ex. 'bgColor')
         * @param {string} fallback - Couleur du mode courant
         * @returns {string} Couleur CSS finale
         */
        const resolve = (key, fallback) => {
            const color = this.config?.[key] || fallback;
            const raw = this.config?.[PsychrometricCalculations.opacityKey(key)];
            if (raw === undefined || raw === null || raw === '') return color;
            const percent = parseFloat(raw);
            // Une couleur non analysable (mot-clé CSS, dégradé) virerait au noir.
            if (!Number.isFinite(percent) || !PsychrometricCalculations.isParsableColor(color)) return color;
            const alpha = Math.min(1, Math.max(0, percent / 100));
            return PsychrometricCalculations.rgbToCss(PsychrometricCalculations.colorToRgb(color), alpha);
        };

        return {
            dark,
            forced,
            bg: resolve('bgColor', readVar('--ha-card-background', readVar('--card-background-color', dark ? '#1c1c1c' : '#ffffff'))),
            text: resolve('textColor', readVar('--primary-text-color', dark ? '#e0e0e0' : '#333333')),
            grid: resolve('gridColor', dark ? '#444444' : '#cccccc'),
            curve: resolve('curveColor', dark ? '#4fc3f7' : '#1f77b4'),
            comfort: resolve('comfortColor', dark ? 'rgba(100, 200, 100, 0.3)' : 'rgba(144, 238, 144, 0.5)'),
            enthalpy: resolve('enthalpyColor', dark ? 'rgba(255, 165, 0, 0.7)' : 'rgba(255, 99, 71, 0.7)'),
            wetBulb: dark ? 'rgba(0, 255, 255, 0.4)' : 'rgba(0, 100, 255, 0.4)',
            saturation: dark ? 'rgba(80, 180, 255, 0.9)' : 'rgba(30, 144, 255, 0.8)',
            pointOutline: dark ? '#ffffff' : '#000000',
        };
    }

    /**
     * Motif de pointillés d'une famille de tracés, mis à l'échelle du canvas.
     *
     * Les longueurs de LINE_STYLES sont en pixels CSS de référence : les multiplier
     * par `scale` garde le même aspect quelle que soit la taille rendue, comme le
     * faisaient les motifs codés en dur qu'elle remplace.
     * @param {string} option - Nom de l'option de configuration (ex. 'gridLineStyle')
     * @param {number} scale - Facteur d'échelle du canvas
     * @returns {number[]} Motif à passer à ctx.setLineDash
     */
    _lineDash(option, scale) {
        const name = this.config?.[option] ?? DEFAULT_LINE_STYLES[option];
        const pattern = LINE_STYLES[name] ?? LINE_STYLES[DEFAULT_LINE_STYLES[option]];
        return pattern.map(segment => segment * scale);
    }

    /**
     * Nombre de sous-multiples tracés entre deux graduations de température sèche.
     *
     * 1 signifie « aucun trait intermédiaire », soit l'aspect historique du
     * graphique. La valeur est bornée : au-delà d'une dizaine, les traits se
     * confondent en aplat et la grille cesse d'être lisible.
     * @returns {number} Nombre entier de sous-multiples, entre 1 et 10
     */
    _tempSubdivisions() {
        const parsed = parseInt(this.config?.tempSubdivisions, 10);
        if (!Number.isFinite(parsed)) return 1;
        return Math.min(10, Math.max(1, parsed));
    }

    /**
     * Get the temperature unit symbol.
     * @returns {string} '°C' or '°F'
     */
    getTempUnit() {
        return this._temperatureUnit === '°F' ? '°F' : '°C';
    }

    /**
     * Detect temperature unit from Home Assistant or config.
     * @param {Object} hass - Home Assistant object
     * @returns {string} '°C' or '°F'
     */
    detectTemperatureUnit(hass) {
        if (this.config && this.config.temperatureUnit) {
            const configUnit = this.config.temperatureUnit.toLowerCase();
            if (['f', 'fahrenheit', '°f'].includes(configUnit)) return '°F';
            if (['c', 'celsius', '°c'].includes(configUnit)) return '°C';
        }
        if (hass && hass.config && hass.config.unit_system) {
            if (hass.config.unit_system.temperature === '°F') return '°F';
        }
        return '°C';
    }

    /**
     * Convert temperature to internal Celsius format.
     * @param {number} temp - Temperature value
     * @returns {number} Temperature in Celsius
     */
    toInternalTemp(temp) {
        if (this._temperatureUnit === '°F') {
            return PsychrometricCalculations.fahrenheitToCelsius(temp);
        }
        return temp;
    }

    /**
     * Convert internal Celsius temperature to display unit.
     * @param {number} tempC - Temperature in Celsius
     * @returns {number} Temperature in display unit
     */
    toDisplayTemp(tempC) {
        if (this._temperatureUnit === '°F') {
            return PsychrometricCalculations.celsiusToFahrenheit(tempC);
        }
        return tempC;
    }

    /**
     * Format temperature for display with unit.
     * @param {number} tempC - Temperature in Celsius
     * @param {number} [decimals=1] - Number of decimal places
     * @returns {string} Formatted temperature string
     */
    formatTemp(tempC, decimals = 1) {
        if (this._temperatureUnit === '°F') {
            return PsychrometricCalculations.celsiusToFahrenheit(tempC).toFixed(decimals) + '°F';
        }
        return tempC.toFixed(decimals) + '°C';
    }

    /**
     * Check if a point is within the comfort zone.
     * @param {number} temp - Temperature in Celsius
     * @param {number} humidity - Humidity in %
     * @param {Object} comfortRange - Comfort range definition
     * @returns {boolean} True if in comfort zone
     */
    isInComfortZone(temp, humidity, comfortRange) {
        return (
            temp >= comfortRange.tempMin &&
            temp <= comfortRange.tempMax &&
            humidity >= comfortRange.rhMin &&
            humidity <= comfortRange.rhMax
        );
    }

    /**
     * Describe *why* a point sits outside the comfort zone.
     * Temperature takes precedence over humidity, being the dominant sensation.
     * @param {number} temp - Temperature in Celsius
     * @param {number} humidity - Humidity in %
     * @param {Object} comfortRange - Comfort range definition
     * @returns {string} Translation key describing the comfort status
     */
    getComfortStatus(temp, humidity, comfortRange) {
        if (this.isInComfortZone(temp, humidity, comfortRange)) return 'comfortOptimal';
        if (temp > comfortRange.tempMax) return 'comfortTooHot';
        if (temp < comfortRange.tempMin) return 'comfortTooCold';
        if (humidity > comfortRange.rhMax) return 'comfortTooHumid';
        if (humidity < comfortRange.rhMin) return 'comfortTooDry';
        return 'outOfComfort';
    }

    /**
     * Get color for mold risk level.
     * @param {number} riskLevel - Risk level (0-6)
     * @param {boolean} darkMode - Whether dark mode is enabled
     * @returns {string} Color hex code
     */
    getMoldRiskColor(riskLevel, darkMode) {
        const colors = darkMode ?
            ["#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", "#FF5722"] :
            ["#2E7D32", "#558B2F", "#9E9D24", "#F9A825", "#EF6C00", "#E65100", "#C62828"];
        return colors[Math.min(Math.floor(riskLevel), 6)];
    }

    /**
     * Get text description for mold risk level.
     * @param {number} riskLevel - Risk level (0-6)
     * @returns {string} Localized risk description
     */
    getMoldRiskText(riskLevel) {
        const keys = ['moldRiskNone', 'moldRiskVeryLow', 'moldRiskLow', 'moldRiskModerate', 'moldRiskHigh', 'moldRiskVeryHigh', 'moldRiskCritical'];
        return this.t(keys[Math.min(Math.floor(riskLevel), 6)]);
    }

    /**
     * Calculate all psychrometric properties for configured points.
     * @returns {Array} List of calculated point objects
     */
    _calculatePoints() {
        if (!this.hass || !this.config || !this.config.points) return [];

        if (this._temperatureUnit === null) {
            this._temperatureUnit = this.detectTemperatureUnit(this.hass);
        }

        return this.config.points.map(point => {
            const tempState = this.hass.states[point.temp];
            const humState = this.hass.states[point.humidity];

            if (!tempState || !humState) return null;

            const tempRaw = parseFloat(tempState.state);
            const humidityRaw = parseFloat(humState.state);

            // Un capteur en 'unavailable' / 'unknown' donne NaN : sans cette garde le
            // NaN se propage dans tous les calculs et s'affiche tel quel sur la carte.
            if (!Number.isFinite(tempRaw) || !Number.isFinite(humidityRaw)) return null;

            const temp = this.toInternalTemp(tempRaw);
            // Une humidité nulle rendrait le point de rosée infini (log(0)).
            const humidity = Math.min(100, Math.max(0.01, humidityRaw));

            const comfortRange = this.config.comfortRange ? {
                tempMin: this.toInternalTemp(this.config.comfortRange.tempMin),
                tempMax: this.toInternalTemp(this.config.comfortRange.tempMax),
                rhMin: this.config.comfortRange.rhMin,
                rhMax: this.config.comfortRange.rhMax
            } : { tempMin: 20, tempMax: 26, rhMin: 40, rhMax: 60 };

            const { massFlowRate = 0.5 } = this.config;

            // Calculations
            let action = "";
            let power = 0;
            let heatingPower = 0;
            let coolingPower = 0;
            let humidificationPower = 0;
            let dehumidificationPower = 0;

            if (temp < comfortRange.tempMin) {
                action = this.t('warm');
                heatingPower = PsychrometricCalculations.calculateHeatingPower(temp, comfortRange.tempMin, massFlowRate);
                power += heatingPower;
            } else if (temp > comfortRange.tempMax) {
                action = this.t('cool');
                coolingPower = PsychrometricCalculations.calculateCoolingPower(temp, comfortRange.tempMax, massFlowRate);
                power += coolingPower;
            }

            if (humidity < comfortRange.rhMin) {
                action = action ? action + " " + this.t('andHumidify') : this.t('humidification');
                humidificationPower = PsychrometricCalculations.calculateHumidityPower(temp, humidity, comfortRange.rhMin, massFlowRate);
                power += humidificationPower;
            } else if (humidity > comfortRange.rhMax) {
                action = action ? action + " " + this.t('andDehumidify') : this.t('dehumidification');
                dehumidificationPower = PsychrometricCalculations.calculateHumidityPower(temp, humidity, comfortRange.rhMax, massFlowRate);
                power += dehumidificationPower;
            }

            const dewPoint = PsychrometricCalculations.calculateDewPoint(temp, humidity);
            const waterContent = PsychrometricCalculations.calculateWaterContent(temp, humidity);
            const enthalpy = PsychrometricCalculations.calculateEnthalpy(temp, waterContent);
            const absoluteHumidity = PsychrometricCalculations.calculateAbsoluteHumidity(temp, humidity);
            const wetBulbTemp = PsychrometricCalculations.calculateWetBulbTemp(temp, humidity);
            const specificVolume = PsychrometricCalculations.calculateSpecificVolume(temp, humidity);
            const moldRisk = PsychrometricCalculations.calculateMoldRisk(temp, humidity);
            const pmv = PsychrometricCalculations.calculatePMV(temp, humidity);
            const apparentTemp = PsychrometricCalculations.calculateApparentTemperature(temp, humidity);
            const idealSetpoint = PsychrometricCalculations.calculateIdealSetpoint(temp, humidity, comfortRange);

            // Normalisation en hex : le dessin concatène `color + '40'` pour le halo et
            // le rendu interpole `${color}15` dans un dégradé — un rgba() hérité d'une
            // ancienne config y produirait une couleur invalide, silencieusement ignorée.
            const rawColor = point.color || PsychrometricCalculations.generateColorFromHash(`${point.temp}_${point.humidity}`);
            const color = PsychrometricCalculations.rgbToHex(PsychrometricCalculations.colorToRgb(rawColor));

            return {
                temp, humidity, action, power, heatingPower, coolingPower, humidificationPower, dehumidificationPower,
                dewPoint, waterContent, enthalpy, absoluteHumidity, wetBulbTemp, specificVolume, moldRisk, pmv, apparentTemp, idealSetpoint,
                color,
                label: point.label || `${point.temp} & ${point.humidity}`,
                icon: point.icon || "mdi:thermometer",
                inComfortZone: this.isInComfortZone(temp, humidity, comfortRange),
                comfortStatus: this.getComfortStatus(temp, humidity, comfortRange),
                tempEntityId: point.temp,
                humidityEntityId: point.humidity,
                details: point.details // Pass through details config
            };
        }).filter(p => p !== null);
    }

    /**
     * Calculate chart boundaries based on config.
     * @returns {Object} Bounds object { minTemp, maxTemp, minHum, maxHum, maxPv }
     */
    _resolveBounds(config) {
        /**
         * Reads one numeric bound, falling back to the default when absent or unparseable.
         * @param {*} value - Raw config value
         * @param {number} fallback - Default bound
         * @returns {number} Resolved bound
         */
        const read = (value, fallback) => {
            if (value === undefined || value === null || value === '') return fallback;
            const parsed = parseFloat(value);
            return Number.isFinite(parsed) ? parsed : fallback;
        };

        return {
            minTemp: read(config?.zoom_temp_min, -10),
            maxTemp: read(config?.zoom_temp_max, 50),
            minHum: read(config?.zoom_humidity_min, 0),
            maxHum: read(config?.zoom_humidity_max, 100),
        };
    }

    /**
     * Calculate chart boundaries based on config.
     * The Y axis maps vapor pressure, so the humidity bounds are converted into a
     * pressure window taken at `maxTemp` — the warmest column of the chart.
     * @returns {Object} Bounds object { minTemp, maxTemp, minHum, maxHum, minPv, maxPv }
     */
    _calculateChartBounds() {
        const { minTemp, maxTemp, minHum, maxHum } = this._resolveBounds(this.config);

        const P_sat_max = PsychrometricCalculations.calculateSaturationPressure(maxTemp);
        const minPv = (minHum / 100) * P_sat_max;
        const maxPv = (maxHum / 100) * P_sat_max;

        return { minTemp, maxTemp, minHum, maxHum, minPv, maxPv };
    }

    /**
     * Rapport largeur/hauteur du graphique quand aucune hauteur n'est imposée.
     * @returns {number} Rapport borné entre 0,5 et 4
     */
    _chartAspectRatio() {
        const parsed = parseFloat(this.config?.chartAspectRatio);
        if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_CHART_RATIO;
        return Math.min(4, Math.max(0.5, parsed));
    }

    /**
     * Hauteur demandée par `chartHeight`, si l'option est exploitable.
     * @returns {number|null} Hauteur en pixels CSS, ou null si l'option est absente
     */
    _chartHeightOption() {
        const parsed = parseFloat(this.config?.chartHeight);
        return Number.isFinite(parsed) && parsed > 0 ? Math.max(MIN_CHART_HEIGHT, parsed) : null;
    }

    /**
     * Hauteur de repos du graphique : celle qu'il prend quand la carte le laisse
     * dicter sa propre taille (vue masonry, `grid_options.rows: auto`).
     *
     * Ce n'est qu'une base : le conteneur est un élément flex qui peut ensuite grandir
     * pour remplir une carte plus haute, ou rétrécir pour en tenir une plus courte.
     * @returns {number} Hauteur en pixels CSS
     */
    _chartBaseHeight() {
        return this._chartHeightOption()
            ?? Math.max(MIN_CHART_HEIGHT, this._canvasWidth / this._chartAspectRatio());
    }

    /**
     * Style en ligne du conteneur du graphique.
     *
     * La hauteur de repos y est posée explicitement plutôt que laissée au contenu : le
     * conteneur cesse ainsi de dépendre de la taille du canvas, ce qui rend impossible
     * toute boucle entre le redimensionnement observé et le redessin.
     * @returns {string} Déclarations CSS à appliquer au conteneur
     */
    _chartContainerStyle() {
        const height = `height: ${Math.round(this._chartBaseHeight())}px`;
        // Une hauteur explicite est une consigne, pas une base : la grille de Home
        // Assistant ne doit pas l'étirer. Seule une carte trop courte la comprime encore,
        // faute de quoi le graphique déborderait à nouveau sur ses voisines.
        return this._chartHeightOption() ? `${height}; flex: 0 1 auto` : height;
    }

    /**
     * Mise en page du graphique : facteurs d'échelle, police et bords de la zone de tracé.
     *
     * Source unique de la géométrie : `_drawChart()` la calcule une fois par dessin et
     * la mémorise dans `_currentLayout`, d'où `tempToX`/`humidityToY` la relisent. Elle
     * doit rester **pure** (aucun contexte de canvas, aucun état de dessin) pour que le
     * test de survol puisse la reconstruire à l'identique.
     *
     * Les marges ne sont plus de simples multiples de la géométrie de référence
     * (800x600) : les polices étant bornées à MIN_AXIS_FONT, elles cessent de rétrécir
     * avec la carte et les étiquettes finissaient par déborder dans la zone de tracé.
     * @returns {Object} { scaleX, scaleY, scale, axisFont, compactAxis, axisLabelX, leftPadding, rightEdge, topPadding, bottomEdge }
     */
    _chartLayout() {
        const width = this._canvasWidth;
        const height = this._canvasHeight;
        const scaleX = width / 800;
        const scaleY = height / 600;
        // Plancher sur l'échelle des symboles : une carte large mais basse (grid_options
        // avec peu de lignes) donnait un scaleY minuscule, donc des pastilles de deux
        // pixels sur un graphique par ailleurs immense.
        const scale = Math.max(0.5, Math.min(scaleX, scaleY));
        const axisFont = Math.max(MIN_AXIS_FONT, 12 * scale);
        // La police a dû être relevée au plancher : le texte n'est plus à l'échelle du
        // dessin, on passe l'axe en version courte (nombres seuls, unité en en-tête).
        const compactAxis = 12 * scale < MIN_AXIS_FONT;

        const bounds = this._currentBounds || this._calculateChartBounds();
        const axisLabelX = Math.max(4, 10 * scaleX);
        const pvLabel = compactAxis ? bounds.maxPv.toFixed(1) : `${bounds.maxPv.toFixed(1)} kPa`;
        const yLabelWidth = this.config?.showVaporPressure === false
            ? 0
            : estimateTextWidth(pvLabel, axisFont);

        // Les marges sont ensuite bornées à une fraction du canvas : une carte très
        // basse ou très étroite finirait sinon avec une zone de tracé nulle, voire
        // inversée (bord bas au-dessus du bord haut), et plus rien ne serait dessiné.
        const leftPadding = Math.min(width * 0.35, Math.max(50 * scaleX, axisLabelX + yLabelWidth + 6 * scale));
        const rightEdge = width - Math.min(width * 0.15, Math.max(50 * scaleX, axisFont * 2));
        const topPadding = Math.min(height * 0.2, Math.max(50 * scaleY, axisFont * 1.6));
        const bottomEdge = height - Math.min(height * 0.25, Math.max(50 * scaleY, axisFont * 2.4));

        return {
            scaleX, scaleY, scale, axisFont, compactAxis,
            axisLabelX, leftPadding, rightEdge, topPadding, bottomEdge,
        };
    }

    /**
     * Draw the psychrometric chart on the canvas.
     */
    _drawChart() {
        const canvas = this.shadowRoot.getElementById('psychroChart');
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const width = this._canvasWidth;
        const height = this._canvasHeight;

        // Rendu net sur écrans HiDPI : le canvas travaille en pixels physiques,
        // la transformation ramène toutes les coordonnées de dessin en pixels CSS.
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const points = this._currentPoints || [];

        const {
            showEnthalpy = true,
            showWetBulb = true,
            showDewPoint = true,
            showVaporPressure = true,
            showPointLabels = true,
        } = this.config;

        const minimalMode = this._displayMode() === 'minimal';
        const palette = this._palette();
        palette.dark;
        const actualBgColor = palette.bg;
        const actualGridColor = palette.grid;
        const actualCurveColor = palette.curve;
        const actualTextColor = palette.text;
        const actualComfortColor = palette.comfort;
        const actualEnthalpyColor = palette.enthalpy;

        const comfortRange = this.config.comfortRange ? {
            tempMin: this.toInternalTemp(this.config.comfortRange.tempMin),
            tempMax: this.toInternalTemp(this.config.comfortRange.tempMax),
            rhMin: this.config.comfortRange.rhMin,
            rhMax: this.config.comfortRange.rhMax
        } : { tempMin: 20, tempMax: 26, rhMin: 40, rhMax: 60 };

        const bounds = this._calculateChartBounds();
        this._currentBounds = bounds; // Store for coordinate conversion

        // Mise en page : calculée une fois ici, puis relue par tempToX/humidityToY.
        const layout = this._chartLayout();
        this._currentLayout = layout;
        const {
            scaleX, scaleY, scale, axisFont, compactAxis,
            axisLabelX, leftPadding, rightEdge, topPadding, bottomEdge,
        } = layout;
        const plotWidth = rightEdge - leftPadding;
        const plotHeight = bottomEdge - topPadding;

        // Zone de tracé trop étroite pour superposer les familles de courbes : on
        // retombe sur le mode minimal, qui ne garde que la grille et les points. Ce
        // repli ne concerne que le canvas — les cartes de données, elles, se
        // réorganisent déjà toutes seules en CSS.
        const minimal = minimalMode || plotWidth < 300 || plotHeight < 220;

        // Clear canvas
        ctx.fillStyle = actualBgColor;
        ctx.fillRect(0, 0, width, height);

        // Draw axes and grid
        ctx.strokeStyle = actualGridColor;
        ctx.lineWidth = 1 * scale;
        ctx.setLineDash(this._lineDash('gridLineStyle', scale));

        // Vertical grid (vapor pressure)
        if (showVaporPressure !== false) {
            ctx.font = `${axisFont}px Arial`;
            // Determine step size based on maxPv
            let pvStep = 0.5;
            if (bounds.maxPv < 1) pvStep = 0.1;
            else if (bounds.maxPv > 5) pvStep = 1;
            // ...puis on l'espace assez pour que deux étiquettes ne se touchent pas.
            pvStep = pickAxisStep(bounds.maxPv - bounds.minPv, plotHeight, axisFont * 1.6, pvStep, [1, 2, 5, 10]);

            // Axe compact : l'unité est écrite une fois en en-tête, les graduations ne
            // portent plus que le nombre — « 12.3 kPa » à chaque trait mangeait le quart
            // de la largeur d'une carte étroite.
            if (compactAxis) {
                ctx.fillStyle = actualTextColor;
                ctx.fillText('kPa', axisLabelX, topPadding - axisFont * 0.4);
            }

            for (let i = 0; i <= bounds.maxPv + pvStep; i += pvStep) {
                // L'axe Y porte la pression de vapeur : on la convertit en humidité
                // relative à la température de référence (maxTemp) pour réutiliser
                // humidityToY, qui est la seule projection Pv -> Y du graphique.
                const P_sat_ref = PsychrometricCalculations.calculateSaturationPressure(bounds.maxTemp);
                const rh = (i / P_sat_ref) * 100;
                const y = this.humidityToY(bounds.maxTemp, rh);

                if (y > topPadding && y < bottomEdge) {
                    ctx.beginPath();
                    ctx.moveTo(leftPadding, y);
                    ctx.lineTo(rightEdge, y);
                    ctx.stroke();
                    ctx.fillStyle = actualTextColor;
                    const label = compactAxis ? i.toFixed(1) : `${i.toFixed(1)} kPa`;
                    ctx.fillText(label, axisLabelX, y + axisFont * 0.35);
                }
            }
        }

        // Horizontal grid (temperature)
        // Les graduations sont posées dans l'unité d'affichage : convertir les bornes,
        // qui sont en Celsius interne, avant d'en déduire le premier et le dernier trait.
        const minDisplay = this.toDisplayTemp(bounds.minTemp);
        const maxDisplay = this.toDisplayTemp(bounds.maxTemp);
        // 10 °F plutôt que 9 (l'équivalent exact de 5 °C) : les graduations tombent sur
        // des dizaines rondes, comme sur n'importe quel axe en Fahrenheit.
        const baseTempStep = this._temperatureUnit === '°F' ? 10 : 5;
        // Un pas fixe faisait se chevaucher les étiquettes dès que la carte descendait
        // sous ~500 px : on l'élargit tant que « -10°C » ne tient pas entre deux traits.
        const tempStep = pickAxisStep(
            maxDisplay - minDisplay,
            plotWidth,
            estimateTextWidth(`-00${this.getTempUnit()}`, axisFont) + 8 * scale,
            baseTempStep
        );
        // Adjust start/end to be multiples of step
        const startT = Math.ceil(minDisplay / tempStep) * tempStep;
        const endT = Math.floor(maxDisplay / tempStep) * tempStep;

        // Sous-multiples : traits intermédiaires entre deux graduations, tracés avant
        // elles pour rester dessous, plus fins et atténués, et jamais étiquetés — les
        // étiquettes se chevaucheraient et l'axe deviendrait illisible.
        const subdivisions = this._tempSubdivisions();
        if (subdivisions > 1) {
            ctx.save();
            ctx.globalAlpha = 0.45;
            ctx.lineWidth = 0.5 * scale;
            // Boucle indexée plutôt qu'un incrément de `tempStep / subdivisions` :
            // l'accumulation de flottants décalerait les derniers traits.
            for (let major = startT - tempStep; major < endT + tempStep; major += tempStep) {
                for (let k = 1; k < subdivisions; k++) {
                    const displayTemp = major + (k * tempStep) / subdivisions;
                    const x = this.tempToX(this.toInternalTemp(displayTemp));
                    if (x < leftPadding || x > rightEdge) continue;
                    ctx.beginPath();
                    ctx.moveTo(x, bottomEdge);
                    ctx.lineTo(x, topPadding);
                    ctx.stroke();
                }
            }
            ctx.restore();
        }

        // Étiquettes centrées sur leur graduation : le décalage fixe de -15 px les
        // désalignait dès que la police cessait de suivre l'échelle du dessin.
        ctx.textAlign = 'center';
        for (let displayTemp = startT; displayTemp <= endT; displayTemp += tempStep) {
            const tempC = this.toInternalTemp(displayTemp);
            const x = this.tempToX(tempC);
            if (x >= leftPadding && x <= rightEdge) {
                ctx.beginPath();
                ctx.moveTo(x, bottomEdge);
                ctx.lineTo(x, topPadding);
                ctx.stroke();
                ctx.fillStyle = actualTextColor;
                ctx.fillText(`${displayTemp}${this.getTempUnit()}`, x, bottomEdge + axisFont * 1.4);
            }
        }
        ctx.textAlign = 'left';

        // Draw relative humidity curves
        ctx.setLineDash(this._lineDash('curveLineStyle', scale));
        ctx.font = `${axisFont}px Arial`;

        // Use zoom bounds for humidity curves if configured
        const startRh = bounds.minHum > 10 ? Math.ceil(bounds.minHum / 10) * 10 : 10;
        const endRh = bounds.maxHum < 100 ? Math.floor(bounds.maxHum / 10) * 10 : 100;
        // Les courbes restent tracées tous les 10 % — ce sont les étiquettes qui se
        // télescopent quand la hauteur manque, pas les traits : on n'en garde qu'une
        // sur deux dès que l'écart vertical moyen tombe sous la hauteur d'une ligne.
        const rhSpacing = plotHeight / Math.max(1, (endRh - startRh) / 10);
        const rhLabelStep = rhSpacing < axisFont * 2.2 ? 20 : 10;
        for (let rh = startRh; rh <= endRh; rh += 10) {
            ctx.beginPath();
            ctx.strokeStyle = rh === 100 ? palette.saturation : actualCurveColor;
            ctx.lineWidth = (rh % 20 === 0 ? 1.5 : 0.8) * scale;

            let firstPoint = true;
            for (let t = bounds.minTemp; t <= bounds.maxTemp; t += 0.5) {
                const x = this.tempToX(t);
                const y = this.humidityToY(t, rh);

                // Clip to bounds
                if (y < topPadding || y > bottomEdge) continue;

                if (firstPoint) {
                    ctx.moveTo(x, y);
                    firstPoint = false;
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();

            // Label
            // Dynamic positioning: find the rightmost visible point
            let labelX = -1;
            let labelY = -1;

            // Search from right to left (maxTemp to minTemp)
            for (let t = bounds.maxTemp; t >= bounds.minTemp; t -= 0.5) {
                const y = this.humidityToY(t, rh);
                // Check if y is within visible bounds (with some padding)
                if (y >= topPadding + 10 && y <= bottomEdge - 10) {
                    labelX = this.tempToX(t);
                    labelY = y;
                    break; // Found the rightmost visible point
                }
            }

            if (labelX !== -1 && labelY !== -1 && rh % rhLabelStep === 0) {
                ctx.fillStyle = actualTextColor;
                ctx.fillText(`${rh}%`, labelX + 5 * scaleX, labelY - 2 * scaleY);
            }
        }

        // Draw enthalpy curves
        if (showEnthalpy && !minimal) {
            ctx.setLineDash(this._lineDash('enthalpyLineStyle', scale));
            ctx.strokeStyle = actualEnthalpyColor;

            for (let h = 0; h <= 150; h += 10) {
                let enthalpy_points = [];
                for (let t = bounds.minTemp; t <= bounds.maxTemp; t += 0.5) {
                    const W = (h - 1.006 * t) / (2501 + 1.84 * t);
                    if (W < 0) continue;
                    const P_v = PsychrometricCalculations.waterContentToVaporPressure(W);
                    const rh = (P_v / PsychrometricCalculations.calculateSaturationPressure(t)) * 100;

                    const y = this.humidityToY(t, rh);
                    if (y >= topPadding && y <= bottomEdge) {
                        enthalpy_points.push({ x: this.tempToX(t), y });
                    }
                }

                if (enthalpy_points.length > 2) {
                    ctx.beginPath();
                    ctx.moveTo(enthalpy_points[0].x, enthalpy_points[0].y);
                    for (let i = 1; i < enthalpy_points.length - 1; i++) {
                        const xc = (enthalpy_points[i].x + enthalpy_points[i + 1].x) / 2;
                        const yc = (enthalpy_points[i].y + enthalpy_points[i + 1].y) / 2;
                        ctx.quadraticCurveTo(enthalpy_points[i].x, enthalpy_points[i].y, xc, yc);
                    }
                    const last = enthalpy_points[enthalpy_points.length - 1];
                    const beforeLast = enthalpy_points[enthalpy_points.length - 2];
                    ctx.quadraticCurveTo(beforeLast.x, beforeLast.y, last.x, last.y);
                    ctx.stroke();
                }
            }
            ctx.setLineDash([]);
        }

        // Draw Wet Bulb lines
        if (showWetBulb && !minimal) {
            ctx.setLineDash(this._lineDash('wetBulbLineStyle', scale));
            ctx.strokeStyle = palette.wetBulb;

            for (const line of this._wetBulbLines(bounds)) {
                let started = false;
                ctx.beginPath();
                for (const { temp, rh } of line) {
                    const y = this.humidityToY(temp, rh);
                    if (y < topPadding || y > bottomEdge) {
                        started = false;
                        continue;
                    }
                    const x = this.tempToX(temp);
                    if (started) {
                        ctx.lineTo(x, y);
                    } else {
                        ctx.moveTo(x, y);
                        started = true;
                    }
                }
                ctx.stroke();
            }
            ctx.setLineDash([]);
        }

        // Draw comfort zone
        // Le motif est posé explicitement : les blocs précédents sont conditionnels,
        // sans quoi le contour hériterait du pointillé du dernier tracé dessiné.
        ctx.setLineDash(this._lineDash('comfortLineStyle', scale));
        ctx.beginPath();
        const comfortPoints = [
            { temp: comfortRange.tempMin, rh: comfortRange.rhMin },
            { temp: comfortRange.tempMax, rh: comfortRange.rhMin },
            { temp: comfortRange.tempMax, rh: comfortRange.rhMax },
            { temp: comfortRange.tempMin, rh: comfortRange.rhMax },
        ];

        comfortPoints.forEach((point, index) => {
            const x = this.tempToX(point.temp);
            const y = this.humidityToY(point.temp, point.rh);
            if (index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();

        const avgTemp = (comfortRange.tempMin + comfortRange.tempMax) / 2;
        const yTop = this.humidityToY(avgTemp, comfortRange.rhMax);
        const yBottom = this.humidityToY(avgTemp, comfortRange.rhMin);
        const gradient = ctx.createLinearGradient(0, yTop, 0, yBottom);

        let startColor = actualComfortColor;
        let endColor = actualComfortColor;
        const colorMatch = actualComfortColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (colorMatch) {
            const [, r, g, b, a = '0.5'] = colorMatch;
            const alpha = parseFloat(a);
            startColor = `rgba(${r}, ${g}, ${b}, ${Math.max(0, alpha - 0.2)})`;
            endColor = `rgba(${r}, ${g}, ${b}, ${Math.min(1, alpha + 0.2)})`;
        }
        gradient.addColorStop(0, startColor);
        gradient.addColorStop(1, endColor);

        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = actualComfortColor;
        ctx.stroke();

        // Draw points
        // Les pastilles et leur halo restent toujours pleins, quel que soit le style
        // choisi pour le contour de la zone de confort dessinée juste avant.
        ctx.setLineDash([]);
        points.forEach(point => {
            const x = this.tempToX(point.temp);
            const y = this.humidityToY(point.temp, point.humidity);

            // Only draw if within visible area (roughly)
            if (x < leftPadding - 20 || x > rightEdge + 20 || y < topPadding - 20 || y > bottomEdge + 20) return;

            ctx.fillStyle = point.color;
            ctx.beginPath();
            ctx.arc(x, y, 6 * scale, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = palette.pointOutline;
            ctx.lineWidth = 2 * scale;
            ctx.stroke();

            // Halo
            ctx.beginPath();
            ctx.arc(x, y, 10 * scale, 0, 2 * Math.PI);
            ctx.strokeStyle = point.color + '40';
            ctx.lineWidth = 3 * scale;
            ctx.stroke();

            // Lines
            ctx.strokeStyle = point.color;
            ctx.setLineDash(this._lineDash('pointLineStyle', scale));
            ctx.lineWidth = 1 * scale;
            ctx.beginPath();
            ctx.moveTo(x, bottomEdge);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(leftPadding, y);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Dew point
            if (showDewPoint && !minimal) {
                const dewX = this.tempToX(point.dewPoint);
                const dewY = this.humidityToY(point.dewPoint, 100);

                if (dewX >= leftPadding && dewX <= rightEdge && dewY >= topPadding && dewY <= bottomEdge) {
                    ctx.beginPath();
                    ctx.arc(dewX, dewY, 4 * scale, 0, 2 * Math.PI);
                    ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
                    ctx.fill();
                    ctx.beginPath();
                    ctx.setLineDash(this._lineDash('pointLineStyle', scale));
                    ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
                    ctx.moveTo(x, y);
                    ctx.lineTo(dewX, dewY);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }

            if (showPointLabels !== false) {
                ctx.fillStyle = actualTextColor;
                ctx.font = `${Math.max(MIN_AXIS_FONT, 10 * scale)}px Arial`;
                ctx.fillText(point.label, x + 10 * scaleX, y - 10 * scaleY);
            }
        });
    }

    /**
     * Build the constant-wet-bulb lines as (temp, rh) samples.
     *
     * These lines only depend on the temperature bounds, never on the entity states,
     * so they are cached: the previous implementation re-ran a nested search calling
     * `calculateWetBulbTemp` ~18 800 times on every redraw.
     * @param {Object} bounds - Chart bounds
     * @returns {Array<Array<{temp: number, rh: number}>>} One sample list per line
     */
    _wetBulbLines(bounds) {
        const key = `${bounds.minTemp}/${bounds.maxTemp}`;
        if (this._wetBulbCache?.key === key) return this._wetBulbCache.lines;

        const lines = [];
        const startTw = Math.ceil(bounds.minTemp / 5) * 5;
        const endTw = Math.floor(bounds.maxTemp / 5) * 5;

        for (let tw = startTw; tw <= endTw; tw += 5) {
            const samples = [];
            // La ligne part de la saturation (t = tw) et s'étend vers les températures
            // sèches croissantes ; la teneur en eau y est donnée en forme close.
            for (let t = tw; t <= bounds.maxTemp; t += 0.5) {
                const W = PsychrometricCalculations.calculateWaterContentFromWetBulb(t, tw);
                if (W <= 0) break;
                const P_v = PsychrometricCalculations.waterContentToVaporPressure(W);
                const rh = (P_v / PsychrometricCalculations.calculateSaturationPressure(t)) * 100;
                if (rh <= 0) break;
                samples.push({ temp: t, rh });
            }
            if (samples.length > 1) lines.push(samples);
        }

        this._wetBulbCache = { key, lines };
        return lines;
    }

    /**
     * Convert temperature to X coordinate.
     * @param {number} temp - Temperature in Celsius
     * @returns {number} X coordinate
     */
    tempToX(temp) {
        const bounds = this._currentBounds || this._calculateChartBounds();
        // `_drawChart()` renseigne `_currentLayout` avant tout tracé : la projection et
        // le dessin partagent ainsi exactement la même géométrie, y compris hors dessin
        // (test de survol) où la mise en page est simplement recalculée à l'identique.
        const { leftPadding, rightEdge } = this._currentLayout || this._chartLayout();
        const chartWidth = rightEdge - leftPadding;

        const tempRange = bounds.maxTemp - bounds.minTemp;
        return leftPadding + ((temp - bounds.minTemp) / tempRange) * chartWidth;
    }

    /**
     * Convert humidity to Y coordinate.
     * The Y axis carries vapor pressure: minPv sits on the bottom edge, maxPv on top.
     * @param {number} temp - Temperature in Celsius
     * @param {number} humidity - Relative humidity in %
     * @returns {number} Y coordinate
     */
    humidityToY(temp, humidity) {
        const bounds = this._currentBounds || this._calculateChartBounds();
        const { topPadding, bottomEdge } = this._currentLayout || this._chartLayout();
        const chartHeight = bottomEdge - topPadding;

        const P_v = PsychrometricCalculations.calculateVaporPressure(temp, humidity);
        const pvRange = bounds.maxPv - bounds.minPv;

        return bottomEdge - ((P_v - bounds.minPv) / pvRange) * chartHeight;
    }

    /**
     * Handle mouse move event on canvas.
     * @param {MouseEvent} e - Mouse event
     */
    _handleMouseMove(e) {
        const canvas = this.shadowRoot.getElementById('psychroChart');
        if (!canvas) return;

        const point = this._pointAt(e);
        canvas.style.cursor = point ? 'pointer' : 'crosshair';
        this._hoveredPoint = point;
        if (point) this._tooltipPos = { x: e.clientX + 15, y: e.clientY + 15 };
    }

    /**
     * Handle mouse leave event on canvas.
     */
    _handleMouseLeave() {
        this._hoveredPoint = null;
    }

    /**
     * Handle click on canvas: open the history of the point under the cursor.
     * @param {MouseEvent} e - Mouse event
     */
    _handleCanvasClick(e) {
        const point = this._pointAt(e);
        if (point) this._openHistory(point.tempEntityId, 'temperature');
    }

    /**
     * Find the point drawn under the pointer, if any.
     * @param {MouseEvent} e - Mouse event
     * @returns {Object|null} Point data, or null when the pointer is over empty space
     */
    _pointAt(e) {
        const canvas = this.shadowRoot.getElementById('psychroChart');
        if (!canvas || !this._currentPoints?.length) return null;

        // Le contexte dessine en pixels CSS : ramener le pointeur dans ce repère.
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return null;
        const x = (e.clientX - rect.left) * (this._canvasWidth / rect.width);
        const y = (e.clientY - rect.top) * (this._canvasHeight / rect.height);

        let found = null;
        this._currentPoints.forEach((point, index) => {
            const dx = x - this.tempToX(point.temp);
            const dy = y - this.humidityToY(point.temp, point.humidity);
            if (Math.sqrt(dx * dx + dy * dy) < 15) found = { ...point, index };
        });
        return found;
    }

    /**
     * Render the hover tooltip.
     * Rendered through Lit inside the shadow root rather than injected into
     * document.body as HTML: labels stay plain text, no node is created per
     * mousemove, and the tooltip cannot outlive the card.
     * @returns {TemplateResult} HTML template
     */
    renderTooltip() {
        const point = this._hoveredPoint;
        if (!point) return '';
        return b`
            <div class="tooltip"
                 style="left: ${this._tooltipPos.x}px; top: ${this._tooltipPos.y}px; border-left-color: ${point.color}">
                <div class="tooltip-title" style="color: ${point.color}">${point.label}</div>
                <div>🌡️ ${this.t('temperature')}: <strong>${this.formatTemp(point.temp)}</strong></div>
                <div>💧 ${this.t('humidity')}: <strong>${point.humidity.toFixed(1)}%</strong></div>
                <div class="tooltip-hint">${this.t('clickToViewHistory')}</div>
            </div>
        `;
    }

    /**
     * Open history modal for an entity.
     * @param {string} entityId - Entity ID
     * @param {string} type - 'temperature' or 'humidity'
     */
    async _openHistory(entityId, type) {
        // Les deux entités du point sont récupérées ensemble : la modale superpose la
        // température et l'humidité sur le même axe de temps, et en déduit le point de
        // rosée. Le point est retrouvé depuis l'entité cliquée, les appelants (carte de
        // données, clic sur le graphique, clavier) ne transmettant qu'un identifiant.
        const point = (this._currentPoints || []).find(
            p => p.tempEntityId === entityId || p.humidityEntityId === entityId
        ) || null;

        this._selectedEntity = entityId;
        this._selectedType = type;
        this._historyPoint = point;
        this._modalOpen = true;
        this._historyData = null;
        this._historyCursor = null;
        this._historyHidden = [];
        // Échap ferme la modale : l'écouteur est posé sur la fenêtre, le focus pouvant
        // se trouver n'importe où dans le tableau de bord au moment du clic.
        window.addEventListener('keydown', this._onModalKeyDown);

        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
        this._historyEnd = endTime.getTime();

        const entityIds = point
            ? [point.tempEntityId, point.humidityEntityId]
            : [entityId];

        try {
            // minimal_response / no_attributes allègent nettement la réponse : seuls
            // `state` et `last_changed` sont exploités par le tracé.
            // significant_changes_only vaut 1 par défaut côté Home Assistant, et le filtre
            // « changement significatif » des capteurs écarte les variations inférieures à
            // 0.5 °C (1 % en humidité) : la courbe en ressortait quantifiée. On demande
            // donc explicitement la résolution complète.
            const url = `history/period/${startTime.toISOString()}`
                + `?filter_entity_id=${entityIds.map(encodeURIComponent).join(',')}`
                + `&end_time=${encodeURIComponent(endTime.toISOString())}`
                + `&significant_changes_only=0`
                + `&minimal_response&no_attributes`;
            const response = await this.hass.callApi('GET', url);
            // La requête a pu être doublée par des clics rapides : ignorer une réponse obsolète.
            if (this._selectedEntity !== entityId) return;
            this._historyData = this._parseHistory(response, point, type);
        } catch (error) {
            console.error('History error:', error);
            if (this._selectedEntity === entityId) this._historyData = { temperature: [], humidity: [], dewPoint: [] };
        }
    }

    /**
     * Parse the raw history response into the three drawable series.
     *
     * Entity states are already expressed in the display unit, so no temperature
     * conversion is applied to them. The dew point is the exception: it is computed
     * here, once, rather than at each draw — a 24 h window holds a few thousand samples.
     * @param {Array<Array<Object>>} response - Raw Home Assistant history response
     * @param {Object|null} point - Card point owning the entities, when known
     * @param {string} type - 'temperature' or 'humidity', the clicked series
     * @returns {Object} { temperature, humidity, dewPoint } sample lists
     */
    _parseHistory(response, point, type) {
        const byEntity = {};
        for (const list of response || []) {
            if (!Array.isArray(list) || list.length === 0) continue;
            // `minimal_response` ne conserve `entity_id` que sur le premier état : c'est
            // lui qui identifie la série, l'ordre des listes n'étant pas garanti.
            const id = list[0]?.entity_id;
            if (!id) continue;
            byEntity[id] = list
                .map(item => ({ time: new Date(item.last_changed).getTime(), value: parseFloat(item.state) }))
                .filter(sample => Number.isFinite(sample.value) && Number.isFinite(sample.time))
                .sort((a, b) => a.time - b.time);
        }

        // Sans point retrouvé, la seule série disponible est celle qui a été cliquée.
        const temperature = point ? (byEntity[point.tempEntityId] || []) : (type === 'temperature' ? byEntity[this._selectedEntity] || [] : []);
        const humidity = point ? (byEntity[point.humidityEntityId] || []) : (type === 'humidity' ? byEntity[this._selectedEntity] || [] : []);

        return { temperature, humidity, dewPoint: this._dewPointSeries(temperature, humidity) };
    }

    /**
     * Derive the dew point series from the temperature and humidity histories.
     *
     * Les deux capteurs n'enregistrent pas aux mêmes instants : `alignSeries` reporte la
     * dernière valeur connue de chacun avant de les apparier. Le calcul exige des
     * Celsius, alors que les états — et l'affichage — peuvent être en Fahrenheit.
     * @param {Array<{time: number, value: number}>} temperature - Temperature samples
     * @param {Array<{time: number, value: number}>} humidity - Humidity samples
     * @returns {Array<{time: number, value: number}>} Dew point samples, display unit
     */
    _dewPointSeries(temperature, humidity) {
        return alignSeries(temperature, humidity).map(({ time, a, b }) => {
            // Une humidité nulle rendrait le point de rosée infini (log(0)).
            const rh = Math.min(100, Math.max(0.01, b));
            const dewC = PsychrometricCalculations.calculateDewPoint(this.toInternalTemp(a), rh);
            return { time, value: this.toDisplayTemp(dewC) };
        });
    }

    /**
     * Describe every series the history modal can draw.
     * @returns {Array<Object>} Series descriptors, primary one first
     */
    _historySeries() {
        const data = this._historyData;
        if (!data) return [];

        const tempUnit = this.getTempUnit();
        const all = [
            { key: 'temperature', label: this.t('temperature'), color: '#ff9800', unit: tempUnit, axis: 'left', samples: data.temperature || [] },
            { key: 'humidity', label: this.t('humidity'), color: '#2196f3', unit: '%', axis: 'right', samples: data.humidity || [] },
            // Le point de rosée est une température : il partage l'axe de gauche, en
            // trait discontinu pour qu'on ne le confonde pas avec la mesure elle-même.
            { key: 'dewPoint', label: this.t('dewPoint'), color: '#4dd0e1', unit: tempUnit, axis: 'left', samples: data.dewPoint || [], dashed: true },
        ].filter(series => series.samples.length > 0);

        // La série cliquée passe devant : c'est elle que portent les tuiles de
        // statistiques, la bande de confort et les repères min/max.
        return all
            .map(series => ({ ...series, primary: series.key === this._selectedType }))
            .sort((a, b) => Number(b.primary) - Number(a.primary));
    }

    /**
     * Series actually drawn, once the legend toggles are applied.
     * @returns {Array<Object>} Visible series descriptors
     */
    _visibleHistorySeries() {
        const hidden = this._historyHidden || [];
        return this._historySeries().filter(series => !hidden.includes(series.key));
    }

    /**
     * Toggle one series from the history legend.
     * @param {string} key - Series key
     */
    _toggleHistorySeries(key) {
        const hidden = this._historyHidden || [];
        const next = hidden.includes(key) ? hidden.filter(k => k !== key) : [...hidden, key];
        // Tout masquer laisserait un graphique vide sans moyen évident de revenir :
        // la dernière série visible n'est pas décochable.
        if (next.length >= this._historySeries().length) return;
        this._historyHidden = next;
        this._historyCursor = null;
    }

    /**
     * Comfort band of the primary series, in display units.
     * @param {string} key - Series key
     * @returns {Object|null} { min, max } or null when the series has no comfort range
     */
    _historyComfortBand(key) {
        // `comfortRange` est déjà exprimé dans l'unité d'affichage, comme les états.
        const range = this.config?.comfortRange || {};
        if (key === 'temperature') {
            const min = parseFloat(range.tempMin ?? this.toDisplayTemp(20));
            const max = parseFloat(range.tempMax ?? this.toDisplayTemp(26));
            return Number.isFinite(min) && Number.isFinite(max) && max > min ? { min, max } : null;
        }
        if (key === 'humidity') {
            const min = parseFloat(range.rhMin ?? 40);
            const max = parseFloat(range.rhMax ?? 60);
            return Number.isFinite(min) && Number.isFinite(max) && max > min ? { min, max } : null;
        }
        return null;
    }

    /**
     * Compute the 24h statistics shown above the history chart.
     * @param {Array<{time: number, value: number}>} samples - History samples
     * @param {Object|null} band - Comfort band of the series, when it has one
     * @returns {Object|null} Statistics, or null when there is no data
     */
    _historyStats(samples, band = null) {
        if (!samples?.length) return null;

        // Un seul balayage : l'étalement `Math.min(...values)` dépasse la pile d'appels
        // sur les longues séries d'un enregistreur à pleine résolution.
        let min = Infinity;
        let max = -Infinity;
        let sum = 0;
        for (const sample of samples) {
            if (sample.value < min) min = sample.value;
            if (sample.value > max) max = sample.value;
            sum += sample.value;
        }

        return {
            min,
            max,
            avg: sum / samples.length,
            // Écart entre le premier et le dernier relevé de la période.
            trend: samples[samples.length - 1].value - samples[0].value,
            outside: band ? timeOutsideRange(samples, band.min, band.max, this._historyEnd) : null,
        };
    }

    /**
     * Close the history modal.
     */
    _closeModal() {
        this._modalOpen = false;
        this._historyData = null;
        this._historyCursor = null;
        this._historyPoint = null;
        this._historyPlot = null;
        window.removeEventListener('keydown', this._onModalKeyDown);
        this._historyResizeObserver?.disconnect();
        this._historyResizeObserver = null;
        this._historyResizeTarget = null;
    }

    /**
     * Close the modal on Escape.
     * @param {KeyboardEvent} e - Keyboard event
     */
    _handleModalKeyDown(e) {
        if (e.key === 'Escape' && this._modalOpen) this._closeModal();
    }

    /**
     * Draw the history chart in the modal.
     */
    _drawHistoryChart() {
        const canvas = this.shadowRoot.getElementById('historyChart');
        if (!canvas) return;

        const series = this._visibleHistorySeries();
        if (series.length === 0) return;

        const layout = this._historyLayout(canvas, series);
        if (!layout) return;
        this._historyPlot = layout;

        const { ctx, width, height, padding, textColor, gridColor, axes, toX, startTime, endTime } = layout;

        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 1;
        ctx.font = '11px Arial';
        ctx.setLineDash([]);

        // Bande de confort de la série principale, tracée en premier : tout le reste se
        // pose dessus. C'est elle qui rend l'écart au confort lisible d'un coup d'œil.
        const primary = series.find(s => s.primary) || series[0];
        const band = this._historyComfortBand(primary.key);
        const primaryAxis = axes[primary.axis];
        // L'intersection est vérifiée **avant** l'écrêtage : une journée entièrement
        // au-dessus de la zone de confort verrait sinon ses bornes ramenées à celles de
        // l'axe, et la bande couvrirait tout le graphique au lieu de disparaître.
        if (band && primaryAxis && band.max > primaryAxis.min && band.min < primaryAxis.max) {
            const top = primaryAxis.toY(Math.min(band.max, primaryAxis.max));
            const bottom = primaryAxis.toY(Math.max(band.min, primaryAxis.min));
            ctx.fillStyle = this._palette().dark ? 'rgba(76, 175, 80, 0.14)' : 'rgba(76, 175, 80, 0.18)';
            ctx.fillRect(padding.left, top, width - padding.left - padding.right, bottom - top);
        }

        // Grille horizontale + libellés de l'axe de gauche
        const gridAxis = axes.left || axes.right;
        ctx.strokeStyle = gridColor;
        ctx.textBaseline = 'middle';
        for (let value = gridAxis.min; value <= gridAxis.max + gridAxis.step / 2; value += gridAxis.step) {
            const y = gridAxis.toY(value);
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
        }

        // Chaque axe porte ses propres graduations, du côté de ses séries, et son unité
        // en tête : deux échelles sur un même cadre restaient sinon impossibles à lire.
        for (const [side, axis] of Object.entries(axes)) {
            ctx.fillStyle = axis.color;
            ctx.textAlign = side === 'left' ? 'right' : 'left';
            const x = side === 'left' ? padding.left - 6 : width - padding.right + 6;
            for (let value = axis.min; value <= axis.max + axis.step / 2; value += axis.step) {
                ctx.fillText(value.toFixed(axis.decimals), x, axis.toY(value));
            }
            ctx.textBaseline = 'bottom';
            ctx.fillText(axis.unit, x, padding.top - 6);
            ctx.textBaseline = 'middle';
        }

        // Grille verticale toutes les heures rondes, libellée toutes les 3 h
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (const { time, labelled } of this._hourTicks(startTime, endTime)) {
            const x = toX(time);
            ctx.strokeStyle = gridColor;
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, height - padding.bottom);
            ctx.stroke();
            if (labelled) {
                ctx.fillStyle = textColor;
                ctx.fillText(this._formatTime(new Date(time)), x, height - padding.bottom + 8);
            }
        }

        // Seule la série principale porte une aire dégradée, et elle est posée avant tous
        // les traits : peinte après, son voile teintait les autres courbes.
        if (primaryAxis) {
            const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
            gradient.addColorStop(0, `${primary.color}40`);
            gradient.addColorStop(1, `${primary.color}00`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(toX(primary.samples[0].time), height - padding.bottom);
            for (const sample of primary.samples) ctx.lineTo(toX(sample.time), primaryAxis.toY(sample.value));
            ctx.lineTo(toX(primary.samples[primary.samples.length - 1].time), height - padding.bottom);
            ctx.closePath();
            ctx.fill();
        }

        // Séries : la principale est tracée en dernier, donc au-dessus des autres.
        for (const item of [...series].reverse()) {
            const axis = axes[item.axis];
            if (!axis) continue;
            const toY = axis.toY;

            ctx.setLineDash(item.dashed ? [4, 3] : []);
            ctx.strokeStyle = item.color;
            ctx.lineWidth = item.primary ? 1.8 : 1.3;
            ctx.globalAlpha = item.primary ? 1 : 0.8;
            ctx.lineJoin = 'round';
            ctx.beginPath();
            item.samples.forEach((sample, index) => {
                const x = toX(sample.time);
                const y = toY(sample.value);
                if (index === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;

            // Dernière valeur, mise en évidence
            const last = item.samples[item.samples.length - 1];
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.arc(toX(last.time), toY(last.value), item.primary ? 3 : 2.5, 0, 2 * Math.PI);
            ctx.fill();
        }

        this._drawHistoryExtremes(layout, primary);
    }

    /**
     * Mark the lowest and highest samples of the primary series.
     *
     * Les tuiles donnent déjà les valeurs : les repères disent *quand* elles ont eu lieu,
     * ce que la courbe seule ne permet pas de situer précisément.
     * @param {Object} layout - History chart layout
     * @param {Object} series - Primary series descriptor
     */
    _drawHistoryExtremes(layout, series) {
        const { ctx, axes, toX, padding, width } = layout;
        const axis = axes[series.axis];
        if (!axis || series.samples.length < 2) return;

        let lowest = series.samples[0];
        let highest = series.samples[0];
        for (const sample of series.samples) {
            if (sample.value < lowest.value) lowest = sample;
            if (sample.value > highest.value) highest = sample;
        }
        if (lowest.value === highest.value) return;

        ctx.font = '10px Arial';
        ctx.textBaseline = 'middle';
        for (const [sample, above] of [[highest, true], [lowest, false]]) {
            const x = toX(sample.time);
            const y = axis.toY(sample.value);
            ctx.beginPath();
            ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
            ctx.fillStyle = layout.bgColor;
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = series.color;
            ctx.stroke();

            const label = `${above ? '▲' : '▼'} ${sample.value.toFixed(1)}${series.unit}`;
            // L'étiquette bascule du côté où il reste de la place, sans quoi un extremum
            // survenu en début ou en fin de période sortirait du cadre.
            const textWidth = ctx.measureText(label).width;
            ctx.textAlign = x + textWidth + 10 > width - padding.right ? 'right' : 'left';
            const offset = ctx.textAlign === 'right' ? -8 : 8;
            ctx.fillStyle = series.color;
            ctx.fillText(label, x + offset, above ? y - 10 : y + 10);
        }
        ctx.textAlign = 'left';
    }

    /**
     * Geometry of the history chart: canvas sizing, axes and time projection.
     *
     * Mémorisée dans `_historyPlot` par `_drawHistoryChart()` : le curseur de survol s'en
     * sert pour retrouver l'instant sous le pointeur sans recalculer la mise en page.
     * @param {HTMLCanvasElement} canvas - Chart canvas
     * @param {Array<Object>} series - Visible series
     * @returns {Object|null} Layout, or null when the canvas has no usable size
     */
    _historyLayout(canvas, series) {
        const width = canvas.offsetWidth;
        // La hauteur vient du CSS (clamp responsive) et non plus d'un 300 px codé en dur.
        const height = canvas.offsetHeight || 300;
        if (!width || !height) return null;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const palette = this._palette();
        const hasRight = series.some(s => s.axis === 'right');
        const hasLeft = series.some(s => s.axis === 'left');
        const padding = { left: hasLeft ? 44 : 16, right: hasRight ? 44 : 16, top: 28, bottom: 30 };
        const plotHeight = height - padding.top - padding.bottom;
        const plotWidth = width - padding.left - padding.right;

        /**
         * Build one Y axis over the series that share it.
         * @param {string} side - 'left' or 'right'
         * @returns {Object|null} Axis with its projection, or null when unused
         */
        const buildAxis = (side) => {
            const sides = series.filter(s => s.axis === side);
            if (!sides.length) return null;
            // Balayage plutôt que `Math.min(...values)` : une fenêtre de 24 h à pleine
            // résolution porte des milliers d'échantillons, et l'étalement en arguments
            // finit par dépasser la pile d'appels.
            let min = Infinity;
            let max = -Infinity;
            for (const item of sides) {
                for (const sample of item.samples) {
                    if (sample.value < min) min = sample.value;
                    if (sample.value > max) max = sample.value;
                }
            }
            if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
            // Graduations sur des valeurs rondes : l'échelle se calait auparavant sur
            // `min + i/5 · plage`, d'où des repères illisibles du type 26.1 / 28.1 / 30.1.
            const scale = PsychrometricCalculations.niceScale(min, max, 6);
            const span = (scale.max - scale.min) || 1;
            return {
                ...scale,
                // Les séries d'un même axe partagent forcément l'unité : température et
                // point de rosée à gauche, humidité à droite.
                unit: sides[0].unit,
                // L'axe de droite reprend la couleur de sa série : deux échelles
                // différentes sur un même cadre seraient sinon impossibles à attribuer.
                color: side === 'right'
                    ? (series.find(s => s.axis === 'right')?.color ?? palette.text)
                    : palette.text,
                toY: value => height - padding.bottom - ((value - scale.min) / span) * plotHeight,
            };
        };

        const axes = {};
        const left = buildAxis('left');
        const right = buildAxis('right');
        if (left) axes.left = left;
        if (right) axes.right = right;

        // L'axe X porte le temps réel : un espacement par index déformerait la
        // chronologie, l'historique HA étant échantillonné irrégulièrement.
        const times = series.flatMap(s => [s.samples[0].time, s.samples[s.samples.length - 1].time]);
        const startTime = Math.min(...times);
        const endTime = Math.max(...times);
        const timeSpan = endTime - startTime || 1;

        return {
            ctx, width, height, padding, plotWidth, plotHeight, axes,
            startTime, endTime, timeSpan,
            textColor: palette.text,
            bgColor: palette.bg,
            gridColor: palette.dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
            toX: time => padding.left + ((time - startTime) / timeSpan) * plotWidth,
        };
    }

    /**
     * Track the pointer over the history chart.
     *
     * Le curseur est un calque distinct : redessiner les courbes à chaque mouvement
     * coûterait un parcours complet des milliers d'échantillons de la période.
     * @param {PointerEvent} e - Pointer event
     */
    _handleHistoryPointer(e) {
        const layout = this._historyPlot;
        const canvas = this.shadowRoot?.getElementById('historyChart');
        if (!layout || !canvas) return;

        const rect = canvas.getBoundingClientRect();
        if (!rect.width) return;
        const x = (e.clientX - rect.left) * (layout.width / rect.width);
        if (x < layout.padding.left || x > layout.width - layout.padding.right) {
            this._historyCursor = null;
            return;
        }

        const time = layout.startTime
            + ((x - layout.padding.left) / layout.plotWidth) * layout.timeSpan;
        const readings = this._visibleHistorySeries()
            .map(item => {
                const sample = this._sampleNear(item.samples, time);
                return sample ? { key: item.key, label: item.label, color: item.color, unit: item.unit, value: sample.value, axis: item.axis } : null;
            })
            .filter(Boolean);

        this._historyCursor = readings.length ? { x, time, readings } : null;
    }

    /**
     * Sample closest to a given time, by binary search.
     * @param {Array<{time: number, value: number}>} samples - Chronological samples
     * @param {number} time - Target time, epoch ms
     * @returns {Object|null} Closest sample
     */
    _sampleNear(samples, time) {
        if (!samples?.length) return null;
        let low = 0;
        let high = samples.length - 1;
        while (low < high) {
            const mid = (low + high) >> 1;
            if (samples[mid].time < time) low = mid + 1;
            else high = mid;
        }
        const after = samples[low];
        const before = samples[Math.max(0, low - 1)];
        return Math.abs(after.time - time) < Math.abs(time - before.time) ? after : before;
    }

    /**
     * Draw the hover crosshair on its own overlay canvas.
     */
    _drawHistoryCursor() {
        const canvas = this.shadowRoot?.getElementById('historyCursor');
        const layout = this._historyPlot;
        if (!canvas || !layout) return;

        const { width, height, padding } = layout;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const cursor = this._historyCursor;
        if (!cursor) return;

        ctx.strokeStyle = this._palette().dark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(cursor.x, padding.top);
        ctx.lineTo(cursor.x, height - padding.bottom);
        ctx.stroke();
        ctx.setLineDash([]);

        for (const reading of cursor.readings) {
            const axis = layout.axes[reading.axis];
            if (!axis) continue;
            ctx.beginPath();
            ctx.arc(cursor.x, axis.toY(reading.value), 4, 0, 2 * Math.PI);
            ctx.fillStyle = reading.color;
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = layout.bgColor;
            ctx.stroke();
        }
    }


    /**
     * Whole-hour gridline positions across a time span.
     * @param {number} startTime - Range start, epoch ms
     * @param {number} endTime - Range end, epoch ms
     * @returns {Array<{time: number, labelled: boolean}>} Tick positions
     */
    _hourTicks(startTime, endTime) {
        const hour = 3600 * 1000;
        const ticks = [];
        const first = new Date(startTime);
        first.setMinutes(0, 0, 0);
        let time = first.getTime();
        if (time < startTime) time += hour;

        // Sur 24 h, une graduation par heure et un libellé toutes les 3 h : au-delà,
        // les libellés se chevauchent sur une carte étroite.
        for (; time <= endTime; time += hour) {
            ticks.push({ time, labelled: new Date(time).getHours() % 3 === 0 });
        }
        return ticks;
    }

    /**
     * Format a time using the Home Assistant locale rather than a hardcoded one.
     * @param {Date} date - Date to format
     * @returns {string} Localized time
     */
    _formatTime(date) {
        const locale = this.hass?.locale?.language || this._language;
        return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    }

    /**
     * Render the history modal.
     * @returns {TemplateResult} HTML template
     */
    renderHistoryModal() {
        const palette = this._palette();
        const textColor = palette.text;
        const bgColor = palette.bg;

        const series = this._historySeries();
        const visible = this._visibleHistorySeries();
        const primary = visible.find(s => s.primary) || visible[0] || null;
        const band = primary ? this._historyComfortBand(primary.key) : null;
        const stats = primary ? this._historyStats(primary.samples, band) : null;
        const unit = primary?.unit ?? '';

        // Le titre porte le nom du point dès qu'on a pu le retrouver : la modale montre
        // désormais ses deux capteurs, pas seulement la grandeur cliquée.
        const subject = this._historyPoint?.label
            ?? (this._selectedType === 'temperature' ? this.t('temperature') : this.t('humidity'));

        const hidden = this._historyHidden || [];
        const cursor = this._historyCursor;
        const plotWidth = this._historyPlot?.width || 0;
        const cursorRatio = cursor && plotWidth ? cursor.x / plotWidth : 0;

        return b`
            <div class="modal-overlay" @click="${(e) => e.target.classList.contains('modal-overlay') && this._closeModal()}">
                <div class="modal-content" style="background: ${bgColor}; color: ${textColor}">
                    <button class="modal-close" @click="${this._closeModal}" style="color: ${textColor}"
                            aria-label="${this.t('close')}">×</button>
                    <h2 style="margin-top: 0">${this.t('historyLast24h')} — ${subject}</h2>
                    ${this._historyData === null ? b`<div class="history-empty">${this.t('historyLoading')}</div>` : ''}
                    ${this._historyData !== null && series.length === 0 ? b`<div class="history-empty">${this.t('historyEmpty')}</div>` : ''}
                    ${series.length > 0 ? b`
                        ${stats ? b`
                            <div class="history-stats-caption">
                                <span class="history-legend-dot" style="background: ${primary.color}"></span>
                                <span>${primary.label}</span>
                            </div>
                            <div class="history-stats">
                                <div class="history-stat">
                                    <span class="history-stat-label">${this.t('statMin')}</span>
                                    <span class="history-stat-value">${stats.min.toFixed(1)}${unit}</span>
                                </div>
                                <div class="history-stat">
                                    <span class="history-stat-label">${this.t('statAvg')}</span>
                                    <span class="history-stat-value">${stats.avg.toFixed(1)}${unit}</span>
                                </div>
                                <div class="history-stat">
                                    <span class="history-stat-label">${this.t('statMax')}</span>
                                    <span class="history-stat-value">${stats.max.toFixed(1)}${unit}</span>
                                </div>
                                <div class="history-stat">
                                    <span class="history-stat-label">${this.t('statTrend')}</span>
                                    <span class="history-stat-value">${this._formatTrend(stats.trend, unit)}</span>
                                </div>
                                ${stats.outside !== null ? b`
                                    <div class="history-stat">
                                        <span class="history-stat-label">${this.t('statOutOfComfort')}</span>
                                        <span class="history-stat-value">${Math.round(stats.outside * 100)}%</span>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}

                        <div class="history-legend">
                            ${series.map(item => b`
                                <button class="history-legend-item ${hidden.includes(item.key) ? 'off' : ''}"
                                        @click="${() => this._toggleHistorySeries(item.key)}"
                                        aria-pressed="${!hidden.includes(item.key)}">
                                    <span class="history-legend-dot ${item.dashed ? 'dashed' : ''}"
                                          style="background: ${item.color}"></span>
                                    <span>${item.label}</span>
                                </button>
                            `)}
                        </div>

                        <div class="history-chart-wrap"
                             @pointermove="${this._onHistoryPointer}"
                             @pointerdown="${this._onHistoryPointer}"
                             @pointerleave="${this._onHistoryPointerLeave}">
                            <canvas id="historyChart" class="history-chart"></canvas>
                            <canvas id="historyCursor" class="history-cursor"></canvas>
                            ${cursor ? b`
                                <div class="history-tooltip ${cursorRatio > 0.5 ? 'at-left' : 'at-right'}"
                                     style="background: ${bgColor}">
                                    <div class="history-tooltip-time">${this._formatTime(new Date(cursor.time))}</div>
                                    ${cursor.readings.map(reading => b`
                                        <div class="history-tooltip-row">
                                            <span class="history-legend-dot" style="background: ${reading.color}"></span>
                                            <span class="history-tooltip-label">${reading.label}</span>
                                            <span class="history-tooltip-value">${reading.value.toFixed(1)}${reading.unit}</span>
                                        </div>
                                    `)}
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Format the trend shown in the statistics tiles.
     * @param {number} trend - Difference between the last and first sample
     * @param {string} unit - Display unit
     * @returns {string} Signed, arrowed trend
     */
    _formatTrend(trend, unit) {
        // Sous un dixième d'unité, la flèche suggérerait une évolution que la précision
        // du capteur ne permet pas d'affirmer.
        if (Math.abs(trend) < 0.1) return `→ 0${unit}`;
        return `${trend > 0 ? '↑' : '↓'} ${Math.abs(trend).toFixed(1)}${unit}`;
    }

    /**
     * Handle key down event for accessibility.
     * @param {KeyboardEvent} e - Keyboard event
     * @param {string} entityId - Entity ID
     * @param {string} type - 'temperature' or 'humidity'
     */
    _handleKeyDown(e, entityId, type) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this._openHistory(entityId, type);
        }
    }

    /**
     * Main render method.
     * @returns {TemplateResult} HTML template
     */
    /**
     * Determine if a field should be shown for a point.
     * @param {Object} point - Point data
     * @param {string} field - Field name
     * @returns {boolean}
     */
    _shouldShowField(point, field) {
        // Le niveau de détail est un interrupteur maître au-dessus du réglage par point :
        //   minimal  : la carte se réduit à température, humidité et badge de confort
        //   custom   : c'est `point.details` qui décide — les cases cochées sur le point
        //   detailed : tous les champs, quel que soit `point.details`
        const mode = this._displayMode();
        if (mode === 'minimal') return false;
        if (mode === 'detailed') return true;

        // If point has specific details configured, use them
        // Fix: check if details is an array, even if empty.
        // If it is an array, it means the user has explicitly configured this point.
        if (point.details && Array.isArray(point.details)) {
            return point.details.includes(field);
        }

        // Aucun `details` sur le point : repli sur les champs les plus courants.
        // Doit rester aligné avec DEFAULT_DETAILS dans l'éditeur.
        const defaultFields = ['dewPoint', 'wetBulb', 'apparentTemp', 'enthalpy', 'pmvIndex'];
        return defaultFields.includes(field);
    }

    /**
     * Current detail level.
     *
     * `standard` a été renommé `custom`, qui décrit ce que le mode fait réellement :
     * respecter les cases cochées sur chaque point. Les configurations existantes
     * portent encore l'ancienne valeur, d'où sa reconnaissance comme alias.
     * @returns {string} 'minimal', 'custom' or 'detailed'
     */
    _displayMode() {
        const mode = this.config?.displayMode;
        if (mode === 'standard') return 'custom';
        return ['minimal', 'custom', 'detailed'].includes(mode) ? mode : 'custom';
    }

    render() {
        if (!this.config || !this.hass) return b``;

        const points = this._currentPoints || [];
        const {
            chartTitle = "Diagramme Psychrométrique",
            showChart = true,
            showLegend = true,
            showCalculatedData = true,
            theme = "modern"
        } = this.config;

        const palette = this._palette();
        const darkMode = palette.dark;
        // Sans couleur explicitement configurée, on ne pose aucun style : ha-card et
        // ses descendants héritent alors du thème de Home Assistant, quel qu'il soit.
        // Exception : `themeMode` forcé, où l'héritage donnerait justement le thème
        // que l'utilisateur vient de refuser — on pose alors les couleurs résolues.
        const styled = (key) => this.config[key] || this.config[PsychrometricCalculations.opacityKey(key)] !== undefined;
        const cardStyle = [
            (styled('bgColor') || palette.forced) ? `background: ${palette.bg}` : '',
            (styled('textColor') || palette.forced) ? `color: ${palette.text}` : '',
        ].filter(Boolean).join('; ');

        // Les entités configurées sont toutes absentes ou invalides : le dire, plutôt
        // que d'afficher un diagramme vide sans explication.
        if (points.length === 0) {
            const message = this.config.points?.length ? this.t('noValidEntity') : this.t('noPointsConfigured');
            return b`
                <ha-card class="theme-${theme}" style="${cardStyle}">
                    <div class="card-header">${chartTitle}</div>
                    <div class="card-message">⚠️ ${message}</div>
                </ha-card>
            `;
        }

        const chartDescription = `Diagramme psychrométrique affichant ${points.length} points. ` + points.map(p =>
            `${p.label}: ${this.formatTemp(p.temp)}, ${p.humidity.toFixed(1)}% d'humidité relative.`
        ).join(" ");

        // Styles conditionnels selon le thème
        const isClassic = theme === 'classic';
        const isCompact = theme === 'compact';
        
        // Surfaces translucides plutôt que des blancs/gris opaques : elles se posent
        // correctement sur le fond du thème courant, quel qu'il soit.
        const dataBoxBg = isClassic
            ? (palette.forced ? palette.bg : 'var(--card-background-color, transparent)')
            : (darkMode
                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.02) 100%)'
                : 'linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.07) 100%)');

        const dataBoxBoxShadow = isClassic
            ? 'none'
            : `0 4px 15px rgba(0, 0, 0, ${darkMode ? '0.3' : '0.1'})`;

        // La légende se pose sur le canvas : elle reprend la couleur de fond résolue
        // du graphique pour rester lisible sans jamais supposer un fond blanc.
        const legendBg = palette.bg;

        return b`
            <ha-card class="theme-${theme}" style="${cardStyle}">
                <div class="card-header">${chartTitle}</div>

                ${showChart ? b`
                <div class="chart-container" style="${this._chartContainerStyle()}">
                    <canvas id="psychroChart" role="img" aria-label="${chartDescription}"
                            @mousemove="${this._onMouseMove}"
                            @mouseleave="${this._onMouseLeave}"
                            @click="${this._onCanvasClick}">
                        ${chartDescription}
                    </canvas>
                    ${showLegend ? b`
                        <div class="legend-box" style="background: ${legendBg}">
                            <div class="legend-title">📍 ${this.t('legend')}</div>
                            ${points.map(p => b`
                                <div class="legend-item">
                                    <span class="legend-color" style="background-color: ${p.color}; box-shadow: 0 0 5px ${p.color}"></span>
                                    <span>${p.label}</span>
                                </div>
                            `)}
                            <div class="legend-item">
                                <span class="legend-color legend-comfort"
                                      style="background-color: ${palette.comfort}"></span>
                                <span>${this.t('comfortZone')}</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
                ` : ''}

                ${showCalculatedData ? b`
                    <div class="psychro-data">
                        ${points.map((point, index) => b`
                            <div class="data-box" 
                                 style="
                                    background: ${dataBoxBg};
                                    border-left-color: ${point.color};
                                    box-shadow: ${dataBoxBoxShadow};
                                    animation: ${isClassic ? 'none' : `fadeInUp 0.5s ease-out ${index * 0.1}s backwards`};
                                 ">
                                ${!isClassic && !isCompact ? b`<div style="
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    bottom: 0;
                                    background: radial-gradient(circle at top right, ${point.color}15, transparent);
                                    pointer-events: none;"></div>` : ''}
                                
                                <div style="position: relative; z-index: 1;">
                                    <div class="data-header" style="color: ${point.color}">
                                        <span>${point.icon ? b`<ha-icon icon="${point.icon}" style="margin-right: 8px;"></ha-icon>` : ''} ${point.label}</span>
                                        ${point.inComfortZone ?
                b`<span class="status-badge" style="background: linear-gradient(135deg, #4CAF50, #45a049); box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);">✓ ${this.t('comfortOptimal')}</span>` :
                b`<span class="status-badge" style="background: linear-gradient(135deg, #FF9800, #f57c00); box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);">⚠ ${this.t(point.comfortStatus)}</span>`
            }
                                    </div>
                                    
                                    <div class="data-grid">
                                        <div class="data-row" 
                                             @click="${() => this._openHistory(point.tempEntityId, 'temperature')}" 
                                             @keydown="${(e) => this._handleKeyDown(e, point.tempEntityId, 'temperature')}"
                                             tabindex="0" 
                                             role="button" 
                                             aria-label="${this.t('historyLast24h')} - ${this.t('temperature')}"
                                             style="cursor: pointer">
                                            <span>🌡️ ${this.t('temperature')}: <span style="color: ${point.color}; font-weight: 600;">${this.formatTemp(point.temp)}</span></span>
                                        </div>
                                        <div class="data-row" 
                                             @click="${() => this._openHistory(point.humidityEntityId, 'humidity')}" 
                                             @keydown="${(e) => this._handleKeyDown(e, point.humidityEntityId, 'humidity')}"
                                             tabindex="0" 
                                             role="button" 
                                             aria-label="${this.t('historyLast24h')} - ${this.t('humidity')}"
                                             style="cursor: pointer">
                                            <span>💧 ${this.t('humidity')}: <span style="color: ${point.color}; font-weight: 600;">${point.humidity.toFixed(1)}%</span></span>
                                        </div>
                                        
                                        ${this._shouldShowField(point, 'dewPoint') ? b`<div>${this.t('dewPoint')}: ${this.formatTemp(point.dewPoint)}</div>` : ''}
                                        ${this._shouldShowField(point, 'wetBulb') ? b`<div>${this.t('wetBulb')}: ${this.formatTemp(point.wetBulbTemp)}</div>` : ''}
                                        ${this._shouldShowField(point, 'apparentTemp') ? b`<div>${this.t('apparentTemp')}: ${this.formatTemp(point.apparentTemp)}</div>` : ''}
                                        ${this._shouldShowField(point, 'enthalpy') ? b`<div>${this.t('enthalpy')}: ${point.enthalpy.toFixed(1)} kJ/kg</div>` : ''}
                                        ${this._shouldShowField(point, 'absHumidity') ? b`<div>${this.t('absHumidity')}: ${point.absoluteHumidity.toFixed(2)} g/m³</div>` : ''}
                                        ${this._shouldShowField(point, 'waterContent') ? b`<div>${this.t('waterContent')}: ${(point.waterContent * 1000).toFixed(1)} g/kg</div>` : ''}
                                        ${this._shouldShowField(point, 'specificVolume') ? b`<div>${this.t('specificVolume')}: ${point.specificVolume.toFixed(3)} m³/kg</div>` : ''}
                                        ${this._shouldShowField(point, 'pmvIndex') ? b`<div>${this.t('pmvIndex')}: ${point.pmv.toFixed(2)}</div>` : ''}
                                        
                                        ${this._shouldShowField(point, 'moldRisk') ? b`
                                            <div style="grid-column: span 2; display: flex; align-items: center; gap: 5px;">
                                                <span>🍄 ${this.t('moldRisk')}:</span>
                                                <span style="color: ${this.getMoldRiskColor(point.moldRisk, darkMode)}; font-weight: bold">
                                                    ${this.getMoldRiskText(point.moldRisk)}
                                                </span>
                                            </div>
                                        ` : ''}
                                    </div>

                                    ${(point.action || point.power > 0) && this._shouldShowField(point, 'action') ? b`
                                        <div class="action-box" style="border-top-color: ${darkMode ? '#555' : '#ddd'}">
                                            ${point.action ? b`<div><span class="action-icon">⚡</span>${this.t('action')}: ${point.action}</div>` : ''}
                                            ${point.power > 0 ? b`<div><span class="action-icon">🔥</span>${this.t('power')}: <span style="color: ${point.color}; font-weight: 600;">${point.power.toFixed(1)} W</span></div>` : ''}
                                            <div><span class="action-icon">🎯</span>${this.t('idealSetpoint')}: ${this.formatTemp(point.idealSetpoint.temp)}, ${point.idealSetpoint.humidity.toFixed(0)}%</div>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `)}
                    </div>
                ` : ''}
            </ha-card>
            
            ${this.renderTooltip()}
            ${this._modalOpen ? this.renderHistoryModal() : ''}
        `;
    }
}

customElements.define("psychrometric-chart-enhanced", PsychrometricChartEnhanced);

// Enregistrement de la carte pour le picker de cartes Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
    type: "psychrometric-chart-enhanced",
    name: "Psychrometric Chart Advanced",
    description: "Carte de diagramme psychrométrique interactif avec calculs scientifiques (point de rosée, enthalpie, PMV, etc.)",
    preview: true,
    documentationURL: "https://github.com/guiohm79/psychrometric-chart-advanced"
});
