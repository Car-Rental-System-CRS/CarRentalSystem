// src/services/modelFeatureService.ts

import axios from '@/lib/axios';

export const modelFeatureService = {
  /* ===== ATTACH FEATURE TO TYPE ===== */
  attach(typeId: string, featureId: string) {
    return axios.post('/model-features/attach', null, {
      params: { typeId, featureId },
    });
  },

  /* ===== REMOVE FEATURE FROM TYPE ===== */
  detach(typeId: string, featureId: string) {
    return axios.delete('/model-features/detach', {
      params: { typeId, featureId },
    });
  },

  /* ===== GET FEATURES OF A TYPE ===== */
  getByType(typeId: string, page = 0, size = 10) {
    return axios.get(`/model-features/by-type/${typeId}`, {
      params: { page, size },
    });
  },

  /* ===== GET TYPES HAVING FEATURE ===== */
  getByFeature(featureId: string, page = 0, size = 10) {
    return axios.get(`/model-features/by-feature/${featureId}`, {
      params: { page, size },
    });
  },
};
