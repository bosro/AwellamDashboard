// truck-operation.types.ts
export type OperationType = 'maintenance' | 'inspection' | 'repair' | 'fuel' | 'service';
export type OperationStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
export type OperationPriority = 'low' | 'medium' | 'high';



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
export interface TruckOperation {
    id: number;
    truckId: number;
    truckRegistration: string;
    operationType: 'maintenance' | 'inspection' | 'repair' | 'fuel' | 'service';
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    startDate: string;
    endDate?: string;
    description: string;
    cost?: number;
    technicianName?: string;
    notes?: string;
    attachments?: string[];
    mileage: number;
    priority: 'low' | 'medium' | 'high';
    location: string;
    checklist?: Task[];
  }

  export interface OperationFormData {
    truckId: number;
    operationType: TruckOperation['operationType'];
    status: TruckOperation['status'];
    priority: TruckOperation['priority'];
    startDate: string;
    endDate?: string;
    description: string;
    cost?: number;
    technicianName?: string;
    notes?: string;
    mileage: number;
    location: string;
    tasks: Task[];
  }

export interface Task {
  id?: number;
  name: string;
  description?: string;
  estimatedTime?: string;
  completed: boolean;
  notes?: string;
}

export interface Truck {
    id: number;
    registration: string;
  }