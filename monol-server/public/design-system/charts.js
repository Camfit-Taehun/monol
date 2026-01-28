/**
 * Monol Design System - Charts
 * Chart.js 공통 테마 및 설정
 */

const MonolCharts = {
  // Color palette
  colors: {
    blue: '#58a6ff',
    green: '#3fb950',
    purple: '#a371f7',
    orange: '#d29922',
    red: '#f85149',
    cyan: '#39c5cf',
    pink: '#db61a2',
    yellow: '#e3b341'
  },

  // Get color array for charts
  getColorArray(count = 8) {
    const palette = Object.values(this.colors);
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(palette[i % palette.length]);
    }
    return result;
  },

  // Get color with alpha
  withAlpha(color, alpha = 0.2) {
    // Handle hex colors
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  },

  // Default chart options
  defaultOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#8b949e',
          font: {
            family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            size: 12
          },
          boxWidth: 12,
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: '#21262d',
        titleColor: '#e6edf3',
        bodyColor: '#8b949e',
        borderColor: '#30363d',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: {
          family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          size: 13,
          weight: '600'
        },
        bodyFont: {
          family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          size: 12
        }
      }
    }
  },

  // Line chart specific options
  lineOptions: {
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8b949e' }
      },
      y: {
        grid: { color: '#30363d' },
        ticks: { color: '#8b949e' },
        beginAtZero: true
      }
    }
  },

  // Bar chart specific options
  barOptions: {
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8b949e' }
      },
      y: {
        grid: { color: '#30363d' },
        ticks: { color: '#8b949e' },
        beginAtZero: true
      }
    }
  },

  // Doughnut/Pie chart specific options
  doughnutOptions: {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#8b949e',
          boxWidth: 12,
          padding: 8
        }
      }
    }
  },

  // Radar chart specific options
  radarOptions: {
    plugins: {
      legend: { display: false }
    },
    scales: {
      r: {
        grid: { color: '#30363d' },
        angleLines: { color: '#30363d' },
        pointLabels: { color: '#8b949e' },
        ticks: {
          color: '#8b949e',
          backdropColor: 'transparent'
        }
      }
    }
  },

  // Polar area chart specific options
  polarOptions: {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#8b949e',
          boxWidth: 12
        }
      }
    },
    scales: {
      r: {
        grid: { color: '#30363d' },
        ticks: {
          color: '#8b949e',
          backdropColor: 'transparent'
        }
      }
    }
  },

  // Merge options helper
  mergeOptions(type, customOptions = {}) {
    const typeOptions = {
      line: this.lineOptions,
      bar: this.barOptions,
      doughnut: this.doughnutOptions,
      pie: this.doughnutOptions,
      radar: this.radarOptions,
      polarArea: this.polarOptions
    };

    return this.deepMerge(
      this.defaultOptions,
      typeOptions[type] || {},
      customOptions
    );
  },

  // Deep merge helper
  deepMerge(...objects) {
    const result = {};
    for (const obj of objects) {
      for (const key in obj) {
        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          result[key] = this.deepMerge(result[key] || {}, obj[key]);
        } else {
          result[key] = obj[key];
        }
      }
    }
    return result;
  },

  // Create line chart
  createLineChart(ctx, labels, datasets, options = {}) {
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.data,
          borderColor: ds.color || this.getColorArray()[i],
          backgroundColor: this.withAlpha(ds.color || this.getColorArray()[i], 0.1),
          fill: ds.fill !== false,
          tension: ds.tension || 0.4,
          ...ds
        }))
      },
      options: this.mergeOptions('line', options)
    });
  },

  // Create bar chart
  createBarChart(ctx, labels, datasets, options = {}) {
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: ds.color || ds.colors || this.getColorArray(labels.length),
          borderRadius: ds.borderRadius || 4,
          ...ds
        }))
      },
      options: this.mergeOptions('bar', options)
    });
  },

  // Create doughnut chart
  createDoughnutChart(ctx, labels, data, options = {}) {
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: this.getColorArray(labels.length),
          borderWidth: 0
        }]
      },
      options: this.mergeOptions('doughnut', options)
    });
  },

  // Create pie chart
  createPieChart(ctx, labels, data, options = {}) {
    return new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: this.getColorArray(labels.length),
          borderWidth: 0
        }]
      },
      options: this.mergeOptions('pie', options)
    });
  },

  // Create radar chart
  createRadarChart(ctx, labels, datasets, options = {}) {
    return new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.data,
          borderColor: ds.color || this.colors.cyan,
          backgroundColor: this.withAlpha(ds.color || this.colors.cyan, 0.2),
          pointBackgroundColor: ds.color || this.colors.cyan,
          ...ds
        }))
      },
      options: this.mergeOptions('radar', options)
    });
  },

  // Create polar area chart
  createPolarAreaChart(ctx, labels, data, options = {}) {
    return new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: this.getColorArray(labels.length).map(c => this.withAlpha(c, 0.5))
        }]
      },
      options: this.mergeOptions('polarArea', options)
    });
  },

  // Utility: Generate last N days labels
  getLastNDaysLabels(n = 7, format = 'short') {
    const labels = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      if (format === 'short') {
        labels.push(d.toLocaleDateString('ko-KR', { weekday: 'short' }));
      } else if (format === 'date') {
        labels.push(d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));
      } else {
        labels.push(d.toLocaleDateString('ko-KR'));
      }
    }
    return labels;
  },

  // Utility: Generate hours labels
  getHoursLabels() {
    return Array.from({ length: 24 }, (_, i) => `${i}:00`);
  },

  // Utility: Count events by date
  countByDate(events, dateField = 'created_at', days = 7) {
    const counts = new Array(days).fill(0);
    const now = new Date();

    events?.forEach(e => {
      const eventDate = new Date(e[dateField]);
      const daysDiff = Math.floor((now - eventDate) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < days) {
        counts[days - 1 - daysDiff]++;
      }
    });

    return counts;
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MonolCharts;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.MonolCharts = MonolCharts;
}
