// truck-operation.types.ts
export type OperationType = 'maintenance' | 'inspection' | 'repair' | 'fuel' | 'service';
export type OperationStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
export type OperationPriority = 'low' | 'medium' | 'high';

export interface TruckOperation {
  id: number;
  type: OperationType;
  status: OperationStatus;
  priority: OperationPriority;
  endDate: string;
  // Add other properties as needed
}

export interface StatusClasses {
  scheduled: string;
  'in-progress': string;
  completed: string;
  cancelled: string;
}

export interface PriorityClasses {
  low: string;
  medium: string;
  high: string;
}

export interface OperationMetrics {
  totalOperations: number;
  inProgress: number;
  completed: number;
  overdue: number;
  maintenanceCost: number;
}

// export interface OperationType {
//   id: string;
//   name: string;
// }

export interface OperationFilter {
  page: number;
  pageSize: number;
  searchTerm?: string;
  operationType?: string;
  status?: string;
  priority?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  truckId?: string;
}