import api from '@/utils/HttpRequest';

export interface LaporanLabResponse {
  success: boolean;
  message: string;
  data: any[];
}

export const getLaporanLabData = async (params?: {
  tahun?: number;
  periode?: number;
}): Promise<LaporanLabResponse> => {
  try {
    const response = await api.post('/admin/laporan-lab/data', params || {});
    return response.data;
  } catch (error) {
    console.error('Error fetching laporan lab data:', error);
    throw error;
  }
};

export const createLaporanLab = async (data: any): Promise<any> => {
  try {
    const response = await api.post('/user/laporan-lab/create', data);
    return response.data;
  } catch (error) {
    console.error('Error creating laporan lab:', error);
    throw error;
  }
};

export const createLaporanLabSimple = async (data: any): Promise<any> => {
  try {
    const response = await api.post('/user/laporan-lab/simple-create', data);
    return response.data;
  } catch (error) {
    console.error('Error creating simple laporan lab:', error);
    throw error;
  }
};

export const updateLaporanLab = async (data: any): Promise<any> => {
  try {
    const response = await api.post('/user/laporan-lab/update', data);
    return response.data;
  } catch (error) {
    console.error('Error updating laporan lab:', error);
    throw error;
  }
};

export const deleteLaporanLab = async (id: number): Promise<any> => {
  try {
    const response = await api.post('/user/laporan-lab/delete', { id });
    return response.data;
  } catch (error) {
    console.error('Error deleting laporan lab:', error);
    throw error;
  }
};

export const getLaporanLabById = async (id: number): Promise<any> => {
  try {
    const response = await api.post('/user/laporan-lab/show', { id });
    return response.data;
  } catch (error) {
    console.error('Error fetching laporan lab by id:', error);
    throw error;
  }
};