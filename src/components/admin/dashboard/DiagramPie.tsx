// components/PieChart.js
import React from "react";
import dynamic from "next/dynamic";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const PieChart = ({ pie, title }) => {
  const options = {
    labels: pie.label ?? [],
    title: {
      text: title, // Judul chart "Berat Total Limbah"
      align: "center",
    },
  };

  const series = pie.value ?? [];

  return (
    <div>
      <ReactApexChart
        options={options}
        series={series}
        type="pie"
        height={600}
        width={375} // Sesuaikan tinggi dengan preferensi Anda, misalnya 300px
      />
    </div>
  );
};

export default PieChart;
