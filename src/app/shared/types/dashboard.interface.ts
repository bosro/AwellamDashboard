export interface DashboardMetrics {
    transport: {
      activeDeliveries: number;
    };
    inventory: {
      lowStockItems: number;
    };
    maintenance: {
      pendingMaintenance: number;
    };
    performance: {
      onTimeDelivery: number;
    };
  }