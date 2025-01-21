export interface DashboardMetrics {
    transport: {
      activeDeliveries: number;
      totalDeliveries: number;
      pendingDeliveries: number;
      completedDeliveries: number;
    };
    inventory: {
      lowStockItems: number;
      totalItems: number;
      outOfStockItems: number;
      reorderRequired: number;
    };
    maintenance: {
      pendingMaintenance: number;
      completedMaintenance: number;
      scheduledMaintenance: number;
      totalVehicles: number;
    };
    performance: {
      onTimeDelivery: number;
      customerSatisfaction: number;
      vehicleUtilization: number;
      fuelEfficiency: number;
    };
  }