import type { TFilter } from '@/components/Table/typing';
import { message } from 'antd';
import { useState } from 'react';

const STORAGE_KEY = 'du_lich_ngan_sach';

const getDefaultDanhMuc = (): DuLichNganSach.IDanhMucNganSach[] => [
	{ key: 'anUong', label: 'Ăn uống', duKien: 0, thucTe: 0 },
	{ key: 'diChuyen', label: 'Di chuyển', duKien: 0, thucTe: 0 },
	{ key: 'luuTru', label: 'Lưu trú', duKien: 0, thucTe: 0 },
	{ key: 'khac', label: 'Khác', duKien: 0, thucTe: 0 },
];

const getDefaultRecord = (idLichTrinh?: string): DuLichNganSach.IRecord => ({
	_id: `du_lich_ngan_sach_default_${idLichTrinh || 'none'}`,
	idLichTrinh,
	danhMuc: getDefaultDanhMuc(),
	createdAt: new Date().toISOString(),
});

const readStorage = (): DuLichNganSach.IRecord[] => {
	const raw = localStorage.getItem(STORAGE_KEY);
	const data = raw ? (JSON.parse(raw) as DuLichNganSach.IRecord[]) : [];
	return Array.isArray(data) ? data : [];
};

const saveStorage = (data: DuLichNganSach.IRecord[]) => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const normalizeDanhMuc = (danhMuc?: DuLichNganSach.IDanhMucNganSach[]) => {
	const mapCurrent = new Map((danhMuc || []).map((item) => [item.key, item]));
	return getDefaultDanhMuc().map((defaultItem) => {
		const current = mapCurrent.get(defaultItem.key);
		return {
			...defaultItem,
			duKien: Number(current?.duKien || 0),
			thucTe: 0,
		};
	});
};

const mapForPlanOnly = (record: DuLichNganSach.IRecord): DuLichNganSach.IRecord => ({
	...record,
	danhMuc: normalizeDanhMuc(record.danhMuc),
});

export default () => {
	const initFilter: TFilter<DuLichNganSach.IRecord>[] = [];
	const [danhSach, setDanhSach] = useState<DuLichNganSach.IRecord[]>([]);
	const [record, setRecord] = useState<DuLichNganSach.IRecord | undefined>(undefined);
	const [loading, setLoading] = useState(false);
	const [visibleForm, setVisibleForm] = useState(false);
	const [edit, setEdit] = useState(false);
	const [isView, setIsView] = useState(false);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [total, setTotal] = useState(0);
	const [condition, setCondition] = useState<Partial<DuLichNganSach.IRecord>>({});
	const [sort, setSort] = useState<{ [k: string]: 1 | -1 } | undefined>(undefined);
	const [filters, setFilters] = useState<TFilter<DuLichNganSach.IRecord>[]>(initFilter);
	const [selectedIds, setSelectedIds] = useState<string[] | undefined>(undefined);
	const [formSubmiting, setFormSubmiting] = useState(false);

	const getModel = () => {
		setLoading(true);
		try {
			let data = readStorage().map(mapForPlanOnly);
			if (sort) {
				const [field, direction] = Object.entries(sort)[0] || [];
				if (field && direction)
					data = [...data].sort((a, b) =>
						String(a[field as keyof DuLichNganSach.IRecord] ?? '').localeCompare(
							String(b[field as keyof DuLichNganSach.IRecord] ?? ''),
						) * direction,
					);
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
			const data = readStorage().map(mapForPlanOnly);
			setDanhSach(data);
			setTotal(data.length);
			return Promise.resolve(data);
		} finally {
			setLoading(false);
		}
	};

	const postModel = (values: Omit<DuLichNganSach.IRecord, '_id' | 'createdAt'>) => {
		if (formSubmiting) return;
		setFormSubmiting(true);
		try {
			const data = readStorage();
			const payload: DuLichNganSach.IRecord = {
				...values,
				_id: `${Date.now()}`,
				createdAt: new Date().toISOString(),
				danhMuc: normalizeDanhMuc(values.danhMuc),
				idLichTrinh: values.idLichTrinh,
			};
			saveStorage([payload, ...data]);
			message.success('Thêm ngân sách thành công');
			getAllModel();
			setVisibleForm(false);
		} catch (error) {
			message.error('Thêm ngân sách thất bại');
		} finally {
			setFormSubmiting(false);
		}
	};

	const putModel = (id: string, values: Partial<DuLichNganSach.IRecord>) => {
		if (formSubmiting) return;
		setFormSubmiting(true);
		try {
			const data = readStorage();
			const nextData = data.map((item) => {
				if (item._id !== id) return item;
				return {
					...item,
					...values,
					danhMuc: normalizeDanhMuc(values.danhMuc || item.danhMuc),
				};
			});
			saveStorage(nextData);
			message.success('Cập nhật ngân sách thành công');
			getAllModel();
			setVisibleForm(false);
		} catch (error) {
			message.error('Cập nhật ngân sách thất bại');
		} finally {
			setFormSubmiting(false);
		}
	};

	const deleteModel = (id: string) => {
		try {
			const data = readStorage();
			saveStorage(data.filter((item) => item._id !== id));
			message.success('Xóa ngân sách thành công');
			getAllModel();
		} catch (error) {
			message.error('Xóa ngân sách thất bại');
		}
	};

	const deleteManyModel = async (ids: string[]) => {
		try {
			const data = readStorage();
			saveStorage(data.filter((item) => !ids.includes(item._id)));
			message.success(`Đã xóa ${ids.length} bản ghi`);
			getAllModel();
			return Promise.resolve(true);
		} catch (error) {
			message.error('Xóa danh sách thất bại');
			return Promise.reject(error);
		}
	};

	const handleEdit = (rec: DuLichNganSach.IRecord) => {
		setRecord(rec);
		setEdit(true);
		setIsView(false);
		setVisibleForm(true);
	};

	const getCurrentRecord = (idLichTrinh?: string) => {
		const data = readStorage();
		const matchedRecord = data.find((item) => item.idLichTrinh === idLichTrinh);
		return mapForPlanOnly(matchedRecord || getDefaultRecord(idLichTrinh));
	};

	const upsertCurrentModel = (
		idLichTrinh: string | undefined,
		values: { danhMuc: DuLichNganSach.IDanhMucNganSach[] },
	) => {
		const current = readStorage().find((item) => item.idLichTrinh === idLichTrinh);
		if (current?._id) {
			putModel(current._id, {
				danhMuc: values.danhMuc,
				idLichTrinh,
			});
			return;
		}
		postModel({
			danhMuc: values.danhMuc,
			idLichTrinh,
		});
	};

	const getTongDuKien = (data?: DuLichNganSach.IDanhMucNganSach[]) =>
		(data || []).reduce((sum, item) => sum + Number(item.duKien || 0), 0);

	const getTongThucTe = (data?: DuLichNganSach.IDanhMucNganSach[]) =>
		(data || []).reduce((sum, item) => sum + Number(item.thucTe || 0), 0);

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
		getCurrentRecord,
		upsertCurrentModel,
		getTongDuKien,
		getTongThucTe,
	};
};
