(()=>{var Ot=Object.defineProperty;var Mt=(e,t)=>{for(var n in t)Ot(e,n,{get:t[n],enumerable:!0})};var De={};Mt(De,{Children:()=>dt,Component:()=>C,Fragment:()=>E,PureComponent:()=>se,StrictMode:()=>Ut,Suspense:()=>q,SuspenseList:()=>I,__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:()=>kt,cloneElement:()=>wt,createContext:()=>ne,createElement:()=>k,createFactory:()=>Et,createPortal:()=>gt,createRef:()=>te,default:()=>Ue,findDOMNode:()=>Pt,flushSync:()=>Ht,forwardRef:()=>pt,hydrate:()=>Ct,isElement:()=>Dt,isFragment:()=>St,isMemo:()=>xt,isValidElement:()=>Z,lazy:()=>yt,memo:()=>ft,render:()=>Y,startTransition:()=>we,unmountComponentAtNode:()=>Nt,unstable_batchedUpdates:()=>Rt,useCallback:()=>ue,useContext:()=>ie,useDebugValue:()=>ae,useDeferredValue:()=>Ne,useEffect:()=>z,useErrorBoundary:()=>$t,useId:()=>le,useImperativeHandle:()=>oe,useInsertionEffect:()=>Re,useLayoutEffect:()=>D,useMemo:()=>F,useReducer:()=>j,useRef:()=>re,useState:()=>L,useSyncExternalStore:()=>He,useTransition:()=>Pe,version:()=>rn});var B,f,Fe,Lt,H,Oe,Ie,fe,ve,pe,de,Ae,$={},We=[],Ft=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,ee=Array.isArray;function N(e,t){for(var n in t)e[n]=t[n];return e}function Ve(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function k(e,t,n){var _,r,o,i={};for(o in t)o=="key"?_=t[o]:o=="ref"?r=t[o]:i[o]=t[o];if(arguments.length>2&&(i.children=arguments.length>3?B.call(arguments,2):n),typeof e=="function"&&e.defaultProps!=null)for(o in e.defaultProps)i[o]===void 0&&(i[o]=e.defaultProps[o]);return V(e,i,_,r,null)}function V(e,t,n,_,r){var o={type:e,props:t,key:n,ref:_,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,constructor:void 0,__v:r==null?++Fe:r,__i:-1,__u:0};return r==null&&f.vnode!=null&&f.vnode(o),o}function te(){return{current:null}}function E(e){return e.children}function C(e,t){this.props=e,this.context=t}function T(e,t){if(t==null)return e.__?T(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null)return n.__e;return typeof e.type=="function"?T(e):null}function $e(e){var t,n;if((e=e.__)!=null&&e.__c!=null){for(e.__e=e.__c.base=null,t=0;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null){e.__e=e.__c.base=n.__e;break}return $e(e)}}function he(e){(!e.__d&&(e.__d=!0)&&H.push(e)&&!X.__r++||Oe!==f.debounceRendering)&&((Oe=f.debounceRendering)||Ie)(X)}function X(){var e,t,n,_,r,o,i,a;for(H.sort(fe);e=H.shift();)e.__d&&(t=H.length,_=void 0,o=(r=(n=e).__v).__e,i=[],a=[],n.__P&&((_=N({},r)).__v=r.__v+1,f.vnode&&f.vnode(_),me(n.__P,_,r,n.__n,n.__P.namespaceURI,32&r.__u?[o]:null,i,o==null?T(r):o,!!(32&r.__u),a),_.__v=r.__v,_.__.__k[_.__i]=_,ze(i,_,a),_.__e!=o&&$e(_)),H.length>t&&H.sort(fe));X.__r=0}function Be(e,t,n,_,r,o,i,a,s,l,p){var u,h,c,g,S,b=_&&_.__k||We,v=t.length;for(n.__d=s,It(n,t,b),s=n.__d,u=0;u<v;u++)(c=n.__k[u])!=null&&(h=c.__i===-1?$:b[c.__i]||$,c.__i=u,me(e,c,h,r,o,i,a,s,l,p),g=c.__e,c.ref&&h.ref!=c.ref&&(h.ref&&ye(h.ref,null,c),p.push(c.ref,c.__c||g,c)),S==null&&g!=null&&(S=g),65536&c.__u||h.__k===c.__k?s=je(c,s,e):typeof c.type=="function"&&c.__d!==void 0?s=c.__d:g&&(s=g.nextSibling),c.__d=void 0,c.__u&=-196609);n.__d=s,n.__e=S}function It(e,t,n){var _,r,o,i,a,s=t.length,l=n.length,p=l,u=0;for(e.__k=[],_=0;_<s;_++)(r=t[_])!=null&&typeof r!="boolean"&&typeof r!="function"?(i=_+u,(r=e.__k[_]=typeof r=="string"||typeof r=="number"||typeof r=="bigint"||r.constructor==String?V(null,r,null,null,null):ee(r)?V(E,{children:r},null,null,null):r.constructor===void 0&&r.__b>0?V(r.type,r.props,r.key,r.ref?r.ref:null,r.__v):r).__=e,r.__b=e.__b+1,o=null,(a=r.__i=At(r,n,i,p))!==-1&&(p--,(o=n[a])&&(o.__u|=131072)),o==null||o.__v===null?(a==-1&&u--,typeof r.type!="function"&&(r.__u|=65536)):a!==i&&(a==i-1?u--:a==i+1?u++:(a>i?u--:u++,r.__u|=65536))):r=e.__k[_]=null;if(p)for(_=0;_<l;_++)(o=n[_])!=null&&!(131072&o.__u)&&(o.__e==e.__d&&(e.__d=T(o)),qe(o,o))}function je(e,t,n){var _,r;if(typeof e.type=="function"){for(_=e.__k,r=0;_&&r<_.length;r++)_[r]&&(_[r].__=e,t=je(_[r],t,n));return t}e.__e!=t&&(t&&e.type&&!n.contains(t)&&(t=T(e)),n.insertBefore(e.__e,t||null),t=e.__e);do t=t&&t.nextSibling;while(t!=null&&t.nodeType===8);return t}function w(e,t){return t=t||[],e==null||typeof e=="boolean"||(ee(e)?e.some(function(n){w(n,t)}):t.push(e)),t}function At(e,t,n,_){var r=e.key,o=e.type,i=n-1,a=n+1,s=t[n];if(s===null||s&&r==s.key&&o===s.type&&!(131072&s.__u))return n;if(_>(s!=null&&!(131072&s.__u)?1:0))for(;i>=0||a<t.length;){if(i>=0){if((s=t[i])&&!(131072&s.__u)&&r==s.key&&o===s.type)return i;i--}if(a<t.length){if((s=t[a])&&!(131072&s.__u)&&r==s.key&&o===s.type)return a;a++}}return-1}function Me(e,t,n){t[0]==="-"?e.setProperty(t,n==null?"":n):e[t]=n==null?"":typeof n!="number"||Ft.test(t)?n:n+"px"}function Q(e,t,n,_,r){var o;e:if(t==="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof _=="string"&&(e.style.cssText=_=""),_)for(t in _)n&&t in n||Me(e.style,t,"");if(n)for(t in n)_&&n[t]===_[t]||Me(e.style,t,n[t])}else if(t[0]==="o"&&t[1]==="n")o=t!==(t=t.replace(/(PointerCapture)$|Capture$/i,"$1")),t=t.toLowerCase()in e||t==="onFocusOut"||t==="onFocusIn"?t.toLowerCase().slice(2):t.slice(2),e.l||(e.l={}),e.l[t+o]=n,n?_?n.u=_.u:(n.u=ve,e.addEventListener(t,o?de:pe,o)):e.removeEventListener(t,o?de:pe,o);else{if(r=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=n==null?"":n;break e}catch(i){}typeof n=="function"||(n==null||n===!1&&t[4]!=="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&n==1?"":n))}}function Le(e){return function(t){if(this.l){var n=this.l[t.type+e];if(t.t==null)t.t=ve++;else if(t.t<n.u)return;return n(f.event?f.event(t):t)}}}function me(e,t,n,_,r,o,i,a,s,l){var p,u,h,c,g,S,b,v,m,A,R,G,W,Te,J,ce,x=t.type;if(t.constructor!==void 0)return null;128&n.__u&&(s=!!(32&n.__u),o=[a=t.__e=n.__e]),(p=f.__b)&&p(t);e:if(typeof x=="function")try{if(v=t.props,m="prototype"in x&&x.prototype.render,A=(p=x.contextType)&&_[p.__c],R=p?A?A.props.value:p.__:_,n.__c?b=(u=t.__c=n.__c).__=u.__E:(m?t.__c=u=new x(v,R):(t.__c=u=new C(v,R),u.constructor=x,u.render=Vt),A&&A.sub(u),u.props=v,u.state||(u.state={}),u.context=R,u.__n=_,h=u.__d=!0,u.__h=[],u._sb=[]),m&&u.__s==null&&(u.__s=u.state),m&&x.getDerivedStateFromProps!=null&&(u.__s==u.state&&(u.__s=N({},u.__s)),N(u.__s,x.getDerivedStateFromProps(v,u.__s))),c=u.props,g=u.state,u.__v=t,h)m&&x.getDerivedStateFromProps==null&&u.componentWillMount!=null&&u.componentWillMount(),m&&u.componentDidMount!=null&&u.__h.push(u.componentDidMount);else{if(m&&x.getDerivedStateFromProps==null&&v!==c&&u.componentWillReceiveProps!=null&&u.componentWillReceiveProps(v,R),!u.__e&&(u.shouldComponentUpdate!=null&&u.shouldComponentUpdate(v,u.__s,R)===!1||t.__v===n.__v)){for(t.__v!==n.__v&&(u.props=v,u.state=u.__s,u.__d=!1),t.__e=n.__e,t.__k=n.__k,t.__k.some(function(K){K&&(K.__=t)}),G=0;G<u._sb.length;G++)u.__h.push(u._sb[G]);u._sb=[],u.__h.length&&i.push(u);break e}u.componentWillUpdate!=null&&u.componentWillUpdate(v,u.__s,R),m&&u.componentDidUpdate!=null&&u.__h.push(function(){u.componentDidUpdate(c,g,S)})}if(u.context=R,u.props=v,u.__P=e,u.__e=!1,W=f.__r,Te=0,m){for(u.state=u.__s,u.__d=!1,W&&W(t),p=u.render(u.props,u.state,u.context),J=0;J<u._sb.length;J++)u.__h.push(u._sb[J]);u._sb=[]}else do u.__d=!1,W&&W(t),p=u.render(u.props,u.state,u.context),u.state=u.__s;while(u.__d&&++Te<25);u.state=u.__s,u.getChildContext!=null&&(_=N(N({},_),u.getChildContext())),m&&!h&&u.getSnapshotBeforeUpdate!=null&&(S=u.getSnapshotBeforeUpdate(c,g)),Be(e,ee(ce=p!=null&&p.type===E&&p.key==null?p.props.children:p)?ce:[ce],t,n,_,r,o,i,a,s,l),u.base=t.__e,t.__u&=-161,u.__h.length&&i.push(u),b&&(u.__E=u.__=null)}catch(K){if(t.__v=null,s||o!=null){for(t.__u|=s?160:128;a&&a.nodeType===8&&a.nextSibling;)a=a.nextSibling;o[o.indexOf(a)]=null,t.__e=a}else t.__e=n.__e,t.__k=n.__k;f.__e(K,t,n)}else o==null&&t.__v===n.__v?(t.__k=n.__k,t.__e=n.__e):t.__e=Wt(n.__e,t,n,_,r,o,i,s,l);(p=f.diffed)&&p(t)}function ze(e,t,n){t.__d=void 0;for(var _=0;_<n.length;_++)ye(n[_],n[++_],n[++_]);f.__c&&f.__c(t,e),e.some(function(r){try{e=r.__h,r.__h=[],e.some(function(o){o.call(r)})}catch(o){f.__e(o,r.__v)}})}function Wt(e,t,n,_,r,o,i,a,s){var l,p,u,h,c,g,S,b=n.props,v=t.props,m=t.type;if(m==="svg"?r="http://www.w3.org/2000/svg":m==="math"?r="http://www.w3.org/1998/Math/MathML":r||(r="http://www.w3.org/1999/xhtml"),o!=null){for(l=0;l<o.length;l++)if((c=o[l])&&"setAttribute"in c==!!m&&(m?c.localName===m:c.nodeType===3)){e=c,o[l]=null;break}}if(e==null){if(m===null)return document.createTextNode(v);e=document.createElementNS(r,m,v.is&&v),a&&(f.__m&&f.__m(t,o),a=!1),o=null}if(m===null)b===v||a&&e.data===v||(e.data=v);else{if(o=o&&B.call(e.childNodes),b=n.props||$,!a&&o!=null)for(b={},l=0;l<e.attributes.length;l++)b[(c=e.attributes[l]).name]=c.value;for(l in b)if(c=b[l],l!="children"){if(l=="dangerouslySetInnerHTML")u=c;else if(!(l in v)){if(l=="value"&&"defaultValue"in v||l=="checked"&&"defaultChecked"in v)continue;Q(e,l,null,c,r)}}for(l in v)c=v[l],l=="children"?h=c:l=="dangerouslySetInnerHTML"?p=c:l=="value"?g=c:l=="checked"?S=c:a&&typeof c!="function"||b[l]===c||Q(e,l,c,b[l],r);if(p)a||u&&(p.__html===u.__html||p.__html===e.innerHTML)||(e.innerHTML=p.__html),t.__k=[];else if(u&&(e.innerHTML=""),Be(e,ee(h)?h:[h],t,n,_,m==="foreignObject"?"http://www.w3.org/1999/xhtml":r,o,i,o?o[0]:n.__k&&T(n,0),a,s),o!=null)for(l=o.length;l--;)Ve(o[l]);a||(l="value",m==="progress"&&g==null?e.removeAttribute("value"):g!==void 0&&(g!==e[l]||m==="progress"&&!g||m==="option"&&g!==b[l])&&Q(e,l,g,b[l],r),l="checked",S!==void 0&&S!==e[l]&&Q(e,l,S,b[l],r))}return e}function ye(e,t,n){try{if(typeof e=="function"){var _=typeof e.__u=="function";_&&e.__u(),_&&t==null||(e.__u=e(t))}else e.current=t}catch(r){f.__e(r,n)}}function qe(e,t,n){var _,r;if(f.unmount&&f.unmount(e),(_=e.ref)&&(_.current&&_.current!==e.__e||ye(_,null,t)),(_=e.__c)!=null){if(_.componentWillUnmount)try{_.componentWillUnmount()}catch(o){f.__e(o,t)}_.base=_.__P=null}if(_=e.__k)for(r=0;r<_.length;r++)_[r]&&qe(_[r],t,n||typeof e.type!="function");n||Ve(e.__e),e.__c=e.__=e.__e=e.__d=void 0}function Vt(e,t,n){return this.constructor(e,n)}function O(e,t,n){var _,r,o,i;f.__&&f.__(e,t),r=(_=typeof n=="function")?null:n&&n.__k||t.__k,o=[],i=[],me(t,e=(!_&&n||t).__k=k(E,null,[e]),r||$,$,t.namespaceURI,!_&&n?[n]:r?null:t.firstChild?B.call(t.childNodes):null,o,!_&&n?n:r?r.__e:t.firstChild,_,i),ze(o,e,i)}function ge(e,t){O(e,t,ge)}function Ye(e,t,n){var _,r,o,i,a=N({},e.props);for(o in e.type&&e.type.defaultProps&&(i=e.type.defaultProps),t)o=="key"?_=t[o]:o=="ref"?r=t[o]:a[o]=t[o]===void 0&&i!==void 0?i[o]:t[o];return arguments.length>2&&(a.children=arguments.length>3?B.call(arguments,2):n),V(e.type,a,_||e.key,r||e.ref,null)}function ne(e,t){var n={__c:t="__cC"+Ae++,__:e,Consumer:function(_,r){return _.children(r)},Provider:function(_){var r,o;return this.getChildContext||(r=new Set,(o={})[t]=this,this.getChildContext=function(){return o},this.componentWillUnmount=function(){r=null},this.shouldComponentUpdate=function(i){this.props.value!==i.value&&r.forEach(function(a){a.__e=!0,he(a)})},this.sub=function(i){r.add(i);var a=i.componentWillUnmount;i.componentWillUnmount=function(){r&&r.delete(i),a&&a.call(i)}}),_.children}};return n.Provider.__=n.Consumer.contextType=n}B=We.slice,f={__e:function(e,t,n,_){for(var r,o,i;t=t.__;)if((r=t.__c)&&!r.__)try{if((o=r.constructor)&&o.getDerivedStateFromError!=null&&(r.setState(o.getDerivedStateFromError(e)),i=r.__d),r.componentDidCatch!=null&&(r.componentDidCatch(e,_||{}),i=r.__d),i)return r.__E=r}catch(a){e=a}throw e}},Fe=0,Lt=function(e){return e!=null&&e.constructor==null},C.prototype.setState=function(e,t){var n;n=this.__s!=null&&this.__s!==this.state?this.__s:this.__s=N({},this.state),typeof e=="function"&&(e=e(N({},n),this.props)),e&&N(n,e),e!=null&&this.__v&&(t&&this._sb.push(t),he(this))},C.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),he(this))},C.prototype.render=E,H=[],Ie=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,fe=function(e,t){return e.__v.__b-t.__v.__b},X.__r=0,ve=0,pe=Le(!1),de=Le(!0),Ae=0;var P,d,be,Ze,M=0,nt=[],y=f,Ge=y.__b,Je=y.__r,Ke=y.diffed,Qe=y.__c,Xe=y.unmount,et=y.__;function U(e,t){y.__h&&y.__h(d,e,M||t),M=0;var n=d.__H||(d.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function L(e){return M=1,j(_t,e)}function j(e,t,n){var _=U(P++,2);if(_.t=e,!_.__c&&(_.__=[n?n(t):_t(void 0,t),function(a){var s=_.__N?_.__N[0]:_.__[0],l=_.t(s,a);s!==l&&(_.__N=[l,_.__[1]],_.__c.setState({}))}],_.__c=d,!d.u)){var r=function(a,s,l){if(!_.__c.__H)return!0;var p=_.__c.__H.__.filter(function(h){return!!h.__c});if(p.every(function(h){return!h.__N}))return!o||o.call(this,a,s,l);var u=!1;return p.forEach(function(h){if(h.__N){var c=h.__[0];h.__=h.__N,h.__N=void 0,c!==h.__[0]&&(u=!0)}}),!(!u&&_.__c.props===a)&&(!o||o.call(this,a,s,l))};d.u=!0;var o=d.shouldComponentUpdate,i=d.componentWillUpdate;d.componentWillUpdate=function(a,s,l){if(this.__e){var p=o;o=void 0,r(a,s,l),o=p}i&&i.call(this,a,s,l)},d.shouldComponentUpdate=r}return _.__N||_.__}function z(e,t){var n=U(P++,3);!y.__s&&ke(n.__H,t)&&(n.__=e,n.i=t,d.__H.__h.push(n))}function D(e,t){var n=U(P++,4);!y.__s&&ke(n.__H,t)&&(n.__=e,n.i=t,d.__h.push(n))}function re(e){return M=5,F(function(){return{current:e}},[])}function oe(e,t,n){M=6,D(function(){return typeof e=="function"?(e(t()),function(){return e(null)}):e?(e.current=t(),function(){return e.current=null}):void 0},n==null?n:n.concat(e))}function F(e,t){var n=U(P++,7);return ke(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}function ue(e,t){return M=8,F(function(){return e},t)}function ie(e){var t=d.context[e.__c],n=U(P++,9);return n.c=e,t?(n.__==null&&(n.__=!0,t.sub(d)),t.props.value):e.__}function ae(e,t){y.useDebugValue&&y.useDebugValue(t?t(e):e)}function $t(e){var t=U(P++,10),n=L();return t.__=e,d.componentDidCatch||(d.componentDidCatch=function(_,r){t.__&&t.__(_,r),n[1](_)}),[n[0],function(){n[1](void 0)}]}function le(){var e=U(P++,11);if(!e.__){for(var t=d.__v;t!==null&&!t.__m&&t.__!==null;)t=t.__;var n=t.__m||(t.__m=[0,0]);e.__="P"+n[0]+"-"+n[1]++}return e.__}function Bt(){for(var e;e=nt.shift();)if(e.__P&&e.__H)try{e.__H.__h.forEach(_e),e.__H.__h.forEach(Ce),e.__H.__h=[]}catch(t){e.__H.__h=[],y.__e(t,e.__v)}}y.__b=function(e){d=null,Ge&&Ge(e)},y.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),et&&et(e,t)},y.__r=function(e){Je&&Je(e),P=0;var t=(d=e.__c).__H;t&&(be===d?(t.__h=[],d.__h=[],t.__.forEach(function(n){n.__N&&(n.__=n.__N),n.i=n.__N=void 0})):(t.__h.forEach(_e),t.__h.forEach(Ce),t.__h=[],P=0)),be=d},y.diffed=function(e){Ke&&Ke(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(nt.push(t)!==1&&Ze===y.requestAnimationFrame||((Ze=y.requestAnimationFrame)||jt)(Bt)),t.__H.__.forEach(function(n){n.i&&(n.__H=n.i),n.i=void 0})),be=d=null},y.__c=function(e,t){t.some(function(n){try{n.__h.forEach(_e),n.__h=n.__h.filter(function(_){return!_.__||Ce(_)})}catch(_){t.some(function(r){r.__h&&(r.__h=[])}),t=[],y.__e(_,n.__v)}}),Qe&&Qe(e,t)},y.unmount=function(e){Xe&&Xe(e);var t,n=e.__c;n&&n.__H&&(n.__H.__.forEach(function(_){try{_e(_)}catch(r){t=r}}),n.__H=void 0,t&&y.__e(t,n.__v))};var tt=typeof requestAnimationFrame=="function";function jt(e){var t,n=function(){clearTimeout(_),tt&&cancelAnimationFrame(t),setTimeout(e)},_=setTimeout(n,100);tt&&(t=requestAnimationFrame(n))}function _e(e){var t=d,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),d=t}function Ce(e){var t=d;e.__c=e.__(),d=t}function ke(e,t){return!e||e.length!==t.length||t.some(function(n,_){return n!==e[_]})}function _t(e,t){return typeof t=="function"?t(e):t}function Se(e,t){for(var n in e)if(n!=="__source"&&!(n in t))return!0;for(var _ in t)if(_!=="__source"&&e[_]!==t[_])return!0;return!1}function se(e,t){this.props=e,this.context=t}function ft(e,t){function n(r){var o=this.props.ref,i=o==r.ref;return!i&&o&&(o.call?o(null):o.current=null),t?!t(this.props,r)||!i:Se(this.props,r)}function _(r){return this.shouldComponentUpdate=n,k(e,r)}return _.displayName="Memo("+(e.displayName||e.name)+")",_.prototype.isReactComponent=!0,_.__f=!0,_}(se.prototype=new C).isPureReactComponent=!0,se.prototype.shouldComponentUpdate=function(e,t){return Se(this.props,e)||Se(this.state,t)};var rt=f.__b;f.__b=function(e){e.type&&e.type.__f&&e.ref&&(e.props.ref=e.ref,e.ref=null),rt&&rt(e)};var zt=typeof Symbol!="undefined"&&Symbol.for&&Symbol.for("react.forward_ref")||3911;function pt(e){function t(n){if(!("ref"in n))return e(n,null);var _=n.ref;delete n.ref;var r=e(n,_);return n.ref=_,r}return t.$$typeof=zt,t.render=t,t.prototype.isReactComponent=t.__f=!0,t.displayName="ForwardRef("+(e.displayName||e.name)+")",t}var ot=function(e,t){return e==null?null:w(w(e).map(t))},dt={map:ot,forEach:ot,count:function(e){return e?w(e).length:0},only:function(e){var t=w(e);if(t.length!==1)throw"Children.only";return t[0]},toArray:w},qt=f.__e;f.__e=function(e,t,n,_){if(e.then){for(var r,o=t;o=o.__;)if((r=o.__c)&&r.__c)return t.__e==null&&(t.__e=n.__e,t.__k=n.__k),r.__c(e,t)}qt(e,t,n,_)};var ut=f.unmount;function ht(e,t,n){return e&&(e.__c&&e.__c.__H&&(e.__c.__H.__.forEach(function(_){typeof _.__c=="function"&&_.__c()}),e.__c.__H=null),(e=function(_,r){for(var o in r)_[o]=r[o];return _}({},e)).__c!=null&&(e.__c.__P===n&&(e.__c.__P=t),e.__c=null),e.__k=e.__k&&e.__k.map(function(_){return ht(_,t,n)})),e}function vt(e,t,n){return e&&n&&(e.__v=null,e.__k=e.__k&&e.__k.map(function(_){return vt(_,t,n)}),e.__c&&e.__c.__P===t&&(e.__e&&n.appendChild(e.__e),e.__c.__e=!0,e.__c.__P=n)),e}function q(){this.__u=0,this.t=null,this.__b=null}function mt(e){var t=e.__.__c;return t&&t.__a&&t.__a(e)}function yt(e){var t,n,_;function r(o){if(t||(t=e()).then(function(i){n=i.default||i},function(i){_=i}),_)throw _;if(!n)throw t;return k(n,o)}return r.displayName="Lazy",r.__f=!0,r}function I(){this.u=null,this.o=null}f.unmount=function(e){var t=e.__c;t&&t.__R&&t.__R(),t&&32&e.__u&&(e.type=null),ut&&ut(e)},(q.prototype=new C).__c=function(e,t){var n=t.__c,_=this;_.t==null&&(_.t=[]),_.t.push(n);var r=mt(_.__v),o=!1,i=function(){o||(o=!0,n.__R=null,r?r(a):a())};n.__R=i;var a=function(){if(!--_.__u){if(_.state.__a){var s=_.state.__a;_.__v.__k[0]=vt(s,s.__c.__P,s.__c.__O)}var l;for(_.setState({__a:_.__b=null});l=_.t.pop();)l.forceUpdate()}};_.__u++||32&t.__u||_.setState({__a:_.__b=_.__v.__k[0]}),e.then(i,i)},q.prototype.componentWillUnmount=function(){this.t=[]},q.prototype.render=function(e,t){if(this.__b){if(this.__v.__k){var n=document.createElement("div"),_=this.__v.__k[0].__c;this.__v.__k[0]=ht(this.__b,n,_.__O=_.__P)}this.__b=null}var r=t.__a&&k(E,null,e.fallback);return r&&(r.__u&=-33),[k(E,null,t.__a?null:e.children),r]};var it=function(e,t,n){if(++n[1]===n[0]&&e.o.delete(t),e.props.revealOrder&&(e.props.revealOrder[0]!=="t"||!e.o.size))for(n=e.u;n;){for(;n.length>3;)n.pop()();if(n[1]<n[0])break;e.u=n=n[2]}};function Yt(e){return this.getChildContext=function(){return e.context},e.children}function Zt(e){var t=this,n=e.i;t.componentWillUnmount=function(){O(null,t.l),t.l=null,t.i=null},t.i&&t.i!==n&&t.componentWillUnmount(),t.l||(t.i=n,t.l={nodeType:1,parentNode:n,childNodes:[],contains:function(){return!0},appendChild:function(_){this.childNodes.push(_),t.i.appendChild(_)},insertBefore:function(_,r){this.childNodes.push(_),t.i.appendChild(_)},removeChild:function(_){this.childNodes.splice(this.childNodes.indexOf(_)>>>1,1),t.i.removeChild(_)}}),O(k(Yt,{context:t.context},e.__v),t.l)}function gt(e,t){var n=k(Zt,{__v:e,i:t});return n.containerInfo=t,n}(I.prototype=new C).__a=function(e){var t=this,n=mt(t.__v),_=t.o.get(e);return _[0]++,function(r){var o=function(){t.props.revealOrder?(_.push(r),it(t,e,_)):r()};n?n(o):o()}},I.prototype.render=function(e){this.u=null,this.o=new Map;var t=w(e.children);e.revealOrder&&e.revealOrder[0]==="b"&&t.reverse();for(var n=t.length;n--;)this.o.set(t[n],this.u=[1,0,this.u]);return e.children},I.prototype.componentDidUpdate=I.prototype.componentDidMount=function(){var e=this;this.o.forEach(function(t,n){it(e,n,t)})};var bt=typeof Symbol!="undefined"&&Symbol.for&&Symbol.for("react.element")||60103,Gt=/^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/,Jt=/^on(Ani|Tra|Tou|BeforeInp|Compo)/,Kt=/[A-Z0-9]/g,Qt=typeof document!="undefined",Xt=function(e){return(typeof Symbol!="undefined"&&typeof Symbol()=="symbol"?/fil|che|rad/:/fil|che|ra/).test(e)};function Y(e,t,n){return t.__k==null&&(t.textContent=""),O(e,t),typeof n=="function"&&n(),e?e.__c:null}function Ct(e,t,n){return ge(e,t),typeof n=="function"&&n(),e?e.__c:null}C.prototype.isReactComponent={},["componentWillMount","componentWillReceiveProps","componentWillUpdate"].forEach(function(e){Object.defineProperty(C.prototype,e,{configurable:!0,get:function(){return this["UNSAFE_"+e]},set:function(t){Object.defineProperty(this,e,{configurable:!0,writable:!0,value:t})}})});var at=f.event;function en(){}function tn(){return this.cancelBubble}function nn(){return this.defaultPrevented}f.event=function(e){return at&&(e=at(e)),e.persist=en,e.isPropagationStopped=tn,e.isDefaultPrevented=nn,e.nativeEvent=e};var xe,_n={enumerable:!1,configurable:!0,get:function(){return this.class}},lt=f.vnode;f.vnode=function(e){typeof e.type=="string"&&function(t){var n=t.props,_=t.type,r={},o=_.indexOf("-")===-1;for(var i in n){var a=n[i];if(!(i==="value"&&"defaultValue"in n&&a==null||Qt&&i==="children"&&_==="noscript"||i==="class"||i==="className")){var s=i.toLowerCase();i==="defaultValue"&&"value"in n&&n.value==null?i="value":i==="download"&&a===!0?a="":s==="translate"&&a==="no"?a=!1:s[0]==="o"&&s[1]==="n"?s==="ondoubleclick"?i="ondblclick":s!=="onchange"||_!=="input"&&_!=="textarea"||Xt(n.type)?s==="onfocus"?i="onfocusin":s==="onblur"?i="onfocusout":Jt.test(i)&&(i=s):s=i="oninput":o&&Gt.test(i)?i=i.replace(Kt,"-$&").toLowerCase():a===null&&(a=void 0),s==="oninput"&&r[i=s]&&(i="oninputCapture"),r[i]=a}}_=="select"&&r.multiple&&Array.isArray(r.value)&&(r.value=w(n.children).forEach(function(l){l.props.selected=r.value.indexOf(l.props.value)!=-1})),_=="select"&&r.defaultValue!=null&&(r.value=w(n.children).forEach(function(l){l.props.selected=r.multiple?r.defaultValue.indexOf(l.props.value)!=-1:r.defaultValue==l.props.value})),n.class&&!n.className?(r.class=n.class,Object.defineProperty(r,"className",_n)):(n.className&&!n.class||n.class&&n.className)&&(r.class=r.className=n.className),t.props=r}(e),e.$$typeof=bt,lt&&lt(e)};var st=f.__r;f.__r=function(e){st&&st(e),xe=e.__c};var ct=f.diffed;f.diffed=function(e){ct&&ct(e);var t=e.props,n=e.__e;n!=null&&e.type==="textarea"&&"value"in t&&t.value!==n.value&&(n.value=t.value==null?"":t.value),xe=null};var kt={ReactCurrentDispatcher:{current:{readContext:function(e){return xe.__n[e.__c].props.value},useCallback:ue,useContext:ie,useDebugValue:ae,useDeferredValue:Ne,useEffect:z,useId:le,useImperativeHandle:oe,useInsertionEffect:Re,useLayoutEffect:D,useMemo:F,useReducer:j,useRef:re,useState:L,useSyncExternalStore:He,useTransition:Pe}}},rn="18.3.1";function Et(e){return k.bind(null,e)}function Z(e){return!!e&&e.$$typeof===bt}function St(e){return Z(e)&&e.type===E}function xt(e){return!!e&&!!e.displayName&&(typeof e.displayName=="string"||e.displayName instanceof String)&&e.displayName.startsWith("Memo(")}function wt(e){return Z(e)?Ye.apply(null,arguments):e}function Nt(e){return!!e.__k&&(O(null,e),!0)}function Pt(e){return e&&(e.base||e.nodeType===1&&e)||null}var Rt=function(e,t){return e(t)},Ht=function(e,t){return e(t)},Ut=E;function we(e){e()}function Ne(e){return e}function Pe(){return[!1,we]}var Re=D,Dt=Z;function He(e,t){var n=t(),_=L({h:{__:n,v:t}}),r=_[0].h,o=_[1];return D(function(){r.__=n,r.v=t,Ee(r)&&o({h:r})},[e,n,t]),z(function(){return Ee(r)&&o({h:r}),e(function(){Ee(r)&&o({h:r})})},[e]),n}function Ee(e){var t,n,_=e.v,r=e.__;try{var o=_();return!((t=r)===(n=o)&&(t!==0||1/t==1/n)||t!=t&&n!=n)}catch(i){return!0}}var Ue={useState:L,useId:le,useReducer:j,useEffect:z,useLayoutEffect:D,useInsertionEffect:Re,useTransition:Pe,useDeferredValue:Ne,useSyncExternalStore:He,startTransition:we,useRef:re,useImperativeHandle:oe,useMemo:F,useCallback:ue,useContext:ie,useDebugValue:ae,version:"18.3.1",Children:dt,render:Y,hydrate:Ct,unmountComponentAtNode:Nt,createPortal:gt,createElement:k,createContext:ne,createFactory:Et,cloneElement:wt,createRef:te,Fragment:E,isValidElement:Z,isElement:Dt,isFragment:St,isMemo:xt,findDOMNode:Pt,Component:C,PureComponent:se,memo:ft,forwardRef:pt,flushSync:Ht,unstable_batchedUpdates:Rt,StrictMode:Ut,Suspense:q,SuspenseList:I,lazy:yt,__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:kt};var Tt=Object.assign({},Ue||De),on=e=>{let t=!0;return{render(n){t&&(e.textContent="",t=!1),Y(n,e)},unmount(){Y(null,e)}}},un=Object.assign({},Tt,{createRoot:on});window.React=Tt;window.ReactDOM=un;})();

