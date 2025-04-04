export const customAxisLine = [
  {
    id: "customAxisLine",
    afterDraw: (chart) => {
      const { ctx, chartArea, scales } = chart;
      const dataset = chart.data.datasets[0].data;
      const xScale = scales.x;
      const yScale = scales.y;

      const firstPoint = dataset[0];
      const lastPoint = dataset[dataset.length - 1];

      const firstX = xScale.getPixelForValue(0);
      const firstY = yScale.getPixelForValue(firstPoint);
      const lastX = xScale.getPixelForValue(dataset.length - 1);
      const lastY = yScale.getPixelForValue(lastPoint);
      const bottomY = chartArea.bottom;

      ctx.save();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(firstX, bottomY);
      ctx.lineTo(firstX, firstY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(lastX, bottomY);
      ctx.lineTo(lastX, lastY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(firstX, bottomY);
      ctx.lineTo(lastX, bottomY);
      ctx.stroke();

      ctx.restore();
    },
  },
];
