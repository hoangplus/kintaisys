// ChartSetup.js
import Chart from 'chart.js/auto';

const DaysOffChart = (ctx, membersData, resultMonth) => {
  const memberNames = membersData?.map((member) => member?.name);
  const dayoff = resultMonth?.dayOffs?.map((member) => member);
  const dayoff_unpaid_leave = resultMonth?.unPaidDayOffs?.map((member) => member);
  const hasData = dayoff && dayoff.length > 0;

  const minYAxis = hasData ? 0 : -5;
  const maxYAxis = hasData ? Math.max(...dayoff, ...dayoff_unpaid_leave) + 5 : 0;

  const stepSize = hasData ? 0.5 : 5;

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: memberNames,
      datasets: [
        {
          label: 'Days Off',
          data: dayoff,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
        {
          label: 'Unpaid Days Off',
          data: dayoff_unpaid_leave,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          min: minYAxis,
          max: maxYAxis,
          stepSize: stepSize,
        },
      },
    },
  });
};

export default DaysOffChart;
