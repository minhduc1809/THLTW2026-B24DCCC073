import { useState } from 'react';
import { message } from 'antd';

export interface CauLacBoRecord {
	_id: string;
	avatar?: string;
	ten: string;
	ngayThanhLap: string;
	moTa: string; 
	chuNhiem: string;
	hoatDong: boolean;
	createdAt: string;
}

export default () => {
	const [danhSach, setDanhSach] = useState<CauLacBoRecord[]>([]);
	const [record, setRecord] = useState<CauLacBoRecord | any>({});
	const [loading, setLoading] = useState<boolean>(false);
	const [formSubmiting, setFormSubmiting] = useState<boolean>(false);
	const [visibleForm, setVisibleForm] = useState<boolean>(false);
	const [edit, setEdit] = useState<boolean>(false);
	const [isView, setIsView] = useState<boolean>(false);
	const [page, setPage] = useState<number>(1);
	const [limit, setLimit] = useState<number>(10);
	const [total, setTotal] = useState<number>(0);
	const [condition, setCondition] = useState<any>({});
	const [filters, setFilters] = useState<any[]>([]);
	const [sort, setSort] = useState<any>({});
	const [selectedIds, setSelectedIds] = useState<string[] | undefined>(undefined);

	const getModel = async (params?: any) => {
		setLoading(true);
		try {
			const dataLocal: CauLacBoRecord[] = JSON.parse(localStorage.getItem('caulacbo_list') || '[]');
			let filtered = [...dataLocal];

			if (filters && filters.length > 0) {
				filters.forEach((f: any) => {
					if (f.active && f.values && f.values.length > 0) {
						filtered = filtered.filter((item: any) => {
							const val = String(item[f.field] || '').toLowerCase();
							if (f.operator === 'contain') {
								return val.includes(String(f.values[0]).toLowerCase());
							}
                            if (f.operator === 'include' || f.operator === 'in') {
                                return f.values.includes(item[f.field]);
                            }
							return true;
						});
					}
				});
			}

			if (sort && Object.keys(sort).length > 0) {
				const sortField = Object.keys(sort)[0];
				const sortOrder = sort[sortField];
				filtered.sort((a: any, b: any) => {
					if (a[sortField] < b[sortField]) return -1 * sortOrder;
					if (a[sortField] > b[sortField]) return 1 * sortOrder;
					return 0;
				});
			}

			setTotal(filtered.length);
			const start = (page - 1) * limit;
			const end = start + limit;
			setDanhSach(filtered.slice(start, end));
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};
    
    const getAllModel = async () => {
        return JSON.parse(localStorage.getItem('caulacbo_list') || '[]');
    };

	const postModel = async (data: CauLacBoRecord) => {
		setFormSubmiting(true);
		try {
			const dataLocal: CauLacBoRecord[] = JSON.parse(localStorage.getItem('caulacbo_list') || '[]');
			const newData = { ...data, _id: Date.now().toString(), createdAt: new Date().toISOString() };
			dataLocal.push(newData);
			localStorage.setItem('caulacbo_list', JSON.stringify(dataLocal));
			message.success('Thêm mới thành công');
			await getModel();
			setVisibleForm(false);
		} catch (error) {
			message.error('Có lỗi xảy ra');
		} finally {
			setFormSubmiting(false);
		}
	};

	const putModel = async (id: string, data: Partial<CauLacBoRecord>) => {
		setFormSubmiting(true);
		try {
			let dataLocal: CauLacBoRecord[] = JSON.parse(localStorage.getItem('caulacbo_list') || '[]');
			dataLocal = dataLocal.map((item) => (item._id === id ? { ...item, ...data } : item));
			localStorage.setItem('caulacbo_list', JSON.stringify(dataLocal));
			message.success('Chỉnh sửa thành công');
			await getModel();
			setVisibleForm(false);
		} catch (error) {
			message.error('Có lỗi xảy ra');
		} finally {
			setFormSubmiting(false);
		}
	};

	const deleteModel = async (id: string) => {
		try {
			let dataLocal: CauLacBoRecord[] = JSON.parse(localStorage.getItem('caulacbo_list') || '[]');
			dataLocal = dataLocal.filter((item) => item._id !== id);
			localStorage.setItem('caulacbo_list', JSON.stringify(dataLocal));
			message.success('Xóa thành công');
			await getModel();
		} catch (error) {
			message.error('Có lỗi xảy ra');
		}
	};

	return {
		danhSach, setDanhSach, record, setRecord, loading, setLoading, formSubmiting, setFormSubmiting,
		visibleForm, setVisibleForm, edit, setEdit, isView, setIsView,
		page, setPage, limit, setLimit, total, setTotal, condition, setCondition,
		filters, setFilters, sort, setSort, selectedIds, setSelectedIds,
		getModel, getAllModel, postModel, putModel, deleteModel,
	};
};
