/**
 * Chart.js helpers for Reports & Analytics.
 * Expects Chart to be loaded (e.g. from CDN).
 */
(function (global) {
  var chartInstances = {};

  var PIE_COLORS = [
    '#e8a0b0',
    '#d87a8f',
    '#f0b4c0',
    '#c75c6f',
    '#b86b7a',
    '#8b6b72',
    '#f5d0d6',
  ];

  function destroyChart(id) {
    if (chartInstances[id]) {
      chartInstances[id].destroy();
      chartInstances[id] = null;
    }
  }

  /**
   * Spending by category – pie chart.
   * data: [{ category, total }, ...]
   */
  function initPieChart(canvasId, data) {
    destroyChart(canvasId);
    if (!data || data.length === 0) return null;
    var ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    ctx = ctx.getContext('2d');
    var labels = data.map(function (d) { return d.category; });
    var values = data.map(function (d) { return d.total; });
    var colors = PIE_COLORS.slice(0, data.length);
    chartInstances[canvasId] = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: '#fff',
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
    return chartInstances[canvasId];
  }

  /**
   * Monthly trend – line or bar chart.
   * data: [{ month, total }, ...], month is "YYYY-MM"
   */
  function initTrendChart(canvasId, data) {
    destroyChart(canvasId);
    if (!data || data.length === 0) return null;
    var ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    ctx = ctx.getContext('2d');
    var labels = data.map(function (d) {
      var parts = d.month.split('-');
      return parts[1] + '/' + parts[0];
    });
    var values = data.map(function (d) { return d.total; });
    chartInstances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Spending',
          data: values,
          borderColor: '#d87a8f',
          backgroundColor: 'rgba(232, 160, 176, 0.2)',
          fill: true,
          tension: 0.3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: { beginAtZero: true },
        },
        plugins: {
          legend: { display: false },
        },
      },
    });
    return chartInstances[canvasId];
  }

  global.ReportsCharts = {
    initPieChart: initPieChart,
    initTrendChart: initTrendChart,
    destroyChart: destroyChart,
  };
})(typeof window !== 'undefined' ? window : this);
