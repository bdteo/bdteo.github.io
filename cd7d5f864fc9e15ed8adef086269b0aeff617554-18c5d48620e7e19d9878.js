(self.webpackChunkgatsby_starter_blog=self.webpackChunkgatsby_starter_blog||[]).push([[847],{225:function(e,t,a){"use strict";var r=a(4994);t.__esModule=!0,t.default=void 0;var n=r(a(2475)),o=r(a(6221)),i=r(a(3693)),l=r(a(6540)),s=r(a(5556)),c=function(e){function t(){for(var t,a=arguments.length,r=new Array(a),o=0;o<a;o++)r[o]=arguments[o];return t=e.call.apply(e,[this].concat(r))||this,(0,i.default)((0,n.default)(t),"state",{theme:"undefined"!=typeof window?window.__theme:null}),t}(0,o.default)(t,e);var a=t.prototype;return a.componentDidMount=function(){var e=this;window.__onThemeChange=function(){e.setState({theme:window.__theme})}},a.toggleTheme=function(e){window.__setPreferredTheme(e)},a.render=function(){return l.default.createElement(this.props.children,{theme:this.state.theme,toggleTheme:this.toggleTheme})},t}(l.default.Component);c.propTypes={children:s.default.func.isRequired};var u=c;t.default=u},3146:function(e,t,a){"use strict";var r=a(4994)(a(225));t.G=r.default},2532:function(e,t,a){"use strict";a.d(t,{G:function(){return P},L:function(){return g},M:function(){return k},P:function(){return x},S:function(){return D},_:function(){return l},a:function(){return i},b:function(){return d},c:function(){return c},g:function(){return m},h:function(){return s}});var r=a(6540),n=(a(5147),a(5556)),o=a.n(n);function i(){return i=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var r in a)Object.prototype.hasOwnProperty.call(a,r)&&(e[r]=a[r])}return e},i.apply(this,arguments)}function l(e,t){if(null==e)return{};var a,r,n={},o=Object.keys(e);for(r=0;r<o.length;r++)t.indexOf(a=o[r])>=0||(n[a]=e[a]);return n}const s=()=>"undefined"!=typeof HTMLImageElement&&"loading"in HTMLImageElement.prototype;const c=e=>{var t;return(e=>{var t,a;return Boolean(null==e||null==(t=e.images)||null==(a=t.fallback)?void 0:a.src)})(e)?e:(e=>Boolean(null==e?void 0:e.gatsbyImageData))(e)?e.gatsbyImageData:(e=>Boolean(null==e?void 0:e.gatsbyImage))(e)?e.gatsbyImage:null==e||null==(t=e.childImageSharp)?void 0:t.gatsbyImageData};function u(e,t,a){const r={};let n="gatsby-image-wrapper";return"fixed"===a?(r.width=e,r.height=t):"constrained"===a&&(n="gatsby-image-wrapper gatsby-image-wrapper-constrained"),{className:n,"data-gatsby-image-wrapper":"",style:r}}function d(e,t,a,r,n){return void 0===n&&(n={}),i({},a,{loading:r,shouldLoad:e,"data-main-image":"",style:i({},n,{opacity:t?1:0})})}function m(e,t,a,r,n,o,l,s){const c={};o&&(c.backgroundColor=o,"fixed"===a?(c.width=r,c.height=n,c.backgroundColor=o,c.position="relative"):("constrained"===a||"fullWidth"===a)&&(c.position="absolute",c.top=0,c.left=0,c.bottom=0,c.right=0)),l&&(c.objectFit=l),s&&(c.objectPosition=s);const u=i({},e,{"aria-hidden":!0,"data-placeholder-image":"",style:i({opacity:t?0:1,transition:"opacity 500ms linear"},c)});return u}const p=["children"],f=function(e){let{layout:t,width:a,height:n}=e;return"fullWidth"===t?r.createElement("div",{"aria-hidden":!0,style:{paddingTop:n/a*100+"%"}}):"constrained"===t?r.createElement("div",{style:{maxWidth:a,display:"block"}},r.createElement("img",{alt:"",role:"presentation","aria-hidden":"true",src:`data:image/svg+xml;charset=utf-8,%3Csvg%20height='${n}'%20width='${a}'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%3E%3C/svg%3E`,style:{maxWidth:"100%",display:"block",position:"static"}})):null},g=function(e){let{children:t}=e,a=l(e,p);return r.createElement(r.Fragment,null,r.createElement(f,i({},a)),t,null)},b=["src","srcSet","loading","alt","shouldLoad"],h=["fallback","sources","shouldLoad"],y=function(e){let{src:t,srcSet:a,loading:n,alt:o="",shouldLoad:s}=e,c=l(e,b);return r.createElement("img",i({},c,{decoding:"async",loading:n,src:s?t:void 0,"data-src":s?void 0:t,srcSet:s?a:void 0,"data-srcset":s?void 0:a,alt:o}))},v=function(e){let{fallback:t,sources:a=[],shouldLoad:n=!0}=e,o=l(e,h);const s=o.sizes||(null==t?void 0:t.sizes),c=r.createElement(y,i({},o,t,{sizes:s,shouldLoad:n}));return a.length?r.createElement("picture",null,a.map((e=>{let{media:t,srcSet:a,type:o}=e;return r.createElement("source",{key:`${t}-${o}-${a}`,type:o,media:t,srcSet:n?a:void 0,"data-srcset":n?void 0:a,sizes:s})})),c):c};var w;y.propTypes={src:n.string.isRequired,alt:n.string.isRequired,sizes:n.string,srcSet:n.string,shouldLoad:n.bool},v.displayName="Picture",v.propTypes={alt:n.string.isRequired,shouldLoad:n.bool,fallback:n.exact({src:n.string.isRequired,srcSet:n.string,sizes:n.string}),sources:n.arrayOf(n.oneOfType([n.exact({media:n.string.isRequired,type:n.string,sizes:n.string,srcSet:n.string.isRequired}),n.exact({media:n.string,type:n.string.isRequired,sizes:n.string,srcSet:n.string.isRequired})]))};const E=["fallback"],x=function(e){let{fallback:t}=e,a=l(e,E);return t?r.createElement(v,i({},a,{fallback:{src:t},"aria-hidden":!0,alt:""})):r.createElement("div",i({},a))};x.displayName="Placeholder",x.propTypes={fallback:n.string,sources:null==(w=v.propTypes)?void 0:w.sources,alt:function(e,t,a){return e[t]?new Error(`Invalid prop \`${t}\` supplied to \`${a}\`. Validation failed.`):null}};const k=function(e){return r.createElement(r.Fragment,null,r.createElement(v,i({},e)),r.createElement("noscript",null,r.createElement(v,i({},e,{shouldLoad:!0}))))};k.displayName="MainImage",k.propTypes=v.propTypes;const N=["as","className","class","style","image","loading","imgClassName","imgStyle","backgroundColor","objectFit","objectPosition"],S=["style","className"],O=e=>e.replace(/\n/g,""),C=function(e,t,a){for(var r=arguments.length,n=new Array(r>3?r-3:0),i=3;i<r;i++)n[i-3]=arguments[i];return e.alt||""===e.alt?o().string.apply(o(),[e,t,a].concat(n)):new Error(`The "alt" prop is required in ${a}. If the image is purely presentational then pass an empty string: e.g. alt="". Learn more: https://a11y-style-guide.com/style-guide/section-media.html`)},L={image:o().object.isRequired,alt:C},j=["as","image","style","backgroundColor","className","class","onStartLoad","onLoad","onError"],_=["style","className"],I=new Set;let T,A;const M=function(e){let{as:t="div",image:n,style:o,backgroundColor:c,className:d,class:m,onStartLoad:p,onLoad:f,onError:g}=e,b=l(e,j);const{width:h,height:y,layout:v}=n,w=u(h,y,v),{style:E,className:x}=w,k=l(w,_),N=(0,r.useRef)(),S=(0,r.useMemo)((()=>JSON.stringify(n.images)),[n.images]);m&&(d=m);const O=function(e,t,a){let r="";return"fullWidth"===e&&(r=`<div aria-hidden="true" style="padding-top: ${a/t*100}%;"></div>`),"constrained"===e&&(r=`<div style="max-width: ${t}px; display: block;"><img alt="" role="presentation" aria-hidden="true" src="data:image/svg+xml;charset=utf-8,%3Csvg%20height='${a}'%20width='${t}'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%3E%3C/svg%3E" style="max-width: 100%; display: block; position: static;"></div>`),r}(v,h,y);return(0,r.useEffect)((()=>{T||(T=a.e(108).then(a.bind(a,1108)).then((e=>{let{renderImageToString:t,swapPlaceholderImage:a}=e;return A=t,{renderImageToString:t,swapPlaceholderImage:a}})));const e=N.current.querySelector("[data-gatsby-image-ssr]");if(e&&s())return e.complete?(null==p||p({wasCached:!0}),null==f||f({wasCached:!0}),setTimeout((()=>{e.removeAttribute("data-gatsby-image-ssr")}),0)):(null==p||p({wasCached:!0}),e.addEventListener("load",(function t(){e.removeEventListener("load",t),null==f||f({wasCached:!0}),setTimeout((()=>{e.removeAttribute("data-gatsby-image-ssr")}),0)}))),void I.add(S);if(A&&I.has(S))return;let t,r;return T.then((e=>{let{renderImageToString:a,swapPlaceholderImage:l}=e;N.current&&(N.current.innerHTML=a(i({isLoading:!0,isLoaded:I.has(S),image:n},b)),I.has(S)||(t=requestAnimationFrame((()=>{N.current&&(r=l(N.current,S,I,o,p,f,g))}))))})),()=>{t&&cancelAnimationFrame(t),r&&r()}}),[n]),(0,r.useLayoutEffect)((()=>{I.has(S)&&A&&(N.current.innerHTML=A(i({isLoading:I.has(S),isLoaded:I.has(S),image:n},b)),null==p||p({wasCached:!0}),null==f||f({wasCached:!0}))}),[n]),(0,r.createElement)(t,i({},k,{style:i({},E,o,{backgroundColor:c}),className:`${x}${d?` ${d}`:""}`,ref:N,dangerouslySetInnerHTML:{__html:O},suppressHydrationWarning:!0}))},P=(0,r.memo)((function(e){return e.image?(0,r.createElement)(M,e):null}));P.propTypes=L,P.displayName="GatsbyImage";const $=["src","__imageData","__error","width","height","aspectRatio","tracedSVGOptions","placeholder","formats","quality","transformOptions","jpgOptions","pngOptions","webpOptions","avifOptions","blurredOptions","breakpoints","outputPixelDensities"];function R(e){return function(t){let{src:a,__imageData:n,__error:o}=t,s=l(t,$);return o&&console.warn(o),n?r.createElement(e,i({image:n},s)):(console.warn("Image not loaded",a),null)}}const z=R((function(e){let{as:t="div",className:a,class:n,style:o,image:s,loading:c="lazy",imgClassName:p,imgStyle:f,backgroundColor:b,objectFit:h,objectPosition:y}=e,v=l(e,N);if(!s)return console.warn("[gatsby-plugin-image] Missing image prop"),null;n&&(a=n),f=i({objectFit:h,objectPosition:y,backgroundColor:b},f);const{width:w,height:E,layout:C,images:L,placeholder:j,backgroundColor:_}=s,I=u(w,E,C),{style:T,className:A}=I,M=l(I,S),P={fallback:void 0,sources:[]};return L.fallback&&(P.fallback=i({},L.fallback,{srcSet:L.fallback.srcSet?O(L.fallback.srcSet):void 0})),L.sources&&(P.sources=L.sources.map((e=>i({},e,{srcSet:O(e.srcSet)})))),r.createElement(t,i({},M,{style:i({},T,o,{backgroundColor:b}),className:`${A}${a?` ${a}`:""}`}),r.createElement(g,{layout:C,width:w,height:E},r.createElement(x,i({},m(j,!1,C,w,E,_,h,y))),r.createElement(k,i({"data-gatsby-image-ssr":"",className:p},v,d("eager"===c,!1,P,c,f)))))})),H=function(e,t){for(var a=arguments.length,r=new Array(a>2?a-2:0),n=2;n<a;n++)r[n-2]=arguments[n];return"fullWidth"!==e.layout||"width"!==t&&"height"!==t||!e[t]?o().number.apply(o(),[e,t].concat(r)):new Error(`"${t}" ${e[t]} may not be passed when layout is fullWidth.`)},q=new Set(["fixed","fullWidth","constrained"]),F={src:o().string.isRequired,alt:C,width:H,height:H,sizes:o().string,layout:e=>{if(void 0!==e.layout&&!q.has(e.layout))return new Error(`Invalid value ${e.layout}" provided for prop "layout". Defaulting to "constrained". Valid values are "fixed", "fullWidth" or "constrained".`)}};z.displayName="StaticImage",z.propTypes=F;const D=R(P);D.displayName="StaticImage",D.propTypes=F},5147:function(e){"use strict";const t=/[\p{Lu}]/u,a=/[\p{Ll}]/u,r=/^[\p{Lu}](?![\p{Lu}])/gu,n=/([\p{Alpha}\p{N}_]|$)/u,o=/[_.\- ]+/,i=new RegExp("^"+o.source),l=new RegExp(o.source+n.source,"gu"),s=new RegExp("\\d+"+n.source,"gu"),c=(e,n)=>{if("string"!=typeof e&&!Array.isArray(e))throw new TypeError("Expected the input to be `string | string[]`");if(n={pascalCase:!1,preserveConsecutiveUppercase:!1,...n},0===(e=Array.isArray(e)?e.map((e=>e.trim())).filter((e=>e.length)).join("-"):e.trim()).length)return"";const o=!1===n.locale?e=>e.toLowerCase():e=>e.toLocaleLowerCase(n.locale),c=!1===n.locale?e=>e.toUpperCase():e=>e.toLocaleUpperCase(n.locale);if(1===e.length)return n.pascalCase?c(e):o(e);return e!==o(e)&&(e=((e,r,n)=>{let o=!1,i=!1,l=!1;for(let s=0;s<e.length;s++){const c=e[s];o&&t.test(c)?(e=e.slice(0,s)+"-"+e.slice(s),o=!1,l=i,i=!0,s++):i&&l&&a.test(c)?(e=e.slice(0,s-1)+"-"+e.slice(s-1),l=i,i=!1,o=!0):(o=r(c)===c&&n(c)!==c,l=i,i=n(c)===c&&r(c)!==c)}return e})(e,o,c)),e=e.replace(i,""),e=n.preserveConsecutiveUppercase?((e,t)=>(r.lastIndex=0,e.replace(r,(e=>t(e)))))(e,o):o(e),n.pascalCase&&(e=c(e.charAt(0))+e.slice(1)),((e,t)=>(l.lastIndex=0,s.lastIndex=0,e.replace(l,((e,a)=>t(a))).replace(s,(e=>t(e)))))(e,c)};e.exports=c,e.exports.default=c},4550:function(e,t,a){"use strict";a.d(t,{A:function(){return O}});var r=a(6540),n=a(4794),o=a(2532),i=a(7107),l=a(5556),s=a.n(l);function c(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function u(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?c(Object(a),!0).forEach((function(t){m(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):c(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function d(e){return d="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},d(e)}function m(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function p(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},o=Object.keys(e);for(r=0;r<o.length;r++)a=o[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)a=o[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}function f(e){return function(e){if(Array.isArray(e))return g(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||function(e,t){if(!e)return;if("string"==typeof e)return g(e,t);var a=Object.prototype.toString.call(e).slice(8,-1);"Object"===a&&e.constructor&&(a=e.constructor.name);if("Map"===a||"Set"===a)return Array.from(e);if("Arguments"===a||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(a))return g(e,t)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function g(e,t){(null==t||t>e.length)&&(t=e.length);for(var a=0,r=new Array(t);a<t;a++)r[a]=e[a];return r}function b(e){return t=e,(t-=0)==t?e:(e=e.replace(/[\-_\s]+(.)?/g,(function(e,t){return t?t.toUpperCase():""}))).substr(0,1).toLowerCase()+e.substr(1);var t}var h=["style"];var y=!1;try{y=!0}catch(C){}function v(e){return e&&"object"===d(e)&&e.prefix&&e.iconName&&e.icon?e:i.qg.icon?i.qg.icon(e):null===e?null:e&&"object"===d(e)&&e.prefix&&e.iconName?e:Array.isArray(e)&&2===e.length?{prefix:e[0],iconName:e[1]}:"string"==typeof e?{prefix:"fas",iconName:e}:void 0}function w(e,t){return Array.isArray(t)&&t.length>0||!Array.isArray(t)&&t?m({},e,t):{}}var E={border:!1,className:"",mask:null,maskId:null,fixedWidth:!1,inverse:!1,flip:!1,icon:null,listItem:!1,pull:null,pulse:!1,rotation:null,size:null,spin:!1,spinPulse:!1,spinReverse:!1,beat:!1,fade:!1,beatFade:!1,bounce:!1,shake:!1,symbol:!1,title:"",titleId:null,transform:null,swapOpacity:!1},x=r.forwardRef((function(e,t){var a=u(u({},E),e),r=a.icon,n=a.mask,o=a.symbol,l=a.className,s=a.title,c=a.titleId,d=a.maskId,p=v(r),g=w("classes",[].concat(f(function(e){var t,a=e.beat,r=e.fade,n=e.beatFade,o=e.bounce,i=e.shake,l=e.flash,s=e.spin,c=e.spinPulse,u=e.spinReverse,d=e.pulse,p=e.fixedWidth,f=e.inverse,g=e.border,b=e.listItem,h=e.flip,y=e.size,v=e.rotation,w=e.pull,E=(m(t={"fa-beat":a,"fa-fade":r,"fa-beat-fade":n,"fa-bounce":o,"fa-shake":i,"fa-flash":l,"fa-spin":s,"fa-spin-reverse":u,"fa-spin-pulse":c,"fa-pulse":d,"fa-fw":p,"fa-inverse":f,"fa-border":g,"fa-li":b,"fa-flip":!0===h,"fa-flip-horizontal":"horizontal"===h||"both"===h,"fa-flip-vertical":"vertical"===h||"both"===h},"fa-".concat(y),null!=y),m(t,"fa-rotate-".concat(v),null!=v&&0!==v),m(t,"fa-pull-".concat(w),null!=w),m(t,"fa-swap-opacity",e.swapOpacity),t);return Object.keys(E).map((function(e){return E[e]?e:null})).filter((function(e){return e}))}(a)),f((l||"").split(" ")))),b=w("transform","string"==typeof a.transform?i.qg.transform(a.transform):a.transform),h=w("mask",v(n)),x=(0,i.Kk)(p,u(u(u(u({},g),b),h),{},{symbol:o,title:s,titleId:c,maskId:d}));if(!x)return function(){var e;!y&&console&&"function"==typeof console.error&&(e=console).error.apply(e,arguments)}("Could not find icon",p),null;var N=x.abstract,S={ref:t};return Object.keys(a).forEach((function(e){E.hasOwnProperty(e)||(S[e]=a[e])})),k(N[0],S)}));x.displayName="FontAwesomeIcon",x.propTypes={beat:s().bool,border:s().bool,beatFade:s().bool,bounce:s().bool,className:s().string,fade:s().bool,flash:s().bool,mask:s().oneOfType([s().object,s().array,s().string]),maskId:s().string,fixedWidth:s().bool,inverse:s().bool,flip:s().oneOf([!0,!1,"horizontal","vertical","both"]),icon:s().oneOfType([s().object,s().array,s().string]),listItem:s().bool,pull:s().oneOf(["right","left"]),pulse:s().bool,rotation:s().oneOf([0,90,180,270]),shake:s().bool,size:s().oneOf(["2xs","xs","sm","lg","xl","2xl","1x","2x","3x","4x","5x","6x","7x","8x","9x","10x"]),spin:s().bool,spinPulse:s().bool,spinReverse:s().bool,symbol:s().oneOfType([s().bool,s().string]),title:s().string,titleId:s().string,transform:s().oneOfType([s().string,s().object]),swapOpacity:s().bool};var k=function e(t,a){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};if("string"==typeof a)return a;var n=(a.children||[]).map((function(a){return e(t,a)})),o=Object.keys(a.attributes||{}).reduce((function(e,t){var r=a.attributes[t];switch(t){case"class":e.attrs.className=r,delete a.attributes.class;break;case"style":e.attrs.style=r.split(";").map((function(e){return e.trim()})).filter((function(e){return e})).reduce((function(e,t){var a,r=t.indexOf(":"),n=b(t.slice(0,r)),o=t.slice(r+1).trim();return n.startsWith("webkit")?e[(a=n,a.charAt(0).toUpperCase()+a.slice(1))]=o:e[n]=o,e}),{});break;default:0===t.indexOf("aria-")||0===t.indexOf("data-")?e.attrs[t.toLowerCase()]=r:e.attrs[b(t)]=r}return e}),{attrs:{}}),i=r.style,l=void 0===i?{}:i,s=p(r,h);return o.attrs.style=u(u({},o.attrs.style),l),t.apply(void 0,[a.tag,u(u({},o.attrs),s)].concat(f(n)))}.bind(null,r.createElement),N=a(7875),S=a(6188);i.Yv.add(N.Vz1,N.IAJ,N.HQ1,S.y_8);var O=()=>{var e,t;const i=(0,n.useStaticQuery)("2923011943"),l=null===(e=i.site.siteMetadata)||void 0===e?void 0:e.author,s=null===(t=i.site.siteMetadata)||void 0===t?void 0:t.social;return r.createElement("div",{className:"bio"},r.createElement(o.S,{className:"bio-avatar",src:"../images/profile-pic.png",width:150,height:150,quality:95,alt:"",__imageData:a(7854)}),r.createElement("div",{className:"bio-content"},(null==l?void 0:l.name)&&r.createElement(r.Fragment,null,r.createElement("h2",{className:"bio-name"},l.name),r.createElement("p",{className:"bio-summary"},l.summary)),r.createElement("div",{className:"bio-social"},(null==s?void 0:s.github)&&r.createElement("a",{href:`https://github.com/${s.github}`,target:"_blank",rel:"noopener noreferrer","aria-label":"GitHub"},r.createElement(x,{icon:N.Vz1})),(null==s?void 0:s.email)&&r.createElement("a",{href:`mailto:${s.email}`,"aria-label":"Email"},r.createElement(x,{icon:S.y_8})))))}},9671:function(e,t,a){"use strict";a.d(t,{A:function(){return c}});var r=a(6540),n=a(4794),o=a(3146);const i="dark-mode",l=()=>r.createElement(o.G,null,(e=>{let{theme:t,toggleTheme:a}=e;const n=t===i;return r.createElement("div",{className:"theme-toggle-wrapper"},r.createElement("button",{className:"theme-toggle-button",onClick:()=>a(n?"light-mode":i),"aria-label":n?"Switch to light mode":"Switch to dark mode",title:n?"Switch to light mode":"Switch to dark mode"},r.createElement("div",{className:"toggle-track"},r.createElement("div",{className:"toggle-icon "+(n?"sun":"moon")},n?r.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"12",height:"12",fill:"currentColor"},r.createElement("path",{d:"M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"})):r.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",width:"12",height:"12",fill:"currentColor"},r.createElement("path",{d:"M11.3807 2.01886C9.91573 3.38468 9 5.33897 9 7.49998C9 11.6421 12.3579 15 16.5 15C18.661 15 20.6153 14.0842 21.9811 12.6193C21.6613 17.8535 17.3149 22 12 22C6.47715 22 2 17.5228 2 12C2 6.68514 6.14648 2.33865 11.3807 2.01886Z"}))),r.createElement("div",{className:"toggle-thumb",style:{transform:n?"translateX(22px)":"translateX(0)"}}))))}));var s=a.p+"static/bd-icon@4x-f90cf1ce14d7a43ad732b9265abfdca5.png";var c=e=>{let{location:t,title:a,children:o}=e;t.pathname;return r.createElement(r.Fragment,null,r.createElement("a",{href:"#main-content",className:"skip-to-main-content"},"Skip to main content"),r.createElement("header",{className:"global-header no-print"},r.createElement("div",{className:"container"},r.createElement("div",{className:"header-content"},r.createElement("div",{className:"header-left"},r.createElement("div",{className:"site-logo"},r.createElement(n.Link,{to:"/",className:"header-logo","aria-label":"Homepage"},r.createElement("img",{src:s,alt:"",width:"40",height:"40"}),r.createElement("span",{className:"site-title"},a))),r.createElement("nav",{className:"site-nav"},r.createElement("ul",{className:"nav-list"},r.createElement("li",{className:"nav-item"},r.createElement(n.Link,{to:"/",className:"nav-link",activeClassName:"active",partiallyActive:!1},r.createElement("span",{className:"nav-text"},"Home"),r.createElement("div",{className:"indicator-container"},r.createElement("span",{className:"nav-indicator"})))),r.createElement("li",{className:"nav-item"},r.createElement(n.Link,{to:"/about",className:"nav-link",activeClassName:"active",partiallyActive:!1},r.createElement("span",{className:"nav-text"},"About"),r.createElement("div",{className:"indicator-container"},r.createElement("span",{className:"nav-indicator"}))))))),r.createElement("div",{className:"header-right"},r.createElement("div",{className:"theme-toggle-container"},r.createElement(l,null)))))),r.createElement("main",{id:"main-content",className:"main-content"},r.createElement("div",{className:"container"},o)),r.createElement("footer",{className:"site-footer no-print"},r.createElement("div",{className:"container"},r.createElement("div",{className:"footer-content"},r.createElement("div",{className:"footer-copyright"},"© ",(new Date).getFullYear(),", Built with"," ",r.createElement("a",{href:"https://www.gatsbyjs.com",target:"_blank",rel:"noopener noreferrer"},"Gatsby")),r.createElement("div",{className:"footer-links"},r.createElement("a",{href:"https://github.com/bdteo",target:"_blank",rel:"noopener noreferrer","aria-label":"GitHub Profile"},"GitHub"),r.createElement("a",{href:"/rss.xml",target:"_blank",rel:"noopener noreferrer","aria-label":"RSS Feed"},"RSS"))))))}},7528:function(e,t,a){"use strict";var r=a(6540),n=a(4794);t.A=e=>{var t,a,o;let{description:i,title:l,children:s}=e;const{site:c}=(0,n.useStaticQuery)("2841359383"),u=i||c.siteMetadata.description,d=null===(t=c.siteMetadata)||void 0===t?void 0:t.title;return r.createElement(r.Fragment,null,r.createElement("title",null,d?`${l} | ${d}`:l),r.createElement("meta",{name:"description",content:u}),r.createElement("meta",{property:"og:title",content:l}),r.createElement("meta",{property:"og:description",content:u}),r.createElement("meta",{property:"og:type",content:"website"}),r.createElement("meta",{name:"twitter:card",content:"summary"}),r.createElement("meta",{name:"twitter:creator",content:(null===(a=c.siteMetadata)||void 0===a||null===(o=a.social)||void 0===o?void 0:o.twitter)||""}),r.createElement("meta",{name:"twitter:title",content:l}),r.createElement("meta",{name:"twitter:description",content:u}),s)}},3693:function(e,t,a){var r=a(7736);e.exports=function(e,t,a){return(t=r(t))in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e},e.exports.__esModule=!0,e.exports.default=e.exports},9045:function(e,t,a){var r=a(3738).default;e.exports=function(e,t){if("object"!=r(e)||!e)return e;var a=e[Symbol.toPrimitive];if(void 0!==a){var n=a.call(e,t||"default");if("object"!=r(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)},e.exports.__esModule=!0,e.exports.default=e.exports},7736:function(e,t,a){var r=a(3738).default,n=a(9045);e.exports=function(e){var t=n(e,"string");return"symbol"==r(t)?t:t+""},e.exports.__esModule=!0,e.exports.default=e.exports},3738:function(e){function t(a){return e.exports=t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},e.exports.__esModule=!0,e.exports.default=e.exports,t(a)}e.exports=t,e.exports.__esModule=!0,e.exports.default=e.exports},7854:function(e){"use strict";e.exports=JSON.parse('{"layout":"constrained","backgroundColor":"#181818","images":{"fallback":{"src":"https://bdteo.github.io/static/2fb36df54ab973fa2cb65e0e16381c11/01986/profile-pic.png","srcSet":"https://bdteo.github.io/static/2fb36df54ab973fa2cb65e0e16381c11/c16ee/profile-pic.png 38w,\\nhttps://bdteo.github.io/static/2fb36df54ab973fa2cb65e0e16381c11/1096c/profile-pic.png 75w,\\nhttps://bdteo.github.io/static/2fb36df54ab973fa2cb65e0e16381c11/01986/profile-pic.png 150w,\\nhttps://bdteo.github.io/static/2fb36df54ab973fa2cb65e0e16381c11/c0d5f/profile-pic.png 300w","sizes":"(min-width: 150px) 150px, 100vw"},"sources":[{"srcSet":"https://bdteo.github.io/static/2fb36df54ab973fa2cb65e0e16381c11/0a429/profile-pic.webp 38w,\\nhttps://bdteo.github.io/static/2fb36df54ab973fa2cb65e0e16381c11/a18cc/profile-pic.webp 75w,\\nhttps://bdteo.github.io/static/2fb36df54ab973fa2cb65e0e16381c11/7ddcc/profile-pic.webp 150w,\\nhttps://bdteo.github.io/static/2fb36df54ab973fa2cb65e0e16381c11/dd79f/profile-pic.webp 300w","type":"image/webp","sizes":"(min-width: 150px) 150px, 100vw"}]},"width":150,"height":150}')}}]);
//# sourceMappingURL=cd7d5f864fc9e15ed8adef086269b0aeff617554-18c5d48620e7e19d9878.js.map