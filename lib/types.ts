export interface Project {
  id: string;
  name: string;
  swimlaneId: string;
  type: 'range' | 'milestone';
  startDate?: Date;
  endDate?: Date;
  deliveryDate?: Date;
  color: string;
  description?: string;
}

export interface Swimlane {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface TimelineSettings {
  startDate: Date;
  endDate: Date;
  title: string;
  backgroundColor: string;
  gridColor: string;
  textColor: string;
  showGrid: boolean;
  showYearLabels: boolean;
  showCurrentDate: boolean;
  currentDateColor: string;
  monthFormat: 'short' | 'long';
}

export interface TimelineData {
  projects: Project[];
  swimlanes: Swimlane[];
  settings: TimelineSettings;
}