import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { OrderForm } from './pages/OrderForm.js';
import { Dashboard } from './pages/Dashboard.js';
import styles from './router.module.css';

// Create a root route
const rootRoute = createRootRoute({
  component: () => (
    <div className={styles.appContainer}>
      <header className={styles.appHeader}>
        <h1>Affirm Merchant Analytics</h1>
        <nav className={styles.nav}>
          <a href="/" className={styles.navLink}>Order Form</a>
          <a href="/dashboard" className={styles.navLink}>Dashboard</a>
        </nav>
      </header>
      <main className={styles.appContent}>
        <Outlet />
      </main>
      <footer className={styles.appFooter}>
        <p>&copy; 2025 Affirm Merchant Analytics</p>
      </footer>
    </div>
  ),
});

// Create routes
const orderFormRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: OrderForm,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  orderFormRoute,
  dashboardRoute,
]);

// Create the router
const router = createRouter({ routeTree });

// Export the router and types
export { router };
export type AppRouter = typeof router;