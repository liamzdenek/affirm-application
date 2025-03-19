import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Merchant,
  AnalyticsResponse,
  SAMPLE_MERCHANTS
} from '@affirm-merchant-analytics/shared';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import styles from './Dashboard.module.css';
import { API_BASE_URL } from '../../config';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Date formatting helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric'
  });
};

export function Dashboard() {
  // State for merchant selection
  const [merchantId, setMerchantId] = useState<string>('');
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  
  // State for date range
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // State for granularity
  const [granularity, setGranularity] = useState<'hourly' | 'daily'>('hourly');
  
  // State for analytics data
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
  
  // State for loading and error
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Set default date range (last 7 days)
  useEffect(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    setEndDate(now.toISOString().split('T')[0]);
    setStartDate(sevenDaysAgo.toISOString().split('T')[0]);
  }, []);
  
  // Fetch merchants on component mount
  useEffect(() => {
    // In a real app, we would fetch these from the API
    // For now, use the sample data
    setMerchants(SAMPLE_MERCHANTS);
    
    // Set default merchant if available
    if (SAMPLE_MERCHANTS.length > 0) {
      setMerchantId(SAMPLE_MERCHANTS[0].id);
    }
  }, []);
  
  // Fetch analytics data when merchant, date range, or granularity changes
  useEffect(() => {
    if (merchantId && startDate && endDate) {
      fetchAnalyticsData();
    }
  }, [merchantId, startDate, endDate, granularity]);
  
  // Fetch analytics data from API
  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/merchants/${merchantId}/analytics`, {
        params: {
          granularity,
          startDate,
          endDate
        }
      });
      
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to fetch analytics data. Please try again.');
      setAnalyticsData(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Prepare chart data for volume
  const volumeChartData = {
    labels: analyticsData?.timePoints.map(point => formatDate(point.timestamp)) || [],
    datasets: [
      {
        label: 'Total Orders',
        data: analyticsData?.timePoints.map(point => point.metrics.volume.total) || [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Successful Orders',
        data: analyticsData?.timePoints.map(point => point.metrics.volume.successful) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Failed Orders',
        data: analyticsData?.timePoints.map(point => point.metrics.volume.failed) || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ]
  };
  
  // Prepare chart data for AOV
  const aovChartData = {
    labels: analyticsData?.timePoints.map(point => formatDate(point.timestamp)) || [],
    datasets: [
      {
        label: 'Average Order Value',
        data: analyticsData?.timePoints.map(point => point.metrics.aov.overall) || [],
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
      }
    ]
  };
  
  // Chart options
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Merchant Analytics',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Analytics Dashboard</h2>
      
      <div className={styles.controls}>
        {/* Merchant Selection */}
        <div className={styles.controlGroup}>
          <label htmlFor="merchant" className={styles.label}>Merchant</label>
          <select
            id="merchant"
            className={styles.select}
            value={merchantId}
            onChange={(e) => setMerchantId(e.target.value)}
            required
          >
            <option value="">Select a merchant</option>
            {merchants.map((merchant) => (
              <option key={merchant.id} value={merchant.id}>
                {merchant.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Date Range */}
        <div className={styles.controlGroup}>
          <label htmlFor="startDate" className={styles.label}>Start Date</label>
          <input
            type="date"
            id="startDate"
            className={styles.input}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        
        <div className={styles.controlGroup}>
          <label htmlFor="endDate" className={styles.label}>End Date</label>
          <input
            type="date"
            id="endDate"
            className={styles.input}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
        
        {/* Granularity */}
        <div className={styles.controlGroup}>
          <label htmlFor="granularity" className={styles.label}>Granularity</label>
          <select
            id="granularity"
            className={styles.select}
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as 'hourly' | 'daily')}
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
          </select>
        </div>
      </div>
      
      {/* Loading and Error States */}
      {isLoading && (
        <div className={styles.loading}>Loading analytics data...</div>
      )}
      
      {error && (
        <div className={styles.error}>{error}</div>
      )}
      
      {/* Charts */}
      {analyticsData && !isLoading && (
        <div className={styles.charts}>
          <div className={styles.chart}>
            <h3 className={styles.chartTitle}>Order Volume</h3>
            <Line data={volumeChartData} options={chartOptions} />
          </div>
          
          <div className={styles.chart}>
            <h3 className={styles.chartTitle}>Average Order Value</h3>
            <Line data={aovChartData} options={chartOptions} />
          </div>
        </div>
      )}
      
      {/* No Data Message */}
      {!analyticsData && !isLoading && !error && (
        <div className={styles.noData}>
          Select a merchant and date range to view analytics data.
        </div>
      )}
    </div>
  );
}