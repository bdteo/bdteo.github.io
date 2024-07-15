"use strict";(self.webpackChunkgatsby_starter_blog=self.webpackChunkgatsby_starter_blog||[]).push([[847],{2532:function(e,t,a){a.d(t,{G:function(){return z},L:function(){return f},M:function(){return S},P:function(){return k},S:function(){return H},_:function(){return o},a:function(){return n},b:function(){return d},c:function(){return c},g:function(){return p},h:function(){return l}});var r=a(6540),i=(a(5147),a(5556)),s=a.n(i);function n(){return n=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var r in a)Object.prototype.hasOwnProperty.call(a,r)&&(e[r]=a[r])}return e},n.apply(this,arguments)}function o(e,t){if(null==e)return{};var a,r,i={},s=Object.keys(e);for(r=0;r<s.length;r++)t.indexOf(a=s[r])>=0||(i[a]=e[a]);return i}const l=()=>"undefined"!=typeof HTMLImageElement&&"loading"in HTMLImageElement.prototype;const c=e=>{var t;return(e=>{var t,a;return Boolean(null==e||null==(t=e.images)||null==(a=t.fallback)?void 0:a.src)})(e)?e:(e=>Boolean(null==e?void 0:e.gatsbyImageData))(e)?e.gatsbyImageData:(e=>Boolean(null==e?void 0:e.gatsbyImage))(e)?e.gatsbyImage:null==e||null==(t=e.childImageSharp)?void 0:t.gatsbyImageData};function u(e,t,a){const r={};let i="gatsby-image-wrapper";return"fixed"===a?(r.width=e,r.height=t):"constrained"===a&&(i="gatsby-image-wrapper gatsby-image-wrapper-constrained"),{className:i,"data-gatsby-image-wrapper":"",style:r}}function d(e,t,a,r,i){return void 0===i&&(i={}),n({},a,{loading:r,shouldLoad:e,"data-main-image":"",style:n({},i,{opacity:t?1:0})})}function p(e,t,a,r,i,s,o,l){const c={};s&&(c.backgroundColor=s,"fixed"===a?(c.width=r,c.height=i,c.backgroundColor=s,c.position="relative"):("constrained"===a||"fullWidth"===a)&&(c.position="absolute",c.top=0,c.left=0,c.bottom=0,c.right=0)),o&&(c.objectFit=o),l&&(c.objectPosition=l);const u=n({},e,{"aria-hidden":!0,"data-placeholder-image":"",style:n({opacity:t?0:1,transition:"opacity 500ms linear"},c)});return u}const g=["children"],m=function(e){let{layout:t,width:a,height:i}=e;return"fullWidth"===t?r.createElement("div",{"aria-hidden":!0,style:{paddingTop:i/a*100+"%"}}):"constrained"===t?r.createElement("div",{style:{maxWidth:a,display:"block"}},r.createElement("img",{alt:"",role:"presentation","aria-hidden":"true",src:"data:image/svg+xml;charset=utf-8,%3Csvg%20height='"+i+"'%20width='"+a+"'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%3E%3C/svg%3E",style:{maxWidth:"100%",display:"block",position:"static"}})):null},f=function(e){let{children:t}=e,a=o(e,g);return r.createElement(r.Fragment,null,r.createElement(m,n({},a)),t,null)},h=["src","srcSet","loading","alt","shouldLoad"],y=["fallback","sources","shouldLoad"],b=function(e){let{src:t,srcSet:a,loading:i,alt:s="",shouldLoad:l}=e,c=o(e,h);return r.createElement("img",n({},c,{decoding:"async",loading:i,src:l?t:void 0,"data-src":l?void 0:t,srcSet:l?a:void 0,"data-srcset":l?void 0:a,alt:s}))},v=function(e){let{fallback:t,sources:a=[],shouldLoad:i=!0}=e,s=o(e,y);const l=s.sizes||(null==t?void 0:t.sizes),c=r.createElement(b,n({},s,t,{sizes:l,shouldLoad:i}));return a.length?r.createElement("picture",null,a.map((e=>{let{media:t,srcSet:a,type:s}=e;return r.createElement("source",{key:t+"-"+s+"-"+a,type:s,media:t,srcSet:i?a:void 0,"data-srcset":i?void 0:a,sizes:l})})),c):c};var w;b.propTypes={src:i.string.isRequired,alt:i.string.isRequired,sizes:i.string,srcSet:i.string,shouldLoad:i.bool},v.displayName="Picture",v.propTypes={alt:i.string.isRequired,shouldLoad:i.bool,fallback:i.exact({src:i.string.isRequired,srcSet:i.string,sizes:i.string}),sources:i.arrayOf(i.oneOfType([i.exact({media:i.string.isRequired,type:i.string,sizes:i.string,srcSet:i.string.isRequired}),i.exact({media:i.string,type:i.string.isRequired,sizes:i.string,srcSet:i.string.isRequired})]))};const E=["fallback"],k=function(e){let{fallback:t}=e,a=o(e,E);return t?r.createElement(v,n({},a,{fallback:{src:t},"aria-hidden":!0,alt:""})):r.createElement("div",n({},a))};k.displayName="Placeholder",k.propTypes={fallback:i.string,sources:null==(w=v.propTypes)?void 0:w.sources,alt:function(e,t,a){return e[t]?new Error("Invalid prop `"+t+"` supplied to `"+a+"`. Validation failed."):null}};const S=function(e){return r.createElement(r.Fragment,null,r.createElement(v,n({},e)),r.createElement("noscript",null,r.createElement(v,n({},e,{shouldLoad:!0}))))};S.displayName="MainImage",S.propTypes=v.propTypes;const L=["as","className","class","style","image","loading","imgClassName","imgStyle","backgroundColor","objectFit","objectPosition"],C=["style","className"],x=e=>e.replace(/\n/g,""),I=function(e,t,a){for(var r=arguments.length,i=new Array(r>3?r-3:0),n=3;n<r;n++)i[n-3]=arguments[n];return e.alt||""===e.alt?s().string.apply(s(),[e,t,a].concat(i)):new Error('The "alt" prop is required in '+a+'. If the image is purely presentational then pass an empty string: e.g. alt="". Learn more: https://a11y-style-guide.com/style-guide/section-media.html')},N={image:s().object.isRequired,alt:I},T=["as","image","style","backgroundColor","className","class","onStartLoad","onLoad","onError"],_=["style","className"],O=new Set;let j,q;const R=function(e){let{as:t="div",image:i,style:s,backgroundColor:c,className:d,class:p,onStartLoad:g,onLoad:m,onError:f}=e,h=o(e,T);const{width:y,height:b,layout:v}=i,w=u(y,b,v),{style:E,className:k}=w,S=o(w,_),L=(0,r.useRef)(),C=(0,r.useMemo)((()=>JSON.stringify(i.images)),[i.images]);p&&(d=p);const x=function(e,t,a){let r="";return"fullWidth"===e&&(r='<div aria-hidden="true" style="padding-top: '+a/t*100+'%;"></div>'),"constrained"===e&&(r='<div style="max-width: '+t+'px; display: block;"><img alt="" role="presentation" aria-hidden="true" src="data:image/svg+xml;charset=utf-8,%3Csvg%20height=\''+a+"'%20width='"+t+"'%20xmlns='http://www.w3.org/2000/svg'%20version='1.1'%3E%3C/svg%3E\" style=\"max-width: 100%; display: block; position: static;\"></div>"),r}(v,y,b);return(0,r.useEffect)((()=>{j||(j=a.e(108).then(a.bind(a,1108)).then((e=>{let{renderImageToString:t,swapPlaceholderImage:a}=e;return q=t,{renderImageToString:t,swapPlaceholderImage:a}})));const e=L.current.querySelector("[data-gatsby-image-ssr]");if(e&&l())return e.complete?(null==g||g({wasCached:!0}),null==m||m({wasCached:!0}),setTimeout((()=>{e.removeAttribute("data-gatsby-image-ssr")}),0)):(null==g||g({wasCached:!0}),e.addEventListener("load",(function t(){e.removeEventListener("load",t),null==m||m({wasCached:!0}),setTimeout((()=>{e.removeAttribute("data-gatsby-image-ssr")}),0)}))),void O.add(C);if(q&&O.has(C))return;let t,r;return j.then((e=>{let{renderImageToString:a,swapPlaceholderImage:o}=e;L.current&&(L.current.innerHTML=a(n({isLoading:!0,isLoaded:O.has(C),image:i},h)),O.has(C)||(t=requestAnimationFrame((()=>{L.current&&(r=o(L.current,C,O,s,g,m,f))}))))})),()=>{t&&cancelAnimationFrame(t),r&&r()}}),[i]),(0,r.useLayoutEffect)((()=>{O.has(C)&&q&&(L.current.innerHTML=q(n({isLoading:O.has(C),isLoaded:O.has(C),image:i},h)),null==g||g({wasCached:!0}),null==m||m({wasCached:!0}))}),[i]),(0,r.createElement)(t,n({},S,{style:n({},E,s,{backgroundColor:c}),className:k+(d?" "+d:""),ref:L,dangerouslySetInnerHTML:{__html:x},suppressHydrationWarning:!0}))},z=(0,r.memo)((function(e){return e.image?(0,r.createElement)(R,e):null}));z.propTypes=N,z.displayName="GatsbyImage";const A=["src","__imageData","__error","width","height","aspectRatio","tracedSVGOptions","placeholder","formats","quality","transformOptions","jpgOptions","pngOptions","webpOptions","avifOptions","blurredOptions","breakpoints","outputPixelDensities"];function P(e){return function(t){let{src:a,__imageData:i,__error:s}=t,l=o(t,A);return s&&console.warn(s),i?r.createElement(e,n({image:i},l)):(console.warn("Image not loaded",a),null)}}const M=P((function(e){let{as:t="div",className:a,class:i,style:s,image:l,loading:c="lazy",imgClassName:g,imgStyle:m,backgroundColor:h,objectFit:y,objectPosition:b}=e,v=o(e,L);if(!l)return console.warn("[gatsby-plugin-image] Missing image prop"),null;i&&(a=i),m=n({objectFit:y,objectPosition:b,backgroundColor:h},m);const{width:w,height:E,layout:I,images:N,placeholder:T,backgroundColor:_}=l,O=u(w,E,I),{style:j,className:q}=O,R=o(O,C),z={fallback:void 0,sources:[]};return N.fallback&&(z.fallback=n({},N.fallback,{srcSet:N.fallback.srcSet?x(N.fallback.srcSet):void 0})),N.sources&&(z.sources=N.sources.map((e=>n({},e,{srcSet:x(e.srcSet)})))),r.createElement(t,n({},R,{style:n({},j,s,{backgroundColor:h}),className:q+(a?" "+a:"")}),r.createElement(f,{layout:I,width:w,height:E},r.createElement(k,n({},p(T,!1,I,w,E,_,y,b))),r.createElement(S,n({"data-gatsby-image-ssr":"",className:g},v,d("eager"===c,!1,z,c,m)))))})),W=function(e,t){for(var a=arguments.length,r=new Array(a>2?a-2:0),i=2;i<a;i++)r[i-2]=arguments[i];return"fullWidth"!==e.layout||"width"!==t&&"height"!==t||!e[t]?s().number.apply(s(),[e,t].concat(r)):new Error('"'+t+'" '+e[t]+" may not be passed when layout is fullWidth.")},D=new Set(["fixed","fullWidth","constrained"]),F={src:s().string.isRequired,alt:I,width:W,height:W,sizes:s().string,layout:e=>{if(void 0!==e.layout&&!D.has(e.layout))return new Error("Invalid value "+e.layout+'" provided for prop "layout". Defaulting to "constrained". Valid values are "fixed", "fullWidth" or "constrained".')}};M.displayName="StaticImage",M.propTypes=F;const H=P(z);H.displayName="StaticImage",H.propTypes=F},5147:function(e){const t=/[\p{Lu}]/u,a=/[\p{Ll}]/u,r=/^[\p{Lu}](?![\p{Lu}])/gu,i=/([\p{Alpha}\p{N}_]|$)/u,s=/[_.\- ]+/,n=new RegExp("^"+s.source),o=new RegExp(s.source+i.source,"gu"),l=new RegExp("\\d+"+i.source,"gu"),c=(e,i)=>{if("string"!=typeof e&&!Array.isArray(e))throw new TypeError("Expected the input to be `string | string[]`");if(i={pascalCase:!1,preserveConsecutiveUppercase:!1,...i},0===(e=Array.isArray(e)?e.map((e=>e.trim())).filter((e=>e.length)).join("-"):e.trim()).length)return"";const s=!1===i.locale?e=>e.toLowerCase():e=>e.toLocaleLowerCase(i.locale),c=!1===i.locale?e=>e.toUpperCase():e=>e.toLocaleUpperCase(i.locale);if(1===e.length)return i.pascalCase?c(e):s(e);return e!==s(e)&&(e=((e,r,i)=>{let s=!1,n=!1,o=!1;for(let l=0;l<e.length;l++){const c=e[l];s&&t.test(c)?(e=e.slice(0,l)+"-"+e.slice(l),s=!1,o=n,n=!0,l++):n&&o&&a.test(c)?(e=e.slice(0,l-1)+"-"+e.slice(l-1),o=n,n=!1,s=!0):(s=r(c)===c&&i(c)!==c,o=n,n=i(c)===c&&r(c)!==c)}return e})(e,s,c)),e=e.replace(n,""),e=i.preserveConsecutiveUppercase?((e,t)=>(r.lastIndex=0,e.replace(r,(e=>t(e)))))(e,s):s(e),i.pascalCase&&(e=c(e.charAt(0))+e.slice(1)),((e,t)=>(o.lastIndex=0,l.lastIndex=0,e.replace(o,((e,a)=>t(a))).replace(l,(e=>t(e)))))(e,c)};e.exports=c,e.exports.default=c},4967:function(e,t,a){var r=a(6540),i=a(4794),s=a(2532);t.A=()=>{var e,t;const n=(0,i.useStaticQuery)("3257411868"),o=null===(e=n.site.siteMetadata)||void 0===e?void 0:e.author;null===(t=n.site.siteMetadata)||void 0===t||t.social;return r.createElement("div",{className:"bio mt-4"},r.createElement(s.S,{className:"bio-avatar",layout:"fixed",formats:["auto","webp","avif"],src:"../images/profile-pic.png",width:96,height:96,quality:95,alt:"Profile picture",__imageData:a(5587)}),(null==o?void 0:o.name)&&r.createElement("p",null,"Written by ",r.createElement("strong",null,o.name),","," ",(null==o?void 0:o.summary)||null," "))}},5587:function(e){e.exports=JSON.parse('{"layout":"fixed","backgroundColor":"#080808","images":{"fallback":{"src":"https://bdteo.github.io/static/f733c46a3533f691817135cae355c3bc/707b5/profile-pic.png","srcSet":"https://bdteo.github.io/static/f733c46a3533f691817135cae355c3bc/707b5/profile-pic.png 96w,\\nhttps://bdteo.github.io/static/f733c46a3533f691817135cae355c3bc/fb5f6/profile-pic.png 192w","sizes":"96px"},"sources":[{"srcSet":"https://bdteo.github.io/static/f733c46a3533f691817135cae355c3bc/b9f10/profile-pic.avif 96w,\\nhttps://bdteo.github.io/static/f733c46a3533f691817135cae355c3bc/f4a4f/profile-pic.avif 192w","type":"image/avif","sizes":"96px"},{"srcSet":"https://bdteo.github.io/static/f733c46a3533f691817135cae355c3bc/bb677/profile-pic.webp 96w,\\nhttps://bdteo.github.io/static/f733c46a3533f691817135cae355c3bc/5a28d/profile-pic.webp 192w","type":"image/webp","sizes":"96px"}]},"width":96,"height":96}')}}]);
//# sourceMappingURL=cd7d5f864fc9e15ed8adef086269b0aeff617554-ece36e260aa536c024a3.js.map