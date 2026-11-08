(function(){
var $=function(i){return document.getElementById(i)};
var inp=$('in'),out=$('out'),list=$('eqs');
if(!inp)return;
var RE=/\\\[([\s\S]+?)\\\]|\$\$([\s\S]+?)\$\$|\\\(([\s\S]+?)\\\)|\$([^$\n]+?)\$/g;
var eqs=[],t;
function toast(m){var e=$('toast');e.textContent=m;e.classList.add('show');clearTimeout(t);t=setTimeout(function(){e.classList.remove('show')},1800)}
function copy(s){
  if(navigator.clipboard&&window.isSecureContext){return navigator.clipboard.writeText(s)}
  return new Promise(function(ok){var a=document.createElement('textarea');a.value=s;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();ok()});
}
function text(p,s){s.split('\n').forEach(function(l,i){if(i)p.appendChild(document.createElement('br'));p.appendChild(document.createTextNode(l))})}
function tex(el,s,disp){try{katex.render(s,el,{displayMode:disp,throwOnError:false})}catch(e){el.textContent=s}}
function render(){
  var src=inp.value;out.innerHTML='';list.innerHTML='';eqs=[];
  if(!src.trim()){out.innerHTML='<p class="empty">Your formatted result will appear here.</p>';list.innerHTML='<p class="empty">Equations will be listed here.</p>';return}
  var last=0,m,box=document.createElement('div');RE.lastIndex=0;
  while((m=RE.exec(src))){
    text(box,src.slice(last,m.index));
    var disp=m[1]!==undefined||m[2]!==undefined;
    var s=(m[1]||m[2]||m[3]||m[4]).trim();
    var el=document.createElement(disp?'div':'span');if(disp)el.className='eq';
    tex(el,s,disp);box.appendChild(el);eqs.push(s);last=RE.lastIndex;
  }
  text(box,src.slice(last));out.appendChild(box);
  eqs.forEach(function(s,i){
    var r=document.createElement('div');r.className='eqrow';
    var p=document.createElement('div');p.className='p';tex(p,s,false);
    var b=document.createElement('button');b.className='b3';b.textContent='Copy #'+(i+1);
    b.onclick=function(){copy(s).then(function(){toast('Equation '+(i+1)+' copied. Paste it inside a Word equation box.')})};
    r.appendChild(p);r.appendChild(b);list.appendChild(r);
  });
  if(!eqs.length)list.innerHTML='<p class="empty">No equations found. Equations must be inside \\[ \\], \\( \\), $$ $$ or $ $.</p>';
}
var d;inp.addEventListener('input',function(){clearTimeout(d);d=setTimeout(render,250)});
$('clear').onclick=function(){inp.value='';render()};
$('example').onclick=function(){
  inp.value='Equation 1 — Quadratic Formula\n\\[\nx=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a},\\quad a\\neq 0\n\\]\nEquation 2 — Definite Integral\n\\[\n\\int_{0}^{\\infty}x^n e^{-\\lambda x}\\,dx=\\frac{\\Gamma(n+1)}{\\lambda^{n+1}},\\quad n>-1,\\ \\lambda>0\n\\]\nEquation 3 — Fourier Series\n\\[\nf(x)=\\frac{a_0}{2}+\\sum_{n=1}^{\\infty}\\left[a_n\\cos\\left(\\frac{n\\pi x}{L}\\right)+b_n\\sin\\left(\\frac{n\\pi x}{L}\\right)\\right]\n\\]';render()};
$('copyall').onclick=function(){if(!eqs.length)return toast('No equations to copy');copy(eqs.join('\n')).then(function(){toast('All equations copied (one per line)')})};
$('copytext').onclick=function(){
  var s=inp.value.replace(RE,function(a,b,c,d2,e){return '\n'+(b||c||d2||e).trim()+'\n'}).replace(/\n{3,}/g,'\n\n');
  copy(s).then(function(){toast('Text copied with plain LaTeX equations')})};
render();
})();
