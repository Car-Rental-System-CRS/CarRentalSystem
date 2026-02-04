export type ModelFeatureRequest = {
  typeId: string;
  featureIds: string[];
};
export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export interface ModelFeature {
  featureId: string;
  feature: {
    id: string;
    name: string;
    description?: string;
  };
}
