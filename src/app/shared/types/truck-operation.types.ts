export interface Truck {
driver: any;
  _id: string;
  truckNumber: string;
  capacity: number;
  expenses: number;
  status: string;
  loadedbags: number;
  productId: {
    _id: string;
    name: string;
  };
  orderId: string | null;
  plantId: {
    _id: string;
    name: string;
  };
  categoryId: {
    _id: string;
    name: string;
  } | null;
  deliveredOrders: any[];
  socNumber: {
    _id: string;
    socNumber: string;
    quantity: number;
    plantId: {
      _id: string;
      name: string;
    };
    categoryId: {
      _id: string;
      name: string;
    };
    productId: {
      _id: string;
      name: string;
    };
    status: string;
    orderType: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  } | null;
  LoadStatus: string;
  isAwellamLoad: boolean;
  amountReceived: number;
  expenditure: any[];
  __v: number;
  customerName: string;
  destinationId: {
    _id: string;
    destination: string;
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