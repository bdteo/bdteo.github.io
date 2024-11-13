"use strict";(self.webpackChunkgatsby_starter_blog=self.webpackChunkgatsby_starter_blog||[]).push([[847],{2532:function(e,t,a){a.d(t,{G:function(){return R},L:function(){return f},M:function(){return S},P:function(){return k},S:function(){return H},_:function(){return o},a:function(){return s},b:function(){return d},c:function(){return c},g:function(){return g},h:function(){return l}});var r=a(6540),i=(a(5147),a(5556)),n=a.n(i);function s(){return s=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var r in a)Object.prototype.hasOwnProperty.call(a,r)&&(e[r]=a[r])}return e},s.apply(this,arguments)}function o(e,t){if(null==e)return{};var a,r,i={},n=Object.keys(e);for(r=0;r<n.length;r++)t.indexOf(a=n[r])>=0||(i[a]=e[a]);return i}const l=()=>"undefined"!=typeof HTMLImageElement&&"loading"in HTMLImageElement.prototype;const c=e=>{var t;return(e=>{var t,a;return Boolean(null==e||null==(t=e.images)||null==(a=t.fallback)?void 0:a.src)})(e)?e:(e=>Boolean(null==e?void 0:e.gatsbyImageData))(e)?e.gatsbyImageData:(e=>Boolean(null==e?void 0:e.gatsbyImage))(e)?e.gatsbyImage:null==e||null==(t=e.childImageSharp)?void 0:t.gatsbyImageData};function u(e,t,a){const r={};let i="gatsby-image-wrapper";return"fixed"===a?(r.width=e,r.height=t):"constrained"===a&&(i="gatsby-image-wrapper gatsby-image-wrapper-constrained"),{className:i,"data-gatsby-image-wrapper":"",style:r}}function d(e,t,a,r,i){return void 0===i&&(i={}),s({},a,{loading:r,shouldLoad:e,"data-main-image":"",style:s({},i,{opacity:t?1:0})})}function g(e,t,a,r,i,n,o,l){const c={};n&&(c.backgroundColor=n,"fixed"===a?(c.width=r,c.height=i,c.backgroundColor=n,c.position="relative"):("constrained"===a||"fullWidth"===a)&&(c.position="absolute",c.top=0,c.left=0,c.bottom=0,c.right=0)),o&&(c.objectFit=o),l&&(c.objectPosition=l);const u=s({},e,{"aria-hidden":!0,"data-placeholder-image":"",style:s({opacity:t?0:1,transition:"opacity 500ms linear"},c)});return u}const p=["children"],m=function(e){let{layout:t,width:a,height:i}=e;return"fullWidth"===t?r.createElement("div",{"aria-hidden":!0,style:{paddingTop:i/a*100+"%"}}):"constrained"===t?r.createElement("div",{style:{maxWidth:a,display:"block"}},r.createElement("img",{alt:"",role:"presentation","aria-hidden":"true",src:"data:image/svg+xml;charset=utf-8,%3Csvg%20height='"+i+"'%20width='"+a+"'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%3E%3C/svg%3E",style:{maxWidth:"100%",display:"block",position:"static"}})):null},f=function(e){let{children:t}=e,a=o(e,p);return r.createElement(r.Fragment,null,r.createElement(m,s({},a)),t,null)},h=["src","srcSet","loading","alt","shouldLoad"],b=["fallback","sources","shouldLoad"],y=function(e){let{src:t,srcSet:a,loading:i,alt:n="",shouldLoad:l}=e,c=o(e,h);return r.createElement("img",s({},c,{decoding:"async",loading:i,src:l?t:void 0,"data-src":l?void 0:t,srcSet:l?a:void 0,"data-srcset":l?void 0:a,alt:n}))},v=function(e){let{fallback:t,sources:a=[],shouldLoad:i=!0}=e,n=o(e,b);const l=n.sizes||(null==t?void 0:t.sizes),c=r.createElement(y,s({},n,t,{sizes:l,shouldLoad:i}));return a.length?r.createElement("picture",null,a.map((e=>{let{media:t,srcSet:a,type:n}=e;return r.createElement("source",{key:t+"-"+n+"-"+a,type:n,media:t,srcSet:i?a:void 0,"data-srcset":i?void 0:a,sizes:l})})),c):c};var w;y.propTypes={src:i.string.isRequired,alt:i.string.isRequired,sizes:i.string,srcSet:i.string,shouldLoad:i.bool},v.displayName="Picture",v.propTypes={alt:i.string.isRequired,shouldLoad:i.bool,fallback:i.exact({src:i.string.isRequired,srcSet:i.string,sizes:i.string}),sources:i.arrayOf(i.oneOfType([i.exact({media:i.string.isRequired,type:i.string,sizes:i.string,srcSet:i.string.isRequired}),i.exact({media:i.string,type:i.string.isRequired,sizes:i.string,srcSet:i.string.isRequired})]))};const E=["fallback"],k=function(e){let{fallback:t}=e,a=o(e,E);return t?r.createElement(v,s({},a,{fallback:{src:t},"aria-hidden":!0,alt:""})):r.createElement("div",s({},a))};k.displayName="Placeholder",k.propTypes={fallback:i.string,sources:null==(w=v.propTypes)?void 0:w.sources,alt:function(e,t,a){return e[t]?new Error("Invalid prop `"+t+"` supplied to `"+a+"`. Validation failed."):null}};const S=function(e){return r.createElement(r.Fragment,null,r.createElement(v,s({},e)),r.createElement("noscript",null,r.createElement(v,s({},e,{shouldLoad:!0}))))};S.displayName="MainImage",S.propTypes=v.propTypes;const L=["as","className","class","style","image","loading","imgClassName","imgStyle","backgroundColor","objectFit","objectPosition"],C=["style","className"],x=e=>e.replace(/\n/g,""),N=function(e,t,a){for(var r=arguments.length,i=new Array(r>3?r-3:0),s=3;s<r;s++)i[s-3]=arguments[s];return e.alt||""===e.alt?n().string.apply(n(),[e,t,a].concat(i)):new Error('The "alt" prop is required in '+a+'. If the image is purely presentational then pass an empty string: e.g. alt="". Learn more: https://a11y-style-guide.com/style-guide/section-media.html')},I={image:n().object.isRequired,alt:N},T=["as","image","style","backgroundColor","className","class","onStartLoad","onLoad","onError"],_=["style","className"],O=new Set;let j,q;const z=function(e){let{as:t="div",image:i,style:n,backgroundColor:c,className:d,class:g,onStartLoad:p,onLoad:m,onError:f}=e,h=o(e,T);const{width:b,height:y,layout:v}=i,w=u(b,y,v),{style:E,className:k}=w,S=o(w,_),L=(0,r.useRef)(),C=(0,r.useMemo)((()=>JSON.stringify(i.images)),[i.images]);g&&(d=g);const x=function(e,t,a){let r="";return"fullWidth"===e&&(r='<div aria-hidden="true" style="padding-top: '+a/t*100+'%;"></div>'),"constrained"===e&&(r='<div style="max-width: '+t+'px; display: block;"><img alt="" role="presentation" aria-hidden="true" src="data:image/svg+xml;charset=utf-8,%3Csvg%20height=\''+a+"'%20width='"+t+"'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%3E%3C/svg%3E\" style=\"max-width: 100%; display: block; position: static;\"></div>"),r}(v,b,y);return(0,r.useEffect)((()=>{j||(j=a.e(108).then(a.bind(a,1108)).then((e=>{let{renderImageToString:t,swapPlaceholderImage:a}=e;return q=t,{renderImageToString:t,swapPlaceholderImage:a}})));const e=L.current.querySelector("[data-gatsby-image-ssr]");if(e&&l())return e.complete?(null==p||p({wasCached:!0}),null==m||m({wasCached:!0}),setTimeout((()=>{e.removeAttribute("data-gatsby-image-ssr")}),0)):(null==p||p({wasCached:!0}),e.addEventListener("load",(function t(){e.removeEventListener("load",t),null==m||m({wasCached:!0}),setTimeout((()=>{e.removeAttribute("data-gatsby-image-ssr")}),0)}))),void O.add(C);if(q&&O.has(C))return;let t,r;return j.then((e=>{let{renderImageToString:a,swapPlaceholderImage:o}=e;L.current&&(L.current.innerHTML=a(s({isLoading:!0,isLoaded:O.has(C),image:i},h)),O.has(C)||(t=requestAnimationFrame((()=>{L.current&&(r=o(L.current,C,O,n,p,m,f))}))))})),()=>{t&&cancelAnimationFrame(t),r&&r()}}),[i]),(0,r.useLayoutEffect)((()=>{O.has(C)&&q&&(L.current.innerHTML=q(s({isLoading:O.has(C),isLoaded:O.has(C),image:i},h)),null==p||p({wasCached:!0}),null==m||m({wasCached:!0}))}),[i]),(0,r.createElement)(t,s({},S,{style:s({},E,n,{backgroundColor:c}),className:k+(d?" "+d:""),ref:L,dangerouslySetInnerHTML:{__html:x},suppressHydrationWarning:!0}))},R=(0,r.memo)((function(e){return e.image?(0,r.createElement)(z,e):null}));R.propTypes=I,R.displayName="GatsbyImage";const A=["src","__imageData","__error","width","height","aspectRatio","tracedSVGOptions","placeholder","formats","quality","transformOptions","jpgOptions","pngOptions","webpOptions","avifOptions","blurredOptions","breakpoints","outputPixelDensities"];function P(e){return function(t){let{src:a,__imageData:i,__error:n}=t,l=o(t,A);return n&&console.warn(n),i?r.createElement(e,s({image:i},l)):(console.warn("Image not loaded",a),null)}}const M=P((function(e){let{as:t="div",className:a,class:i,style:n,image:l,loading:c="lazy",imgClassName:p,imgStyle:m,backgroundColor:h,objectFit:b,objectPosition:y}=e,v=o(e,L);if(!l)return console.warn("[gatsby-plugin-image] Missing image prop"),null;i&&(a=i),m=s({objectFit:b,objectPosition:y,backgroundColor:h},m);const{width:w,height:E,layout:N,images:I,placeholder:T,backgroundColor:_}=l,O=u(w,E,N),{style:j,className:q}=O,z=o(O,C),R={fallback:void 0,sources:[]};return I.fallback&&(R.fallback=s({},I.fallback,{srcSet:I.fallback.srcSet?x(I.fallback.srcSet):void 0})),I.sources&&(R.sources=I.sources.map((e=>s({},e,{srcSet:x(e.srcSet)})))),r.createElement(t,s({},z,{style:s({},j,n,{backgroundColor:h}),className:q+(a?" "+a:"")}),r.createElement(f,{layout:N,width:w,height:E},r.createElement(k,s({},g(T,!1,N,w,E,_,b,y))),r.createElement(S,s({"data-gatsby-image-ssr":"",className:p},v,d("eager"===c,!1,R,c,m)))))})),W=function(e,t){for(var a=arguments.length,r=new Array(a>2?a-2:0),i=2;i<a;i++)r[i-2]=arguments[i];return"fullWidth"!==e.layout||"width"!==t&&"height"!==t||!e[t]?n().number.apply(n(),[e,t].concat(r)):new Error('"'+t+'" '+e[t]+" may not be passed when layout is fullWidth.")},F=new Set(["fixed","fullWidth","constrained"]),D={src:n().string.isRequired,alt:N,width:W,height:W,sizes:n().string,layout:e=>{if(void 0!==e.layout&&!F.has(e.layout))return new Error("Invalid value "+e.layout+'" provided for prop "layout". Defaulting to "constrained". Valid values are "fixed", "fullWidth" or "constrained".')}};M.displayName="StaticImage",M.propTypes=D;const H=P(R);H.displayName="StaticImage",H.propTypes=D},5147:function(e){const t=/[\p{Lu}]/u,a=/[\p{Ll}]/u,r=/^[\p{Lu}](?![\p{Lu}])/gu,i=/([\p{Alpha}\p{N}_]|$)/u,n=/[_.\- ]+/,s=new RegExp("^"+n.source),o=new RegExp(n.source+i.source,"gu"),l=new RegExp("\\d+"+i.source,"gu"),c=(e,i)=>{if("string"!=typeof e&&!Array.isArray(e))throw new TypeError("Expected the input to be `string | string[]`");if(i={pascalCase:!1,preserveConsecutiveUppercase:!1,...i},0===(e=Array.isArray(e)?e.map((e=>e.trim())).filter((e=>e.length)).join("-"):e.trim()).length)return"";const n=!1===i.locale?e=>e.toLowerCase():e=>e.toLocaleLowerCase(i.locale),c=!1===i.locale?e=>e.toUpperCase():e=>e.toLocaleUpperCase(i.locale);if(1===e.length)return i.pascalCase?c(e):n(e);return e!==n(e)&&(e=((e,r,i)=>{let n=!1,s=!1,o=!1;for(let l=0;l<e.length;l++){const c=e[l];n&&t.test(c)?(e=e.slice(0,l)+"-"+e.slice(l),n=!1,o=s,s=!0,l++):s&&o&&a.test(c)?(e=e.slice(0,l-1)+"-"+e.slice(l-1),o=s,s=!1,n=!0):(n=r(c)===c&&i(c)!==c,o=s,s=i(c)===c&&r(c)!==c)}return e})(e,n,c)),e=e.replace(s,""),e=i.preserveConsecutiveUppercase?((e,t)=>(r.lastIndex=0,e.replace(r,(e=>t(e)))))(e,n):n(e),i.pascalCase&&(e=c(e.charAt(0))+e.slice(1)),((e,t)=>(o.lastIndex=0,l.lastIndex=0,e.replace(o,((e,a)=>t(a))).replace(l,(e=>t(e)))))(e,c)};e.exports=c,e.exports.default=c},4967:function(e,t,a){var r=a(6540),i=a(4794),n=a(2532),s=a(6784),o=a(7875),l=a(6188);a(7107).Yv.add(o.Vz1,o.IAJ,o.HQ1,l.y_8);t.A=()=>{var e,t;const c=(0,i.useStaticQuery)("2923011943"),u=null===(e=c.site.siteMetadata)||void 0===e?void 0:e.author,d=null===(t=c.site.siteMetadata)||void 0===t?void 0:t.social;return r.createElement("div",{className:"bio"},r.createElement("div",{className:"bio-image"},r.createElement(n.S,{className:"bio-avatar",layout:"fixed",formats:["auto","webp","avif"],src:"../images/profile-pic.png",width:150,height:150,quality:95,alt:"Profile picture",__imageData:a(7951)})),r.createElement("div",{className:"bio-content"},(null==u?void 0:u.name)&&r.createElement(r.Fragment,null,r.createElement("h2",{className:"bio-name"},u.name),r.createElement("p",{className:"bio-summary"},u.summary)),r.createElement("div",{className:"bio-social"},(null==d?void 0:d.github)&&r.createElement("a",{href:"https://github.com/"+d.github,target:"_blank",rel:"noopener noreferrer","aria-label":"GitHub"},r.createElement(s.g,{icon:o.Vz1})),(null==d?void 0:d.email)&&r.createElement("a",{href:"mailto:"+d.email,"aria-label":"Email"},r.createElement(s.g,{icon:l.y_8})))))}},7951:function(e){e.exports=JSON.parse('{"layout":"fixed","backgroundColor":"#181818","images":{"fallback":{"src":"https://bdteo.github.io/static/2fb36df54ab973fa2cb65e0e16381c11/01986/profile-pic.png","srcSet":"https://bdteo.github.io/static/2fb36df54ab973fa2cb65e0e16381c11/01986/profile-pic.png 150w,\\nhttps://bdteo.github.io/static/2fb36df54ab973fa2cb65e0e16381c11/c0d5f/profile-pic.png 300w","sizes":"150px"},"sources":[{"srcSet":"https://bdteo.github.io/static/2fb36df54ab973fa2cb65e0e16381c11/95309/profile-pic.avif 150w,\\nhttps://bdteo.github.io/static/2fb36df54ab973fa2cb65e0e16381c11/288e4/profile-pic.avif 300w","type":"image/avif","sizes":"150px"},{"srcSet":"https://bdteo.github.io/static/2fb36df54ab973fa2cb65e0e16381c11/7ddcc/profile-pic.webp 150w,\\nhttps://bdteo.github.io/static/2fb36df54ab973fa2cb65e0e16381c11/dd79f/profile-pic.webp 300w","type":"image/webp","sizes":"150px"}]},"width":150,"height":150}')}}]);
//# sourceMappingURL=cd7d5f864fc9e15ed8adef086269b0aeff617554-5d96247f5e76a3d0c50c.js.map