export interface Truck {
  _id: string;
  truckNumber: string;
  capacity: number;
  expenses: number;
  status: 'active' | 'inactive' | 'maintenance';
  product?: {
    _id: string;
    name: string;
  };
  orderId: string | null;
  deliveredOrders: any[];
  expenditure: any[];

  driver?: {
    _id: string;
    name: string;
  };
}

export interface TruckResponse {
  message: string;
  trucks: Truck[];
}

export interface TruckLoad {
  capacity: string;
  productId: string;
  truckId: string;
}

export interface Driver {
  _id: string;
  name: string;
}

export interface TruckOperation {
  checklist: any;
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
}

export interface MaintenanceSchedule {
  id?: number;
  truckId: number;
  maintenanceType: string;
  scheduledDate: string;
  interval: number;
  intervalUnit: 'days' | 'weeks' | 'months' | 'kilometers';
  lastPerformed?: string;
  description: string;
  checklist: MaintenanceTask[];
}

export interface MaintenanceTask {
  id?: number;
  name: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
  notes?: string;
}