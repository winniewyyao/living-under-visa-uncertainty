/* ============================================================
   econ-map.js — U.S. Choropleth Map: International Student
   Economic Contributions by State
   D3.js v7 + TopoJSON | Targets #econ-map in index.html
   Title, subtitle, legend and notes are all HTML (not SVG)
   so they scale correctly at any container width
   ============================================================ */

(function () {

  /* ── 1. INJECT STYLES ────────────────────────────────────── */
  const style = document.createElement("style");
  style.textContent = `
    #econ-map {
      position: relative;
      font-family: 'Helvetica Neue', Arial, sans-serif;
    }

    /* ── HTML Title & Subtitle ── */
    #econ-map .map-header {
      margin-bottom: 0.5rem;
      padding: 0 0.5rem;
    }
    #econ-map .map-title {
      font-size: 1.2rem;
      font-weight: 800;
      color: #111111;
      line-height: 1.3;
      margin: 0 0 0.3rem 0;
    }
    #econ-map .map-subtitle {
      font-size: 0.8rem;
      color: #555555;
      margin: 0 0 2rem 0;
      line-height: 1.4;
    }

    /* ── SVG Map ── */
    #econ-map svg {
      width: 100%;
      height: auto;
      display: block;
    }
    #econ-map .state {
      stroke: #ffffff;
      stroke-width: 0.5px;
      cursor: default;
      transition: opacity 0.15s ease, stroke-width 0.15s ease;
    }
    #econ-map .state:hover {
      stroke: #ffffff;
      stroke-width: 2px;
      opacity: 0.8;
    }

    /* ── Tooltip ── */
    #econ-map .map-tooltip {
      position: absolute;
      background: #111111;
      color: #ffffff;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 0.78rem;
      line-height: 1.6;
      padding: 0.45rem 0.8rem;
      border-radius: 3px;
      pointer-events: none;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.15s ease;
    }

    /* ── HTML Legend — right-aligned below map ── */
    #econ-map .map-legend-wrap {
      display: flex;
      flex-direction: column;
      align-items: flex-end;   /* pins to right */
      margin: 0.6rem 0.5rem 0.4rem auto;
      width: fit-content;
      margin-left: auto;       /* pushes to right edge */
    }
    #econ-map .map-legend-title {
      font-size: 0.72rem;
      font-weight: 700;
      color: #333333;
      margin-bottom: 4px;
    }
    #econ-map .map-legend-gradient {
      width: 160px;
      height: 10px;
      background: linear-gradient(to right, #457b9d, #1d3557);
    }
    #econ-map .map-legend-labels {
      display: flex;
      justify-content: space-between;
      width: 160px;
      font-size: 0.68rem;
      color: #555555;
      margin-top: 3px;
    }

    /* ── Source & Notes ── */
    #econ-map .map-notes {
      margin-top: 1.5rem;
      padding: 0 0.5rem;
    }
    #econ-map .map-notes p {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 0.72rem;
      font-style: italic;
      color: #555555;
      line-height: 1.5;
      margin-bottom: 0.25rem;
    }
    #econ-map .map-notes a {
      color: #555555;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    #econ-map .map-notes a:hover { color: #111111; }
  `;
  document.head.appendChild(style);

  /* ── 2. HTML HEADER (title + subtitle) ───────────────────── */
  // Rendered as HTML so font sizes match the rest of the page
  const header = d3.select("#econ-map")
    .append("div")
    .attr("class", "map-header");

  header.append("p")
    .attr("class", "map-title")
    .text("International Students Contributed near $ 43 Billion in 2024-2025 Across the U.S.");

  header.append("p")
    .attr("class", "map-subtitle")
    .text("International Students' Economic Contribution includes spending on tuition, food, transportation and other expenses.");

  /* ── 3. HARDCODED DATA ───────────────────────────────────── */
  const rawData = {
    "Alabama":              339500000,
    "Alaska":               10000000,
    "Arizona":              1000000000,
    "Arkansas":             153800000,
    "California":           6300000000,
    "Colorado":             409900000,
    "Connecticut":          747700000,
    "Delaware":             108900000,
    "District of Columbia": 532200000,
    "Florida":              1500000000,
    "Georgia":              1100000000,
    "Hawaii":               124500000,
    "Idaho":                85500000,
    "Illinois":             2400000000,
    "Indiana":              997500000,
    "Iowa":                 266500000,
    "Kansas":               230800000,
    "Kentucky":             295500000,
    "Louisiana":            271100000,
    "Maine":                87300000,
    "Maryland":             1000000000,
    "Massachusetts":        3600000000,
    "Michigan":             1400000000,
    "Minnesota":            518000000,
    "Mississippi":          92100000,
    "Missouri":             1000000000,
    "Montana":              31100000,
    "Nebraska":             121400000,
    "Nevada":               67600000,
    "New Hampshire":        160400000,
    "New Jersey":           950300000,
    "New Mexico":           84500000,
    "New York":             5900000000,
    "North Carolina":       886300000,
    "North Dakota":         56700000,
    "Ohio":                 1300000000,
    "Oklahoma":             224700000,
    "Oregon":               263800000,
    "Pennsylvania":         2100000000,
    "Rhode Island":         272400000,
    "South Carolina":       207200000,
    "South Dakota":         67100000,
    "Tennessee":            384800000,
    "Texas":                2500000000,
    "Utah":                 316300000,
    "Vermont":              57600000,
    "Virginia":             893500000,
    "Washington":           950100000,
    "West Virginia":        81900000,
    "Wisconsin":            571800000,
    "Wyoming":              25500000,
  };

  /* ── 4. FIPS → STATE NAME LOOKUP ─────────────────────────── */
  const fipsToName = {
    "01":"Alabama","02":"Alaska","04":"Arizona","05":"Arkansas",
    "06":"California","08":"Colorado","09":"Connecticut","10":"Delaware",
    "11":"District of Columbia","12":"Florida","13":"Georgia","15":"Hawaii",
    "16":"Idaho","17":"Illinois","18":"Indiana","19":"Iowa","20":"Kansas",
    "21":"Kentucky","22":"Louisiana","23":"Maine","24":"Maryland",
    "25":"Massachusetts","26":"Michigan","27":"Minnesota","28":"Mississippi",
    "29":"Missouri","30":"Montana","31":"Nebraska","32":"Nevada",
    "33":"New Hampshire","34":"New Jersey","35":"New Mexico","36":"New York",
    "37":"North Carolina","38":"North Dakota","39":"Ohio","40":"Oklahoma",
    "41":"Oregon","42":"Pennsylvania","44":"Rhode Island","45":"South Carolina",
    "46":"South Dakota","47":"Tennessee","48":"Texas","49":"Utah",
    "50":"Vermont","51":"Virginia","53":"Washington","54":"West Virginia",
    "55":"Wisconsin","56":"Wyoming"
  };

  /* ── 5. FORMAT HELPER ────────────────────────────────────── */
  function formatValue(val) {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(1)} billion`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)} million`;
    return `$${val.toLocaleString()}`;
  }

  /* ── 6. SVG — map only, no title/subtitle inside ─────────── */
  const totalWidth  = 960;
  const totalHeight = 580;

  const svg = d3.select("#econ-map")
    .append("svg")
      .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("aria-label", "Choropleth map: international student economic contributions by U.S. state");

  const mapG = svg.append("g");

  /* ── 7. PROJECTION ───────────────────────────────────────── */
  const projection = d3.geoAlbersUsa()
    .scale(1280)
    .translate([totalWidth / 2, totalHeight / 2]);

  const path = d3.geoPath().projection(projection);

  /* ── 8. COLOR SCALE ──────────────────────────────────────── */
  const values = Object.values(rawData);
  const colorScale = d3.scaleSequentialLog()
    .domain([d3.min(values), d3.max(values)])
    .range(["#457b9d", "#1d3557"]);

  /* ── 9. TOOLTIP ──────────────────────────────────────────── */
  const tooltip = d3.select("#econ-map")
    .append("div")
    .attr("class", "map-tooltip");

  /* ── 10. LOAD TOPOJSON & DRAW ────────────────────────────── */
  d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json")
    .then(function (us) {

      // State fills
      mapG.append("g")
        .selectAll(".state")
        .data(topojson.feature(us, us.objects.states).features)
        .enter()
        .append("path")
          .attr("class", "state")
          .attr("d", path)
          .attr("fill", function (d) {
            const id   = String(d.id).padStart(2, "0");
            const name = fipsToName[id];
            const val  = rawData[name];
            return val ? colorScale(val) : "#cccccc";
          })
          .on("mouseover", function (event, d) {
            const id   = String(d.id).padStart(2, "0");
            const name = fipsToName[id] || "Unknown";
            const val  = rawData[name];
            tooltip
              .style("opacity", 1)
              .html(`<strong>${name}</strong><br/>${val ? formatValue(val) : "No data"}`);
          })
          .on("mousemove", function (event) {
            const rect = document.getElementById("econ-map").getBoundingClientRect();
            tooltip
              .style("left", `${event.clientX - rect.left + 14}px`)
              .style("top",  `${event.clientY - rect.top  - 44}px`);
          })
          .on("mouseleave", function () {
            tooltip.style("opacity", 0);
          });

      // State borders mesh
      mapG.append("path")
        .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
        .attr("fill", "none")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", "0.4")
        .attr("d", path);

    })
    .catch(function (err) {
      console.error("econ-map.js: Failed to load TopoJSON →", err);
      d3.select("#econ-map")
        .append("p")
        .style("color", "#963737")
        .style("font-style", "italic")
        .style("font-size", "0.85rem")
        .text("Map data could not be loaded.");
    });

  /* ── 11. HTML LEGEND — right-aligned below map ───────────── */
  const legendWrap = d3.select("#econ-map")
    .append("div")
    .attr("class", "map-legend-wrap");

  legendWrap.append("div")
    .attr("class", "map-legend-title")
    .text("Economic Contribution");

  legendWrap.append("div")
    .attr("class", "map-legend-gradient");

  legendWrap.append("div")
    .attr("class", "map-legend-labels")
    .html("<span>Lower</span><span>Higher</span>");

  /* ── 12. SOURCE & NOTES ──────────────────────────────────── */
  const notes = d3.select("#econ-map")
    .append("div")
    .attr("class", "map-notes");

  notes.append("p")
    .html(`<strong>Source:</strong> <a href="https://www.nafsa.org/policy-and-advocacy/policy-resources/nafsa-international-student-economic-value-tool-v2" target="_blank" rel="noopener">Association of International Educators (NAFSA)</a> ,based on data from U.S. Department of Education, Petersons Data, Common Data Set, U.S. Department of Commerce, and the Open Doors Report.`);

})();