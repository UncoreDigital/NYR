export interface DriverAvailability {
  id: number;
  userId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  isActive: boolean;
}

export interface CreateDriverAvailabilityRequest {
  userId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface UpdateDriverAvailabilityRequest {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface DriverAvailabilityBulkRequest {
  userId: number;
  days: { [key: string]: boolean };
  startTime: string;
  endTime: string;
}
