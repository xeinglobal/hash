import React, { useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getCoinPriceHistory, getCurrentCoinPrice } from '@/services/coinService';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const CoinPriceChart: React.FC = () => {
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Current price and price history data are being retrieved
        const [priceHistoryData, currentPriceData] = await Promise.all([
          getCoinPriceHistory(30),
          getCurrentCoinPrice()
        ]);
        
        setPriceHistory(priceHistoryData);
        setCurrentPrice(currentPriceData.pricePerUnit);
      } catch (error) {
        console.error('Could not get price data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e5e7eb'
        }
      },
      title: {
        display: true,
        text: 'Coin Price History',
        color: '#e5e7eb'
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Price: ${context.parsed.y.toFixed(3)} $`;
          }
        },
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleColor: '#e5e7eb',
        bodyColor: '#e5e7eb',
        borderColor: '#4b5563',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
          tooltipFormat: 'PPP',
          displayFormats: {
            day: 'd MMM'
          }
        },
        title: {
          display: true,
          text: 'Date',
          color: '#9ca3af'
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
          borderColor: '#4b5563'
        },
        ticks: {
          color: '#9ca3af'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Coin Price ($)',
          color: '#9ca3af'
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
          borderColor: '#4b5563'
        },
        ticks: {
          color: '#9ca3af'
        }
      }
    }
  };

  const data = {
    datasets: [
      {
        label: 'Coin Price',
        data: priceHistory.map(item => ({
          x: new Date(item.createdAt),
          y: item.pricePerUnit
        })).sort((a, b) => a.x.getTime() - b.x.getTime()),
        borderColor: 'rgb(45, 212, 191)',
        backgroundColor: 'rgba(45, 212, 191, 0.5)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(20, 184, 166)',
        pointBorderColor: 'rgb(20, 184, 166)',
      },
    ],
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-md rounded-lg shadow-md p-6 h-80 flex items-center justify-center">
        <p className="text-gray-300">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-md text-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-200">Coin Price Chart</h3>
        <div className="bg-teal-900/50 text-teal-300 px-3 py-1 rounded-full text-sm font-medium border border-teal-700/50">
          Current: {currentPrice.toFixed(3)} $
        </div>
      </div>
      <div className="h-80">
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default CoinPriceChart; 