import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  Merchant,
  AnalyticsResponse,
  RecentOrdersResponse,
  SAMPLE_MERCHANTS,
  SAMPLE_PRODUCTS,
  SAMPLE_PAYMENT_PLANS
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
  
  // State for recent orders
  const [recentOrders, setRecentOrders] = useState<RecentOrdersResponse | null>(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  
  // State for loading and error
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for auto-refresh
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [isTabFocused, setIsTabFocused] = useState<boolean>(true);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(false);
  const refreshIntervalRef = useRef<number | null>(null);
  const [secondsSinceRefresh, setSecondsSinceRefresh] = useState<number>(0);
  const [secondsUntilNextRefresh, setSecondsUntilNextRefresh] = useState<number>(60);
  
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
  
  // Fetch recent orders from API
  const fetchRecentOrders = async () => {
    setIsLoadingOrders(true);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/merchants/${merchantId}/orders`, {
        params: {
          limit: 10 // Get the 10 most recent orders
        }
      });
      
      setRecentOrders(response.data);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      setRecentOrders(null);
    } finally {
      setIsLoadingOrders(false);
    }
  };
  
  // Memoized refresh function
  const refreshData = useCallback(async () => {
    if (merchantId && startDate && endDate) {
      await Promise.all([
        fetchAnalyticsData(),
        fetchRecentOrders()
      ]);
      const now = new Date();
      setLastRefreshTime(now);
      setSecondsSinceRefresh(0);
      
      // Reset countdown timer if auto-refresh is enabled
      if (autoRefreshEnabled) {
        setSecondsUntilNextRefresh(60);
      }
    }
  }, [merchantId, startDate, endDate, granularity, autoRefreshEnabled]);
  
  // Helper function to format relative time
  const getRelativeTimeString = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 10) {
      return 'just now';
    } else if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
  };
  
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
      refreshData();
    }
  }, [merchantId, startDate, endDate, granularity, refreshData]);
  
  // Set up tab focus/blur event listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabFocused(document.visibilityState === 'visible');
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Update seconds since last refresh every second
  useEffect(() => {
    const updateTimerInterval = window.setInterval(() => {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - lastRefreshTime.getTime()) / 1000);
      setSecondsSinceRefresh(diffInSeconds);
      
      // If auto-refresh is enabled, update countdown timer
      if (autoRefreshEnabled) {
        const nextRefreshIn = Math.max(0, 60 - (diffInSeconds % 60));
        setSecondsUntilNextRefresh(nextRefreshIn);
      }
    }, 1000);
    
    return () => {
      clearInterval(updateTimerInterval);
    };
  }, [lastRefreshTime, autoRefreshEnabled]);
  
  // Set up auto-refresh interval
  useEffect(() => {
    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    // Only set up interval if auto-refresh is enabled
    if (autoRefreshEnabled) {
      // Reset countdown timer
      setSecondsUntilNextRefresh(60);
      
      refreshIntervalRef.current = window.setInterval(() => {
        // Only refresh if the tab is focused
        if (isTabFocused && merchantId && startDate && endDate) {
          refreshData();
        }
      }, 60000); // 60 seconds
    }
    
    // Clean up on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefreshEnabled, isTabFocused, merchantId, startDate, endDate, refreshData]);
  
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
      
      {/* Refresh Controls */}
      <div className={styles.refreshControls}>
        <div className={styles.lastRefreshInfo}>
          <span className={styles.refreshLabel}>Last refreshed:</span>
          <span className={styles.refreshTime}>
            {secondsSinceRefresh < 60
              ? `${secondsSinceRefresh} ${secondsSinceRefresh === 1 ? 'second' : 'seconds'} ago`
              : getRelativeTimeString(lastRefreshTime)}
          </span>
        </div>
        
        <div className={styles.refreshActions}>
          <button
            className={styles.refreshButton}
            onClick={() => refreshData()}
            disabled={isLoading || isLoadingOrders}
          >
            {isLoading || isLoadingOrders ? 'Refreshing...' : 'Refresh Now'}
          </button>
          
          <div className={styles.autoRefreshToggle}>
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefreshEnabled}
              onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
            />
            <label htmlFor="autoRefresh">
              Auto-refresh every 60 seconds
              {autoRefreshEnabled && (
                <span className={styles.countdownTimer}>
                  (next refresh in {secondsUntilNextRefresh}s)
                </span>
              )}
            </label>
          </div>
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
          
          {/* Payment Plan Counts */}
          <div className={styles.chart}>
            <h3 className={styles.chartTitle}>Payment Plan Distribution</h3>
            {analyticsData.timePoints.length > 0 && (
              <div className={styles.countsContainer}>
                <h4>Most Recent Data ({formatDate(analyticsData.timePoints[analyticsData.timePoints.length - 1].timestamp)})</h4>
                <div className={styles.countsList}>
                  {Object.entries(analyticsData.timePoints[analyticsData.timePoints.length - 1].metrics.counts.byPaymentPlan).map(([planId, count]) => (
                    <div key={planId} className={styles.countItem}>
                      <span className={styles.countLabel}>
                        {planId === 'plan-1' ? 'Pay in 4' :
                         planId === 'plan-2' ? '3 Month Financing' :
                         planId === 'plan-3' ? '6 Month Financing' :
                         planId === 'plan-4' ? '12 Month Financing' : planId}
                      </span>
                      <span className={styles.countValue}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Product Counts */}
          <div className={styles.chart}>
            <h3 className={styles.chartTitle}>Product Distribution</h3>
            {analyticsData.timePoints.length > 0 && (
              <div className={styles.countsContainer}>
                <h4>Most Recent Data ({formatDate(analyticsData.timePoints[analyticsData.timePoints.length - 1].timestamp)})</h4>
                <div className={styles.countsList}>
                  {Object.entries(analyticsData.timePoints[analyticsData.timePoints.length - 1].metrics.counts.byProduct).map(([productId, count]) => {
                    // Find product name based on ID
                    let productName = productId;
                    if (productId.startsWith('product-1-1')) productName = 'Designer Handbag';
                    else if (productId.startsWith('product-1-2')) productName = 'Premium Jeans';
                    else if (productId.startsWith('product-1-3')) productName = 'Cashmere Sweater';
                    else if (productId.startsWith('product-2-1')) productName = 'Smartphone';
                    else if (productId.startsWith('product-2-2')) productName = 'Laptop';
                    else if (productId.startsWith('product-2-3')) productName = 'Wireless Headphones';
                    else if (productId.startsWith('product-3-1')) productName = 'Sectional Sofa';
                    else if (productId.startsWith('product-3-2')) productName = 'Dining Table';
                    else if (productId.startsWith('product-3-3')) productName = 'Bed Frame';
                    
                    return (
                      <div key={productId} className={styles.countItem}>
                        <span className={styles.countLabel}>{productName}</span>
                        <span className={styles.countValue}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Recent Orders */}
      {recentOrders && recentOrders.orders.length > 0 && (
        <div className={styles.recentOrdersContainer}>
          <h3 className={styles.sectionTitle}>Recent Orders</h3>
          <div className={styles.recentOrdersList}>
            {recentOrders.orders.map(order => {
              // Find product name based on ID
              const product = SAMPLE_PRODUCTS.find(p => p.id === order.productId);
              // Find payment plan name based on ID
              const paymentPlan = SAMPLE_PAYMENT_PLANS.find(p => p.id === order.paymentPlan);
              
              return (
                <div key={order.orderId} className={`${styles.orderItem} ${order.status === 'success' ? styles.successOrder : styles.failedOrder}`}>
                  <div className={styles.orderHeader}>
                    <span className={styles.orderTime}>{new Date(order.timestamp).toLocaleString()}</span>
                    <span className={`${styles.orderStatus} ${order.status === 'success' ? styles.successStatus : styles.failedStatus}`}>
                      {order.status === 'success' ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <div className={styles.orderDetails}>
                    <div className={styles.orderDetail}>
                      <span className={styles.orderDetailLabel}>Product:</span>
                      <span className={styles.orderDetailValue}>{product ? product.name : order.productId}</span>
                    </div>
                    <div className={styles.orderDetail}>
                      <span className={styles.orderDetailLabel}>Amount:</span>
                      <span className={styles.orderDetailValue}>${order.amount.toFixed(2)}</span>
                    </div>
                    <div className={styles.orderDetail}>
                      <span className={styles.orderDetailLabel}>Payment Plan:</span>
                      <span className={styles.orderDetailValue}>{paymentPlan ? paymentPlan.name : order.paymentPlan}</span>
                    </div>
                  </div>
                </div>
              );
            })}
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