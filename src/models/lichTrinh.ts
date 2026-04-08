import type { TFilter } from '@/components/Table/typing';
import { message } from 'antd';
import moment from 'moment';
import { useState } from 'react';

const STORAGE_KEY = 'du_lich_lich_trinh';
const DIEM_DEN_STORAGE_KEY = 'du_lich_diem_den';

const readStorage = (): DuLichLichTrinh.IRecord[] => {
	const raw = localStorage.getItem(STORAGE_KEY);
	return raw ? (JSON.parse(raw) as DuLichLichTrinh.IRecord[]) : [];
};

const saveStorage = (data: DuLichLichTrinh.IRecord[]) => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const readDiemDenStorage = (): DuLichDiemDen.IRecord[] => {
	const raw = localStorage.getItem(DIEM_DEN_STORAGE_KEY);
	return raw ? (JSON.parse(raw) as DuLichDiemDen.IRecord[]) : [];
};

const makeId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const buildNgayList = (
	ngayBatDau: string,
	ngayKetThuc: string,
	existing?: DuLichLichTrinh.INgayLichTrinh[],
): DuLichLichTrinh.INgayLichTrinh[] => {
	const start = moment(ngayBatDau);
	const end = moment(ngayKetThuc);
	if (!start.isValid() || !end.isValid() || end.isBefore(start, 'day')) return [];

	const existingMap = new Map((existing || []).map((item) => [moment(item.ngay).format('YYYY-MM-DD'), item]));
	const days: DuLichLichTrinh.INgayLichTrinh[] = [];
	const current = start.clone();

	while (current.isSameOrBefore(end, 'day')) {
		const key = current.format('YYYY-MM-DD');
		days.push({
			ngay: current.toISOString(),
			diemDen: existingMap.get(key)?.diemDen || [],
		});
		current.add(1, 'day');
	}

	return days;
};

const getTongChiPhiDiemDen = (
	item: DuLichLichTrinh.IDiemDenNgay,
	diemDenMap: Map<string, DuLichDiemDen.IRecord>,
) => {
	const master = diemDenMap.get(item.idDiemDen);
	return (
		Number(master?.chiAn ?? item.chiAn ?? 0) +
		Number(master?.chiLuuTru ?? item.chiLuuTru ?? 0) +
		Number(master?.chiDiChuyen ?? item.chiDiChuyen ?? 0)
	);
};

