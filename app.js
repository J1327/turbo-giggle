let data = [];
let sortKey = null;
let sortAsc = true;

async function loadJson(path) {
  const r = await fetch(path);
  const text = await r.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`Failed to parse ${path}`);
    console.error(text.slice(0, 200));
    throw e;
  }
}

function shotColor(v) {
  if (v <= 5) return "green";
  if (v <= 7) return "orange";
  return "red";
}

function reloadColor(v) {
  if (v <= 7) return "green";
  if (v <= 14) return "orange";
  return "red";
}

function repairColor(v) {
  if (v <= 5000) return "green";
  if (v <= 7000) return "orange";
  return "red";
}

function alphaColor(v) {
  if (v <= 200) return "red";
  if (v <= 800) return "orange";
  return "green";
}

function premColor(v) {
return v ? "#d97706" : "inherit";
}

async function loadData() {
  try {
    const metaRaw = await loadJson("data/meta.json");
    const econRaw = await loadJson("data/economics.json");
    const moeRaw = await loadJson("data/moe.json");
    const statsRaw = await loadJson("data/tank-stats.json");

    const meta = metaRaw.pageProps.tankDetails;
    const econ = econRaw.pageProps.data.data;
    const moe = moeRaw.pageProps.initialChangeData;
    const stats = statsRaw.pageProps.data;

    console.log("Loaded OK:", {
      meta: meta.length,
      econ: econ.length,
      moe: moe.length,
      stats: stats.length
    });

data = merge(meta, econ, moe, stats);
populateTiers(data);
populateNations(data);
render();

  } catch (err) {
    console.error("loadData failed:", err);
    alert("Failed to load local JSON. See console.");
  }
}




function merge(meta, econ, moe, stats) {
  const econMap = new Map(econ.map(e => [e.tank_id, e]));
  const moeMap = new Map(moe.map(m => [m.id, m]));
  const statMap = new Map(stats.map(s => [s.tank_id, s]));

  return meta.map(t => {
    const e = econMap.get(t.id);
    const m = moeMap.get(t.id);
    const s = statMap.get(t.id);

    //const alpha = s
    //  ? Math.max(s.alpha1 || 0, s.alpha2 || 0, s.alpha3 || 0)
    //  : null;

    const alpha = s?.alpha1 ?? null;

    const reload = s?.reload ?? null;
    const moe65 = m ? m["65"] : null;

    return {
      id: t.id,
      name: t.name,
      tier: t.tier,
      class: t.class,
      nation: t.nation,
      isPrem: t.isPrem,
      
      alpha,
      reload,

  
      repair: e?.avg_repair_cost ?? null,
      costPerShot: e?.cost_per_shot ?? null,

      moe65,

      shots: (alpha && moe65)
        ? Math.ceil(moe65 / alpha)
        : null
    };
  });
}


function populateTiers(rows) {
  const tiers = [...new Set(rows.map(r => r.tier))].sort();
  const sel = document.getElementById("tierFilter");
  tiers.forEach(t => {
    const o = document.createElement("option");
    o.value = t;
    o.textContent = `Tier ${t}`;
    sel.appendChild(o);
  });
}

function populateNations(rows) {
  const nations = [...new Set(rows.map(r => r.nation))].sort();
  const sel = document.getElementById("nationFilter");

  nations.forEach(n => {
    const o = document.createElement("option");
    o.value = n;
    o.textContent = n;
    sel.appendChild(o);
  });
}

function render() {
  const tbody = document.querySelector("#tankTable tbody");
  tbody.innerHTML = "";

  const search = document.getElementById("search").value.toLowerCase();
  const tier = document.getElementById("tierFilter").value;
  const cls = document.getElementById("classFilter").value;
  const nation = document.getElementById("nationFilter").value;
  const showPremOnly = document.getElementById("showPremOnly").checked;
  const hideZeros = document.getElementById("hideZeros").checked;

let rows = data.filter(r =>
  (!search || r.name.toLowerCase().includes(search)) &&
  (!tier || r.tier == tier) &&
  (!cls || r.class === cls) &&
  (!nation || r.nation === nation) &&
  (
    !hideZeros ||
    (
      (r.shots ?? 0) > 0 &&
      (r.repair ?? 0) > 0
    )
  ) &&
  (
    !showPremOnly ||
    r.isPrem === true
  )
);


  if (sortKey) {
    rows.sort((a, b) =>
      sortAsc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]
    );
  }

  rows.forEach(r => {
    tbody.insertAdjacentHTML("beforeend", `
      <tr>
        <td style="color:${premColor(r.isPrem)}">${r.name}</td>
        <td>${r.class}</td>
        <td>${r.nation}</td>
        <td>${r.tier}</td>
        <td style="color:${alphaColor(r.alpha ?? 0)}">${r.alpha ?? 0}</td>
        <td style="color:${reloadColor(r.reload ?? 0)}">${r.reload ?? 0}</td>
        <td style="color:${repairColor(r.repair ?? 0)}">${(r.repair) ?? 0}</td>
        <td>${(r.moe65 ?? 0).toFixed(0) }</td>
        <td style="color:${shotColor(r.shots ?? 0)}">${r.shots ?? 0}</td>
      </tr>
    `);
  });

    document.getElementById("counter").textContent =
    `Showing ${rows.length} / ${data.length} tanks`;

}

document.getElementById("search").oninput = render;
document.getElementById("tierFilter").onchange = render;
document.getElementById("classFilter").onchange = render;
document.getElementById("hideZeros").onchange = render;
document.getElementById("showPremOnly").onchange = render;
document.getElementById("nationFilter").onchange = render;

document.querySelectorAll("th").forEach(th => {
  th.onclick = () => {
    const key = th.dataset.key;
    sortAsc = sortKey === key ? !sortAsc : true;
    sortKey = key;
    render();
  };
});

loadData();
