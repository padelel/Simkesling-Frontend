import React from 'react';
import Chart from "react-apexcharts";

const MyCharts = () => {
  const series = [ //data on the y-axis
    {
      name: "Temperature in Celsius",
      data: []
    }
  ];
  const options = { //data on the x-axis
    chart: { id: 'bar-chart'},
    xaxis: {
      categories: []
    }
  };

  return (
    <div>
      <Chart
        options={options}
        series={series}
        type="bar"
        width="450"
      />
    </div>
  )
}

export default MyCharts;