// GENERATED from dc-runtime/src/*.ts — do not edit. Rebuild with `cd dc-runtime && bun run build`.
"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/react.ts
  function getReact() {
    const R = window.React;
    if (!R) throw new Error("dc-runtime: window.React is not available yet");
    return R;
  }
  function getReactDOM() {
    const RD = window.ReactDOM;
    if (!RD) throw new Error("dc-runtime: window.ReactDOM is not available yet");
    return RD;
  }
  var h = ((...args) => getReact().createElement(
    ...args
  ));

  // src/parse.ts
  function parseDcDocument(doc) {
    const dc = doc.querySelector("x-dc");
    if (!dc) return null;
    const scriptEl = doc.querySelector("script[data-dc-script]");
    const { props, preview } = parseDataProps(
      scriptEl?.getAttribute("data-props") ?? null
    );
    return {
      template: dc.innerHTML,
      js: scriptEl ? scriptEl.textContent || "" : "",
      props,
      preview
    };
  }
  function parseDcText(src) {
    const openMatch = /<x-dc(?:\s[^>]*)?>/.exec(src);
    if (!openMatch) return null;
    const close = src.lastIndexOf("</x-dc>");
    if (close === -1 || close < openMatch.index) return null;
    const template = src.slice(openMatch.index + openMatch[0].length, close);
    const doc = new DOMParser().parseFromString(src, "text/html");
    const scriptEl = doc.querySelector("script[data-dc-script]");
    const { props, preview } = parseDataProps(
      scriptEl?.getAttribute("data-props") ?? null
    );
    return {
      template,
      js: scriptEl ? scriptEl.textContent || "" : "",
      props,
      preview
    };
  }
  function parseDataProps(raw) {
    if (!raw) return { props: null, preview: null };
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { props: null, preview: null };
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { props: null, preview: null };
    }
    const obj = parsed;
    const preview = obj.$preview && typeof obj.$preview === "object" ? obj.$preview : null;
    const rest = {};
    for (const k of Object.keys(obj)) {
      if (k[0] !== "$") rest[k] = obj[k];
    }
    return { props: Object.keys(rest).length ? rest : null, preview };
  }
  function dcNameFromPath(pathname) {
    let p = pathname || "";
    try {
      p = decodeURIComponent(p);
    } catch {
    }
    const base = p.split("/").pop() || "Root";
    return base.replace(/\.dc\.html$/, "").replace(/\.html?$/, "") || "Root";
  }

  // src/boot.ts
  var BASE_CSS = `
    .sc-placeholder{background:color-mix(in srgb,currentColor 8%,transparent);
      border:1px solid color-mix(in srgb,currentColor 50%,transparent);
      border-radius:2px;box-sizing:border-box;overflow:hidden}
    @keyframes sc-shine{0%{background-position:100% 50%}100%{background-position:0% 50%}}
    html.sc-dc-streaming .sc-placeholder,
    html.sc-dc-streaming .sc-interp.sc-missing{position:relative;
      background:color-mix(in srgb,currentColor 5%,transparent);
      border-color:transparent}
    html.sc-dc-streaming .sc-placeholder::before,
    html.sc-dc-streaming .sc-interp.sc-missing::before{content:'';
      position:absolute;inset:0;pointer-events:none;
      background:linear-gradient(90deg,rgba(217,119,87,0) 25%,rgba(247,225,211,.95) 37%,rgba(217,119,87,0) 63%);
      background-size:400% 100%;animation:sc-shine 1.4s ease infinite}
    html.sc-dc-streaming .sc-placeholder:nth-child(n+9 of .sc-placeholder)::before,
    html.sc-dc-streaming .sc-interp.sc-missing:nth-child(n+9 of .sc-interp.sc-missing)::before{animation:none;
      background:color-mix(in srgb,currentColor 8%,transparent)}
    .sc-placeholder-error{padding:4px 8px;font:11px/1.4 ui-monospace,monospace;
      color:color-mix(in srgb,currentColor 70%,transparent);word-break:break-word}
    .sc-interp.sc-missing{display:inline-block;width:2em;height:1em;overflow:hidden;
      vertical-align:text-bottom;background:rgba(255,255,255,.3);border:1px solid rgba(0,0,0,.5);
      border-radius:2px;box-sizing:border-box;color:transparent;
      user-select:none}
    .sc-interp.sc-unresolved{font-family:ui-monospace,monospace;font-size:.85em;
      color:color-mix(in srgb,currentColor 50%,transparent);
      background:color-mix(in srgb,currentColor 10%,transparent);border-radius:3px;
      padding:0 3px}
    .sc-host.sc-has-error{position:relative}
    .sc-logic-error{position:absolute;top:8px;left:8px;z-index:2147483647;max-width:60ch;
      padding:6px 10px;background:#b00020;color:#fff;font:12px/1.4 ui-monospace,monospace;
      border-radius:4px;white-space:pre-wrap;pointer-events:none}
    /* Mirrors PRINT_BASELINE_CSS in apps/web deck-stage-export.ts \u2014 keep both
       in sync until dc-runtime regains a build step. */
    @media print {
      @page { margin: 0.5cm; }
      figure, table { break-inside: avoid; }
      #dc-root, #dc-root > .sc-host { height: auto; }
      *, *::before, *::after {
        print-color-adjust: exact; -webkit-print-color-adjust: exact;
        backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
        animation-delay: -99s !important; animation-duration: .001s !important;
        animation-iteration-count: 1 !important; animation-fill-mode: both !important;
        animation-play-state: running !important; transition-duration: 0s !important;
      }
    }
  `;
  var FULL_PAGE_CSS = "html,body{height:100%;margin:0}#dc-root,#dc-root>.sc-host{height:100%}";
  function rootNameForDocument(doc, loc) {
    let bootPath = loc.pathname || "";
    if (!/\.dc\.html?$/i.test(safeDecode(bootPath))) {
      try {
        bootPath = new URL(doc.baseURI || "/").pathname;
      } catch {
      }
    }
    return dcNameFromPath(bootPath);
  }
  function safeDecode(s) {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  }
  function boot(runtime, doc = document) {
    const parsed = parseDcDocument(doc);
    if (!parsed) return null;
    const React = getReact();
    const rootName = rootNameForDocument(doc, location);
    runtime.markFetched(rootName);
    runtime.setRootName(rootName);
    runtime.adoptParsed(rootName, parsed);
    if (!window.__resources) {
      fetch(location.href).then((res) => res.ok ? res.text() : "").then((t) => {
        const raw = t ? parseDcText(t) : null;
        if (raw?.template) runtime.updateHtml(rootName, raw.template);
      }).catch(() => {
      });
    }
    const dc = doc.querySelector("x-dc");
    const hostEl = doc.createElement("div");
    hostEl.id = "dc-root";
    dc.replaceWith(hostEl);
    if (!parsed.preview) {
      const s = doc.createElement("style");
      s.textContent = FULL_PAGE_CSS;
      doc.head.appendChild(s);
    }
    const Root = runtime.getDC(rootName);
    const entry = runtime.registry.get(rootName);
    function StandaloneRoot() {
      const [, setTick] = React.useState(0);
      React.useEffect(() => {
        const sub = () => setTick((n) => n + 1);
        entry.subs.add(sub);
        return () => {
          entry.subs.delete(sub);
        };
      }, []);
      const defaults = React.useMemo(() => {
        const d = {};
        for (const k in entry.propsMeta || {}) {
          const v = entry.propsMeta?.[k]?.default;
          if (v !== void 0) d[k] = v;
        }
        return d;
      }, [entry.propsMeta]);
      return h(Root, { ...defaults, ...entry.propOverrides || {} });
    }
    const ReactDOM = getReactDOM();
    if (ReactDOM.createRoot)
      ReactDOM.createRoot(hostEl).render(h(StandaloneRoot));
    else ReactDOM.render(h(StandaloneRoot), hostEl);
    return rootName;
  }

  // src/expr.ts
  var IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*/;
  var NUMBER_RE = /^-?\d+(\.\d+)?$/;
  function resolve(vals, src) {
    const expr = String(src).trim();
    if (!expr) return void 0;
    if (expr[0] === "(" && expr[expr.length - 1] === ")" && parensWrapWhole(expr)) {
      return resolve(vals, expr.slice(1, -1));
    }
    const eq = findTopLevelEquality(expr);
    if (eq) {
      const lv = resolve(vals, expr.slice(0, eq.index));
      const rv = resolve(vals, expr.slice(eq.index + eq.op.length));
      switch (eq.op) {
        case "===":
          return lv === rv;
        case "!==":
          return lv !== rv;
        case "==":
          return lv == rv;
        default:
          return lv != rv;
      }
    }
    if (expr[0] === "!") return !resolve(vals, expr.slice(1));
    if (expr === "true") return true;
    if (expr === "false") return false;
    if (expr === "null") return null;
    if (expr === "undefined") return void 0;
    if (NUMBER_RE.test(expr)) return Number(expr);
    if (expr.length >= 2 && (expr[0] === '"' || expr[0] === "'") && expr[expr.length - 1] === expr[0]) {
      return expr.slice(1, -1);
    }
    return resolvePath(vals, expr);
  }
  function parensWrapWhole(expr) {
    let depth = 0;
    for (let i = 0; i < expr.length - 1; i++) {
      if (expr[i] === "(") depth++;
      else if (expr[i] === ")") {
        depth--;
        if (depth === 0) return false;
      }
    }
    return true;
  }
  function findTopLevelEquality(expr) {
    let depth = 0;
    for (let i = 0; i < expr.length; i++) {
      const c = expr[i];
      if (c === "[" || c === "(") depth++;
      else if (c === "]" || c === ")") depth--;
      else if (depth === 0 && (c === "=" || c === "!") && expr[i + 1] === "=") {
        if (i > 0 && (expr[i - 1] === "=" || expr[i - 1] === "!")) continue;
        if (!expr.slice(0, i).trim()) continue;
        const op = expr[i + 2] === "=" ? c + "==" : c + "=";
        return { index: i, op };
      }
    }
    return null;
  }
  function resolvePath(vals, expr) {
    const head = expr.match(IDENT_RE);
    if (!head) return void 0;
    let cur = vals == null ? void 0 : vals[head[0]];
    let i = head[0].length;
    while (i < expr.length) {
      if (expr[i] === ".") {
        const m = expr.slice(i + 1).match(IDENT_RE) || expr.slice(i + 1).match(/^\d+/);
        if (!m) return void 0;
        cur = cur == null ? void 0 : cur[m[0]];
        i += 1 + m[0].length;
      } else if (expr[i] === "[") {
        let depth = 1;
        let j = i + 1;
        while (j < expr.length && depth > 0) {
          if (expr[j] === "[") depth++;
          else if (expr[j] === "]") {
            depth--;
            if (depth === 0) break;
          }
          j++;
        }
        if (depth !== 0) return void 0;
        const key = resolve(vals, expr.slice(i + 1, j));
        cur = cur == null ? void 0 : cur[key];
        i = j + 1;
      } else {
        return void 0;
      }
    }
    return cur;
  }

  // src/encode.ts
  var CAMEL_ATTR = "sc-camel-";
  var INLINE_TEXT_TAGS = new Set(
    "a abbr b bdi bdo br cite code del dfn em i ins kbd mark q s samp small span strike strong sub sup u var wbr".split(
      " "
    )
  );
  var RAW_WRAP = {
    select: "sc-raw-select",
    table: "sc-raw-table",
    tbody: "sc-raw-tbody",
    thead: "sc-raw-thead",
    tfoot: "sc-raw-tfoot",
    tr: "sc-raw-tr",
    td: "sc-raw-td",
    th: "sc-raw-th",
    caption: "sc-raw-caption"
  };
  var RAW_UNWRAP = Object.fromEntries(
    Object.entries(RAW_WRAP).map(([k, v]) => [v, k])
  );
  var EVENT_MAP = {
    onclick: "onClick",
    onchange: "onChange",
    oninput: "onInput",
    onsubmit: "onSubmit",
    onkeydown: "onKeyDown",
    onkeyup: "onKeyUp",
    onkeypress: "onKeyPress",
    onmousedown: "onMouseDown",
    onmouseup: "onMouseUp",
    onmouseenter: "onMouseEnter",
    onmouseleave: "onMouseLeave",
    onfocus: "onFocus",
    onblur: "onBlur",
    ondoubleclick: "onDoubleClick",
    oncontextmenu: "onContextMenu",
    onmousemove: "onMouseMove",
    onmouseover: "onMouseOver",
    onmouseout: "onMouseOut",
    onpointerdown: "onPointerDown",
    onpointerup: "onPointerUp",
    onpointermove: "onPointerMove",
    onpointerenter: "onPointerEnter",
    onpointerleave: "onPointerLeave",
    onpointercancel: "onPointerCancel",
    onpointerover: "onPointerOver",
    onpointerout: "onPointerOut",
    ongotpointercapture: "onGotPointerCapture",
    onlostpointercapture: "onLostPointerCapture",
    ontouchstart: "onTouchStart",
    ontouchend: "onTouchEnd",
    ontouchmove: "onTouchMove",
    ontouchcancel: "onTouchCancel",
    ondragstart: "onDragStart",
    ondragend: "onDragEnd",
    ondragenter: "onDragEnter",
    ondragleave: "onDragLeave",
    ondragover: "onDragOver",
    onanimationstart: "onAnimationStart",
    onanimationend: "onAnimationEnd",
    onanimationiteration: "onAnimationIteration",
    ontransitionend: "onTransitionEnd"
  };
  var ATTRS = `(?:[^>"']|"[^"]*"|'[^']*')*`;
  var IMPORT_SELF_CLOSE_RE = new RegExp(
    "<(x-import|dc-import)(" + ATTRS + ")/>",
    "gi"
  );
  var CAMEL_ATTR_RE = /(\s)([a-z]+[A-Z][A-Za-z0-9]*)(\s*=)/g;
  function encodeCamelAttrs(html) {
    return html.replace(
      CAMEL_ATTR_RE,
      (_, sp, name, eq) => sp + CAMEL_ATTR + name.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()) + eq
    );
  }
  function encodeCase(html) {
    html = html.replace(
      IMPORT_SELF_CLOSE_RE,
      (_, t, a) => "<" + t + a + "></" + t + ">"
    );
    html = html.replace(/<helmet(\s|>)/gi, "<sc-helmet$1");
    html = html.replace(/<\/helmet\s*>/gi, "</sc-helmet>");
    html = encodeCamelAttrs(html);
    for (const [real, alias] of Object.entries(RAW_WRAP)) {
      html = html.replace(
        new RegExp("(</?)" + real + "(?=[\\s>])", "gi"),
        "$1" + alias
      );
    }
    return html;
  }
  function kebabToCamel(s) {
    return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  }
  function cssToObj(css) {
    const o = {};
    for (const decl of css.split(";")) {
      const i = decl.indexOf(":");
      if (i < 0) continue;
      const prop = decl.slice(0, i).trim();
      o[prop.startsWith("--") ? prop : kebabToCamel(prop)] = decl.slice(i + 1).trim();
    }
    return o;
  }
  function compileAttr(raw) {
    const whole = raw.match(/^\s*\{\{([\s\S]+?)\}\}\s*$/);
    if (whole) {
      const path = whole[1];
      return (vals) => resolve(vals, path);
    }
    if (raw.includes("{{")) {
      const parts = raw.split(/\{\{([\s\S]+?)\}\}/g);
      return (vals) => parts.map((s, i) => i & 1 ? resolve(vals, s) ?? "" : s).join("");
    }
    return () => raw;
  }

  // src/compile.ts
  function collectProps(node, kind, host) {
    const propGetters = [];
    const pseudoClasses = [];
    let hintSize = null;
    for (const { name, value } of [...node.attributes]) {
      if (name === "sc-name" || name === "data-dc-tpl") continue;
      let key = name;
      if (key.startsWith(CAMEL_ATTR))
        key = kebabToCamel(key.slice(CAMEL_ATTR.length));
      if (key === "hint-size") {
        hintSize = value;
        continue;
      }
      if (key.startsWith("style-")) {
        pseudoClasses.push(host.pseudoClass(key.slice(6), value));
        continue;
      }
      if (kind !== "dom") {
        if (key.includes("-") && !(kind === "x-import" && (key.startsWith("aria-") || key.startsWith("data-"))))
          key = kebabToCamel(key);
      } else {
        if (key === "class") key = "className";
        else if (key === "for") key = "htmlFor";
        else if (key.startsWith("on"))
          key = EVENT_MAP[key] || "on" + key[2].toUpperCase() + key.slice(3);
      }
      propGetters.push([key, compileAttr(value)]);
    }
    return { propGetters, pseudoClasses, hintSize };
  }
  var HOST_STYLE_PROPS = /* @__PURE__ */ new Set([
    "position",
    "left",
    "right",
    "top",
    "bottom",
    "inset",
    "width",
    "height",
    "z-index",
    "transform"
  ]);
  function hostPositionStyle(style) {
    const all = typeof style === "string" ? cssToObj(style) : style != null && typeof style === "object" ? style : null;
    if (!all) return void 0;
    const out = {};
    for (const [k, v] of Object.entries(all)) {
      const kebab = k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
      if (HOST_STYLE_PROPS.has(kebab)) out[k] = v;
    }
    return Object.keys(out).length ? out : void 0;
  }
  function compileTemplate(html, host) {
    const tpl = document.createElement("template");
    //! nosemgrep: direct-inner-html-assignment
    tpl.innerHTML = encodeCase(html);
    let tplN = 0;
    (function stamp(node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        node.setAttribute("data-dc-tpl", String(tplN++));
      }
      for (const c of node.childNodes) stamp(c);
    })(tpl.content);
    const builders = walkChildren(tpl.content, host);
    const render = ((vals, ctx) => builders.map((b, i) => b(vals || {}, ctx, i)));
    render.__annotated = tpl.innerHTML;
    return render;
  }
  function walkChildren(node, host) {
    return [...node.childNodes].map((c) => walk(c, host)).filter((b) => b != null);
  }
  var SLIDE_ID_VALUE_RE = /^[0-9a-f]{8}$/;
  var DECK_CONTROL_FLOW_RE = /^(sc-if|sc-for|sc-else|dc-import|x-import)$/;
  var DECK_AUX_RE = /^(template|script|style|sc-helmet|helmet)$/;
  function isDeckMountTag(el) {
    if (el.localName === "deck-stage") return true;
    return el.localName === "x-import" && (el.getAttribute("component-from-global-scope") || "") === "deck-stage";
  }
  function walkDeckChildren(el, host) {
    const pairs = [...el.childNodes].map((c) => ({ c, b: walk(c, host) })).filter((p) => p.b !== null);
    const kids = pairs.map((p) => p.b);
    const seen = /* @__PURE__ */ new Set();
    const wsSeen = /* @__PURE__ */ new Map();
    const keys = [];
    const nextSlideId = new Array(pairs.length);
    {
      let upcoming = null;
      for (let j = pairs.length - 1; j >= 0; j--) {
        const n = pairs[j].c;
        if (n.nodeType === Node.ELEMENT_NODE) {
          const t = n.localName;
          upcoming = !DECK_AUX_RE.test(t) && !DECK_CONTROL_FLOW_RE.test(t) ? n.getAttribute("data-om-slide-id") : null;
        }
        nextSlideId[j] = upcoming;
      }
    }
    for (let j = 0; j < pairs.length; j++) {
      const { c } = pairs[j];
      if (c.nodeType === Node.TEXT_NODE) {
        if ((c.nodeValue ?? "").trim() === "") {
          const base = nextSlideId[j] ? "omid-ws:" + nextSlideId[j] : "omid-ws:aux";
          const n = wsSeen.get(base) ?? 0;
          wsSeen.set(base, n + 1);
          keys.push(n === 0 ? base : base + ":" + n);
          continue;
        }
        return { kids, keys: null };
      }
      if (c.nodeType !== Node.ELEMENT_NODE) {
        keys.push(j);
        continue;
      }
      const child = c;
      const tag = child.localName;
      if (DECK_AUX_RE.test(tag)) {
        keys.push(j);
        continue;
      }
      if (DECK_CONTROL_FLOW_RE.test(tag)) return { kids, keys: null };
      const v = child.getAttribute("data-om-slide-id");
      if (!v || !SLIDE_ID_VALUE_RE.test(v) || seen.has(v)) {
        return { kids, keys: null };
      }
      seen.add(v);
      keys.push("omid:" + v);
    }
    return { kids, keys };
  }
  function renderDeckKids(kids, kidKeys, vals, ctx) {
    return kids.map((b, j) => {
      const k = kidKeys ? kidKeys[j] : j;
      const out = b(vals, ctx, k);
      return kidKeys != null && typeof out === "string" ? h(getReact().Fragment, { key: k }, out) : out;
    });
  }
  function walk(node, host) {
    if (node.nodeType === Node.TEXT_NODE) return walkText(node);
    if (node.nodeType !== Node.ELEMENT_NODE) return null;
    const el = node;
    const tag = el.tagName.toLowerCase();
    if (tag === "sc-for") return walkFor(el, host);
    if (tag === "sc-if") return walkIf(el, host);
    if (tag === "x-import") return walkXImport(el, host);
    if (tag === "sc-helmet") return host.helmet(el);
    if (tag === "dc-import") return walkComponent(el, host);
    return walkElement(el, host);
  }
  var warnedHoles = /* @__PURE__ */ new Set();
  function warnUnresolved(ctx, what) {
    const key = (ctx?.__name || "?") + "\0" + what;
    if (warnedHoles.has(key)) return;
    warnedHoles.add(key);
    console.warn("[dc-runtime] " + (ctx?.__name || "template") + ": " + what);
  }
  function walkText(node) {
    const txt = node.nodeValue ?? "";
    if (!txt.includes("{{")) {
      if (!txt.trim() && !txt.includes(" ")) return null;
      return () => txt;
    }
    const parts = txt.split(/\{\{([\s\S]+?)\}\}/g);
    return (vals, ctx, key) => h(
      getReact().Fragment,
      { key },
      ...parts.map((p, i) => {
        if (!(i & 1)) return p;
        const v = resolve(vals, p);
        if (v === void 0) {
          if (!ctx?.__streamingNow) {
            if (document.body?.hasAttribute("data-dc-editor-on")) {
              return h(
                "span",
                { key: i, className: "sc-interp sc-unresolved" },
                "{{ " + p.trim() + " }}"
              );
            }
            warnUnresolved(
              ctx,
              "{{ " + p.trim() + " }} never resolved \u2014 rendered as empty"
            );
            return null;
          }
          return h(
            "span",
            { key: i, className: "sc-interp sc-missing" },
            p.trim()
          );
        }
        if (getReact().isValidElement(v) || Array.isArray(v)) {
          return h(getReact().Fragment, { key: i }, v);
        }
        if (v === null || typeof v === "boolean") return null;
        return h("span", { key: i, className: "sc-interp" }, String(v));
      })
    );
  }
  function walkFor(el, host) {
    const listGet = compileAttr(el.getAttribute("list") || "");
    const asName = el.getAttribute("as") || "item";
    const hintN = parseInt(el.getAttribute("hint-placeholder-count") || "0", 10);
    const kids = walkChildren(el, host);
    const listSrc = el.getAttribute("list") || "";
    return (vals, ctx, key) => {
      let list = listGet(vals);
      if (!Array.isArray(list)) {
        if (!ctx?.__streamingNow) {
          if (list !== void 0 && list !== null) {
            warnUnresolved(
              ctx,
              'sc-for list="' + listSrc + '" is not an array (' + typeof list + ")"
            );
          }
          list = [];
        } else {
          list = hintN > 0 ? Array(hintN).fill(void 0) : [];
        }
      }
      return h(
        getReact().Fragment,
        { key },
        list.map((item, i) => {
          const sub = { ...vals, [asName]: item, $index: i };
          return h(
            getReact().Fragment,
            { key: i },
            kids.map((b, j) => b(sub, ctx, j))
          );
        })
      );
    };
  }
  function walkIf(el, host) {
    const valGet = compileAttr(el.getAttribute("value") || "");
    const hintRaw = el.getAttribute("hint-placeholder-val");
    const hintGet = hintRaw != null ? compileAttr(hintRaw) : null;
    const kids = walkChildren(el, host);
    return (vals, ctx, key) => {
      let v = valGet(vals);
      if (v === void 0 && hintGet && ctx?.__streamingNow) v = hintGet(vals);
      return v ? h(
        getReact().Fragment,
        { key },
        kids.map((b, j) => b(vals, ctx, j))
      ) : null;
    };
  }
  function walkComponent(el, host) {
    const name = el.getAttribute("name") || el.getAttribute("component") || "";
    el.removeAttribute("name");
    el.removeAttribute("component");
    const tplId = el.getAttribute("data-dc-tpl");
    const styleRaw = el.getAttribute("style");
    el.removeAttribute("style");
    const styleGet = styleRaw != null ? compileAttr(styleRaw) : null;
    const { propGetters, hintSize } = collectProps(el, "dc-import", host);
    const kids = walkChildren(el, host);
    return (vals, ctx, key) => {
      const props = {
        key,
        __hintSize: hintSize,
        __tplId: tplId,
        __hostStyle: styleGet ? hostPositionStyle(styleGet(vals)) : void 0
      };
      for (const [k, g] of propGetters) {
        const v = g(vals);
        if (k === "dcProps") {
          if (v && typeof v === "object") Object.assign(props, v);
          continue;
        }
        props[k] = v;
      }
      if (kids.length) props.children = kids.map((b, j) => b(vals, ctx, j));
      return h(host.component(name), props);
    };
  }
  function walkXImport(el, host) {
    const globalNameGet = compileAttr(
      el.getAttribute("component-from-global-scope") || ""
    );
    const exportNameGet = compileAttr(
      el.getAttribute("component") || el.getAttribute("name") || ""
    );
    const fromRaw = el.getAttribute("from") || (el.getAttribute("component-from-global-scope") ? "" : el.getAttribute("src") || el.getAttribute("import") || "");
    const urls = fromRaw.trim() ? fromRaw.trim().split(/\s+/) : [];
    const url = urls.length ? urls[urls.length - 1] : "";
    const kindOf = (u) => /\.(jsx|tsx)(\?|#|$)/i.test(u) ? "jsx" : "js";
    const tplId = el.getAttribute("data-dc-tpl");
    const styleRaw = el.getAttribute("style");
    el.removeAttribute("style");
    const styleGet = styleRaw != null ? compileAttr(styleRaw) : null;
    const wrap = tplId != null || styleGet != null;
    const { propGetters, hintSize } = collectProps(el, "x-import", host);
    const hasContent = el.children.length > 0 || !!(el.textContent || "").trim();
    const deckKeyed = hasContent && isDeckMountTag(el) ? walkDeckChildren(el, host) : null;
    const kids = deckKeyed ? deckKeyed.kids : hasContent ? walkChildren(el, host) : [];
    const kidKeys = deckKeyed?.keys ?? null;
    const urlBindable = fromRaw.includes("{{");
    if (urls.length && !urlBindable) {
      let prev;
      for (const u of urls) prev = host.loadExternal(kindOf(u), u, prev);
    }
    const evalName = (g, vals) => {
      const v = g(vals);
      const s = v == null ? "" : String(v);
      return s.includes("{{") ? "" : s;
    };
    return (vals, ctx, key) => {
      const globalName = evalName(globalNameGet, vals);
      const name = globalName || evalName(exportNameGet, vals);
      const C = !name || urlBindable ? null : globalName ? host.resolveExternalGlobal(url, globalName) : host.resolveExternal(url, name);
      const hostStyle = styleGet ? hostPositionStyle(styleGet(vals)) : void 0;
      const wrapper = wrap ? {
        key,
        className: "sc-host-x",
        "data-dc-tpl": tplId,
        style: hostStyle || { display: "contents" }
      } : null;
      if (!C) {
        const error = urlBindable ? "x-import `from` cannot contain {{ \u2026 }} \u2014 module URLs are resolved at parse time; use a literal URL" : host.resolveExternalError(url, name);
        const ph = host.placeholder({
          key: wrapper ? void 0 : key,
          name,
          hintSize,
          error
        });
        return wrapper ? h("div", wrapper, ph) : ph;
      }
      const props = wrapper ? {} : { key };
      let unresolvedHole = false;
      for (const [k, g] of propGetters) {
        if (k === "component" || k === "componentFromGlobalScope" || k === "from") {
          continue;
        }
        const v = g(vals);
        if (v === void 0) unresolvedHole = true;
        if (k === "dcProps") {
          if (v && typeof v === "object") Object.assign(props, v);
          continue;
        }
        props[k] = v;
      }
      if (unresolvedHole && ctx?.__htmlStreamingNow) {
        const ph = host.placeholder({
          key: wrapper ? void 0 : key,
          name,
          hintSize,
          error: null
        });
        return wrapper ? h("div", wrapper, ph) : ph;
      }
      if (kids.length) {
        props.children = renderDeckKids(kids, kidKeys, vals, ctx);
      }
      return wrapper ? h("div", wrapper, h(C, props)) : h(C, props);
    };
  }
  function contentKey(el) {
    const clone = el.cloneNode(true);
    for (const d of clone.querySelectorAll("*")) {
      while (d.attributes.length) d.removeAttribute(d.attributes[0].name);
    }
    const s = clone.innerHTML;
    let h2 = 5381;
    for (let i = 0; i < s.length; i++) h2 = (h2 << 5) + h2 + s.charCodeAt(i) | 0;
    return s.length + "." + (h2 >>> 0).toString(36);
  }
  var NEVER_CONTENT_KEYED = new Set(
    "script style textarea option title select canvas iframe video audio".split(
      " "
    )
  );
  var NOT_INLINE_SELECTOR = ":not(" + [...INLINE_TEXT_TAGS].join(",") + ")";
  function walkElement(el, host) {
    const realTag = RAW_UNWRAP[el.localName] || el.localName;
    const tplId = el.getAttribute("data-dc-tpl");
    const inlineOnly = el.childNodes.length > 0 && !NEVER_CONTENT_KEYED.has(realTag) && el.querySelector(NOT_INLINE_SELECTOR) === null;
    const keySuffix = inlineOnly ? "|" + contentKey(el) : "";
    const { propGetters, pseudoClasses } = collectProps(el, "dom", host);
    const deckKeyed = isDeckMountTag(el) ? walkDeckChildren(el, host) : null;
    const kids = deckKeyed ? deckKeyed.kids : walkChildren(el, host);
    const kidKeys = deckKeyed?.keys ?? null;
    return (vals, ctx, key) => {
      const props = {
        key: key + keySuffix,
        "data-dc-tpl": tplId
      };
      for (const [k, g] of propGetters) {
        let v = g(vals);
        if (k === "style" && typeof v === "string") v = cssToObj(v);
        if ((k === "value" || k === "checked") && v === void 0) {
          v = k === "checked" ? false : "";
        }
        props[k] = v;
      }
      if (pseudoClasses.length) {
        props.className = [props.className, ...pseudoClasses].filter(Boolean).join(" ");
      }
      return h(realTag, props, ...renderDeckKids(kids, kidKeys, vals, ctx));
    };
  }

  // src/logic.ts
  var StreamableLogic = class {
    constructor(props) {
      __publicField(this, "props");
      __publicField(this, "state", {});
      /** Back-pointer to the wrapper component, installed after construction. */
      __publicField(this, "__host");
      this.props = props || {};
    }
    setState(update, cb) {
      this.__host && this.__host.__setLogicState(update, cb);
    }
    forceUpdate() {
      this.__host && this.__host.forceUpdate();
    }
    componentDidMount() {
    }
    componentDidUpdate(_prevProps) {
    }
    componentWillUnmount() {
    }
    /** The flat object the template renders against (merged over props). */
    renderVals() {
      return {};
    }
  };
  function evalDcLogic(src) {
    //! nosemgrep: eval-and-function-constructor
    const fn = new Function(
      "DCLogic",
      "StreamableLogic",
      "React",
      src + '\n;return (typeof Component!=="undefined"&&Component)||undefined;'
    );
    return fn(StreamableLogic, StreamableLogic, getReact());
  }

  // src/component.ts
  function shallowEqual(a, b) {
    if (!b) return false;
    const ak = Object.keys(a).filter((k) => k !== "children");
    const bk = Object.keys(b).filter((k) => k !== "children");
    if (ak.length !== bk.length) return false;
    for (const k of ak) if (a[k] !== b[k]) return false;
    return true;
  }
  function Placeholder({
    name,
    hintSize,
    streaming,
    error
  }) {
    const [w, hgt] = (hintSize || "100%,60px").split(",");
    return h(
      "div",
      {
        className: "sc-placeholder" + (streaming ? " sc-streaming" : ""),
        style: { width: w.trim(), height: hgt && hgt.trim() },
        title: name
      },
      error ? h(
        "div",
        { className: "sc-placeholder-error" },
        (name ? name + ": " : "") + error
      ) : null
    );
  }
  function hintToMin(hint) {
    if (!hint) return void 0;
    const [w, hgt] = hint.split(",");
    return { minWidth: w.trim(), minHeight: hgt && hgt.trim() };
  }
  function createComponentFactory(registry, ensureFetched) {
    const React = getReact();
    const AncestorContext = React.createContext([]);
    class StreamableComponent extends React.Component {
      constructor(props) {
        super(props);
        __publicField(this, "__name");
        __publicField(this, "__sub");
        __publicField(this, "__needsDidMount", false);
        /** Snapshot of the registry's streaming flags taken at render time —
         *  builders read it off the RenderCtx (this) to pick placeholder vs
         *  render-nothing for unresolved values. */
        __publicField(this, "__streamingNow", false);
        __publicField(this, "__htmlStreamingNow", false);
        /** When a construct throws, remember the (class, registry.ver, props)
         *  triple so render-time reconcile doesn't re-attempt it on every parent
         *  re-render. A registry bump (new class, template, external module
         *  resolving via bumpAll) changes `ver` and breaks the memo so an
         *  env-dependent constructor can self-heal. */
        __publicField(this, "__failedLogic", null);
        __publicField(this, "__failedUserProps", null);
        __publicField(this, "__failedVer", -1);
        /** Per-instance constructor error — kept here (not on the registry entry)
         *  so one instance's successful construct can't hide a sibling's failure,
         *  and a construct can never wipe an eval error `updateJs` recorded on
         *  `r.logicError`. */
        __publicField(this, "__ctorError", null);
        __publicField(this, "logic");
        this.__name = props.__name;
        this.state = { __v: 0, __err: null };
        this.__sub = () => {
          if (this.state.__err) this.setState({ __err: null });
          this.forceUpdate();
        };
        this.__makeLogic(registry.get(this.__name).Logic, null);
        ensureFetched(this.__name);
      }
      /** Error-boundary hook: a render crash anywhere in this DC's subtree
       *  (its own template, an x-import'd component, a child DC without its
       *  own deeper boundary) lands here instead of unmounting the page. */
      static getDerivedStateFromError(e) {
        return { __err: e instanceof Error && e.message ? e.message : String(e) };
      }
      componentDidCatch(e, info) {
        console.error(
          "[dc-runtime] render error in <" + this.__name + ">:",
          e,
          info?.componentStack || ""
        );
      }
      /** Instantiate the logic class (or the no-op base) and adopt `prevState`
       *  over its initial state — used both at mount and on hot-swap. */
      __makeLogic(Logic, prevState) {
        const L = Logic || StreamableLogic;
        try {
          this.logic = new L(this.__userProps());
          this.__failedLogic = null;
          this.__failedUserProps = null;
          this.__ctorError = null;
        } catch (e) {
          console.error(e);
          this.__failedLogic = Logic;
          this.__failedUserProps = this.__userProps();
          this.__failedVer = registry.get(this.__name).ver;
          this.__ctorError = this.__name + ": " + (e instanceof Error && e.message ? e.message : String(e));
          this.logic = new StreamableLogic(
            this.__userProps()
          );
        }
        this.logic.__host = this;
        if (prevState)
          this.logic.state = { ...this.logic.state || {}, ...prevState };
      }
      /** The props the author's logic + template see — internal __-prefixed
       *  wiring stripped. */
      __userProps() {
        const { __name, __hintSize, __tplId, __hostStyle, ...rest } = this.props;
        return rest;
      }
      __setLogicState(update, cb) {
        const prev = this.logic.state;
        const patch = typeof update === "function" ? update(prev) : update;
        this.logic.state = { ...prev, ...patch };
        this.setState((s) => ({ __v: s.__v + 1 }), cb);
      }
      /** Swap the logic instance when the registry's Logic class changed
       *  (streaming completion, hot reload). State carries over; didMount
       *  re-fires after the swap commits so refs exist. */
      __reconcileLogic() {
        const r = registry.get(this.__name);
        const Next = r.Logic;
        const Cur = this.logic.constructor;
        if (Next === Cur || !Next && Cur === StreamableLogic || Next === this.__failedLogic && r.ver === this.__failedVer && shallowEqual(this.__userProps(), this.__failedUserProps)) {
          return;
        }
        if (!this.__needsDidMount) {
          try {
            this.logic.componentWillUnmount();
          } catch (e) {
            console.error(e);
          }
        }
        this.__makeLogic(Next, this.logic.state);
        this.__needsDidMount = true;
      }
      componentDidMount() {
        registry.get(this.__name).subs.add(this.__sub);
        try {
          this.logic.componentDidMount();
        } catch (e) {
          console.error(e);
        }
      }
      componentDidUpdate(prevProps) {
        this.logic.props = this.__userProps();
        if (this.__needsDidMount) {
          if (this.state.__err || !registry.get(this.__name).tpl) return;
          this.__needsDidMount = false;
          try {
            this.logic.componentDidMount();
          } catch (e) {
            console.error(e);
          }
        } else {
          try {
            this.logic.componentDidUpdate(prevProps);
          } catch (e) {
            console.error(e);
          }
        }
      }
      componentWillUnmount() {
        registry.get(this.__name).subs.delete(this.__sub);
        if (!this.__needsDidMount) {
          try {
            this.logic.componentWillUnmount();
          } catch (e) {
            console.error(e);
          }
        }
      }
      render() {
        const r = registry.get(this.__name);
        const cls = "sc-host" + (r.htmlStreaming ? " sc-streaming-html" : "") + (r.jsStreaming ? " sc-streaming-js" : "");
        const hintStyle = r.htmlStreaming ? hintToMin(this.props.__hintSize) : void 0;
        const hostStyle = this.props.__hostStyle || hintStyle ? { ...hintStyle || {}, ...this.props.__hostStyle || {} } : void 0;
        const hostBase = {
          className: cls,
          style: hostStyle,
          "data-sc-name": this.__name,
          "data-dc-tpl": this.props.__tplId
        };
        const chain = Array.isArray(this.context) ? this.context : [];
        if (chain.includes(this.__name)) {
          const cycle = [
            ...chain.slice(chain.indexOf(this.__name)),
            this.__name
          ].join(" \u2192 ");
          return h(
            "div",
            { ...hostBase, className: cls + " sc-has-error" },
            h(Placeholder, {
              name: this.__name,
              hintSize: this.props.__hintSize,
              error: "circular import: " + cycle
            })
          );
        }
        if (this.state.__err) {
          return h(
            "div",
            { ...hostBase, className: cls + " sc-has-error" },
            h(
              "div",
              { className: "sc-logic-error", "data-omelette-chrome": "" },
              this.__name + ": " + this.state.__err
            ),
            h(Placeholder, {
              name: this.__name,
              hintSize: this.props.__hintSize,
              error: this.state.__err
            })
          );
        }
        this.__reconcileLogic();
        if (!r.tpl) {
          return h(
            "div",
            hostBase,
            h(Placeholder, { name: this.__name, hintSize: this.props.__hintSize })
          );
        }
        const userProps = this.__userProps();
        this.logic.props = userProps;
        let vals = userProps;
        let renderErr = r.logicError || this.__ctorError;
        try {
          vals = { ...userProps, ...this.logic.renderVals() || {} };
        } catch (e) {
          console.error(e);
          renderErr = this.__name + ".renderVals(): " + (e instanceof Error && e.message ? e.message : String(e));
        }
        this.__streamingNow = !!(r.htmlStreaming || r.jsStreaming);
        this.__htmlStreamingNow = !!r.htmlStreaming;
        return h(
          "div",
          { ...hostBase, className: cls + (renderErr ? " sc-has-error" : "") },
          renderErr && h(
            "div",
            { className: "sc-logic-error", "data-omelette-chrome": "" },
            renderErr
          ),
          h(
            AncestorContext.Provider,
            { value: [...chain, this.__name] },
            r.tpl(vals, this)
          )
        );
      }
    }
    __publicField(StreamableComponent, "contextType", AncestorContext);
    const named = /* @__PURE__ */ new Map();
    function getDC(name) {
      const hit = named.get(name);
      if (hit) return hit;
      function Dispatcher(p) {
        const [, setTick] = React.useState(0);
        React.useEffect(() => {
          const sub = () => setTick((n) => n + 1);
          registry.get(name).subs.add(sub);
          return () => {
            registry.get(name).subs.delete(sub);
          };
        }, []);
        ensureFetched(name);
        return h(StreamableComponent, { ...p, __name: name });
      }
      Dispatcher.displayName = name;
      named.set(name, Dispatcher);
      return Dispatcher;
    }
    return {
      getDC,
      StreamableComponent
    };
  }

  // src/bundled.ts
  function bundledBlob(url) {
    const blobs = window.__resourceBlobs;
    const b = blobs ? blobs[url.split("#")[0]] : void 0;
    return b instanceof Blob ? b : null;
  }

  // src/cdn.ts
  var REACT_URL = "https://unpkg.com/react@18.3.1/umd/react.production.min.js";
  var REACT_SRI = "sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z";
  var REACT_DOM_URL = "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js";
  var REACT_DOM_SRI = "sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1";
  var BABEL_URL = "https://unpkg.com/@babel/standalone@7.29.0/babel.min.js";
  var BABEL_SRI = "sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y";
  function cdnScriptFor(url, sri) {
    const res = window.__resources;
    const v = res ? res[url] : void 0;
    return typeof v === "string" && v ? { src: v } : { src: url, integrity: sri };
  }

  // src/external.ts
  var isCustomElementName = (n) => !n.includes(".") && n.includes("-");
  function isRenderableType(g) {
    if (typeof g === "function") return !isElementClass(g);
    return typeof g === "object" && g !== null && typeof g.$$typeof === "symbol";
  }
  function resolveDottedPath(root, name) {
    let cur = root;
    for (const seg of name.split(".")) {
      if (cur == null) return void 0;
      cur = cur[seg];
    }
    return cur;
  }
  var GLOBAL_POLL_INTERVAL_MS = 50;
  var GLOBAL_POLL_TIMEOUT_MS = 3e4;
  function createExternalModules(onResolved) {
    const cache = /* @__PURE__ */ new Map();
    let babelLoading = null;
    const reportedMissing = /* @__PURE__ */ new Map();
    const polling = /* @__PURE__ */ new Set();
    function ensureBabel() {
      if (window.Babel) return Promise.resolve();
      if (babelLoading) return babelLoading;
      const babel = cdnScriptFor(BABEL_URL, BABEL_SRI);
      babelLoading = new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = babel.src;
        if (babel.integrity) {
          s.integrity = babel.integrity;
          s.crossOrigin = "anonymous";
        }
        s.onload = () => res();
        s.onerror = rej;
        document.head.appendChild(s);
      });
      return babelLoading;
    }
    const pending = /* @__PURE__ */ new Map();
    function load(kind, url, after) {
      const existing = pending.get(url);
      if (existing) return existing;
      cache.set(url, null);
      console.info("[dc-runtime] x-import: loading", url, "(" + kind + ")");
      const ready = Promise.all([
        kind === "jsx" ? ensureBabel() : Promise.resolve(),
        after ?? Promise.resolve()
      ]);
      const p = ready.then(() => {
        const pre = bundledBlob(url);
        if (pre) return pre.text();
        return fetch(url).then((r) => {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.text();
        });
      }).then((src) => {
        const code = kind === "jsx" ? window.Babel.transform(src, {
          filename: url,
          presets: ["react", "typescript"]
        }).code : src;
        const module = { exports: {} };
        const before = new Set(Object.keys(window));
        //! nosemgrep: eval-and-function-constructor
        new Function("React", "module", "exports", "require", code)(
          getReact(),
          module,
          module.exports,
          () => ({})
        );
        const globals = {};
        for (const k of Object.keys(window)) {
          if (!before.has(k) && typeof window[k] === "function") {
            globals[k] = window[k];
          }
        }
        cache.set(url, { mod: module.exports, globals });
        console.info(
          "[dc-runtime] x-import: loaded",
          url,
          "\u2014 exports:",
          Object.keys(module.exports),
          "window globals:",
          Object.keys(globals)
        );
        onResolved();
      }).catch((e) => {
        cache.set(url, {
          mod: {},
          globals: {},
          error: "failed to load: " + (e instanceof Error && e.message ? e.message : String(e))
        });
        console.error(
          "[dc-runtime] x-import: FAILED to load",
          url,
          "(" + kind + ")",
          e
        );
        onResolved();
      });
      pending.set(url, p);
      return p;
    }
    function resolve2(url, name) {
      const entry = cache.get(url);
      if (!entry) return null;
      const { mod, globals } = entry;
      const C = mod && mod[name] || globals && globals[name] || typeof window !== "undefined" && window[name] || mod && mod.default;
      if (typeof C === "function") return C;
      const key = url + "\0" + name;
      if (!reportedMissing.has(key)) {
        reportedMissing.set(
          key,
          entry.error || 'no export named "' + name + '" (has: ' + Object.keys(mod).join(", ") + ")"
        );
        console.error(
          "[dc-runtime] x-import: module",
          url,
          "loaded but has no component named",
          JSON.stringify(name),
          "\u2014 available exports:",
          Object.keys(mod),
          "window globals:",
          Object.keys(globals),
          ". The module must `module.exports = {" + name + "}` or set `window." + name + "`."
        );
      }
      return null;
    }
    function waitForGlobal(name) {
      if (polling.has(name)) return;
      polling.add(name);
      const started = Date.now();
      const isCE = isCustomElementName(name);
      const tick = () => {
        const found = isCE ? customElements.get(name) : isRenderableType(resolveDottedPath(window, name));
        if (found) {
          polling.delete(name);
          onResolved();
          return;
        }
        if (Date.now() - started >= GLOBAL_POLL_TIMEOUT_MS) {
          console.warn(
            "[dc-runtime] x-import: global",
            JSON.stringify(name),
            "never appeared on window after " + GLOBAL_POLL_TIMEOUT_MS + "ms"
          );
          return;
        }
        setTimeout(tick, GLOBAL_POLL_INTERVAL_MS);
      };
      setTimeout(tick, GLOBAL_POLL_INTERVAL_MS);
    }
    function resolveGlobal(url, name) {
      const isCE = isCustomElementName(name);
      if (!url) {
        if (isCE) {
          if (customElements.get(name)) return name;
          waitForGlobal(name);
          return null;
        }
        const g2 = resolveDottedPath(window, name);
        if (isRenderableType(g2)) return g2;
        waitForGlobal(name);
        return null;
      }
      const entry = cache.get(url);
      if (!entry) return null;
      if (isCE && customElements.get(name)) return name;
      const g = entry.globals[name] ?? resolveDottedPath(window, name);
      if (isRenderableType(g)) return g;
      if (name.includes(".")) return null;
      const key = url + "\0global\0" + name;
      if (!reportedMissing.has(key)) {
        reportedMissing.set(key, null);
        if (isCE && !customElements.get(name)) {
          console.warn(
            "[dc-runtime] x-import:",
            url,
            "loaded but no custom element",
            JSON.stringify(name),
            "is registered and window." + name + " is not a function \u2014 rendering <" + name + "> as an unknown element."
          );
        }
      }
      return name;
    }
    function getError(url, name) {
      const entry = cache.get(url);
      if (entry?.error) return entry.error;
      return reportedMissing.get(url + "\0" + name) || null;
    }
    return { load, resolve: resolve2, resolveGlobal, getError };
  }
  function isElementClass(g) {
    try {
      return typeof g === "function" && typeof HTMLElement !== "undefined" && g.prototype instanceof HTMLElement;
    } catch {
      return false;
    }
  }

  // src/atomics.ts
  var ATOMIC_CSS = (
    // layout
    ".fx{display:flex}.col{display:flex;flex-direction:column}.grid{display:grid}.ac{align-items:center}.jc{justify-content:center}.jb{justify-content:space-between}.f1{flex:1}.noshrink{flex-shrink:0}.wrap{flex-wrap:wrap}.fw5{font-weight:500}.fw6{font-weight:600}.fw7{font-weight:700}.fw8{font-weight:800}.fs11{font-size:11px}.fs12{font-size:12px}.fs13{font-size:13px}.fs14{font-size:14px}.fs15{font-size:15px}.fs16{font-size:16px}.fs20{font-size:20px}.fs22{font-size:22px}.upper{text-transform:uppercase}.tc{text-align:center}.nowrap{white-space:nowrap}.gap8{gap:8px}.gap10{gap:10px}.gap12{gap:12px}.gap16{gap:16px}.gap24{gap:24px}.m0{margin:0}.mt8{margin-top:8px}.mt12{margin-top:12px}.mt16{margin-top:16px}.mb8{margin-bottom:8px}.mb12{margin-bottom:12px}.mb16{margin-bottom:16px}.posrel{position:relative}.posabs{position:absolute}.round{border-radius:50%}.ohide{overflow:hidden}.bbox{box-sizing:border-box}.pointer{cursor:pointer}.w100{width:100%}.b0{border:none}"
  );

  // src/helmet.ts
  var DESIGN_DOC_MODE_RE = /<meta\b[^>]*\bname\s*=\s*["']design_doc_mode["'][^>]*\b(?:content|value)\s*=\s*["'](\w+)["']/i;
  var CANVAS_BG_LIGHT = "#f0eee6";
  var CANVAS_BG_DARK = "#2e2c26";
  function createHelmetManager(doc, isStreaming) {
    const mounted = /* @__PURE__ */ new Set();
    const live = /* @__PURE__ */ new Map();
    let designDocMode = null;
    let canvasStyleEl = null;
    let appTheme = "light";
    try {
      const ds = doc.documentElement.dataset.theme;
      appTheme = ds === "dark" || ds === "light" ? ds : new URLSearchParams(doc.defaultView?.location.search ?? "").get(
        "theme"
      ) === "dark" ? "dark" : "light";
    } catch {
    }
    function applyCanvasBg() {
      if (!canvasStyleEl) return;
      const bg = appTheme === "dark" ? CANVAS_BG_DARK : CANVAS_BG_LIGHT;
      canvasStyleEl.textContent = `html,body{background:${bg}}#dc-root>.sc-host{position:relative}`;
    }
    function postDesignMode(mode) {
      if (window.parent === window) return;
      try {
        window.parent.postMessage({ type: "__dc_design_mode", mode }, "*");
      } catch {
      }
    }
    function setDesignDocMode(mode) {
      if (mode === designDocMode) return;
      designDocMode = mode;
      postDesignMode(mode);
      if (mode === "canvas") {
        doc.documentElement.setAttribute("data-dc-canvas", "");
        canvasStyleEl = doc.createElement("style");
        canvasStyleEl.setAttribute("data-dc-canvas", "");
        applyCanvasBg();
        doc.head.appendChild(canvasStyleEl);
      } else {
        doc.documentElement.removeAttribute("data-dc-canvas");
        canvasStyleEl?.remove();
        canvasStyleEl = null;
      }
    }
    window.addEventListener("message", (e) => {
      const type = e.data && e.data.type;
      if (type === "__dc_theme") {
        const t = e.data.theme;
        if (t === "light" || t === "dark") {
          appTheme = t;
          applyCanvasBg();
        }
        return;
      }
      if (!designDocMode || type !== "__dc_probe") return;
      postDesignMode(designDocMode);
    });
    function compile(node) {
      const raw = [...node.children];
      const helmetClosed = node.nextSibling != null || node.parentNode?.nextSibling != null;
      if (node.hasAttribute("data-dc-atomics") && !mounted.has("__dc-atomics")) {
        mounted.add("__dc-atomics");
        const el = doc.createElement("style");
        el.id = "__dc-atomics";
        el.textContent = ATOMIC_CSS;
        doc.head.appendChild(el);
      }
      return (_vals, ctx) => {
        const name = ctx && ctx.__name || "";
        const streaming = !!(name && isStreaming(name));
        for (let i = 0; i < raw.length; i++) {
          const child = raw[i];
          const tag = child.tagName;
          const mayBePartial = streaming && !helmetClosed && i === raw.length - 1;
          if (tag === "SCRIPT") {
            if (mayBePartial) continue;
            const key = "SCRIPT|" + (child.getAttribute("src") || child.textContent || "");
            if (mounted.has(key)) continue;
            mounted.add(key);
            const el = doc.createElement("script");
            for (const { name: an, value } of [...child.attributes])
              el.setAttribute(an, value);
            if (child.textContent) el.textContent = child.textContent;
            doc.head.appendChild(el);
          } else if (tag === "LINK" || tag === "META") {
            if (mayBePartial) continue;
            const key = tag + "|" + (child.getAttribute("href") || child.getAttribute("src") || child.outerHTML);
            if (mounted.has(key)) continue;
            mounted.add(key);
            if (tag === "LINK") {
              const rel = (child.getAttribute("rel") || "").toLowerCase().split(/\s+/);
              const href = (child.getAttribute("href") || "").trim();
              const res = window.__resources;
              const pre = res && rel.includes("stylesheet") && !rel.includes("alternate") ? res[href] : void 0;
              const blob = typeof pre === "string" && pre ? bundledBlob(pre) : null;
              if (blob) {
                const el = doc.createElement("style");
                if (child.hasAttribute("disabled")) {
                  el.setAttribute("media", "not all");
                } else if (child.getAttribute("media")) {
                  el.setAttribute("media", child.getAttribute("media"));
                }
                if (child.getAttribute("title"))
                  el.setAttribute("title", child.getAttribute("title"));
                void blob.text().then((css) => {
                  el.textContent = css;
                });
                doc.head.appendChild(el);
                continue;
              }
            }
            doc.head.appendChild(child.cloneNode(true));
          } else {
            const key = name + "|" + i;
            let el = live.get(key);
            if (!el || el.tagName !== tag) {
              if (el) el.remove();
              el = doc.createElement(tag.toLowerCase());
              live.set(key, el);
              doc.head.appendChild(el);
            }
            for (const { name: an, value } of [...child.attributes]) {
              if (el.getAttribute(an) !== value) el.setAttribute(an, value);
            }
            if (el.textContent !== child.textContent)
              el.textContent = child.textContent;
          }
        }
        return null;
      };
    }
    return { compile, setDesignDocMode };
  }

  // src/pseudo.ts
  function scanUnquotedUrl(css, i) {
    if (css[i] !== "u" && css[i] !== "U" || css.slice(i, i + 4).toLowerCase() !== "url(" || /[a-z0-9_-]/i.test(css[i - 1] ?? "")) {
      return -1;
    }
    let j = i + 4;
    while (j < css.length && /\s/.test(css[j])) j++;
    if (css[j] === '"' || css[j] === "'") return -1;
    while (j < css.length && css[j] !== ")") {
      if (css[j] === "\\") j++;
      j++;
    }
    return j < css.length ? j + 1 : css.length;
  }
  function stripComments(css) {
    let out = "";
    let quote = "";
    for (let i = 0; i < css.length; i++) {
      const c = css[i];
      if (quote) {
        if (c === "\\") {
          out += c + (css[i + 1] ?? "");
          i++;
          continue;
        }
        if (c === quote) quote = "";
        out += c;
      } else if (c === "'" || c === '"') {
        quote = c;
        out += c;
      } else if (c === "/" && css[i + 1] === "*") {
        const end = css.indexOf("*/", i + 2);
        i = end === -1 ? css.length : end + 1;
        out += " ";
      } else {
        const end = scanUnquotedUrl(css, i);
        if (end === -1) out += c;
        else {
          out += css.slice(i, end);
          i = end - 1;
        }
      }
    }
    return out;
  }
  function importantify(css) {
    css = stripComments(css);
    const decls = [];
    let start = 0;
    let depth = 0;
    let quote = "";
    for (let i = 0; i < css.length; i++) {
      const c = css[i];
      if (quote) {
        if (c === "\\") i++;
        else if (c === quote) quote = "";
      } else if (c === "'" || c === '"') quote = c;
      else if (c === "(") depth++;
      else if (c === ")") depth = Math.max(0, depth - 1);
      else if (c === ";" && depth === 0) {
        decls.push(css.slice(start, i));
        start = i + 1;
      } else {
        const end = scanUnquotedUrl(css, i);
        if (end !== -1) i = end - 1;
      }
    }
    decls.push(css.slice(start));
    return decls.map((d) => d.trim()).filter(Boolean).map((d) => /!\s*important$/i.test(d) ? d : d + " !important").join(";");
  }
  function createPseudoSheet(doc) {
    let el = null;
    const cache = /* @__PURE__ */ new Map();
    let n = 0;
    return (pseudo, css) => {
      const k = pseudo + "|" + css;
      const hit = cache.get(k);
      if (hit) return hit;
      if (!el) {
        el = doc.createElement("style");
        doc.head.appendChild(el);
      }
      const cls = "scp" + (n++).toString(36);
      const isPseudoElement = pseudo === "before" || pseudo === "after";
      const sel = isPseudoElement ? "." + cls + "::" + pseudo : "." + cls + ":" + pseudo;
      el.sheet.insertRule(
        sel + "{" + (isPseudoElement ? css : importantify(css)) + "}",
        el.sheet.cssRules.length
      );
      cache.set(k, cls);
      return cls;
    };
  }

  // src/registry.ts
  function createRegistry() {
    const entries = /* @__PURE__ */ Object.create(null);
    function get(name) {
      return entries[name] || (entries[name] = {
        html: "",
        tpl: null,
        Logic: null,
        jsStreaming: false,
        htmlStreaming: false,
        ver: 0,
        subs: /* @__PURE__ */ new Set(),
        fetched: false
      });
    }
    function bump(name) {
      const r = get(name);
      r.ver++;
      for (const fn of r.subs) fn();
    }
    return {
      entries,
      get,
      bump,
      bumpAll() {
        for (const n in entries) bump(n);
      }
    };
  }

  // src/runtime.ts
  var COMPONENT_DIR = ".";
  function createRuntime(doc = document) {
    const registry = createRegistry();
    const pseudoClass = createPseudoSheet(doc);
    const helmet = createHelmetManager(
      doc,
      (name) => registry.get(name).htmlStreaming
    );
    const external = createExternalModules(() => registry.bumpAll());
    const factory = createComponentFactory(registry, ensureFetched);
    const host = {
      component: (name) => factory.getDC(name),
      placeholder: (props) => h(Placeholder, props),
      helmet: (node) => helmet.compile(node),
      loadExternal: (kind, url, after) => external.load(kind, url, after),
      resolveExternal: (url, name) => external.resolve(url, name),
      resolveExternalGlobal: (url, name) => external.resolveGlobal(url, name),
      resolveExternalError: (url, name) => external.getError(url, name),
      pseudoClass
    };
    function ensureFetched(name) {
      const r = registry.get(name);
      if (r.fetched) return;
      r.fetched = true;
      const url = COMPONENT_DIR + "/" + encodeURIComponent(name) + ".dc.html";
      const res = window.__resources;
      const pre = res ? res[url] : void 0;
      const target = typeof pre === "string" && pre ? pre : url;
      const blob = bundledBlob(target);
      (blob ? blob.text() : fetch(target).then((res2) => {
        if (!res2.ok) {
          console.error(
            '[dc-runtime] sibling fetch for "' + name + '" failed:',
            url,
            "returned",
            res2.status,
            "\u2014 the reference renders as an empty placeholder."
          );
          return "";
        }
        return res2.text();
      })).then((t) => {
        if (!t) return;
        const parsed = parseDcText(t);
        if (!parsed) {
          console.error(
            '[dc-runtime] sibling fetch for "' + name + '":',
            url,
            "has no <x-dc> block \u2014 not a Design Component."
          );
          return;
        }
        if (parsed.props) r.propsMeta = parsed.props;
        if (parsed.preview) r.preview = parsed.preview;
        if (parsed.template && !r.html) updateHtml(name, parsed.template);
        if (parsed.js && !r.Logic) updateJs(name, parsed.js);
      }).catch(
        (e) => console.error(
          '[dc-runtime] sibling fetch for "' + name + '" threw:',
          url,
          e
        )
      );
    }
    let rootName = null;
    function updateHtml(name, html) {
      const r = registry.get(name);
      r.html = html;
      if (name === rootName) {
        const mode = DESIGN_DOC_MODE_RE.exec(html)?.[1] ?? null;
        if (mode || !r.htmlStreaming) helmet.setDesignDocMode(mode);
      }
      try {
        r.tpl = compileTemplate(html, host);
      } catch (e) {
        console.error("[dc-runtime] template compile FAILED for", name, e);
      }
      registry.bump(name);
    }
    function updateJs(name, src) {
      const r = registry.get(name);
      const seq = r.jsSeq = (r.jsSeq || 0) + 1;
      try {
        const Cls = evalDcLogic(src);
        if (r.jsSeq !== seq) return;
        if (typeof Cls !== "function") {
          r.logicError = name + ".dc.html: <script data-dc-script> must define `class Component extends DCLogic`";
        } else {
          r.logicError = null;
          r.Logic = Cls;
        }
      } catch (e) {
        if (r.jsSeq !== seq) return;
        console.error(
          "[dc-runtime] logic class eval FAILED for",
          name,
          "\u2014 the template renders with props only.",
          e
        );
        r.logicError = name + ": " + (e instanceof Error && e.message ? e.message : String(e));
      }
      registry.bump(name);
    }
    function setStreaming(name, kind, on) {
      const r = registry.get(name);
      if (kind === "html") r.htmlStreaming = !!on;
      else r.jsStreaming = !!on;
      let any = false;
      for (const n in registry.entries) {
        const e = registry.entries[n];
        if (e && (e.htmlStreaming || e.jsStreaming)) {
          any = true;
          break;
        }
      }
      doc.documentElement.classList.toggle("sc-dc-streaming", any);
      registry.bump(name);
    }
    function dcUpdate(name, kind, content, streaming) {
      if (streaming) registry.get(name).fetched = true;
      if (kind === "html") {
        setStreaming(name, "html", !!streaming);
        updateHtml(name, content);
      } else if (kind === "js") {
        setStreaming(name, "js", !!streaming);
        if (!streaming) updateJs(name, content);
      } else if (kind === "props") {
        const { props, preview } = parseDataProps(content);
        const r = registry.get(name);
        r.propsMeta = props ?? void 0;
        r.preview = preview;
        registry.bump(name);
      }
    }
    function setProps(name, overrides) {
      registry.get(name).propOverrides = overrides && typeof overrides === "object" ? { ...overrides } : null;
      registry.bump(name);
    }
    function adoptParsed(name, parsed) {
      if (!parsed) return;
      const r = registry.get(name);
      if (parsed.props) r.propsMeta = parsed.props;
      if (parsed.preview) r.preview = parsed.preview;
      if (parsed.template) updateHtml(name, parsed.template);
      if (parsed.js) updateJs(name, parsed.js);
    }
    return {
      registry,
      getDC: factory.getDC,
      updateHtml,
      updateJs,
      dcUpdate,
      setProps,
      adoptParsed,
      setRootName: (name) => {
        rootName = name;
      },
      markFetched: (name) => {
        registry.get(name).fetched = true;
      },
      annotatedTemplate: (name) => {
        const r = registry.get(name);
        return r.tpl && r.tpl.__annotated || null;
      },
      templateSource: (name) => registry.get(name).html || null,
      StreamableLogic
    };
  }

  // src/stream-state.ts
  function createStreamTracker(staleMs = 6e4, now = Date.now) {
    const since = /* @__PURE__ */ new Map();
    const liveOne = (n) => {
      const t = since.get(n);
      if (t === void 0) return false;
      if (now() - t > staleMs) {
        since.delete(n);
        return false;
      }
      return true;
    };
    return {
      push(name, streaming, viewportKey) {
        if (viewportKey === "dc-model") return;
        if (streaming) since.set(name, now());
        else since.delete(name);
      },
      live(name) {
        if (name !== void 0) return liveOne(name);
        for (const n of [...since.keys()]) if (liveOne(n)) return true;
        return false;
      }
    };
  }

  // src/index.ts
  function hideRawTemplate() {
    const s = document.createElement("style");
    s.textContent = "x-dc{display:none!important}";
    document.head.appendChild(s);
  }
  function loadScript(src, integrity) {
    return new Promise((resolve2, reject) => {
      //! nosemgrep: create-script-element
      const s = document.createElement("script");
      s.src = src;
      if (integrity) {
        s.integrity = integrity;
        s.crossOrigin = "anonymous";
      }
      s.async = false;
      s.onload = () => resolve2();
      s.onerror = () => reject(new Error(`failed to load ${src}`));
      document.head.appendChild(s);
    });
  }
  function loadReactUmd() {
    const w = window;
    if (w.React && w.ReactDOM) return Promise.resolve();
    const react = cdnScriptFor(REACT_URL, REACT_SRI);
    const reactDom = cdnScriptFor(REACT_DOM_URL, REACT_DOM_SRI);
    return Promise.all([
      loadScript(react.src, react.integrity),
      loadScript(reactDom.src, reactDom.integrity)
    ]).then(() => void 0);
  }
  function init() {
    const runtime = createRuntime(document);
    let rootName = "Root";
    const baseCss = document.createElement("style");
    baseCss.textContent = BASE_CSS;
    document.head.prepend(baseCss);
    const notifyHost = () => {
      if (window.parent === window) return;
      const r = runtime.registry.entries[rootName];
      try {
        window.parent.postMessage(
          {
            type: "__dc_booted",
            rootName,
            propsMeta: r && r.propsMeta || null,
            preview: r && r.preview || null
          },
          "*"
        );
      } catch {
      }
    };
    const streams = createStreamTracker();
    const api = {
      __dcUpdate: (name, kind, content, streaming, viewportKey) => {
        streams.push(name, streaming, viewportKey);
        runtime.dcUpdate(name, kind, content, streaming);
        if (name === rootName && !streaming && kind === "props") notifyHost();
      },
      __dcStreaming: (name) => streams.live(name),
      __dcSetProps: (name, overrides) => runtime.setProps(name, overrides),
      /** Name of the component currently mounted as the page root — DC tools
       *  push their template-stream here when targeting "the open page". */
      __dcRootName: () => rootName,
      /** Editor bridge — the encoded, `data-dc-tpl`-annotated template source.
       *  The host editor parses this into its own template DOM so it can map a
       *  rendered node (carrying the same `data-dc-tpl`) back to the source
       *  node that emitted it. Returns the encoded form (`sc-camel-*` attrs,
       *  `<sc-raw-*>`/`<sc-helmet>` tags); the editor decodes on serialize. */
      __dcAnnotatedTemplate: (name) => runtime.annotatedTemplate(name),
      /** Editor bridge — the *original* (decoded) template source. */
      __dcTemplateSource: (name) => runtime.templateSource(name),
      __dcBoot: () => {
        rootName = boot(runtime, document) ?? rootName;
        notifyHost();
      },
      __dcRegistry: runtime.registry.entries,
      getDC: (name) => runtime.getDC(name),
      // `DCLogic` is the documented base class name; `StreamableLogic` is the
      // implementation alias kept for any project that already references it.
      DCLogic: runtime.StreamableLogic,
      StreamableLogic: runtime.StreamableLogic
    };
    Object.assign(window, api);
    window.__dcContentKeyed = true;
    if (document.readyState !== "loading") api.__dcBoot();
    else document.addEventListener("DOMContentLoaded", () => api.__dcBoot());
  }
  hideRawTemplate();
  loadReactUmd().then(init).catch((err) => {
    console.error("[dc] failed to load React or boot:", err);
    throw err;
  });
})();

