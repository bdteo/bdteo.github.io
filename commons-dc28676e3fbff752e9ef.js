/*! For license information please see commons-dc28676e3fbff752e9ef.js.LICENSE.txt */
(self.webpackChunkgatsby_starter_blog=self.webpackChunkgatsby_starter_blog||[]).push([[223],{225:function(e,t,r){"use strict";var n=r(4994);t.__esModule=!0,t.default=void 0;var o=n(r(2475)),a=n(r(6221)),l=n(r(3693)),i=n(r(6540)),s=n(r(5556)),c=function(e){function t(){for(var t,r=arguments.length,n=new Array(r),a=0;a<r;a++)n[a]=arguments[a];return t=e.call.apply(e,[this].concat(n))||this,(0,l.default)((0,o.default)(t),"state",{theme:"undefined"!=typeof window?window.__theme:null}),t}(0,a.default)(t,e);var r=t.prototype;return r.componentDidMount=function(){var e=this;window.__onThemeChange=function(){e.setState({theme:window.__theme})}},r.toggleTheme=function(e){window.__setPreferredTheme(e)},r.render=function(){return i.default.createElement(this.props.children,{theme:this.state.theme,toggleTheme:this.toggleTheme})},t}(i.default.Component);c.propTypes={children:s.default.func.isRequired};var u=c;t.default=u},3146:function(e,t,r){"use strict";var n=r(4994)(r(225));t.G=n.default},9526:function(e,t,r){"use strict";r.d(t,{A:function(){return N}});var n=r(6540),o=r(4794),a=r(7387),l=r(3146),i=r(7107),s=r(5556),c=r.n(s);function u(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function f(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?u(Object(r),!0).forEach((function(t){m(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):u(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e){return p="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},p(e)}function m(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function d(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}function y(e){return function(e){if(Array.isArray(e))return b(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||function(e,t){if(!e)return;if("string"==typeof e)return b(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(e);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return b(e,t)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function b(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function h(e){return t=e,(t-=0)==t?e:(e=e.replace(/[\-_\s]+(.)?/g,(function(e,t){return t?t.toUpperCase():""}))).substr(0,1).toLowerCase()+e.substr(1);var t}var v=["style"];var g=!1;try{g=!0}catch(A){}function w(e){return e&&"object"===p(e)&&e.prefix&&e.iconName&&e.icon?e:i.qg.icon?i.qg.icon(e):null===e?null:e&&"object"===p(e)&&e.prefix&&e.iconName?e:Array.isArray(e)&&2===e.length?{prefix:e[0],iconName:e[1]}:"string"==typeof e?{prefix:"fas",iconName:e}:void 0}function x(e,t){return Array.isArray(t)&&t.length>0||!Array.isArray(t)&&t?m({},e,t):{}}var O=n.forwardRef((function(e,t){var r=e.icon,n=e.mask,o=e.symbol,a=e.className,l=e.title,s=e.titleId,c=e.maskId,u=w(r),p=x("classes",[].concat(y(function(e){var t,r=e.beat,n=e.fade,o=e.beatFade,a=e.bounce,l=e.shake,i=e.flash,s=e.spin,c=e.spinPulse,u=e.spinReverse,f=e.pulse,p=e.fixedWidth,d=e.inverse,y=e.border,b=e.listItem,h=e.flip,v=e.size,g=e.rotation,w=e.pull,x=(m(t={"fa-beat":r,"fa-fade":n,"fa-beat-fade":o,"fa-bounce":a,"fa-shake":l,"fa-flash":i,"fa-spin":s,"fa-spin-reverse":u,"fa-spin-pulse":c,"fa-pulse":f,"fa-fw":p,"fa-inverse":d,"fa-border":y,"fa-li":b,"fa-flip":!0===h,"fa-flip-horizontal":"horizontal"===h||"both"===h,"fa-flip-vertical":"vertical"===h||"both"===h},"fa-".concat(v),null!=v),m(t,"fa-rotate-".concat(g),null!=g&&0!==g),m(t,"fa-pull-".concat(w),null!=w),m(t,"fa-swap-opacity",e.swapOpacity),t);return Object.keys(x).map((function(e){return x[e]?e:null})).filter((function(e){return e}))}(e)),y(a.split(" ")))),d=x("transform","string"==typeof e.transform?i.qg.transform(e.transform):e.transform),b=x("mask",w(n)),h=(0,i.Kk)(u,f(f(f(f({},p),d),b),{},{symbol:o,title:l,titleId:s,maskId:c}));if(!h)return function(){var e;!g&&console&&"function"==typeof console.error&&(e=console).error.apply(e,arguments)}("Could not find icon",u),null;var v=h.abstract,E={ref:t};return Object.keys(e).forEach((function(t){O.defaultProps.hasOwnProperty(t)||(E[t]=e[t])})),k(v[0],E)}));O.displayName="FontAwesomeIcon",O.propTypes={beat:c().bool,border:c().bool,beatFade:c().bool,bounce:c().bool,className:c().string,fade:c().bool,flash:c().bool,mask:c().oneOfType([c().object,c().array,c().string]),maskId:c().string,fixedWidth:c().bool,inverse:c().bool,flip:c().oneOf([!0,!1,"horizontal","vertical","both"]),icon:c().oneOfType([c().object,c().array,c().string]),listItem:c().bool,pull:c().oneOf(["right","left"]),pulse:c().bool,rotation:c().oneOf([0,90,180,270]),shake:c().bool,size:c().oneOf(["2xs","xs","sm","lg","xl","2xl","1x","2x","3x","4x","5x","6x","7x","8x","9x","10x"]),spin:c().bool,spinPulse:c().bool,spinReverse:c().bool,symbol:c().oneOfType([c().bool,c().string]),title:c().string,titleId:c().string,transform:c().oneOfType([c().string,c().object]),swapOpacity:c().bool},O.defaultProps={border:!1,className:"",mask:null,maskId:null,fixedWidth:!1,inverse:!1,flip:!1,icon:null,listItem:!1,pull:null,pulse:!1,rotation:null,size:null,spin:!1,spinPulse:!1,spinReverse:!1,beat:!1,fade:!1,beatFade:!1,bounce:!1,shake:!1,symbol:!1,title:"",titleId:null,transform:null,swapOpacity:!1};var k=function e(t,r){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};if("string"==typeof r)return r;var o=(r.children||[]).map((function(r){return e(t,r)})),a=Object.keys(r.attributes||{}).reduce((function(e,t){var n=r.attributes[t];switch(t){case"class":e.attrs.className=n,delete r.attributes.class;break;case"style":e.attrs.style=n.split(";").map((function(e){return e.trim()})).filter((function(e){return e})).reduce((function(e,t){var r,n=t.indexOf(":"),o=h(t.slice(0,n)),a=t.slice(n+1).trim();return o.startsWith("webkit")?e[(r=o,r.charAt(0).toUpperCase()+r.slice(1))]=a:e[o]=a,e}),{});break;default:0===t.indexOf("aria-")||0===t.indexOf("data-")?e.attrs[t.toLowerCase()]=n:e.attrs[h(t)]=n}return e}),{attrs:{}}),l=n.style,i=void 0===l?{}:l,s=d(n,v);return a.attrs.style=f(f({},a.attrs.style),i),t.apply(void 0,[r.tag,f(f({},a.attrs),s)].concat(y(o)))}.bind(null,n.createElement),E=r(6188),S=r(6942),j=r.n(S);i.Yv.add(E.oMq,E.PJS);const _="dark-mode";let P=function(e){function t(){return e.apply(this,arguments)||this}return(0,a.A)(t,e),t.prototype.render=function(){return n.createElement(l.G,null,(e=>{let{theme:t,toggleTheme:r}=e;const o=t===_;return n.createElement("div",{style:{fontSize:"1.5em"}},n.createElement("div",{className:"form-check form-switch position-relative d-block clearfix my-0",style:{paddingLeft:"2em"}},n.createElement("input",{className:"form-check-input my-0",type:"checkbox",id:"darkModeSwitch",style:{width:"2em",marginLeft:"-2em"},onChange:e=>{const t=e.target.checked?_:"light-mode";r(t)},checked:o}),n.createElement("label",{className:"form-check-label position-absolute d-inline-block",htmlFor:"darkModeSwitch",style:{top:"50%",transform:"translateY(-50%)",left:o?"0.55em":null,right:o?null:"0.55em",transition:"all 0.5s ease",fontSize:"0.5em"}},n.createElement(O,{icon:o?E.oMq:E.PJS,className:j()({"text-warning":o,"text-info":!o}),style:{opacity:o?1:.75}}))))}))},t}(n.Component);var N=e=>{let{location:t,title:r,children:a}=e;const l="/"===t.pathname;let i;return i=l?n.createElement("h1",{className:"main-heading"},n.createElement(o.Link,{to:"/"},r)):n.createElement("div",null,n.createElement(o.Link,{className:"header-link-home",to:"/",style:{opacity:.9}},r),n.createElement("hr",null)),n.createElement("div",{className:"super-global-wrapper"},n.createElement("header",{className:"global-header row align-items-start","data-is-root-path":l},n.createElement("div",{className:"col"}),n.createElement("div",{className:"col-auto global-wrapper"},n.createElement("div",{className:"mb-2"},i),n.createElement("main",null,a),n.createElement("footer",null,"© ",(new Date).getFullYear(),", Built with"," ",n.createElement("a",{href:"https://www.gatsbyjs.com"},"Gatsby"))),n.createElement("div",{className:"col text-end"},n.createElement("div",{className:"d-inline-block mx-3 my-4 py-2"},n.createElement(P,null)))))}},7528:function(e,t,r){"use strict";var n=r(6540),o=r(4794);t.A=e=>{var t,r,a;let{description:l,title:i,children:s}=e;const{site:c}=(0,o.useStaticQuery)("2841359383"),u=l||c.siteMetadata.description,f=null===(t=c.siteMetadata)||void 0===t?void 0:t.title;return n.createElement(n.Fragment,null,n.createElement("title",null,f?i+" | "+f:i),n.createElement("meta",{name:"description",content:u}),n.createElement("meta",{property:"og:title",content:i}),n.createElement("meta",{property:"og:description",content:u}),n.createElement("meta",{property:"og:type",content:"website"}),n.createElement("meta",{name:"twitter:card",content:"summary"}),n.createElement("meta",{name:"twitter:creator",content:(null===(r=c.siteMetadata)||void 0===r||null===(a=r.social)||void 0===a?void 0:a.twitter)||""}),n.createElement("meta",{name:"twitter:title",content:i}),n.createElement("meta",{name:"twitter:description",content:u}),s)}},3693:function(e,t,r){var n=r(7736);e.exports=function(e,t,r){return(t=n(t))in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e},e.exports.__esModule=!0,e.exports.default=e.exports},9045:function(e,t,r){var n=r(3738).default;e.exports=function(e,t){if("object"!=n(e)||!e)return e;var r=e[Symbol.toPrimitive];if(void 0!==r){var o=r.call(e,t||"default");if("object"!=n(o))return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)},e.exports.__esModule=!0,e.exports.default=e.exports},7736:function(e,t,r){var n=r(3738).default,o=r(9045);e.exports=function(e){var t=o(e,"string");return"symbol"==n(t)?t:t+""},e.exports.__esModule=!0,e.exports.default=e.exports},3738:function(e){function t(r){return e.exports=t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},e.exports.__esModule=!0,e.exports.default=e.exports,t(r)}e.exports=t,e.exports.__esModule=!0,e.exports.default=e.exports},6942:function(e,t){var r;!function(){"use strict";var n={}.hasOwnProperty;function o(){for(var e="",t=0;t<arguments.length;t++){var r=arguments[t];r&&(e=l(e,a(r)))}return e}function a(e){if("string"==typeof e||"number"==typeof e)return e;if("object"!=typeof e)return"";if(Array.isArray(e))return o.apply(null,e);if(e.toString!==Object.prototype.toString&&!e.toString.toString().includes("[native code]"))return e.toString();var t="";for(var r in e)n.call(e,r)&&e[r]&&(t=l(t,r));return t}function l(e,t){return t?e?e+" "+t:e+t:e}e.exports?(o.default=o,e.exports=o):void 0===(r=function(){return o}.apply(t,[]))||(e.exports=r)}()}}]);
//# sourceMappingURL=commons-dc28676e3fbff752e9ef.js.map