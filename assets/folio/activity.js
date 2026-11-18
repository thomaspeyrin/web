// The dated static list remains available when GitHub is offline or rate-limits a visitor.
async function refreshRepository(panel) {
  const repo = panel.dataset.repository;
  const route = "https://api.github.com/repos/" + repo + "/commits?per_page=6";
  try {
    const response = await fetch(route, {headers:{Accept:"application/vnd.github+json"}, credentials:"omit"});
    if (!response.ok) return;
    const commits = await response.json();
    if (!Array.isArray(commits) || !commits.length) return;
    const items = document.createDocumentFragment();
    for (const item of commits) {
      if (!/^[a-f0-9]{40}$/.test(item.sha)) return;
      const date = item.commit.committer.date.slice(0,10);
      const li = document.createElement("li");
      const time = document.createElement("time");
      time.dateTime = date;
      time.textContent = date;
      const a = document.createElement("a");
      a.href = "https://github.com/" + repo + "/commit/" + item.sha;
      a.textContent = item.commit.message.split("\n")[0];
      li.append(time, a);
      items.append(li);
    }
    panel.querySelector(".feed").replaceChildren(items);
    panel.querySelector(".metadata").textContent = "Latest commit · " + commits[0].commit.committer.date.slice(0,10);
  } catch { /* Keep the complete static snapshot. */ }
}
async function refreshStats(panel) {
  try {
    const response = await fetch("https://api.github.com/repos/"+panel.dataset.repository, {credentials:"omit"});
    if (!response.ok) return;
    const repo = await response.json();
    if (!Number.isSafeInteger(repo.stargazers_count) || !Number.isSafeInteger(repo.forks_count)) return;
    const [language, stars, forks] = panel.querySelectorAll(".repo-stats span");
    if (repo.language) language.textContent = repo.language;
    stars.textContent = "☆ "+repo.stargazers_count+" stars";
    forks.textContent = repo.forks_count+" forks";
  } catch { /* The repository card already contains its saved metadata. */ }
}
document.querySelectorAll("[data-repository]").forEach(panel => {
  refreshStats(panel);
  const details = panel.querySelector("details");
  details.addEventListener("toggle", () => refreshRepository(panel), {once:true});
});

