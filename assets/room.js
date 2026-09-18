/* =========================================================================
   THE ROOM PAGES — shared behaviour (v3.39, Sep 2026)
   The entrance, the White / Carbon ground, the Delhi clock, the mail line
   that copies itself, and the still that follows the pointer over a
   directory. Page-specific effects (the 038 strip on retain.html, the 106
   wheel on production.html) live in each page's own script. No library.
   ========================================================================= */
(function(){
  var doc=document.documentElement;

  /* the entrance, once the face is in */
  var go=function(){ requestAnimationFrame(function(){ requestAnimationFrame(function(){ doc.classList.add('in'); }); }); };
  if(document.fonts&&document.fonts.ready){ document.fonts.ready.then(go); setTimeout(go,1800); } else { go(); }

  /* the ground and the Delhi clock moved to assets/site.js in v3.53, with
     the shared header that carries them */

  /* the mail line copies itself on click, then goes back to being a link */
  var mail=document.getElementById('mail');
  if(mail) mail.addEventListener('click', function(e){
    if(!navigator.clipboard) return;
    e.preventDefault();
    navigator.clipboard.writeText(mail.getAttribute('data-mail')).then(function(){
      var t=mail.textContent; mail.textContent='Copied'; setTimeout(function(){ mail.textContent=t; }, 1400);
    }, function(){ location.href=mail.href; });
  });

  /* a still follows the pointer across directory rows that carry data-img */
  if(matchMedia('(hover:hover)').matches){
    var peek=document.getElementById('peek'), img=peek&&peek.querySelector('img');
    var dir=document.querySelector('.dir');
    if(peek&&img&&dir){
      var x=0,y=0,on=false;
      function place(){ var W=peek.offsetWidth,H=peek.offsetHeight, right=dir.getBoundingClientRect().right;
        var px=Math.max(x+18, right+16), py=y-Math.round(H*0.35);
        if(px+W>innerWidth-10) px=innerWidth-10-W; if(py+H>innerHeight-10) py=innerHeight-10-H; if(py<10) py=10;
        peek.style.transform='translate('+px+'px,'+py+'px)'; }
      document.querySelectorAll('.dir .row[data-img]').forEach(function(row){
        row.addEventListener('mouseenter', function(e){ img.src=row.getAttribute('data-img'); x=e.clientX; y=e.clientY; place(); peek.classList.add('on'); on=true; });
        row.addEventListener('mousemove', function(e){ x=e.clientX; y=e.clientY; if(on) place(); });
        row.addEventListener('mouseleave', function(){ peek.classList.remove('on'); on=false; });
      });
      addEventListener('load', function(){ setTimeout(function(){
        document.querySelectorAll('.dir .row[data-img]').forEach(function(r){ var i=new Image(); i.src=r.getAttribute('data-img'); });
      }, 1200); });
    }
  }
})();
