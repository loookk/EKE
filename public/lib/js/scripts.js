$(document).ready(function(){$(".header__menu-open").click(function(){return $(".header__nav, .header__secondary-nav").fadeIn(200),$(this).hide(),$(".header__menu-close").show(),!1}),$(".header__menu-close").click(function(){return $(".header__nav, .header__secondary-nav").fadeOut(200),$(this).hide(),$(".header__menu-open").show(),!1}),svg4everybody();var e=1,t=$(".home-casestudy-screen__title-list h4").length;function o(e){$(".home-casestudy-summaries >:visible, .home-casestudy-screen__title-list >:visible, .home-casestudy-screen__shots >:visible").fadeOut(),$(".home-casestudy-summaries :nth-child("+e+"), .home-casestudy-screen__title-list :nth-child("+e+"), .home-casestudy-screen__shots :nth-child("+e+")").fadeIn(),$(".home-casestudy-controls__dots .dot").removeClass("dot--selected"),$(".home-casestudy-controls__dots :nth-child("+e+")").addClass("dot--selected")}$(".home-casestudy-controls__right").click(function(){return t<++e&&(e=1),o(e),!1}),$(".home-casestudy-controls__left").click(function(){return--e<1&&(e=t),o(e),!1}),$(".home-casestudy-controls__dots .dot").click(function(){return o($(this).data("index")),!1}),AOS.init({offset:200,duration:700,once:!0}),$(window).scroll(function(){0<$(window).scrollTop()?$(".header").addClass("header--sticky"):$(".header").removeClass("header--sticky")}),$(".js-home-scroll").click(function(){return $("html, body").animate({scrollTop:$("#panel1").offset().top},200),!1}),setTimeout(function(){$("html").removeClass("wf-loading")},3e3)}),function(e,t){"function"==typeof define&&define.amd?define([],function(){return e.svg4everybody=t()}):"object"==typeof module&&module.exports?module.exports=t():e.svg4everybody=t()}(this,function(){function b(e,t,o){if(o){var n=document.createDocumentFragment(),i=!t.hasAttribute("viewBox")&&o.getAttribute("viewBox");i&&t.setAttribute("viewBox",i);for(var a=o.cloneNode(!0);a.childNodes.length;)n.appendChild(a.firstChild);e.appendChild(n)}}function h(n){n.onreadystatechange=function(){if(4===n.readyState){var o=n._cachedDocument;o||((o=n._cachedDocument=document.implementation.createHTMLDocument("")).body.innerHTML=n.responseText,n._cachedTarget={}),n._embeds.splice(0).map(function(e){var t=n._cachedTarget[e.id];t||(t=n._cachedTarget[e.id]=o.getElementById(e.id)),b(e.parent,e.svg,t)})}},n.onreadystatechange()}function g(e){for(var t=e;"svg"!==t.nodeName.toLowerCase()&&(t=t.parentNode););return t}return function(e){var d,l=Object(e),t=window.top!==window.self;d="polyfill"in l?l.polyfill:/\bTrident\/[567]\b|\bMSIE (?:9|10)\.0\b/.test(navigator.userAgent)||(navigator.userAgent.match(/\bEdge\/12\.(\d+)\b/)||[])[1]<10547||(navigator.userAgent.match(/\bAppleWebKit\/(\d+)\b/)||[])[1]<537||/\bEdge\/.(\d+)\b/.test(navigator.userAgent)&&t;var f={},m=window.requestAnimationFrame||setTimeout,p=document.getElementsByTagName("use"),v=0;d&&function e(){for(var t=0;t<p.length;){var o=p[t],n=o.parentNode,i=g(n);if(i){var a=o.getAttribute("xlink:href")||o.getAttribute("href");if(!a&&l.attributeName&&(a=o.getAttribute(l.attributeName)),d)if(!l.validate||l.validate(a,i,o)){n.removeChild(o);var r=a.split("#"),c=r.shift(),s=r.join("#");if(c.length){var u=f[c];u||((u=f[c]=new XMLHttpRequest).open("GET",c),u.send(),u._embeds=[]),u._embeds.push({parent:n,svg:i,id:s}),h(u)}else b(n,i,document.getElementById(s))}else++t,++v}else++t}(!p.length||0<p.length-v)&&m(e,67)}()}}),function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.AOS=t():e.AOS=t()}(this,function(){return function(o){function n(e){if(i[e])return i[e].exports;var t=i[e]={exports:{},id:e,loaded:!1};return o[e].call(t.exports,t,t.exports,n),t.loaded=!0,t.exports}var i={};return n.m=o,n.c=i,n.p="dist/",n(0)}([function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}var i=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var o=arguments[t];for(var n in o)Object.prototype.hasOwnProperty.call(o,n)&&(e[n]=o[n])}return e},a=n((n(o(1)),o(6))),r=n(o(7)),c=n(o(8)),s=n(o(9)),u=n(o(10)),d=n(o(11)),l=n(o(14)),f=[],m=!1,p=document.all&&!window.atob,v={offset:120,delay:0,easing:"ease",duration:400,disable:!1,once:!1,startEvent:"DOMContentLoaded"},b=function(){if(0<arguments.length&&void 0!==arguments[0]&&arguments[0]&&(m=!0),m)return f=(0,d.default)(f,v),(0,u.default)(f,v.once),f},h=function(){f=(0,l.default)(),b()};e.exports={init:function(e){return v=i(v,e),f=(0,l.default)(),!0===(t=v.disable)||"mobile"===t&&s.default.mobile()||"phone"===t&&s.default.phone()||"tablet"===t&&s.default.tablet()||"function"==typeof t&&!0===t()||p?void f.forEach(function(e,t){e.node.removeAttribute("data-aos"),e.node.removeAttribute("data-aos-easing"),e.node.removeAttribute("data-aos-duration"),e.node.removeAttribute("data-aos-delay")}):(document.querySelector("body").setAttribute("data-aos-easing",v.easing),document.querySelector("body").setAttribute("data-aos-duration",v.duration),document.querySelector("body").setAttribute("data-aos-delay",v.delay),"DOMContentLoaded"===v.startEvent&&-1<["complete","interactive"].indexOf(document.readyState)?b(!0):"load"===v.startEvent?window.addEventListener(v.startEvent,function(){b(!0)}):document.addEventListener(v.startEvent,function(){b(!0)}),window.addEventListener("resize",(0,r.default)(b,50,!0)),window.addEventListener("orientationchange",(0,r.default)(b,50,!0)),window.addEventListener("scroll",(0,a.default)(function(){(0,u.default)(f,v.once)},99)),document.addEventListener("DOMNodeRemoved",function(e){var t=e.target;t&&1===t.nodeType&&t.hasAttribute&&t.hasAttribute("data-aos")&&(0,r.default)(h,50,!0)}),(0,c.default)("[data-aos]",h),f);var t},refresh:b,refreshHard:h}},function(e,t){},,,,,function(v,e){(function(e){"use strict";function a(n,i,e){function a(e){var t=u,o=d;return u=d=void 0,v=e,f=n.apply(o,t)}function r(e){var t=e-p;return void 0===p||i<=t||t<0||h&&l<=e-v}function c(){var e,t,o=x();return r(o)?s(o):void(m=setTimeout(c,(t=i-((e=o)-p),h?_(t,l-(e-v)):t)))}function s(e){return m=void 0,o&&u?a(e):(u=d=void 0,f)}function t(){var e,t=x(),o=r(t);if(u=arguments,d=this,p=t,o){if(void 0===m)return v=e=p,m=setTimeout(c,i),b?a(e):f;if(h)return m=setTimeout(c,i),a(p)}return void 0===m&&(m=setTimeout(c,i)),f}var u,d,l,f,m,p,v=0,b=!1,h=!1,o=!0;if("function"!=typeof n)throw new TypeError(w);return i=y(i)||0,g(e)&&(b=!!e.leading,l=(h="maxWait"in e)?k(y(e.maxWait)||0,i):l,o="trailing"in e?!!e.trailing:o),t.cancel=function(){void 0!==m&&clearTimeout(m),u=p=d=m=void(v=0)},t.flush=function(){return void 0===m?f:s(x())},t}function g(e){var t=void 0===e?"undefined":o(e);return!!e&&("object"==t||"function"==t)}function n(e){return"symbol"==(void 0===e?"undefined":o(e))||!!(t=e)&&"object"==(void 0===t?"undefined":o(t))&&p.call(e)==r;var t}function y(e){if("number"==typeof e)return e;if(n(e))return i;if(g(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=g(t)?t+"":t}if("string"!=typeof e)return 0===e?e:+e;e=e.replace(c,"");var o=u.test(e);return o||d.test(e)?l(e.slice(2),o?2:8):s.test(e)?i:+e}var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},w="Expected a function",i=NaN,r="[object Symbol]",c=/^\s+|\s+$/g,s=/^[-+]0x[0-9a-f]+$/i,u=/^0b[01]+$/i,d=/^0o[0-7]+$/i,l=parseInt,t="object"==(void 0===e?"undefined":o(e))&&e&&e.Object===Object&&e,f="object"==("undefined"==typeof self?"undefined":o(self))&&self&&self.Object===Object&&self,m=t||f||Function("return this")(),p=Object.prototype.toString,k=Math.max,_=Math.min,x=function(){return m.Date.now()};v.exports=function(e,t,o){var n=!0,i=!0;if("function"!=typeof e)throw new TypeError(w);return g(o)&&(n="leading"in o?!!o.leading:n,i="trailing"in o?!!o.trailing:i),a(e,t,{leading:n,maxWait:t,trailing:i})}}).call(e,function(){return this}())},function(p,e){(function(e){"use strict";function g(e){var t=void 0===e?"undefined":o(e);return!!e&&("object"==t||"function"==t)}function n(e){return"symbol"==(void 0===e?"undefined":o(e))||!!(t=e)&&"object"==(void 0===t?"undefined":o(t))&&m.call(e)==a;var t}function y(e){if("number"==typeof e)return e;if(n(e))return i;if(g(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=g(t)?t+"":t}if("string"!=typeof e)return 0===e?e:+e;e=e.replace(r,"");var o=s.test(e);return o||u.test(e)?d(e.slice(2),o?2:8):c.test(e)?i:+e}var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},i=NaN,a="[object Symbol]",r=/^\s+|\s+$/g,c=/^[-+]0x[0-9a-f]+$/i,s=/^0b[01]+$/i,u=/^0o[0-7]+$/i,d=parseInt,t="object"==(void 0===e?"undefined":o(e))&&e&&e.Object===Object&&e,l="object"==("undefined"==typeof self?"undefined":o(self))&&self&&self.Object===Object&&self,f=t||l||Function("return this")(),m=Object.prototype.toString,w=Math.max,k=Math.min,_=function(){return f.Date.now()};p.exports=function(n,i,e){function a(e){var t=u,o=d;return u=d=void 0,v=e,f=n.apply(o,t)}function r(e){var t=e-p;return void 0===p||i<=t||t<0||h&&l<=e-v}function c(){var e,t,o=_();return r(o)?s(o):void(m=setTimeout(c,(t=i-((e=o)-p),h?k(t,l-(e-v)):t)))}function s(e){return m=void 0,o&&u?a(e):(u=d=void 0,f)}function t(){var e,t=_(),o=r(t);if(u=arguments,d=this,p=t,o){if(void 0===m)return v=e=p,m=setTimeout(c,i),b?a(e):f;if(h)return m=setTimeout(c,i),a(p)}return void 0===m&&(m=setTimeout(c,i)),f}var u,d,l,f,m,p,v=0,b=!1,h=!1,o=!0;if("function"!=typeof n)throw new TypeError("Expected a function");return i=y(i)||0,g(e)&&(b=!!e.leading,l=(h="maxWait"in e)?w(y(e.maxWait)||0,i):l,o="trailing"in e?!!e.trailing:o),t.cancel=function(){void 0!==m&&clearTimeout(m),u=p=d=m=void(v=0)},t.flush=function(){return void 0===m?f:s(_())},t}}).call(e,function(){return this}())},function(e,t){"use strict";function o(){for(var e,t,o=0,n=s.length;o<n;o++){e=s[o];for(var i,a=0,r=(t=c.querySelectorAll(e.selector)).length;a<r;a++)(i=t[a]).ready||(i.ready=!0,e.fn.call(i,i))}}Object.defineProperty(t,"__esModule",{value:!0});var c=window.document,n=window.MutationObserver||window.WebKitMutationObserver,s=[],i=void 0;t.default=function(e,t){s.push({selector:e,fn:t}),!i&&n&&(i=new n(o)).observe(c.documentElement,{childList:!0,subtree:!0,removedNodes:!0}),o()}},function(e,t){"use strict";function o(){return navigator.userAgent||navigator.vendor||window.opera||""}Object.defineProperty(t,"__esModule",{value:!0});var n=function(){function n(e,t){for(var o=0;o<t.length;o++){var n=t[o];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(e,t,o){return t&&n(e.prototype,t),o&&n(e,o),e}}(),i=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i,a=/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,r=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i,c=/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,s=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e)}return n(e,[{key:"phone",value:function(){var e=o();return!(!i.test(e)&&!a.test(e.substr(0,4)))}},{key:"mobile",value:function(){var e=o();return!(!r.test(e)&&!c.test(e.substr(0,4)))}},{key:"tablet",value:function(){return this.mobile()&&!this.phone()}}]),e}();t.default=new s},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.default=function(e,r){var c=window.pageYOffset,s=window.innerHeight;e.forEach(function(e,t){var o,n,i,a;n=s+c,i=r,a=(o=e).node.getAttribute("data-aos-once"),n>o.position?o.node.classList.add("aos-animate"):void 0!==a&&("false"===a||!i&&"true"!==a)&&o.node.classList.remove("aos-animate")})}},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n,i=o(12),a=(n=i)&&n.__esModule?n:{default:n};t.default=function(e,o){return e.forEach(function(e,t){e.node.classList.add("aos-init"),e.position=(0,a.default)(e.node,o.offset)}),e}},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n,i=o(13),r=(n=i)&&n.__esModule?n:{default:n};t.default=function(e,t){var o=0,n=0,i=window.innerHeight,a={offset:e.getAttribute("data-aos-offset"),anchor:e.getAttribute("data-aos-anchor"),anchorPlacement:e.getAttribute("data-aos-anchor-placement")};switch(a.offset&&!isNaN(a.offset)&&(n=parseInt(a.offset)),a.anchor&&document.querySelectorAll(a.anchor)&&(e=document.querySelectorAll(a.anchor)[0]),o=(0,r.default)(e).top,a.anchorPlacement){case"top-bottom":break;case"center-bottom":o+=e.offsetHeight/2;break;case"bottom-bottom":o+=e.offsetHeight;break;case"top-center":o+=i/2;break;case"bottom-center":o+=i/2+e.offsetHeight;break;case"center-center":o+=i/2+e.offsetHeight/2;break;case"top-top":o+=i;break;case"bottom-top":o+=e.offsetHeight+i;break;case"center-top":o+=e.offsetHeight/2+i}return a.anchorPlacement||a.offset||isNaN(t)||(n=t),o+n}},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.default=function(e){for(var t=0,o=0;e&&!isNaN(e.offsetLeft)&&!isNaN(e.offsetTop);)t+=e.offsetLeft-("BODY"!=e.tagName?e.scrollLeft:0),o+=e.offsetTop-("BODY"!=e.tagName?e.scrollTop:0),e=e.offsetParent;return{top:o,left:t}}},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.default=function(e){e=e||document.querySelectorAll("[data-aos]");var o=[];return[].forEach.call(e,function(e,t){o.push({node:e})}),o}}])});