/* ============================================================
   opt-chart.js — OPT Processing Times Line Chart
   D3.js v7 | Targets #opt-chart in index.html
   All tooltip styles injected by this file
   ============================================================ */

(function () {

  /* ── 1. INJECT TOOLTIP CSS ───────────────────────────────── */
  // Self-contained: no tooltip rules needed in chart.css
  const style = document.createElement("style");
  style.textContent = `
    #opt-chart {
      position: relative; 
    }
    #opt-chart .chart-tooltip {
      position: absolute;
      background: #111111;
      color: #ffffff;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 0.78rem;
      line-height: 1.5;
      padding: 0.4rem 0.75rem;
      border-radius: 3px;
      pointer-events: none;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.15s ease;
    }
    #opt-chart .chart-headline {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 1rem;
      font-weight: 800;
      fill: #111111;
    }
    #opt-chart .axis .tick line {
      stroke: #e0e0e0;
      stroke-dasharray: 3, 3;
    }
    #opt-chart .axis .tick text {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 0.75rem;
      fill: #555555;
    }
    #opt-chart .axis-label {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 0.75rem;
      fill: #555555;
    }
    #opt-chart .line {
      fill: none;
      stroke-width: 2.5px;
    }
    #opt-chart .line-baseline  { stroke: #111111; }
    #opt-chart .line-highlight { stroke: #963737; }
    #opt-chart .dot {
      stroke: #ffffff;
      stroke-width: 2px;
    }
    #opt-chart .dot-baseline  { fill: #111111; }
    #opt-chart .dot-highlight { fill: #963737; }
    #opt-chart .direct-label {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 0.78rem;
      font-weight: 700;
      fill: #963737;
    }
    #opt-chart .chart-notes {
      margin-top: 0.5rem;
      padding: 0 0.5rem;
    }

    #opt-chart .chart-notes p {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 0.75rem;
      font-style: italic;
      color: #555555;
      line-height: 1.5;
      margin-bottom: 0.25rem;
    }

    #opt-chart .chart-notes a {
      color: #555555;
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    #opt-chart .chart-notes a:hover {
      color: #111111;
    }
  `;
  document.head.appendChild(style);

  /* ── 2. HARDCODED DATA ───────────────────────────────────── */
  const data = [
    { year: 2021, months: 3   },
    { year: 2022, months: 4.7 },
    { year: 2023, months: 2.8 },
    { year: 2024, months: 3.1 },
    { year: 2025, months: 4.1 },
  ];

  /* ── 3. DIMENSIONS & MARGINS ─────────────────────────────── */
  const margin = { top: 60, right: 40, bottom: 50, left: 60 };
  const totalWidth  = 700;
  const totalHeight = 400;
  const width  = totalWidth  - margin.left - margin.right;
  const height = totalHeight - margin.top  - margin.bottom;

  /* ── 4. CREATE SVG ───────────────────────────────────────── */
  const svg = d3.select("#opt-chart")
    .append("svg")
      .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("aria-label", "Line chart: OPT processing times 2021–2025")
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  /* ── 5. SCALES ───────────────────────────────────────────── */
  const xScale = d3.scaleLinear()
    .domain([2021, 2025])
    .range([0, width]);

  const yMin = Math.floor(d3.min(data, d => d.months));
  const yMax = Math.ceil(d3.max(data, d => d.months));

  const yScale = d3.scaleLinear()
    .domain([yMin - 1, yMax + 0.5])
    .range([height, 0]);

  /* ── 6. AXES ─────────────────────────────────────────────── */
  const xAxis = d3.axisBottom(xScale)
    .tickValues([2021, 2022, 2023, 2024, 2025])
    .tickFormat(d3.format("d"))
    .tickSize(-height)
    .tickPadding(12);

  const yAxis = d3.axisLeft(yScale)
    .ticks(yMax - yMin + 2)
    .tickFormat(d => `${d}`)
    .tickSize(-width)
    .tickPadding(10);

  svg.append("g")
    .attr("class", "axis axis-x")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis)
    .call(g => g.select(".domain").remove());

  svg.append("g")
    .attr("class", "axis axis-y")
    .call(yAxis)
    .call(g => g.select(".domain").remove());

  // Y-axis label — tied to margin so it never gets clipped
  svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 12)
    .attr("text-anchor", "middle")
    .text("Duration (Months)");

  /* ── 7. LINE SEGMENTS ────────────────────────────────────── */
  const lineGen = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.months))
    .curve(d3.curveMonotoneX);

  // Black baseline: 2021–2024
  svg.append("path")
    .datum(data.filter(d => d.year <= 2024))
    .attr("class", "line line-baseline")
    .attr("d", lineGen);

  // Red highlight: 2024–2025
  svg.append("path")
    .datum(data.filter(d => d.year >= 2024))
    .attr("class", "line line-highlight")
    .attr("d", lineGen);

  /* ── 8. DOTS ─────────────────────────────────────────────── */
  svg.selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("class", d => d.year >= 2024 ? "dot dot-highlight" : "dot dot-baseline")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.months))
      .attr("r", 5);

  /* ── 9. DIRECT LABELS for 2024 & 2025 ───────────────────── */
  svg.selectAll(".direct-label")
    .data(data.filter(d => d.year >= 2024))
    .enter()
    .append("text")
      .attr("class", "direct-label")
      .attr("x", d => xScale(d.year))
      .attr("y", d => yScale(d.months) - 12)
      .attr("text-anchor", "middle")
      .text(d => `${d.months} mo`);

