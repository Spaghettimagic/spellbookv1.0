export function initReveal(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const els = document.querySelectorAll('.surface');
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:0.1});
  els.forEach(el=>{
    el.classList.add('reveal');
    observer.observe(el);
  });
}