window.__PW_LAZY = {"StudioScene": 1, "CockpitScene": 1, "FlowScene": 1, "TopPerformers": 1};
/* ---- Scene mounter: renders the Claude Design scenes into the .pw-embed placeholders ---- */
(function () {
  var SCENES = window.__PW_SCENES = window.__PW_SCENES || {}; // shared with the scene files, whichever runs first
  var mounted = []; // {el, name, props, root}
  var registered = {};

  function lang() {
    var l = (document.documentElement.getAttribute('lang') || 'da').toLowerCase();
    return l.indexOf('en') === 0 ? 'en' : 'da';
  }
  function ready() { return !!(window.__dcUpdate && window.getDC && window.React && window.ReactDOM); }
  function register(name) {
    if (registered[name]) return;
    var s = SCENES[name]; if (!s) return;
    window.__dcUpdate(name, 'props', s.props, false);
    window.__dcUpdate(name, 'html', s.html, true);
    window.__dcUpdate(name, 'html', s.html, false);
    window.__dcUpdate(name, 'js', s.js, false);
    registered[name] = true;
  }
  function propsFor(el, name) {
    var s = SCENES[name] || { defaults: {} };
    var p = Object.assign({}, s.defaults);
    p.lang = lang();
    if ('currency' in p) p.currency = p.lang === 'da' ? 'DKK' : 'EUR';
    // token form set in Webflow: data-scene="phone still noboard fit:Podium"
    var tok = el.getAttribute('data-scene');
    if (tok) tok.split(/\s+/).forEach(function (t) {
      if (!t) return;
      var kv = t.split(':');
      if (kv.length === 2) { p[kv[0]] = kv[1]; return; }
      if (t.indexOf('no') === 0 && (t.slice(2) in p)) { p[t.slice(2)] = false; return; }
      p[t] = true;
    });
    // JSON form set at runtime by page.js
    try {
      var raw = el.getAttribute('data-scene-props');
      if (raw) Object.assign(p, JSON.parse(raw));
    } catch (e) { /* ignore bad JSON */ }
    return p;
  }
  function render(m) {
    var C = window.getDC(m.name);
    m.root.render(window.React.createElement(C, m.props));
  }
  // Every scene lives in its own file next to the entry (dist/scenes/*.js), fetched by the chunk loader (src/loader.js)
  // with the integrity hash recorded at build time. Platform-page scenes (window.__PW_LAZY) mount when the placeholder
  // comes near the viewport; the others mount as soon as their file has run.
  var LAZY = window.__PW_LAZY || {};
  var loading = {};
  function want(el, name) {
    if (loading[name] || !window.__pwNeed) return;
    loading[name] = true;
    window.__pwNeed('scene:' + name, function () { mountAll(); });
  }
  var io = window.IntersectionObserver ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.__pwNear = true; io.unobserve(e.target); mountAll(); } });
  }, { rootMargin: '300px 0px' }) : null;
  function watch(el) {
    if (el.__pwWatched) return; el.__pwWatched = true;
    if (io) io.observe(el); else { el.__pwNear = true; }
    if (!io) mountAll();
  }
  function mountAll() {
    var els = document.querySelectorAll('.pw-embed[data-component]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.__pwMounted) continue;
      var name = el.getAttribute('data-component');
      if (!SCENES[name]) { want(el, name); continue; }
      if (LAZY[name] && !el.__pwNear) { watch(el); continue; }
      register(name);
      el.__pwMounted = true;
      el.classList.add('pw-embed--live');
      var root = window.ReactDOM.createRoot(el);
      var m = { el: el, name: name, props: propsFor(el, name), root: root };
      mounted.push(m);
      render(m);
    }
  }
  // Public hook used by page.js (e.g. hero hold → release after the intro)
  window.__pwScenes = {
    setProps: function (el, patch) {
      for (var i = 0; i < mounted.length; i++) {
        if (mounted[i].el === el) { Object.assign(mounted[i].props, patch); render(mounted[i]); }
      }
    },
    mounted: mounted,
    loaded: function () { mountAll(); }
  };
  var tries = 0;
  (function wait() {
    if (ready()) { mountAll(); return; }
    if (++tries > 400) { console.error('[prowi] scene runtime did not initialise'); return; }
    setTimeout(wait, 25);
  })();
})();

