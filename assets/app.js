(function(){
var $=function(i){return document.getElementById(i)};
var inp=$('in'),out=$('out'),list=$('eqs');
if(!inp)return;
var blocks=[],tm,ommlFn=null;
function toast(m){var e=$('toast');e.textContent=m;e.classList.add('show');clearTimeout(tm);tm=setTimeout(function(){e.classList.remove('show')},2600)}
function copy(s){if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(s);
  return new Promise(function(ok){var a=document.createElement('textarea');a.value=s;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();ok()})}
function loadOmml(){if(ommlFn)return Promise.resolve();
  return import('https://cdn.jsdelivr.net/npm/mathml2omml@0.5.0/+esm').then(function(m){ommlFn=m.mml2omml}).catch(function(){ommlFn=null})}
function toOmml(tex){if(!ommlFn)throw 0;
  var ml=katex.renderToString(tex,{output:'mathml',throwOnError:false}).match(/<math[\s\S]*<\/math>/);if(!ml)throw 0;
  return ommlFn(ml[0].replace(/<annotation[\s\S]*?<\/annotation>/g,''))}
function render(){
  var src=inp.value;list.innerHTML='';
  if(!src.trim()){blocks=[];out.innerHTML='<p class="empty">Your formatted result will appear here.</p>';list.innerHTML='<p class="empty">Equations will be listed here.</p>';return}
  blocks=MTW.parse(src);out.innerHTML=MTW.html(blocks,false);
  var e=MTW.eqs(blocks);
  if(!e.length)list.innerHTML='<p class="empty">No equations found. Equations must be inside \\[ \\], \\( \\), $$ $$ or $ $.</p>';
  e.forEach(function(s,i){var r=document.createElement('div');r.className='eqrow';
    var p=document.createElement('div');p.className='p';try{katex.render(s,p,{throwOnError:false})}catch(x){p.textContent=s}
    var b=document.createElement('button');b.className='b3';b.textContent='Copy #'+(i+1);
    b.onclick=function(){copy(s).then(function(){toast('Equation '+(i+1)+' copied. In Word: Alt + =, Ctrl + V, Enter.')})};
    r.appendChild(p);r.appendChild(b);list.appendChild(r)})}
var d;inp.addEventListener('input',function(){clearTimeout(d);d=setTimeout(render,250)});
$('clear').onclick=function(){inp.value='';render()};
$('example').onclick=function(){
  inp.value='## Equation Practice\n**Equation 1 — Quadratic Formula**\n\\[\nx=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a},\\quad a\\neq 0\n\\]\n**Equation 2 — Definite Integral**\n\\[\n\\int_{0}^{\\infty}x^n e^{-\\lambda x}\\,dx=\\frac{\\Gamma(n+1)}{\\lambda^{n+1}},\\quad n>-1,\\ \\lambda>0\n\\]\n**Equation 3 — Fourier Series**\n\\[\nf(x)=\\frac{a_0}{2}+\\sum_{n=1}^{\\infty}\\left[a_n\\cos\\left(\\frac{n\\pi x}{L}\\right)+b_n\\sin\\left(\\frac{n\\pi x}{L}\\right)\\right]\n\\]\nInline example: \\( E=mc^2 \\) works too.\n\n- First point\n- Second point';render()};
$('copyall').onclick=function(){var e=MTW.eqs(blocks);if(!e.length)return toast('No equations to copy');copy(e.join('\n')).then(function(){toast('All equations copied, one per line')})};
$('copytext').onclick=function(){if(!inp.value.trim())return toast('Paste some text first');copy(MTW.plain(inp.value)).then(function(){toast('Text copied with plain equations')})};
$('copyword').onclick=function(){
  if(!blocks.length)return toast('Paste some text first');
  if(!ommlFn)return toast('Loading the converter... please try again in a few seconds.');
  var h='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40"><body><!--StartFragment-->'+MTW.html(blocks,true,toOmml)+'<!--EndFragment--></body></html>';
  var pl=MTW.plain(inp.value),ta=document.createElement('textarea');ta.value=pl;document.body.appendChild(ta);ta.select();
  function on(e){e.clipboardData.setData('text/html',h);e.clipboardData.setData('text/plain',pl);e.preventDefault()}
  document.addEventListener('copy',on);var ok=false;try{ok=document.execCommand('copy')}catch(x){}
  document.removeEventListener('copy',on);ta.remove();
  toast(ok?'Copied. Press Ctrl + V in Word. If equations look wrong, use Download Word file.':'Copy blocked. Please use Download Word file.')};
$('docx').onclick=function(){
  if(!blocks.length)return toast('Paste some text first');
  toast('Building your Word file...');
  loadOmml().then(function(){
    var f=MTW.files(blocks,toOmml),z=new JSZip();for(var k in f)z.file(k,f[k]);
    return z.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'})})
  .then(function(b){var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='equations.docx';document.body.appendChild(a);a.click();a.remove();
    toast(ommlFn?'Downloaded equations.docx':'Downloaded, but equations are plain text (no internet for converter).')})
  .catch(function(){toast('Could not build the file. Please try again.')})};
render();inp.addEventListener('focus',loadOmml,{once:true});inp.addEventListener('paste',loadOmml,{once:true});setTimeout(loadOmml,4000);
})();
