import{Aa as E,Ba as L,Ca as N,D as s,Ea as R,Ga as u,H as v,M as r,O as C,P as m,Q as a,R as n,T,U as c,X as l,ea as b,fa as x,ma as _,na as M,o as p,oa as y,pa as k,qa as D,ra as O,sa as A,ta as w,ua as I,wa as F,xa as f,y as S,ya as W,z as d,za as P}from"./chunk-MZH6H3KD.js";var B=[{path:"",pathMatch:"full",loadComponent:()=>import("./chunk-ETLFMRLX.js").then(e=>e.LiveComponent)}];var j={providers:[x({eventCoalescing:!0}),I(B),A(O()),y(k())]};function Z(e,o){if(e&1&&n(0,"fa-duotone-icon",1),e&2){let t=c();r("icon",t.soundsOn)("fixedWidth",!0)}}function q(e,o){if(e&1&&n(0,"fa-duotone-icon",2),e&2){let t=c();r("icon",t.soundsOff)("fixedWidth",!0)}}function z(e,o){if(e&1&&n(0,"fa-duotone-icon",3),e&2){let t=c();r("icon",t.dark)("fixedWidth",!0)}}function G(e,o){if(e&1&&n(0,"fa-duotone-icon",4),e&2){let t=c();r("icon",t.light)("fixedWidth",!0)}}var h=class e{themeService=p(u);isDarkMode=this.themeService.isDarkMode();platformID=p(S);light=N;dark=P;soundsOn=E;soundsOff=R;ngOnInit(){if(M(this.platformID)){let i=(localStorage.getItem("darkMode")??"light")==="dark";this.setDarkMode(i),this.setSoundsOn(!1)}}setDarkMode(o){this.themeService.setDarkMode(o),this.updateTheme(o)}setSoundsOn(o){this.themeService.setSoundsOn(o)}toggleMode(){this.themeService.toggleMode(),this.updateTheme(this.themeService.isDarkMode())}toggleSounds(){this.themeService.toggleSounds()}updateTheme(o){this.isDarkMode=o,o?document.documentElement.setAttribute("data-theme","dark"):document.documentElement.setAttribute("data-theme","light")}static \u0275fac=function(t){return new(t||e)};static \u0275cmp=s({type:e,selectors:[["app-theme-toggle"]],decls:7,vars:2,consts:[[1,"btn","btn-circle",3,"click"],["title","Turn sounds ON",3,"icon","fixedWidth"],["title","Turn sounds OFF",3,"icon","fixedWidth"],["title","Turn light on",3,"icon","fixedWidth"],["title","Turn light off",3,"icon","fixedWidth"]],template:function(t,i){t&1&&(m(0,"button",0),T("click",function(){return i.toggleSounds()}),v(1,Z,1,2,"fa-duotone-icon",1)(2,q,1,2,"fa-duotone-icon",2),a(),l(3," \xA0 "),m(4,"button",0),T("click",function(){return i.toggleMode()}),v(5,z,1,2,"fa-duotone-icon",3)(6,G,1,2,"fa-duotone-icon",4),a()),t&2&&(d(),C(i.themeService.isSoundsOn()?1:2),d(4),C(i.themeService.isDarkMode()?5:6))},dependencies:[_,f],encapsulation:2})};var g=class e{title="chessfield-live";streamService=p(F);faPopcorn=L;static \u0275fac=function(t){return new(t||e)};static \u0275cmp=s({type:e,selectors:[["app-root"]],features:[b([u])],decls:10,vars:3,consts:[[1,"navbar","bg-base-100","shadow-sm"],[1,"navbar-start"],["href","/",1,"btn","btn-ghost","border-0","text-xl"],["primaryColor","#d40c0c","secondaryColor","#e9e921","secondaryOpacity","1",3,"icon","fixedWidth","animation"],[1,"navbar-center"],[1,"navbar-end"],[1,"mr-2"],[1,"m-auto","w-[92vw]"]],template:function(t,i){t&1&&(m(0,"div",0)(1,"div",1)(2,"a",2),n(3,"fa-duotone-icon",3),l(4," ChessPop Live "),a()(),n(5,"div",4),m(6,"div",5),n(7,"app-theme-toggle",6),a()(),m(8,"div",7),n(9,"router-outlet"),a()),t&2&&(d(3),r("icon",i.faPopcorn)("fixedWidth",!0)("animation",i.streamService.isLoading()?"bounce":void 0))},dependencies:[w,h,W,f],encapsulation:2})};D(g,j).catch(e=>console.error(e));
