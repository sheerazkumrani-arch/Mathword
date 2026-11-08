(function(root){
var esc=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')};
var D=/\\\[([\s\S]+?)\\\]|\$\$([\s\S]+?)\$\$/g;
var IN=/\\\((.+?)\\\)|\$(?!\s)([^$\n]*?[^\s$])\$/g;
function fmt(s,out){s.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/).forEach(function(p){
  if(!p)return;
  if(/^\*\*.+\*\*$/.test(p))out.push({k:'t',s:p.slice(2,-2),b:1});
  else if(/^\*.+\*$/.test(p))out.push({k:'t',s:p.slice(1,-1),i:1});
  else if(/^`.+`$/.test(p))out.push({k:'t',s:p.slice(1,-1),c:1});
  else out.push({k:'t',s:p})})}
function inline(s){var out=[],last=0,m;IN.lastIndex=0;
  while((m=IN.exec(s))){fmt(s.slice(last,m.index),out);out.push({k:'m',tex:(m[1]||m[2]).trim()});last=IN.lastIndex}
  fmt(s.slice(last),out);return out}
function parse(src){
  var disp=[];
  src=src.replace(/\r/g,'').replace(D,function(a,b,c){disp.push((b||c).trim());return '\n\u0001'+(disp.length-1)+'\u0001\n'});
  var L=src.split('\n'),B=[],i=0,m;
  while(i<L.length){
    var t=L[i].trim();
    if(!t){i++;continue}
    if(/^```/.test(t)){var c=[];i++;while(i<L.length&&!/^```/.test(L[i].trim()))c.push(L[i++]);i++;B.push({t:'code',s:c.join('\n')});continue}
    if((m=/^\u0001(\d+)\u0001$/.exec(t))){B.push({t:'eq',tex:disp[+m[1]]});i++;continue}
    if((m=/^(#{1,3})\s+(.*)$/.exec(t))){B.push({t:'h',n:m[1].length,r:inline(m[2])});i++;continue}
    if(t[0]==='|'&&i+1<L.length&&/^\|?[\s:|-]+\|?$/.test(L[i+1].trim())){
      var rows=[];
      while(i<L.length&&L[i].trim()[0]==='|'){var row=L[i].trim();
        if(!/^[\s:|-]+$/.test(row))rows.push(row.replace(/^\||\|$/g,'').split('|').map(function(x){return inline(x.trim())}));
        i++}
      B.push({t:'tbl',rows:rows});continue}
    if((m=/^[-*•]\s+(.*)$/.exec(t))){B.push({t:'li',mark:'•',r:inline(m[1])});i++;continue}
    if((m=/^(\d+)[.)]\s+(.*)$/.exec(t))){B.push({t:'li',mark:m[1]+'.',r:inline(m[2])});i++;continue}
    B.push({t:'p',r:inline(t)});i++}
  return B}
function eqs(B){var a=[];B.forEach(function(b){if(b.t==='eq')a.push(b.tex);[b.r].concat(b.rows||[]).forEach(function(x){(function w(r){if(!r)return;if(r.forEach)r.forEach(w);else if(r.k==='m')a.push(r.tex)})(x)})});return a}
function math(tex,disp,copy){try{return root.katex.renderToString(tex,{displayMode:disp,throwOnError:false,output:copy?'mathml':'htmlAndMathml'})}catch(e){return esc(tex)}}
function hruns(rs,copy){return rs.map(function(r){
  if(r.k==='m')return math(r.tex,false,copy);
  var s=esc(r.s);if(r.c)s='<code>'+s+'</code>';if(r.b)s='<b>'+s+'</b>';if(r.i)s='<i>'+s+'</i>';return s}).join('')}
function html(B,copy){return B.map(function(b){
  if(b.t==='h')return '<h'+b.n+'>'+hruns(b.r,copy)+'</h'+b.n+'>';
  if(b.t==='p')return '<p>'+hruns(b.r,copy)+'</p>';
  if(b.t==='eq')return copy?'<p style="text-align:center">'+math(b.tex,false,1)+'</p>':'<div class="eq">'+math(b.tex,true)+'</div>';
  if(b.t==='li')return '<p style="margin-left:24px">'+b.mark+' '+hruns(b.r,copy)+'</p>';
  if(b.t==='code')return '<pre style="font-family:Consolas,monospace">'+esc(b.s)+'</pre>';
  if(b.t==='tbl')return '<table border="1" cellpadding="5" style="border-collapse:collapse">'+b.rows.map(function(r,i){return '<tr>'+r.map(function(c){var tg=i?'td':'th';return '<'+tg+'>'+hruns(c,copy)+'</'+tg+'>'}).join('')+'</tr>'}).join('')+'</table>';
  return ''}).join('\n')}
function wr(t,r){var p='';if(r.c)p+='<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>';if(r.b)p+='<w:b/>';if(r.i)p+='<w:i/>';
  return '<w:r>'+(p?'<w:rPr>'+p+'</w:rPr>':'')+'<w:t xml:space="preserve">'+esc(t)+'</w:t></w:r>'}
function druns(rs,omml){return rs.map(function(r){
  if(r.k==='m'){try{return omml(r.tex)}catch(e){return wr(r.tex,{})}}
  return wr(r.s,r)}).join('')}
function P(c,ppr){return '<w:p>'+(ppr?'<w:pPr>'+ppr+'</w:pPr>':'')+c+'</w:p>'}
function docxBody(B,omml){return B.map(function(b){
  if(b.t==='h')return P(druns(b.r,omml),'<w:pStyle w:val="Heading'+b.n+'"/>');
  if(b.t==='p')return P(druns(b.r,omml));
  if(b.t==='li')return P(wr(b.mark+'\t',{})+druns(b.r,omml),'<w:tabs><w:tab w:val="left" w:pos="720"/></w:tabs><w:ind w:left="720" w:hanging="360"/>');
  if(b.t==='eq'){var x;try{x='<m:oMathPara>'+omml(b.tex)+'</m:oMathPara>'}catch(e){x=wr(b.tex,{c:1})}return P(x,'<w:jc w:val="center"/>')}
  if(b.t==='code')return b.s.split('\n').map(function(l){return P(wr(l,{c:1}),'<w:spacing w:after="0"/>')}).join('');
  if(b.t==='tbl'){var bd=['top','left','bottom','right','insideH','insideV'].map(function(s){return '<w:'+s+' w:val="single" w:sz="4" w:space="0" w:color="808080"/>'}).join('');
    return '<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders>'+bd+'</w:tblBorders></w:tblPr>'+b.rows.map(function(r,i){
      return '<w:tr>'+r.map(function(c){return '<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/></w:tcPr>'+P(druns(i?c:c.map(function(x){return x.k==='t'?{k:'t',s:x.s,b:1}:x}),omml))+'</w:tc>'}).join('')+'</w:tr>'}).join('')+'</w:tbl>'+P('')}
  return ''}).join('')}
var W='xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
function files(B,omml){
  var H=[32,28,26].map(function(s,i){return '<w:style w:type="paragraph" w:styleId="Heading'+(i+1)+'"><w:name w:val="heading '+(i+1)+'"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="120"/><w:outlineLvl w:val="'+i+'"/></w:pPr><w:rPr><w:b/><w:sz w:val="'+s+'"/></w:rPr></w:style>'}).join('');
  var h='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  var f={};
  f['[Content_Types].xml']=h+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>';
  f['_rels/.rels']=h+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
  f['word/_rels/document.xml.rels']=h+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>';
  f['word/styles.xml']=h+'<w:styles '+W+'><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>'+H+'</w:styles>';
  f['word/document.xml']=h+'<w:document '+W+' xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"><w:body>'+docxBody(B,omml)+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>';
  return f}
function plain(src){return src.replace(/\r/g,'').replace(D,function(a,b,c){return '\n'+(b||c).trim()+'\n'}).replace(IN,function(a,b,c){return (b||c).trim()}).replace(/\n{3,}/g,'\n\n').trim()}
var api={parse:parse,html:html,files:files,eqs:eqs,plain:plain};
if(typeof module!=='undefined')module.exports=api;else root.MTW=api;
})(typeof window!=='undefined'?window:globalThis);
