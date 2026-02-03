import api from '@/lib/axios';
import { APIResponse } from '@/types/api';
import { PageResponse } from '@/types/modelFeature';

export interface ModelFeature {
  id: string;
  featureId: string;
  featureName: string;
  description?: string;
}

export const modelFeatureService = {
  /* ---------- GET FEATURES BY TYPE ---------- */
  getByType(typeId: string, params?: { page?: number; size?: number }) {
    return api.get<APIResponse<PageResponse<ModelFeature>>>(
      `/api/model-features/by-type/${typeId}`,
      { params }
    );
  },

  /* ---------- ATTACH ---------- */
  attachBulk(payload: { typeId: string; featureIds: string[] }) {
    return api.post('/api/model-features/attach-bulk', payload);
  },

  /* ---------- REPLACE ---------- */
  replace(payload: { typeId: string; featureIds: string[] }) {
    return api.post('/api/model-features/replace', payload);
  },

  /* ---------- DETACH ---------- */
  detachBulk(payload: { typeId: string; featureIds: string[] }) {
    return api.delete('/api/model-features/detach-bulk', {
      data: payload, // 👈 REQUIRED for DELETE body
    });
  },
};
