declare module DuLichDiemDen {
	export type TLoaiDiemDen = 'bien' | 'nui' | 'thanhPho';

	export interface IRecord {
		_id: string;
		ten: string;
		loai: TLoaiDiemDen;
		moTa: string;
		thoiGianThamQuan: number;
		chiAn: number;
		chiLuuTru: number;
		chiDiChuyen: number;
		rating: number;
		hinhAnh?: string;
		createdAt: string;
	}
}

declare module DuLichLichTrinh {
	export interface IDiemDenNgay {
		idDiemDen: string;
		ten?: string;
		loai?: DuLichDiemDen.TLoaiDiemDen;
		rating?: number;
		chiAn?: number;
		chiLuuTru?: number;
		chiDiChuyen?: number;
		hinhAnh?: string;
	}

	export interface INgayLichTrinh {
		ngay: string;
		diemDen: IDiemDenNgay[];
	}

	export interface IRecord {
		_id: string;
		ten: string;
		ngayBatDau: string;
		ngayKetThuc: string;
		nganSachTong?: number;
		danhSachNgay: INgayLichTrinh[];
		createdAt: string;
	}
}

declare module DuLichNganSach {
	export type TCategoryKey = 'anUong' | 'diChuyen' | 'luuTru' | 'khac';

	export interface IDanhMucNganSach {
		key: TCategoryKey;
		label: string;
		duKien: number;
		thucTe: number;
	}

	export interface IRecord {
		_id: string;
		idLichTrinh?: string;
		danhMuc: IDanhMucNganSach[];
		createdAt: string;
	}
}