export default () => {
	const initFilter: TFilter<DuLichLichTrinh.IRecord>[] = [];
	const [danhSach, setDanhSach] = useState<DuLichLichTrinh.IRecord[]>([]);
	const [record, setRecord] = useState<DuLichLichTrinh.IRecord | undefined>(undefined);
	const [loading, setLoading] = useState(false);
	const [visibleForm, setVisibleForm] = useState(false);
	const [edit, setEdit] = useState(false);
	const [isView, setIsView] = useState(false);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(12);
	const [total, setTotal] = useState(0);
	const [condition, setCondition] = useState<Partial<DuLichLichTrinh.IRecord>>({});
	const [sort, setSort] = useState<{ [k: string]: 1 | -1 } | undefined>(undefined);
	const [filters, setFilters] = useState<TFilter<DuLichLichTrinh.IRecord>[]>(initFilter);
	const [selectedIds, setSelectedIds] = useState<string[] | undefined>(undefined);
	const [formSubmiting, setFormSubmiting] = useState(false);

	const getModel = () => {
		setLoading(true);
		try {
			let data = readStorage().sort((a, b) => b.createdAt.localeCompare(a.createdAt));

			if (condition?.ten) {
				const keyword = String(condition.ten).toLowerCase();
				data = data.filter((item) => item.ten.toLowerCase().includes(keyword));
			}

			if (sort) {
				const [field, direction] = Object.entries(sort)[0] || [];
				if (field && direction) {
					data = [...data].sort((a, b) => {
						if (field === 'ngayBatDau') {
							return (moment(a.ngayBatDau).valueOf() - moment(b.ngayBatDau).valueOf()) * direction;
						}
						return String(a[field as keyof DuLichLichTrinh.IRecord] || '').localeCompare(
							String(b[field as keyof DuLichLichTrinh.IRecord] || ''),
						) * direction;
					});
				}
			}

			setTotal(data.length);
			const start = (page - 1) * limit;
			setDanhSach(data.slice(start, start + limit));
		} finally {
			setLoading(false);
		}
	};

	const getAllModel = () => {
		setLoading(true);
		try {
			const data = readStorage().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
			setDanhSach(data);
			setTotal(data.length);
			return Promise.resolve(data);
		} finally {
			setLoading(false);
		}
	};

	const postModel = (values: Omit<DuLichLichTrinh.IRecord, '_id' | 'createdAt' | 'danhSachNgay' | 'nganSachTong'>) => {
		if (formSubmiting) return;
		setFormSubmiting(true);
		try {
			const data = readStorage();
			const payload: DuLichLichTrinh.IRecord = {
				...values,
				_id: makeId(),
				createdAt: new Date().toISOString(),
				danhSachNgay: buildNgayList(values.ngayBatDau, values.ngayKetThuc),
			};
			saveStorage([payload, ...data]);
			message.success('Tạo lịch trình thành công');
			getAllModel();
			setVisibleForm(false);
		} catch (error) {
			message.error('Tạo lịch trình thất bại');
		} finally {
			setFormSubmiting(false);
		}
	};

	const putModel = (id: string, values: Partial<DuLichLichTrinh.IRecord>) => {
		if (formSubmiting) return;
		setFormSubmiting(true);
		try {
			const data = readStorage();
			const nextData = data.map((item) => {
				if (item._id !== id) return item;
				const nextStart = values.ngayBatDau || item.ngayBatDau;
				const nextEnd = values.ngayKetThuc || item.ngayKetThuc;
				return {
					...item,
					...values,
					danhSachNgay: buildNgayList(nextStart, nextEnd, item.danhSachNgay),
				};
			});
			saveStorage(nextData);
			message.success('Cập nhật lịch trình thành công');
			getAllModel();
			setVisibleForm(false);
		} catch (error) {
			message.error('Cập nhật lịch trình thất bại');
		} finally {
			setFormSubmiting(false);
		}
	};

	const deleteModel = (id: string) => {
		try {
			const data = readStorage();
			saveStorage(data.filter((item) => item._id !== id));
			message.success('Xóa lịch trình thành công');
			getAllModel();
		} catch (error) {
			message.error('Xóa lịch trình thất bại');
		}
	};

	const deleteManyModel = async (ids: string[]) => {
		try {
			const data = readStorage();
			saveStorage(data.filter((item) => !ids.includes(item._id)));
			message.success(`Đã xóa ${ids.length} lịch trình`);
			getAllModel();
			return Promise.resolve(true);
		} catch (error) {
			message.error('Xóa danh sách thất bại');
			return Promise.reject(error);
		}
	};

	const handleEdit = (rec: DuLichLichTrinh.IRecord) => {
		setRecord(rec);
		setEdit(true);
		setIsView(false);
		setVisibleForm(true);
	};

	const addDiemDenToNgay = (payload: {
		idLichTrinh: string;
		ngay: string;
		diemDen: DuLichLichTrinh.IDiemDenNgay;
	}) => {
		const data = readStorage();
		const nextData = data.map((item) => {
			if (item._id !== payload.idLichTrinh) return item;
			return {
				...item,
				danhSachNgay: item.danhSachNgay.map((day) => {
					if (!moment(day.ngay).isSame(moment(payload.ngay), 'day')) return day;
					if (day.diemDen.some((d) => d.idDiemDen === payload.diemDen.idDiemDen)) return day;
					return { ...day, diemDen: [...day.diemDen, { idDiemDen: payload.diemDen.idDiemDen }] };
				}),
			};
		});
		saveStorage(nextData);
		message.success('Đã thêm điểm đến vào lịch trình');
		getAllModel();
	};

	const removeDiemDenKhoiNgay = (payload: { idLichTrinh: string; ngay: string; idDiemDen: string }) => {
		const data = readStorage();
		const nextData = data.map((item) => {
			if (item._id !== payload.idLichTrinh) return item;
			return {
				...item,
				danhSachNgay: item.danhSachNgay.map((day) => {
					if (!moment(day.ngay).isSame(moment(payload.ngay), 'day')) return day;
					return { ...day, diemDen: day.diemDen.filter((d) => d.idDiemDen !== payload.idDiemDen) };
				}),
			};
		});
		saveStorage(nextData);
		message.success('Đã xóa điểm đến khỏi ngày');
		getAllModel();
	};

	const sortDiemDenTrongNgay = (payload: {
		idLichTrinh: string;
		ngay: string;
		idDiemDen: string;
		newIndex: number;
	}) => {
		const data = readStorage();
		const nextData = data.map((item) => {
			if (item._id !== payload.idLichTrinh) return item;
			return {
				...item,
				danhSachNgay: item.danhSachNgay.map((day) => {
					if (!moment(day.ngay).isSame(moment(payload.ngay), 'day')) return day;
					const oldIndex = day.diemDen.findIndex((d) => d.idDiemDen === payload.idDiemDen);
					if (oldIndex < 0 || oldIndex === payload.newIndex) return day;
					const nextList = [...day.diemDen];
					const [moved] = nextList.splice(oldIndex, 1);
					nextList.splice(payload.newIndex, 0, moved);
					return { ...day, diemDen: nextList };
				}),
			};
		});
		saveStorage(nextData);
		message.success('Đã cập nhật thứ tự điểm đến');
		getAllModel();
	};

	const getTongChiPhiLichTrinh = (item: DuLichLichTrinh.IRecord) => {
		const diemDenMap = new Map(readDiemDenStorage().map((diemDen) => [diemDen._id, diemDen]));
		return (item.danhSachNgay || []).reduce((sum, day) => {
			const chiPhiNgay = (day.diemDen || []).reduce((totalNgay, diemDen) => {
				return totalNgay + getTongChiPhiDiemDen(diemDen, diemDenMap);
			}, 0);
			return sum + chiPhiNgay;
		}, 0);
	};

	return {
		danhSach,
		setDanhSach,
		record,
		setRecord,
		loading,
		visibleForm,
		setVisibleForm,
		edit,
		setEdit,
		isView,
		setIsView,
		page,
		setPage,
		limit,
		setLimit,
		total,
		condition,
		setCondition,
		sort,
		setSort,
		filters,
		setFilters,
		initFilter,
		selectedIds,
		setSelectedIds,
		formSubmiting,
		setFormSubmiting,
		getModel,
		getAllModel,
		postModel,
		putModel,
		deleteModel,
		deleteManyModel,
		handleEdit,
		addDiemDenToNgay,
		removeDiemDenKhoiNgay,
		sortDiemDenTrongNgay,
		getTongChiPhiLichTrinh,
	};
};
