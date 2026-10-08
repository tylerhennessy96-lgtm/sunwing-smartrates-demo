// Minimal local Chart.js replacement for the Sunwing demo.
// This keeps the container fully self-contained with no browser-time pulls.
(function () {
  function toNumber(value, fallback) {
    var num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  function hexToRgba(value, fallbackAlpha) {
    if (!value || typeof value !== "string") return value;
    var match = value.trim().match(/^#([0-9a-f]{6})$/i);
    if (!match) return value;
    var hex = match[1];
    var r = parseInt(hex.slice(0, 2), 16);
    var g = parseInt(hex.slice(2, 4), 16);
    var b = parseInt(hex.slice(4, 6), 16);
    return "rgba(" + r + "," + g + "," + b + "," + fallbackAlpha + ")";
  }

  function dashed(ctx, dash) {
    ctx.setLineDash(Array.isArray(dash) ? dash : []);
  }

  function resolveFill(dataset) {
    if (dataset.backgroundColor && dataset.backgroundColor !== "rgba(0,0,0,0)") {
      return dataset.backgroundColor;
    }
    return hexToRgba(dataset.borderColor, 0.12) || "rgba(233,30,140,0.12)";
  }

  function buildSegments(xs, ys, stepped) {
    var segments = [];
    var current = [];
    for (var i = 0; i < xs.length; i += 1) {
      var x = xs[i];
      var y = ys[i];
      if (y == null || !Number.isFinite(y) || !Number.isFinite(x)) {
        if (current.length) segments.push(current);
        current = [];
        continue;
      }
      current.push({ x: x, y: y });
    }
    if (current.length) segments.push(current);
    return segments.map(function (segment) {
      if (stepped !== "before" || segment.length < 2) return segment;
      var steppedPoints = [segment[0]];
      for (var i = 1; i < segment.length; i += 1) {
        steppedPoints.push({ x: segment[i].x, y: segment[i - 1].y });
        steppedPoints.push(segment[i]);
      }
      return steppedPoints;
    });
  }

  function pathLine(ctx, points) {
    ctx.beginPath();
    for (var i = 0; i < points.length; i += 1) {
      var point = points[i];
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }
  }

  function LocalChart(canvas, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.config = config || {};
    this.onResize = this.render.bind(this);
    if (typeof window !== "undefined") {
      window.addEventListener("resize", this.onResize);
    }
    this.render();
  }

  LocalChart.prototype.destroy = function () {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", this.onResize);
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  LocalChart.prototype.render = function () {
    var canvas = this.canvas;
    var ctx = this.ctx;
    // Size to the PARENT container (Chart.js-style responsive sizing). A bare
    // <canvas> with no CSS size defaults to 300x150, so reading its own rect
    // pins the chart to that default instead of filling its wrapper. The pages
    // wrap each canvas in a `position:relative; width:100%; height:NNNpx` box,
    // so the parent's content box is the width/height we should fill.
    var parent = (canvas.parentNode && canvas.parentNode.nodeType === 1) ? canvas.parentNode : null;
    var rect = canvas.getBoundingClientRect();
    var availW = (parent && parent.clientWidth) || rect.width || canvas.clientWidth || 640;
    var availH = (parent && parent.clientHeight) || rect.height || canvas.clientHeight || 320;
    var width = Math.max(120, Math.round(availW));
    var height = Math.max(120, Math.round(availH));
    var dpr = (typeof window !== "undefined" && window.devicePixelRatio) || 1;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    var options = this.config.options || {};
    var scales = options.scales || {};
    var plugins = options.plugins || {};
    var todayMarker = plugins.todayMarker || null;
    var xScale = scales.x || {};
    var yScale = scales.y || {};
    var data = this.config.data || {};
    var labels = Array.isArray(data.labels) ? data.labels.map(function (value) { return Number(value); }) : [];
    var datasets = Array.isArray(data.datasets) ? data.datasets : [];

    var padding = { top: 18, right: 16, bottom: 34, left: 44 };
    var plot = {
      left: padding.left,
      top: padding.top,
      width: Math.max(10, width - padding.left - padding.right),
      height: Math.max(10, height - padding.top - padding.bottom)
    };

    var xLabels = labels.filter(function (value, index, arr) {
      return Number.isFinite(value) && arr.indexOf(value) === index;
    });
    var xMin = toNumber(xScale.min, xLabels.length ? Math.min.apply(null, xLabels) : 0);
    var xMax = toNumber(xScale.max, xLabels.length ? Math.max.apply(null, xLabels) : 100);
    var yValues = [];
    datasets.forEach(function (dataset) {
      (dataset.data || []).forEach(function (value) {
        if (value != null && Number.isFinite(Number(value))) yValues.push(Number(value));
      });
    });
    var yMin = toNumber(yScale.min, yValues.length ? Math.min.apply(null, yValues) : 0);
    var yMax = toNumber(yScale.max, yValues.length ? Math.max.apply(null, yValues) : 100);

    function projectX(value) {
      var ratio = (value - xMin) / Math.max(1, xMax - xMin);
      var normalized = xScale.reverse ? 1 - ratio : ratio;
      return plot.left + (normalized * plot.width);
    }

    function projectY(value) {
      var ratio = (value - yMin) / Math.max(1, yMax - yMin);
      return plot.top + plot.height - (ratio * plot.height);
    }

    var markerX = null;
    if (todayMarker && todayMarker.display !== false) {
      var markerValue = Number(todayMarker.x);
      if (Number.isFinite(markerValue) && markerValue >= xMin && markerValue <= xMax) {
        markerX = projectX(markerValue);
      }
    }

    function tickValues(axisLabels, min, max, count) {
      if (axisLabels && axisLabels.length) return axisLabels;
      var values = [];
      for (var i = 0; i <= count; i += 1) {
        values.push(min + ((max - min) * i) / count);
      }
      return values;
    }

    // Evenly-spaced "nice" tick values (1/2/2.5/5 × 10^n steps) across a
    // numeric range, so the x-axis is labelled by VALUE at round intervals
    // (e.g. 0,100,…,500) instead of one tick per data point.
    function niceTicks(min, max, maxCount) {
      if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return [min];
      var span = max - min;
      var rawStep = span / Math.max(1, maxCount);
      var mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
      var norm = rawStep / mag;
      var step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
      var ticks = [];
      var start = Math.ceil(min / step - 1e-6) * step;
      for (var v = start; v <= max + step * 1e-6; v += step) {
        ticks.push(Math.round(v * 1e6) / 1e6);
      }
      if (!ticks.length || ticks[0] > min + step * 1e-6) ticks.unshift(min);
      if (ticks[ticks.length - 1] < max - step * 1e-6) ticks.push(max);
      return ticks;
    }

    // x ticks: round, evenly-by-value, and capped to what fits the plot
    // width so labels never crowd/overlap. y ticks keep their even split.
    var xTickCap = (xScale.ticks && Number.isFinite(xScale.ticks.maxTicksLimit))
      ? xScale.ticks.maxTicksLimit : 10;
    var xTickFit = Math.max(2, Math.floor(plot.width / 64));
    var xTicks = niceTicks(xMin, xMax, Math.min(xTickCap, xTickFit, 11));
    var yTicks = tickValues(null, yMin, yMax, 5);

    ctx.font = "10px sans-serif";

    if (markerX != null && todayMarker.shade !== false) {
      var shadeSide = todayMarker.shadeSide || "past";
      var shadeStart;
      var shadeEnd;
      if (shadeSide === "future") {
        shadeStart = xScale.reverse ? markerX : plot.left;
        shadeEnd = xScale.reverse ? plot.left + plot.width : markerX;
      } else {
        shadeStart = xScale.reverse ? plot.left : markerX;
        shadeEnd = xScale.reverse ? markerX : plot.left + plot.width;
      }
      var shadeLeft = Math.max(plot.left, Math.min(shadeStart, shadeEnd));
      var shadeRight = Math.min(plot.left + plot.width, Math.max(shadeStart, shadeEnd));
      if (shadeRight > shadeLeft) {
        ctx.fillStyle = todayMarker.shadeColor || "rgba(233,30,140,0.07)";
        ctx.fillRect(shadeLeft, plot.top, shadeRight - shadeLeft, plot.height);
      }
    }

    yTicks.forEach(function (tick) {
      var y = projectY(tick);
      ctx.beginPath();
      ctx.moveTo(plot.left, y);
      ctx.lineTo(plot.left + plot.width, y);
      ctx.strokeStyle = (yScale.grid && yScale.grid.color) || "#2a2d35";
      ctx.lineWidth = 1;
      ctx.stroke();

      var formatter = yScale.ticks && yScale.ticks.callback;
      var label = formatter ? formatter(tick) : String(Math.round(tick));
      ctx.fillStyle = "#9ca3af";
      ctx.fillText(label, 6, y + 3);
    });

    // Draw in left-to-right pixel order (the axis may be reversed) so the
    // overlap guard can compare against the previously placed label.
    var xGridOn = !(xScale.grid && xScale.grid.display === false);
    var xFormatter = xScale.ticks && xScale.ticks.callback;
    var xTickColor = (xScale.ticks && xScale.ticks.color) || "#9ca3af";
    var lastLabelRight = -Infinity;
    xTicks
      .map(function (tick) { return { tick: tick, x: projectX(tick) }; })
      .sort(function (a, b) { return a.x - b.x; })
      .forEach(function (t) {
        if (xGridOn) {
          ctx.beginPath();
          ctx.moveTo(t.x, plot.top);
          ctx.lineTo(t.x, plot.top + plot.height);
          // grid.color may be a per-tick callback in the page config; only a
          // plain string is a valid strokeStyle, otherwise use the default.
          ctx.strokeStyle = (xScale.grid && typeof xScale.grid.color === "string")
            ? xScale.grid.color : "#2a2d35";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        // The page callbacks blank non-marker values; fall back to the
        // rounded number so our evenly-spaced ticks are always labelled.
        var raw = xFormatter ? xFormatter(t.tick) : null;
        var label = (raw === "" || raw == null) ? String(Math.round(t.tick)) : String(raw);
        if (!label) return;
        var w = ctx.measureText(label).width;
        var tx = t.x - w / 2;
        // Keep first/last labels inside the canvas instead of clipping them.
        if (tx < plot.left - 2) tx = plot.left - 2;
        if (tx + w > plot.left + plot.width + 2) tx = plot.left + plot.width + 2 - w;
        if (tx < lastLabelRight + 6) return; // would overlap previous label
        lastLabelRight = tx + w;
        ctx.fillStyle = xTickColor;
        ctx.fillText(label, tx, plot.top + plot.height + 16);
      });

    datasets.forEach(function (dataset, index) {
      var datasetXs = labels.map(projectX);
      var datasetYs = (dataset.data || []).map(function (value) {
        return value == null ? null : projectY(Number(value));
      });
      var segments = buildSegments(datasetXs, datasetYs, dataset.stepped);

      if (dataset.fill === true || dataset.fill === "origin") {
        segments.forEach(function (segment) {
          if (segment.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(segment[0].x, projectY(yMin));
          segment.forEach(function (point) { ctx.lineTo(point.x, point.y); });
          ctx.lineTo(segment[segment.length - 1].x, projectY(yMin));
          ctx.closePath();
          ctx.fillStyle = resolveFill(dataset);
          ctx.fill();
        });
      } else if (dataset.fill === "+1" && datasets[index + 1]) {
        var otherYs = (datasets[index + 1].data || []).map(function (value) {
          return value == null ? null : projectY(Number(value));
        });
        var topPoints = [];
        var bottomPoints = [];
        for (var i = 0; i < datasetXs.length; i += 1) {
          if (datasetYs[i] == null || otherYs[i] == null) continue;
          topPoints.push({ x: datasetXs[i], y: datasetYs[i] });
          bottomPoints.unshift({ x: datasetXs[i], y: otherYs[i] });
        }
        if (topPoints.length > 1) {
          ctx.beginPath();
          ctx.moveTo(topPoints[0].x, topPoints[0].y);
          topPoints.slice(1).forEach(function (point) { ctx.lineTo(point.x, point.y); });
          bottomPoints.forEach(function (point) { ctx.lineTo(point.x, point.y); });
          ctx.closePath();
          ctx.fillStyle = resolveFill(dataset);
          ctx.fill();
        }
      }

      if (dataset.showLine !== false) segments.forEach(function (segment) {
        if (segment.length < 2) return;
        pathLine(ctx, segment);
        dashed(ctx, dataset.borderDash);
        ctx.strokeStyle = dataset.borderColor || "#e91e8c";
        ctx.lineWidth = dataset.borderWidth || 2;
        ctx.stroke();
        dashed(ctx, []);
      });
      datasetYs.forEach(function (y, pointIndex) {
        var x = datasetXs[pointIndex];
        var radius = Array.isArray(dataset.pointRadius) ? dataset.pointRadius[pointIndex] : dataset.pointRadius;
        radius = toNumber(radius, 0);
        if (radius <= 0 || y == null || !Number.isFinite(x) || !Number.isFinite(y)) return;
        var fill = Array.isArray(dataset.pointBackgroundColor)
          ? dataset.pointBackgroundColor[pointIndex] : dataset.pointBackgroundColor;
        var border = Array.isArray(dataset.pointBorderColor)
          ? dataset.pointBorderColor[pointIndex] : dataset.pointBorderColor;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = fill || dataset.borderColor || "#e91e8c";
        ctx.fill();
        var borderWidth = toNumber(dataset.pointBorderWidth, 0);
        if (borderWidth > 0) {
          ctx.strokeStyle = border || dataset.borderColor || "#e91e8c";
          ctx.lineWidth = borderWidth;
          ctx.stroke();
        }
      });
    });

    if (markerX != null) {
      ctx.save();
      dashed(ctx, todayMarker.lineDash || [3, 3]);
      ctx.beginPath();
      ctx.moveTo(markerX, plot.top);
      ctx.lineTo(markerX, plot.top + plot.height);
      ctx.strokeStyle = todayMarker.color || "#ffffff";
      ctx.lineWidth = todayMarker.lineWidth || 1.5;
      ctx.stroke();
      dashed(ctx, []);

      var markerLabel = todayMarker.label === false ? "" : (todayMarker.label || "Today");
      if (markerLabel) {
        ctx.font = "10px sans-serif";
        var labelText = String(markerLabel);
        var labelWidth = ctx.measureText(labelText).width;
        var labelX = markerX + 5;
        if (labelX + labelWidth > plot.left + plot.width) labelX = markerX - labelWidth - 5;
        if (labelX < plot.left) labelX = plot.left;
        ctx.fillStyle = todayMarker.labelColor || todayMarker.color || "#ffffff";
        ctx.fillText(labelText, labelX, plot.top + 10);
      }
      ctx.restore();
    }

    var xTitle = xScale.title && xScale.title.display ? xScale.title.text : "";
    if (xTitle) {
      ctx.fillStyle = "#9ca3af";
      ctx.fillText(String(xTitle), plot.left + (plot.width / 2) - 40, height - 6);
    }

    var yTitle = yScale.title && yScale.title.display ? yScale.title.text : "";
    if (yTitle) {
      ctx.save();
      ctx.translate(12, plot.top + (plot.height / 2) + 20);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = "#9ca3af";
      ctx.fillText(String(yTitle), 0, 0);
      ctx.restore();
    }
  };

  window.Chart = LocalChart;
}());
