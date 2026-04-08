export const LOAI_OPTIONS: { label: string; value: 'tatCa' | DuLichDiemDen.TLoaiDiemDen }[] = [
	{ label: 'Tất cả', value: 'tatCa' },
	{ label: 'Biển', value: 'bien' },
	{ label: 'Núi', value: 'nui' },
	{ label: 'Thành phố', value: 'thanhPho' },
];

export const LOAI_LABEL: Record<DuLichDiemDen.TLoaiDiemDen, string> = {
	bien: 'Biển',
	nui: 'Núi',
	thanhPho: 'Thành phố',
};

export const LOAI_COLOR: Record<DuLichDiemDen.TLoaiDiemDen, string> = {
	bien: 'blue',
	nui: 'green',
	thanhPho: 'gold',
};

export const RATING_FILTER_OPTIONS = [
	{ label: 'Tất cả', value: 0 },
	{ label: 'Từ 3 sao', value: 3 },
	{ label: 'Từ 4 sao', value: 4 },
	{ label: '5 sao', value: 5 },
];

export const SORT_FILTER_OPTIONS: {
	label: string;
	value: 'giaTang' | 'giaGiam' | 'ratingCao' | 'ratingThap';
}[] = [
	{ label: 'Giá tăng dần', value: 'giaTang' },
	{ label: 'Giá giảm dần', value: 'giaGiam' },
	{ label: 'Rating cao nhất', value: 'ratingCao' },
	{ label: 'Rating thấp nhất', value: 'ratingThap' },
];

export const BUDGET_CATEGORY_LABELS: Record<DuLichNganSach.TCategoryKey, string> = {
	anUong: 'Ăn uống',
	diChuyen: 'Di chuyển',
	luuTru: 'Lưu trú',
	khac: 'Khác',
};

export const BUDGET_CATEGORY_KEYS: DuLichNganSach.TCategoryKey[] = ['anUong', 'diChuyen', 'luuTru', 'khac'];

export const getTongChiPhiDiemDen = (item: Pick<DuLichDiemDen.IRecord, 'chiAn' | 'chiLuuTru' | 'chiDiChuyen'>) =>
	Number(item.chiAn || 0) + Number(item.chiLuuTru || 0) + Number(item.chiDiChuyen || 0);

export const getTongChiPhiNgay = (
	item: Pick<DuLichLichTrinh.IDiemDenNgay, 'chiAn' | 'chiLuuTru' | 'chiDiChuyen'> | Pick<DuLichDiemDen.IRecord, 'chiAn' | 'chiLuuTru' | 'chiDiChuyen'>,
) => Number(item.chiAn || 0) + Number(item.chiLuuTru || 0) + Number(item.chiDiChuyen || 0);