/* ── 10. TOOLTIP for 2021–2023 ───────────────────────────── */
const tooltip = d3.select("#opt-chart")
  .append("div")
  .attr("class", "chart-tooltip");

svg.selectAll(".hit-area")
  .data(data.filter(d => d.year <= 2023))
  .enter()
  .append("circle")
    .attr("class", "hit-area")
    .attr("cx", d => xScale(d.year))
    .attr("cy", d => yScale(d.months))
    .attr("r", 20)
    .style("fill", "transparent")
    .style("cursor", "default")
    .on("mouseover", function (event, d) {
      tooltip
        .style("opacity", 1)
        .html(`<strong>${d.year}</strong><br/>${d.months} months`);

      // Highlight the dot underneath
      svg.selectAll(".dot-baseline")
        .filter(p => p.year === d.year)
        .attr("r", 7);
    })
    .on("mousemove", function (event) {
      const rect = document.getElementById("opt-chart").getBoundingClientRect();
      tooltip
        .style("left", `${event.clientX - rect.left + 14}px`)
        .style("top",  `${event.clientY - rect.top  - 44}px`);
    })
    .on("mouseleave", function (event, d) {
      tooltip.style("opacity", 0);

      // Restore dot size
      svg.selectAll(".dot-baseline")
        .filter(p => p.year === d.year)
        .attr("r", 5);
    });

  /* ── 11. CHART HEADLINE ──────────────────────────────────── */
  svg.append("text")
    .attr("class", "chart-headline")
    .attr("x", -margin.left)
    .attr("y", -30)
    .text("OPT Approval Processing Times Surged 1.5x Over the Last Year");

})();

  /* ── 12. BOTTOM NOTES ────────────────────────────────────── */
  const notesGroup = d3.select("#opt-chart")
    .append("div")
    .attr("class", "chart-notes");

  notesGroup.append("p")
    .html(`<strong>Source:</strong> <a href="https://egov.uscis.gov/processing-times/historic-pt" target="_blank" rel="noopener">U.S. Citizenship and Immigration Services (USCIS)</a>`);

  notesGroup.append("p")
    .text("Note: This category includes all other applications for employment authorization, except those based on Deferred Action for Childhood Arrivals (DACA), a pending asylum application, a pending application for adjustment of status (green card), or parole.");
