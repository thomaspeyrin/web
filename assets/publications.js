const yearNav = document.querySelector('.year-nav');
const links = Array.from(yearNav.querySelectorAll('a'));
const headings = links.map(link => document.getElementById(link.hash.slice(1)));
const select = document.createElement('select');
select.className = 'year-select';
select.setAttribute('aria-label', 'Jump to year or section');
for (const link of links) {
  select.add(new Option(link.textContent, link.hash));
}
select.addEventListener('change', () => { location.hash = select.value; });
yearNav.append(select);
yearNav.classList.add('enhanced');

let active = -1;
function updateYear() {
  const top = Math.max(32, select.offsetHeight ? yearNav.offsetHeight + 22 : 32);
  let index = headings.findLastIndex(heading => heading.getBoundingClientRect().top <= top);
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
    const target = links.findIndex(link => link.hash === location.hash);
    index = target >= 0 && headings[target].getBoundingClientRect().top >= 0
      ? target : headings.length - 1;
  }
  if (index < 0) index = 0;
  if (index === active) return;
  if (active >= 0) links[active].removeAttribute('aria-current');
  active = index;
  links[index].setAttribute('aria-current', 'location');
  select.value = links[index].hash;
}
let queued = false;
function scheduleUpdate() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; updateYear(); });
}
window.addEventListener('scroll', scheduleUpdate, {passive: true});
window.addEventListener('resize', scheduleUpdate);
window.addEventListener('pageshow', scheduleUpdate);
window.addEventListener('hashchange', scheduleUpdate);
updateYear();
