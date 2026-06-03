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
    var rect = canvas.getBoundingClientRect();
    var width = Math.max(320, Math.round(rect.width || canvas.clientWidth || 640));
    var height = Math.max(220, Math.round(rect.height || canvas.clientHeight || 320));
    var dpr = (typeof window !== "undefined" && window.devicePixelRatio) || 1;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    var options = this.config.options || {};
    var scales = options.scales || {};
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

    function tickValues(axisLabels, min, max, count) {
      if (axisLabels && axisLabels.length) return axisLabels;
      var values = [];
      for (var i = 0; i <= count; i += 1) {
        values.push(min + ((max - min) * i) / count);
      }
      return values;
    }

    var xTicks = tickValues(xLabels, xMin, xMax, 8);
    var yTicks = tickValues(null, yMin, yMax, 5);

    ctx.font = "10px sans-serif";

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

    xTicks.forEach(function (tick) {
      var x = projectX(tick);
      var formatter = xScale.ticks && xScale.ticks.callback;
      var label = formatter ? formatter(tick) : String(Math.round(tick));
      if (!label) return;
      ctx.fillStyle = "#9ca3af";
      ctx.fillText(String(label), x - 8, plot.top + plot.height + 16);
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

      segments.forEach(function (segment) {
        if (segment.length < 2) return;
        pathLine(ctx, segment);
        dashed(ctx, dataset.borderDash);
        ctx.strokeStyle = dataset.borderColor || "#e91e8c";
        ctx.lineWidth = dataset.borderWidth || 2;
        ctx.stroke();
        dashed(ctx, []);
      });
    });

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
