// Examination type constants
export const JENIS_PEMERIKSAAN = {
  KUALITAS_UDARA: 'kualitas_udara',
  KUALITAS_AIR: 'kualitas_air',
  KUALITAS_MAKANAN: 'kualitas_makanan',
  USAP_ALAT_MEDIS_LINEN: 'usap_alat_medis_linen',
  LIMBAH_CAIR: 'limbah_cair'
} as const;

export type JenisPemeriksaan = typeof JENIS_PEMERIKSAAN[keyof typeof JENIS_PEMERIKSAAN];

export interface MLaporanLab {
  id_laporan_lab?: number;
  id_user?: string;
  // Actual database fields based on current structure
  kualitas_udara?: string;
  kualitas_air?: string;
  kualitas_makanan?: string;
  usap_alat_medis_linen?: string;
  limbah_cair?: string;
  catatan?: string;
  periode?: string;
  periode_nama?: string;
  tahun?: string;
  status_laporan_lab?: string;
  statusactive_laporan_lab?: string;
  user_created?: string;
  user_updated?: string;
  uid?: string;
  created_at?: string;
  updated_at?: string;
  user?: User;
  
  // Legacy fields for backward compatibility (may not exist in database)
  nama_lab?: string;
  jenis_pemeriksaan?: JenisPemeriksaan;
  total_pemeriksaan?: number;
  parameter_uji?: string | ParameterUji;
  hasil_uji?: string | HasilUji;
  metode_analisis?: string;
  link_sertifikat_lab?: string;
  link_hasil_uji?: string;
  link_dokumen_pendukung?: string;
  
  // Helper functions
  simpenSementara?: Function;
}

// Base parameter interface
export interface BaseParameter {
  satuan: string;
  nilai: number | null;
}

// Specific parameter interfaces for each examination type
export interface ParameterKualitasUdara {
  pencahayaan: BaseParameter;
  kebisingan: BaseParameter;
  udara_ambien: BaseParameter;
  emisi: BaseParameter;
  kelembapan: BaseParameter;
}

export interface ParameterKualitasAir {
  air_minum: BaseParameter;
  air_hemodialisa: BaseParameter;
  air_hygiene_sanitasi: BaseParameter;
}

export interface ParameterKualitasMakanan {
  makanan: BaseParameter;
  usap_alat_makan_masak: BaseParameter;
  usap_dubur: BaseParameter;
}

export interface ParameterUsapAlatMedisLinen {
  usap_alat_medis: BaseParameter;
  usap_linen: BaseParameter;
}

export interface ParameterLimbahCair {
  ph: BaseParameter;
  bod: BaseParameter;
  cod: BaseParameter;
  tss: BaseParameter;
  minyak_lemak: BaseParameter;
  amoniak: BaseParameter;
  total_coliform: BaseParameter;
}

// Union type for all parameter types
export type ParameterUji = 
  | ParameterKualitasUdara 
  | ParameterKualitasAir 
  | ParameterKualitasMakanan 
  | ParameterUsapAlatMedisLinen 
  | ParameterLimbahCair;

// Base result interface
export interface BaseResult {
  nilai: number | null;
  status: 'normal' | 'abnormal' | 'tidak_terdeteksi';
  keterangan?: string;
}

// Specific result interfaces for each examination type
export interface HasilKualitasUdara {
  pencahayaan: BaseResult;
  kebisingan: BaseResult;
  udara_ambien: BaseResult;
  emisi: BaseResult;
  kelembapan: BaseResult;
}

export interface HasilKualitasAir {
  air_minum: BaseResult;
  air_hemodialisa: BaseResult;
  air_hygiene_sanitasi: BaseResult;
}

export interface HasilKualitasMakanan {
  makanan: BaseResult;
  usap_alat_makan_masak: BaseResult;
  usap_dubur: BaseResult;
}

export interface HasilUsapAlatMedisLinen {
  usap_alat_medis: BaseResult;
  usap_linen: BaseResult;
}

export interface HasilLimbahCair {
  ph: BaseResult;
  bod: BaseResult;
  cod: BaseResult;
  tss: BaseResult;
  minyak_lemak: BaseResult;
  amoniak: BaseResult;
  total_coliform: BaseResult;
}

// Union type for all result types
export type HasilUji = 
  | HasilKualitasUdara 
  | HasilKualitasAir 
  | HasilKualitasMakanan 
  | HasilUsapAlatMedisLinen 
  | HasilLimbahCair;

export interface User {
  id_user?: number;
  username?: string;
  nama_user?: string;
  email?: string;
  level?: string;
  nama_instansi?: string;
  alamat_instansi?: string;
  telepon_instansi?: string;
}

// Example data structure:
// {
//   "id_laporan_lab": 1,
//   "id_user": "2",
//   "nama_lab": "Lab Kesehatan Daerah",
//   "jenis_pemeriksaan": "Pemeriksaan Air Minum",
//   "total_pemeriksaan": 25,
//   "parameter_uji": [
//     {
//       "id": 1,
//       "nama_parameter": "pH",
//       "satuan": "",
//       "metode": "Elektrometri",
//       "batas_normal": "6.5 - 8.5"
//     },
//     {
//       "id": 2,
//       "nama_parameter": "Kekeruhan",
//       "satuan": "NTU",
//       "metode": "Nefelometri",
//       "batas_normal": "< 5"
//     }
//   ],
//   "hasil_uji": [
//     {
//       "id": 1,
//       "parameter_id": 1,
//       "nilai": "7.2",
//       "status": "normal",
//       "keterangan": "Sesuai standar"
//     },
//     {
//       "id": 2,
//       "parameter_id": 2,
//       "nilai": "3.5",
//       "status": "normal",
//       "keterangan": "Sesuai standar"
//     }
//   ],
//   "metode_analisis": "SNI 06-6989.11-2004",
//   "catatan": "Pemeriksaan dilakukan sesuai prosedur standar",
//   "link_sertifikat_lab": "https://example.com/sertifikat.pdf",
//   "link_hasil_uji": "https://example.com/hasil_uji.pdf",
//   "link_dokumen_pendukung": "https://example.com/dokumen_pendukung.pdf",
//   "periode": "3",
//   "periode_nama": "Maret",
//   "tahun": "2024",
//   "status_laporan_lab": "1",
//   "statusactive_laporan_lab": "1",
//   "user_created": "labuser001",
//   "user_updated": "",
//   "uid": "5b942520-a334-489e-8c55-1efd08cb8248",
//   "created_at": "2024-01-17T03:30:13.000000Z",
//   "updated_at": "2024-01-17T03:30:13.000000Z",
//   "user": {
//     "id_user": 2,
//     "username": "labuser001",
//     "nama_user": "Lab User 001",
//     "email": "labuser001@example.com",
//     "level": "3",
//     "nama_instansi": "Lab Kesehatan Daerah",
//     "alamat_instansi": "Jl. Kesehatan No. 123",
//     "telepon_instansi": "021-12345678"
//   }
// }