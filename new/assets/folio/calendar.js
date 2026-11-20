// Render the same twelve-month calendar for the static snapshot and its online refresh.
function calendarSvg(start, end, counts) {
  const dayMs = 86400000;
  const first = Date.parse(start + "T00:00:00Z");
  const last = Date.parse(end + "T00:00:00Z");
  const origin = first - new Date(first).getUTCDay() * dayMs;
  const shades = ["#e9e4d9", "#b0d4c1", "#6ab397", "#35846f", "#145a4c"];
  const paths = shades.map(() => []);
  const labels = [];
  for (let time = first; time <= last; time += dayMs) {
    const d = new Date(time);
    const x = 39 + 14 * Math.floor((time - origin) / (7 * dayMs));
    const y = 22 + 14 * d.getUTCDay();
    const count = counts[d.toISOString().slice(0,10)] || 0;
    const level = count === 0 ? 0 : count === 1 ? 1 : count < 4 ? 2 : count < 8 ? 3 : 4;
    paths[level].push("M"+x+" "+y+"h11v11h-11z");
    if (d.getUTCDate() === 1) {
      labels.push('<text x="'+x+'" y="13">'+d.toLocaleDateString("en-US",{month:"short",timeZone:"UTC"})+'</text>');
    }
  }
  const axis = ["Mon","Wed","Fri"].map((day,i)=>'<text x="0" y="'+(45+i*28)+'">'+day+'</text>');
  const width = 53 + Math.floor((last - origin)/(7*dayMs)) * 14;
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+width+' 122"><g fill="#534b51" font-family="Arial,sans-serif" font-size="11">'+labels.concat(axis).join("")+'</g>'+paths.map((d,i)=>'<path fill="'+shades[i]+'" d="'+d.join("")+'"/>').join("")+'</svg>';
}
if (typeof module !== "undefined") module.exports = {calendarSvg};

async function calendarSeries(owner, repo) {
  const end = new Date().toISOString().slice(0,10);
  const dayMs = 86400000;
  const start = new Date(Date.parse(end) - 364 * dayMs).toISOString().slice(0,10);
  const counts = Object.create(null);
  if (owner === "thomaspeyrin") {
    const res = await fetch("https://github-contributions-api.jogruber.de/v4/thomaspeyrin?y=last",{credentials:"omit"});
    if (!res.ok) return;
    const data = await res.json();
    for (const day of data.contributions) {
      if (day.date >= start && day.date <= end && Number.isSafeInteger(day.count) && day.count >= 0) counts[day.date]=day.count;
    }
    // GitHub may still show the previous UTC day. Accept one day of reporting lag.
    const dates=Object.keys(counts).sort();
    const last=dates[dates.length-1];
    if (dates[0] !== start || dates.length < 364 || (Date.parse(last)-Date.parse(start))/dayMs+1 !== dates.length) return;
    return {counts,start,end:last,unit:"contributions",scope:"@thomaspeyrin",url:"https://github.com/thomaspeyrin"};
  }
  for (let page=1;page<=10;page++) {
    const url = "https://api.github.com/repos/"+owner+"/"+repo+"/commits?sha=master&per_page=100&since="+start+"T00:00:00Z&page="+page;
    const res=await fetch(url,{credentials:"omit"});
    if (!res.ok) return;
    const items=await res.json();
    if (!Array.isArray(items)) return;
    for (const item of items) {
      const key=item.commit.committer.date.slice(0,10);
      if (key>=start && key<=end) counts[key]=(counts[key]||0)+1;
    }
    if (items.length<100) return {counts,start,end,unit:"commits",scope:owner+"/"+repo,url:"https://github.com/"+owner+"/"+repo+"/commits/master/"};
  }
}
async function refreshCalendar(panel) {
  try {
    const [owner,repo]=panel.dataset.calendar.split("/");
    const series=await calendarSeries(owner,repo);
    if (!series) return;
    const total=Object.values(series.counts).reduce((x,y)=>x+y,0);
    const title=total+" "+series.unit+" · "+series.scope;
    const image=panel.querySelector(".calendar-grid img");
    image.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(calendarSvg(series.start,series.end,series.counts));
    image.alt=title+" from "+series.start+" to "+series.end;
    const heading=panel.querySelector(".calendar-title");
    heading.textContent=title;
    heading.href=series.url;
    panel.querySelector(".calendar-range").textContent=series.start+" – "+series.end;
  } catch { /* A complete, dated calendar is already present in the page. */ }
}
if (typeof document !== "undefined") document.querySelectorAll("[data-calendar]").forEach(refreshCalendar);

