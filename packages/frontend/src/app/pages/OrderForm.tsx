import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Merchant,
  Product,
  PaymentPlan,
  OrderRequest,
  SAMPLE_MERCHANTS,
  SAMPLE_PRODUCTS,
  SAMPLE_PAYMENT_PLANS
} from '@affirm-merchant-analytics/shared';
import styles from './OrderForm.module.css';
import { API_BASE_URL } from '../../config';

export function OrderForm() {
  // State for form data
  const [merchantId, setMerchantId] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [paymentPlan, setPaymentPlan] = useState<string>('');
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);
  
  // State for data from API
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  
  // State for selected product (to display price)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Fetch merchants, products, and payment plans on component mount
  useEffect(() => {
    // In a real app, we would fetch these from the API
    // For now, use the sample data
    setMerchants(SAMPLE_MERCHANTS);
    setPaymentPlans(SAMPLE_PAYMENT_PLANS);
    
    // Set default merchant if available
    if (SAMPLE_MERCHANTS.length > 0) {
      setMerchantId(SAMPLE_MERCHANTS[0].id);
    }
  }, []);
  
  // Fetch products when merchant changes
  useEffect(() => {
    if (merchantId) {
      // In a real app, we would fetch products for the selected merchant from the API
      // For now, filter the sample data
      const merchantProducts = SAMPLE_PRODUCTS.filter(p => p.merchantId === merchantId);
      setProducts(merchantProducts);
      
      // Reset product selection
      setProductId('');
      setSelectedProduct(null);
    }
  }, [merchantId]);
  
  // Update selected product when productId changes
  useEffect(() => {
    if (productId) {
      const product = products.find(p => p.id === productId) || null;
      setSelectedProduct(product);
    } else {
      setSelectedProduct(null);
    }
  }, [productId, products]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!merchantId || !productId || !paymentPlan) {
      setSubmitResult({
        success: false,
        message: 'Please fill out all required fields'
      });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitResult(null);
    
    try {
      // Create order request
      const orderRequest: OrderRequest = {
        merchantId,
        productId,
        amount: selectedProduct?.price || 0,
        paymentPlan,
        simulateFailure
      };
      
      // Submit order to API
      const response = await axios.post(`${API_BASE_URL}/orders`, orderRequest);
      
      // Handle success
      setSubmitResult({
        success: true,
        message: `Order submitted successfully! Order ID: ${response.data.orderId}`
      });
      
      // Reset form if successful
      if (response.data.status === 'success') {
        setProductId('');
        setPaymentPlan('');
        setSimulateFailure(false);
      }
    } catch (error) {
      // Handle error
      setSubmitResult({
        success: false,
        message: 'Error submitting order. Please try again.'
      });
      console.error('Error submitting order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Place Order</h2>
      
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Merchant Selection */}
        <div className={styles.formGroup}>
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
        
        {/* Product Selection */}
        <div className={styles.formGroup}>
          <label htmlFor="product" className={styles.label}>Product</label>
          <select
            id="product"
            className={styles.select}
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
            disabled={!merchantId}
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - ${product.price.toFixed(2)}
              </option>
            ))}
          </select>
        </div>
        
        {/* Payment Plan Selection */}
        <div className={styles.formGroup}>
          <label htmlFor="paymentPlan" className={styles.label}>Payment Plan</label>
          <select
            id="paymentPlan"
            className={styles.select}
            value={paymentPlan}
            onChange={(e) => setPaymentPlan(e.target.value)}
            required
            disabled={!productId}
          >
            <option value="">Select a payment plan</option>
            {paymentPlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} - {plan.description}
              </option>
            ))}
          </select>
        </div>
        
        {/* Simulate Failure Checkbox */}
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(e) => setSimulateFailure(e.target.checked)}
              className={styles.checkbox}
            />
            Simulate Payment Failure
          </label>
        </div>
        
        {/* Order Summary */}
        {selectedProduct && (
          <div className={styles.summary}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            <p className={styles.summaryItem}>
              <span>Product:</span>
              <span>{selectedProduct.name}</span>
            </p>
            <p className={styles.summaryItem}>
              <span>Price:</span>
              <span>${selectedProduct.price.toFixed(2)}</span>
            </p>
            {paymentPlan && (
              <p className={styles.summaryItem}>
                <span>Payment Plan:</span>
                <span>{paymentPlans.find(p => p.id === paymentPlan)?.name}</span>
              </p>
            )}
          </div>
        )}
        
        {/* Submit Button */}
        <button
          type="submit"
          className={styles.button}
          disabled={isSubmitting || !merchantId || !productId || !paymentPlan}
        >
          {isSubmitting ? 'Submitting...' : 'Place Order'}
        </button>
        
        {/* Result Message */}
        {submitResult && (
          <div className={`${styles.result} ${submitResult.success ? styles.success : styles.error}`}>
            {submitResult.message}
          </div>
        )}
      </form>
    </div>
  );
}