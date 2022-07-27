import React from 'react';
import { Line } from 'react-chartjs-2';

export const EthereumChart = ({ chartData }) => {
    return (
        <div>
          <Line
            data={chartData}
            options={{
              plugins: {
                title: {
                  display: true,
                  text: "Ethereum Price"
                },
                legend: {
                  display: true,
                  position: "bottom"
                }
              }
            }}
          />
        </div>
    );
}