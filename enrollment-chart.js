(function () {

  /* ── 1. INJECT STYLES ────────────────────────────────────── */
  const style = document.createElement("style");
  style.textContent = `
    #enrollment-chart {
      position: relative;
      font-family: 'Helvetica Neue', Arial, sans-serif;
    }

    /* HTML title & subtitle */
    #enrollment-chart .chart-header {
      margin-bottom: 0.5rem;
      padding: 0 0.5rem;
    }
    #enrollment-chart .chart-title {
      font-size: 1.2rem;      /* overridden in responsive-fixes.css */
      font-weight: 800;
      color: #111111;
      line-height: 1.3;
      margin: 0 0 0.8rem 0;
    }
    #enrollment-chart .chart-subtitle {
      font-size: 0.8rem;      /* overridden in responsive-fixes.css */
      color: #555555;
      margin: 0 0 0.8rem 0;
      line-height: 1.4;
    }

    /* SVG */
    #enrollment-chart svg {
      width: 100%;
      height: auto;
      display: block;
    }

    /* Grid lines */
    #enrollment-chart .axis .tick line {
      stroke: #e0e0e0;
      stroke-dasharray: 3, 3;
    }
    #enrollment-chart .axis .tick text {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 0.75rem;
      fill: #555555;
    }
    #enrollment-chart .axis-label {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 0.75rem;
      fill: #555555;
    }

    /* Zero baseline */
    #enrollment-chart .zero-line {
      stroke: #aaa8a8;
      stroke-width: 1.5px;
      stroke-dasharray: 3, 3;
    }

    /* Lines */
    #enrollment-chart .line {
      fill: none;
      stroke-width: 2.5px;
    }
    #enrollment-chart .line-baseline  { stroke: #111111; }
    #enrollment-chart .line-highlight { stroke: #963737; }

    /* Dots */
    #enrollment-chart .dot {
      stroke: #ffffff;
      stroke-width: 2px;
    }
    #enrollment-chart .dot-baseline  { fill: #111111; }
    #enrollment-chart .dot-highlight { fill: #963737; }

    /* Direct labels */
    #enrollment-chart .direct-label {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 0.78rem;
      font-weight: 700;
      fill: #963737;
      letter-spacing: 0.04rem;
    }

    #enrollment-chart .annotation-text {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 0.6rem;
      font-weight: 400;
      fill: #6e6e6e;
    }

    /* Tooltip */
    #enrollment-chart .chart-tooltip {
      position: absolute;
      background: #111111;
      color: #ffffff;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 0.78rem;
      line-height: 1.6;
      padding: 0.4rem 0.75rem;
      border-radius: 3px;
      pointer-events: none;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.15s ease;
    }

    /* Source & notes */
    #enrollment-chart .chart-notes {
      margin-top: 0.5rem;
      padding: 0 0.5rem;
    }
    #enrollment-chart .chart-notes p {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 0.72rem;
      font-style: italic;
      color: #555555;
      line-height: 1.5;
      margin-bottom: 0.25rem;
    }
    #enrollment-chart .chart-notes a {
      color: #555555;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    #enrollment-chart .chart-notes a:hover { color: #111111; }
  `;
  document.head.appendChild(style);

  /* ── 2. HTML HEADER ──────────────────────────────────────── */
  const header = d3.select("#enrollment-chart")
    .append("div")
    .attr("class", "chart-header");

  header.append("p")
    .attr("class", "chart-title")
    .text("New International Student Enrollment Dropped 7% in 2025");

  header.append("p")
    .attr("class", "chart-subtitle")
    .text("Annual % change in new international student enrollment in the U.S., 2015–2025");

  /* ── 3. HARDCODED DATA ───────────────────────────────────── */
  const data = [
    { year: 2015, pct: -2.3  },
    { year: 2016, pct:  2.3  },
    { year: 2017, pct: -3.2  },
    { year: 2018, pct: -6.5  },
    { year: 2019, pct: -0.8  },
    { year: 2020, pct: -0.6  },
    { year: 2021, pct: -45.6 },
    { year: 2022, pct:  80.0 },
    { year: 2023, pct:  13.9 },
    { year: 2024, pct:  0.06 },
    { year: 2025, pct: -7.2  },
  ];

  /* ── 4. DIMENSIONS ───────────────────────────────────────── */
  const margin      = { top: 30, right: 50, bottom: 55, left: 60 };
  const totalWidth  = 700;
  const totalHeight = 420;
  const width       = totalWidth  - margin.left - margin.right;
  const height      = totalHeight - margin.top  - margin.bottom;

  /* ── 5. SVG ──────────────────────────────────────────────── */
  // ─── RESPONSIVE NOTE ──────────────────────────────────────
  // viewBox + preserveAspectRatio let the browser handle scaling.
  // The container width is controlled by chart.css + the
  // responsive-fixes.css overrides, so no JS resize is needed
  // for the chart body itself.
  const outerSvg = d3.select("#enrollment-chart")
    .append("svg")
      .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("aria-label", "Line chart: annual % change in new international student enrollment 2015–2025");

  const svg = outerSvg
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  /* ── 6. SCALES ───────────────────────────────────────────── */
  const xScale = d3.scaleLinear()
    .domain([2015, 2025])
    .range([0, width]);

  const yPadding = 8;
  const yMin = Math.floor(d3.min(data, d => d.pct)) - yPadding;
  const yMax = Math.ceil(d3.max(data, d => d.pct))  + yPadding;

  const yScale = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([height, 0]);

  /* ── 7. AXES ─────────────────────────────────────────────── */
  // ─── RESPONSIVE FIX: adaptive x-axis tick density ─────────
  // At 700px (viewBox), 11 year labels fit fine (~64px each).
  // When the SVG is scaled to ~300px, each slot shrinks to
  // ~27px — labels collide. A ResizeObserver switches to
  // alternate-year ticks below a rendered width of 400px.
  //
  // We expose the axis selection so the observer can re-call it.
  const allYears  = [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025];
  const evenYears = allYears.filter(y => y % 2 === 1); // 2015,2017,...2025

  function buildXAxis(tickValues) {
    return d3.axisBottom(xScale)
      .tickValues(tickValues)
      .tickFormat(d3.format("d"))
      .tickSize(-height)
      .tickPadding(12);
  }

  const xAxisG = svg.append("g")
    .attr("class", "axis axis-x")
    .attr("transform", `translate(0,${height})`)
    .call(buildXAxis(allYears))
    .call(g => g.select(".domain").remove());

  const yAxis = d3.axisLeft(yScale)
    .ticks(8)
    .tickFormat(d => `${d}%`)
    .tickSize(-width)
    .tickPadding(10);

  svg.append("g")
    .attr("class", "axis axis-y")
    .call(yAxis)
    .call(g => g.select(".domain").remove());

  svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 12)
    .attr("text-anchor", "middle")
    .text("% Change");

  // ─── ResizeObserver: switch tick density at narrow widths ──
  // The SVG scales via CSS, so its rendered pixel width may be
  // much smaller than the 700px viewBox. We observe the SVG
  // element's actual rendered width and re-draw the x-axis with
  // fewer ticks when needed.
  if (typeof ResizeObserver !== "undefined") {
    const svgEl = document.querySelector("#enrollment-chart svg");
    let lastWide = true; // track state to avoid unnecessary redraws

    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const renderedWidth = entry.contentRect.width;
        const useWide = renderedWidth >= 400;

        if (useWide !== lastWide) {
          lastWide = useWide;
          xAxisG
            .call(buildXAxis(useWide ? allYears : evenYears))
            .call(g => g.select(".domain").remove());
        }
      }
    });

    ro.observe(svgEl);
  }

  /* ── 8. ZERO BASELINE ────────────────────────────────────── */
  svg.append("line")
    .attr("class", "zero-line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", yScale(0))
    .attr("y2", yScale(0));

  /* ── 9. LINE SEGMENTS ────────────────────────────────────── */
  const lineGen = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.pct))
    .curve(d3.curveMonotoneX);

  svg.append("path")
    .datum(data.filter(d => d.year <= 2024))
    .attr("class", "line line-baseline")
    .attr("d", lineGen);

  svg.append("path")
    .datum(data.filter(d => d.year >= 2024))
    .attr("class", "line line-highlight")
    .attr("d", lineGen);

  /* ── 10. DOTS ────────────────────────────────────────────── */
  svg.selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("class", d => d.year > 2024 ? "dot dot-highlight" : "dot dot-baseline")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.pct))
      .attr("r", 5);

  /* ── 11. DIRECT LABELS for 2025 ─────────────────────────── */
  const labelData = data.filter(d => d.year > 2024);

  svg.selectAll(".direct-label")
    .data(labelData)
    .enter()
    .append("text")
      .attr("class", "direct-label")
      .attr("x", d => xScale(d.year))
      .attr("text-anchor", d => d.year === 2025 ? "end" : "middle")
      .attr("y", d => d.pct >= 0
        ? yScale(d.pct) - 12
        : yScale(d.pct) + 20)
      .text(d => `${d.pct}%`);

  /* ── 11.5 ANNOTATION for 2021 ───────────────────────────── */
  const data2021 = data.find(d => d.year === 2021);

  if (data2021) {
    svg.append("text")
      .attr("class", "annotation-text")
      .attr("x", xScale(data2021.year))
      .attr("y", yScale(data2021.pct) + 25)
      .attr("text-anchor", "middle")
      .text("pandemic");
  }

  /* ── 12. TOOLTIP for 2015–2024 ───────────────────────────── */
  const tooltip = d3.select("#enrollment-chart")
    .append("div")
    .attr("class", "chart-tooltip");

  /* Helper — position tooltip near pointer or touch */
  function positionTooltip(event, d) {
    const rect = document.getElementById("enrollment-chart").getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    tooltip
      .style("opacity", 1)
      .html(`<strong>${d.year}</strong><br/>${d.pct}%`)
      .style("left", `${clientX - rect.left + 14}px`)
      .style("top",  `${clientY - rect.top  - 44}px`);
  }

  svg.selectAll(".hit-area")
    .data(data.filter(d => d.year <= 2024))
    .enter()
    .append("circle")
      .attr("class", "hit-area")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.pct))
      .attr("r", 20)
      .style("fill", "transparent")
      .style("cursor", "default")
      /* Mouse events */
      .on("mouseover", function (event, d) {
        positionTooltip(event, d);
        svg.selectAll(".dot-baseline")
          .filter(p => p.year === d.year)
          .attr("r", 7);
      })
      .on("mousemove", function (event) {
        const rect = document.getElementById("enrollment-chart").getBoundingClientRect();
        tooltip
          .style("left", `${event.clientX - rect.left + 14}px`)
          .style("top",  `${event.clientY - rect.top  - 44}px`);
      })
      .on("mouseleave", function (event, d) {
        tooltip.style("opacity", 0);
        svg.selectAll(".dot-baseline")
          .filter(p => p.year === d.year)
          .attr("r", 5);
      })
      /* Touch events — RESPONSIVE FIX ───────────────────────
         Tap a dot on mobile to see the tooltip. Auto-hides
         after 2.5 s so it doesn't block the rest of the chart.
      ────────────────────────────────────────────────────────── */
      .on("touchstart", function (event, d) {
        event.preventDefault();
        positionTooltip(event, d);
        svg.selectAll(".dot-baseline")
          .filter(p => p.year === d.year)
          .attr("r", 7);
        setTimeout(() => {
          tooltip.style("opacity", 0);
          svg.selectAll(".dot-baseline")
            .filter(p => p.year === d.year)
            .attr("r", 5);
        }, 2500);
      });

  /* ── 13. SOURCE ──────────────────────────────────────────── */
  const notes = d3.select("#enrollment-chart")
    .append("div")
    .attr("class", "chart-notes");

  notes.append("p")
    .html(`<strong>Source:</strong> <a href="https://opendoorsdata.org" target="_blank" rel="noopener">Institute of International Education (IIE)</a> Open Doors Report`);

})();