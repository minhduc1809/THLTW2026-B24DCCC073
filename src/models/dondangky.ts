import { useState } from 'react';
import { message } from 'antd';
import moment from 'moment';

export interface DonDangKyRecord {
	_id: string;
	hoTen: string;
	email: string;
	soDienThoai: string;
	gioiTinh: string; 
	diaChi: string;
	soTruong: string;
	idCauLacBo: string; 
	lyDoDangKy: string;
	trangThai: string; 
	ghiChu?: string; 
	createdAt: string;
	actionHistory?: { action: string; time: string; note: string; user?: string }[];
}

export default () => {
	const [danhSach, setDanhSach] = useState<DonDangKyRecord[]>([]);
	const [record, setRecord] = useState<DonDangKyRecord | any>({});
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

	const getModel = async (params?: any, manualFilter?: (item: any) => boolean) => {
		setLoading(true);
		try {
			const dataLocal: DonDangKyRecord[] = JSON.parse(localStorage.getItem('dondangky_list') || '[]');
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
            if (manualFilter) {
                filtered = filtered.filter(manualFilter);
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

	const postModel = async (data: DonDangKyRecord) => {
		setFormSubmiting(true);
		try {
			const dataLocal: DonDangKyRecord[] = JSON.parse(localStorage.getItem('dondangky_list') || '[]');
			const newData = {
				...data,
				_id: Date.now().toString(),
				createdAt: new Date().toISOString(),
				trangThai: 'Pending',
				actionHistory: [],
			};
			dataLocal.push(newData);
			localStorage.setItem('dondangky_list', JSON.stringify(dataLocal));
			message.success('Thêm mới thành công');
			await getModel();
			setVisibleForm(false);
		} catch (error) {
			message.error('Có lỗi xảy ra');
		} finally {
			setFormSubmiting(false);
		}
	};

	const putModel = async (id: string, data: Partial<DonDangKyRecord>) => {
		setFormSubmiting(true);
		try {
			let dataLocal: DonDangKyRecord[] = JSON.parse(localStorage.getItem('dondangky_list') || '[]');
			dataLocal = dataLocal.map((item) => (item._id === id ? { ...item, ...data } : item));
			localStorage.setItem('dondangky_list', JSON.stringify(dataLocal));
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
			let dataLocal: DonDangKyRecord[] = JSON.parse(localStorage.getItem('dondangky_list') || '[]');
			dataLocal = dataLocal.filter((item) => item._id !== id);
			localStorage.setItem('dondangky_list', JSON.stringify(dataLocal));
			message.success('Xóa thành công');
			await getModel();
		} catch (error) {
			message.error('Có lỗi xảy ra');
		}
	};

	const approveManyModel = async (ids: string[]) => {
		try {
			let dataLocal: DonDangKyRecord[] = JSON.parse(localStorage.getItem('dondangky_list') || '[]');
			dataLocal = dataLocal.map((item) => {
				if (ids.includes(item._id)) {
					const time = moment().format('HH:mm DD/MM/YYYY');
					item.trangThai = 'Approved';
					item.actionHistory = [
						...(item.actionHistory || []),
						{ action: 'Approved', time, note: '', user: 'Admin' }
					];
				}
				return item;
			});
			localStorage.setItem('dondangky_list', JSON.stringify(dataLocal));
			message.success(`Đã duyệt ${ids.length} đơn đăng ký`);
			setSelectedIds(undefined);
			await getModel();
		} catch (error) {
			message.error('Có lỗi xảy ra');
		}
	};

	const rejectManyModel = async (ids: string[], ghiChu: string) => {
		try {
			let dataLocal: DonDangKyRecord[] = JSON.parse(localStorage.getItem('dondangky_list') || '[]');
			dataLocal = dataLocal.map((item) => {
				if (ids.includes(item._id)) {
					const time = moment().format('HH:mm DD/MM/YYYY');
					item.trangThai = 'Rejected';
					item.ghiChu = ghiChu;
					item.actionHistory = [
						...(item.actionHistory || []),
						{ action: 'Rejected', time, note: ghiChu, user: 'Admin' }
					];
				}
				return item;
			});
			localStorage.setItem('dondangky_list', JSON.stringify(dataLocal));
			message.success(`Đã từ chối ${ids.length} đơn đăng ký`);
			setSelectedIds(undefined);
			await getModel();
		} catch (error) {
			message.error('Có lỗi xảy ra');
		}
	};

	const changeGroupManyModel = async (ids: string[], idCauLacBo: string) => {
		try {
			let dataLocal: DonDangKyRecord[] = JSON.parse(localStorage.getItem('dondangky_list') || '[]');
			dataLocal = dataLocal.map((item) => {
				if (ids.includes(item._id)) {
					item.idCauLacBo = idCauLacBo;
				}
				return item;
			});
			localStorage.setItem('dondangky_list', JSON.stringify(dataLocal));
			message.success(`Đã đổi câu lạc bộ cho ${ids.length} thành viên`);
			setSelectedIds(undefined);
			await getModel();
		} catch (error) {
			message.error('Có lỗi xảy ra');
		}
	};

    const deleteManyModel = async (ids: string[], getDataData: () => void) => {
        try {
            let dataLocal: DonDangKyRecord[] = JSON.parse(localStorage.getItem('dondangky_list') || '[]');
			dataLocal = dataLocal.filter((item) => !ids.includes(item._id));
			localStorage.setItem('dondangky_list', JSON.stringify(dataLocal));
			message.success('Xóa thành công');
            getDataData();
        } catch {
        }
    };

	return {
		danhSach, setDanhSach, record, setRecord, loading, setLoading, formSubmiting, setFormSubmiting,
		visibleForm, setVisibleForm, edit, setEdit, isView, setIsView,
		page, setPage, limit, setLimit, total, setTotal, condition, setCondition,
		filters, setFilters, sort, setSort, selectedIds, setSelectedIds,
		getModel, postModel, putModel, deleteModel, deleteManyModel,
		approveManyModel, rejectManyModel, changeGroupManyModel,
	};
};
