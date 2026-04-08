import { EOperatorType } from '@/components/Table/constant';
import type { TFilter } from '@/components/Table/typing';
import { message } from 'antd';
import { useState } from 'react';

const STORAGE_KEY = 'du_lich_diem_den';

const readStorage = (): DuLichDiemDen.IRecord[] => {
	const raw = localStorage.getItem(STORAGE_KEY);
	return raw ? (JSON.parse(raw) as DuLichDiemDen.IRecord[]) : [];
};

const saveStorage = (data: DuLichDiemDen.IRecord[]) => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const makeId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const getFieldValue = (
	item: DuLichDiemDen.IRecord,
	field: keyof DuLichDiemDen.IRecord | [keyof DuLichDiemDen.IRecord, string],
) => {
	if (Array.isArray(field)) {
		const parent = item[field[0]] as Record<string, unknown> | undefined;
		return parent?.[field[1]];
	}
	return item[field];
};

const getTongChiPhi = (item: DuLichDiemDen.IRecord) =>
	Number(item.chiAn || 0) + Number(item.chiLuuTru || 0) + Number(item.chiDiChuyen || 0);

export default () => {
	const initFilter: TFilter<DuLichDiemDen.IRecord>[] = [];
	const [danhSach, setDanhSach] = useState<DuLichDiemDen.IRecord[]>([]);
	const [record, setRecord] = useState<DuLichDiemDen.IRecord | undefined>(undefined);
	const [loading, setLoading] = useState(false);
	const [visibleForm, setVisibleForm] = useState(false);
	const [edit, setEdit] = useState(false);
	const [isView, setIsView] = useState(false);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [total, setTotal] = useState(0);
	const [condition, setCondition] = useState<Partial<DuLichDiemDen.IRecord>>({});
	const [sort, setSort] = useState<{ [k: string]: 1 | -1 } | undefined>(undefined);
	const [filters, setFilters] = useState<TFilter<DuLichDiemDen.IRecord>[]>(initFilter);
	const [selectedIds, setSelectedIds] = useState<string[] | undefined>(undefined);
	const [formSubmiting, setFormSubmiting] = useState(false);

	const applyCondition = (list: DuLichDiemDen.IRecord[]) => {
		if (!Object.keys(condition || {}).length) return list;
		return list.filter((item) =>
			Object.entries(condition || {}).every(([key, value]) => {
				if (value === undefined || value === null || value === '') return true;
				return String(item[key as keyof DuLichDiemDen.IRecord] || '') === String(value);
			}),
		);
	};

	const applyFilters = (list: DuLichDiemDen.IRecord[]) => {
		if (!filters?.length) return list;
		return list.filter((item) =>
			filters.every((filterRule) => {
				if (filterRule.active === false) return true;
				const val = getFieldValue(item, filterRule.field);
				const values = filterRule.values || [];
				if (filterRule.operator === EOperatorType.CONTAIN) {
					const keyword = String(values[0] ?? '').toLowerCase();
					return String(val ?? '').toLowerCase().includes(keyword);
				}
				if (filterRule.operator === EOperatorType.INCLUDE) {
					return values.map((v) => String(v)).includes(String(val ?? ''));
				}
				return true;
			}),
		);
	};

	const applySort = (list: DuLichDiemDen.IRecord[]) => {
		if (!sort) return list;
		const [field, direction] = Object.entries(sort)[0] || [];
		if (!field || !direction) return list;
		return [...list].sort((a, b) => {
			const aVal = field === 'chiPhiNgay' ? getTongChiPhi(a) : (getFieldValue(a, field as keyof DuLichDiemDen.IRecord) as any);
			const bVal = field === 'chiPhiNgay' ? getTongChiPhi(b) : (getFieldValue(b, field as keyof DuLichDiemDen.IRecord) as any);
			if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * direction;
			return String(aVal ?? '').localeCompare(String(bVal ?? '')) * direction;
		});
	};

	const getModel = () => {
		setLoading(true);
		try {
			let data = readStorage();
			data = applyCondition(data);
			data = applyFilters(data);
			data = applySort(data);
			data = data.map((item) => ({ ...item, chiPhiNgay: getTongChiPhi(item) } as DuLichDiemDen.IRecord));
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
			const data = readStorage()
				.map((item) => ({ ...item, chiPhiNgay: getTongChiPhi(item) } as DuLichDiemDen.IRecord))
				.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
			setDanhSach(data);
			setTotal(data.length);
			return Promise.resolve(data);
		} finally {
			setLoading(false);
		}
	};

	const postModel = (values: Omit<DuLichDiemDen.IRecord, '_id' | 'createdAt'>) => {
		if (formSubmiting) return;
		setFormSubmiting(true);
		try {
			const data = readStorage();
			const payload: DuLichDiemDen.IRecord = {
				...values,
				_id: makeId(),
				createdAt: new Date().toISOString(),
				chiAn: Number(values.chiAn || 0),
				chiLuuTru: Number(values.chiLuuTru || 0),
				chiDiChuyen: Number(values.chiDiChuyen || 0),
				rating: Number(values.rating || 0),
				thoiGianThamQuan: Number(values.thoiGianThamQuan || 0),
			};
			saveStorage([payload, ...data]);
			message.success('Thêm điểm đến thành công');
			getModel();
			setVisibleForm(false);
		} catch (error) {
			message.error('Thêm điểm đến thất bại');
		} finally {
			setFormSubmiting(false);
		}
	};

	const putModel = (id: string, values: Partial<DuLichDiemDen.IRecord>) => {
		if (formSubmiting) return;
		setFormSubmiting(true);
		try {
			const data = readStorage();
			const nextData = data.map((item) => {
				if (item._id !== id) return item;
				return {
					...item,
					...values,
					chiAn: Number(values.chiAn ?? item.chiAn ?? 0),
					chiLuuTru: Number(values.chiLuuTru ?? item.chiLuuTru ?? 0),
					chiDiChuyen: Number(values.chiDiChuyen ?? item.chiDiChuyen ?? 0),
					rating: Number(values.rating ?? item.rating ?? 0),
					thoiGianThamQuan: Number(values.thoiGianThamQuan ?? item.thoiGianThamQuan ?? 0),
				};
			});
			saveStorage(nextData);
			message.success('Cập nhật điểm đến thành công');
			getModel();
			setVisibleForm(false);
		} catch (error) {
			message.error('Cập nhật điểm đến thất bại');
		} finally {
			setFormSubmiting(false);
		}
	};

	const deleteModel = (id: string) => {
		try {
			const data = readStorage();
			saveStorage(data.filter((item) => item._id !== id));
			message.success('Xóa điểm đến thành công');
			getModel();
		} catch (error) {
			message.error('Xóa điểm đến thất bại');
		}
	};

	const deleteManyModel = async (ids: string[]) => {
		try {
			const data = readStorage();
			saveStorage(data.filter((item) => !ids.includes(item._id)));
			message.success(`Đã xóa ${ids.length} điểm đến`);
			getModel();
			return Promise.resolve(true);
		} catch (error) {
			message.error('Xóa danh sách thất bại');
			return Promise.reject(error);
		}
	};

	const handleEdit = (rec: DuLichDiemDen.IRecord) => {
		setRecord(rec);
		setEdit(true);
		setIsView(false);
		setVisibleForm(true);
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
	};
};
