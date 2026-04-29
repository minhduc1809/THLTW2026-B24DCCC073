import React, { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Select, Spin, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import { PlusOutlined } from '@ant-design/icons';
import moment, { Moment } from 'moment';
import dayjs from 'dayjs';
import {
	WorkoutExerciseType,
	WorkoutSession,
	WorkoutSessionInput,
	WorkoutStatus,
	createWorkoutSession,
	deleteWorkoutSessionById,
	formatDisplayDate,
	getAllWorkoutSessions,
	getWorkoutStatusColor,
	getWorkoutTypeLabel,
	getWorkoutTypeColor,
	updateWorkoutSession,
} from '@/services/storage';

type WorkoutFilterType = WorkoutExerciseType | 'All';

type WorkoutFormValues = {
	date: Moment;
	exerciseType: WorkoutExerciseType;
	duration: number;
	calories: number;
	note: string;
	status: WorkoutStatus;
};

const exerciseTypeOptions: WorkoutFilterType[] = ['All', 'Cardio', 'Strength', 'Yoga', 'HIIT', 'Other'];

const WorkoutLogPage: React.FC = () => {
	const [loading, setLoading] = useState(true);
	const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
	const [searchValue, setSearchValue] = useState('');
	const [typeFilter, setTypeFilter] = useState<WorkoutFilterType>('All');
	const [dateRange, setDateRange] = useState<[Moment, Moment] | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingRecord, setEditingRecord] = useState<WorkoutSession | null>(null);
	const [form] = Form.useForm<WorkoutFormValues>();

	const loadData = () => {
		setLoading(true);
		window.setTimeout(() => {
			setWorkouts(getAllWorkoutSessions());
			setLoading(false);
		}, 180);
	};

	useEffect(() => {
		loadData();
	}, []);

	const filteredWorkouts = useMemo(() => {
		return workouts
			.filter((item) => {
				const keyword = searchValue.trim().toLowerCase();
				const matchesKeyword = !keyword || item.exerciseType.toLowerCase().includes(keyword) || item.note.toLowerCase().includes(keyword);
				const matchesType = typeFilter === 'All' || item.exerciseType === typeFilter;
				const matchesRange =
					!dateRange ||
					(dayjs(item.date).valueOf() >= dateRange[0].startOf('day').valueOf() && dayjs(item.date).valueOf() <= dateRange[1].endOf('day').valueOf());
				return matchesKeyword && matchesType && matchesRange;
			})
			.sort((left, right) => dayjs(right.date).valueOf() - dayjs(left.date).valueOf());
	}, [dateRange, searchValue, typeFilter, workouts]);

	const openCreateModal = () => {
		setEditingRecord(null);
		form.resetFields();
		form.setFieldsValue({
			date: moment(),
			exerciseType: 'Cardio',
			duration: 30,
			calories: 250,
			note: '',
			status: 'completed',
		});
		setIsModalOpen(true);
	};

	const openEditModal = (record: WorkoutSession) => {
		setEditingRecord(record);
		form.setFieldsValue({
			date: moment(record.date),
			exerciseType: record.exerciseType,
			duration: record.duration,
			calories: record.calories,
			note: record.note,
			status: record.status,
		});
		setIsModalOpen(true);
	};

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			const payload: WorkoutSessionInput = {
				date: values.date.toISOString(),
				exerciseType: values.exerciseType,
				duration: values.duration,
				calories: values.calories,
				note: values.note,
				status: values.status,
			};

			if (editingRecord) {
				updateWorkoutSession(editingRecord.id, payload);
				message.success('Đã cập nhật buổi tập');
			} else {
				createWorkoutSession(payload);
				message.success('Đã thêm buổi tập mới');
			}
			setIsModalOpen(false);
			loadData();
		} catch {
			message.error('Vui lòng kiểm tra lại form');
		}
	};

	const handleDelete = (id: string) => {
		if (deleteWorkoutSessionById(id)) {
			message.success('Đã xóa buổi tập');
			loadData();
			return;
		}
		message.error('Không thể xóa buổi tập');
	};

	const columns: ColumnsType<WorkoutSession> = [
		{
			title: 'Ngày',
			dataIndex: 'date',
			key: 'date',
			render: (value: string) => formatDisplayDate(value),
		},
		{
			title: 'Loại bài tập',
			dataIndex: 'exerciseType',
			key: 'exerciseType',
			render: (value: WorkoutExerciseType) => <Tag color={getWorkoutTypeColor(value)}>{getWorkoutTypeLabel(value)}</Tag>,
		},
		{
			title: 'Thời lượng',
			dataIndex: 'duration',
			key: 'duration',
			render: (value: number) => `${value} phút`,
		},
		{
			title: 'Calo đốt',
			dataIndex: 'calories',
			key: 'calories',
			render: (value: number) => `${value} kcal`,
		},
		{
			title: 'Ghi chú',
			dataIndex: 'note',
			key: 'notePreview',
			render: (value: string) => <span>{value.length > 48 ? `${value.slice(0, 48)}...` : value}</span>,
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			key: 'status',
			render: (value: WorkoutStatus) => (
				<Tag color={getWorkoutStatusColor(value)}>{value === 'completed' ? 'Hoàn thành' : 'Bỏ lỡ'}</Tag>
			),
		},
		{
			title: 'Hành động',
			key: 'actions',
			render: (_, record) => (
				<div style={{ display: 'flex', gap: 8 }}>
					<Button size='small' onClick={() => openEditModal(record)}>
						Sửa
					</Button>
					<Popconfirm title='Xóa buổi tập này?' onConfirm={() => handleDelete(record.id)}>
						<Button danger size='small'>
							Xóa
						</Button>
					</Popconfirm>
				</div>
			),
		},
	];

	return (
		<Spin spinning={loading}>
			<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
					<Input.Search
						allowClear
						placeholder='Tìm theo tên loại hoặc ghi chú'
						style={{ maxWidth: 320 }}
						onSearch={setSearchValue}
						onChange={(event) => setSearchValue(event.target.value)}
					/>
					<div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
						<Select value={typeFilter} style={{ width: 180 }} onChange={(value: WorkoutFilterType) => setTypeFilter(value)} options={exerciseTypeOptions.map((item) => ({ label: item === 'All' ? 'Tất cả' : getWorkoutTypeLabel(item), value: item }))} />
						<DatePicker.RangePicker value={dateRange} onChange={(value) => setDateRange(value as [Moment, Moment] | null)} />
						<Button type='primary' icon={<PlusOutlined />} onClick={openCreateModal}>
							Thêm mới
						</Button>
					</div>
				</div>

				<Table<WorkoutSession> rowKey='id' columns={columns} dataSource={filteredWorkouts} pagination={{ pageSize: 8 }} locale={{ emptyText: 'Không có dữ liệu buổi tập' }} />

				<Modal
					title={editingRecord ? 'Sửa buổi tập' : 'Thêm buổi tập'}
						visible={isModalOpen}
					onCancel={() => setIsModalOpen(false)}
					onOk={handleSubmit}
					destroyOnClose
					okText={editingRecord ? 'Cập nhật' : 'Tạo mới'}
				>
					<Form layout='vertical' form={form}>
						<Form.Item label='Ngày tập' name='date' rules={[{ required: true, message: 'Vui lòng chọn ngày tập' }]}>
							<DatePicker style={{ width: '100%' }} />
						</Form.Item>
						<Form.Item label='Loại bài tập' name='exerciseType' rules={[{ required: true, message: 'Vui lòng chọn loại bài tập' }]}>
							<Select
								options={exerciseTypeOptions.filter((item): item is WorkoutExerciseType => item !== 'All').map((item) => ({ label: getWorkoutTypeLabel(item), value: item }))}
							/>
						</Form.Item>
						<Form.Item label='Thời lượng (phút)' name='duration' rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}>
							<InputNumber min={1} style={{ width: '100%' }} />
						</Form.Item>
						<Form.Item label='Calo đốt' name='calories' rules={[{ required: true, message: 'Vui lòng nhập calo' }]}>
							<InputNumber min={0} style={{ width: '100%' }} />
						</Form.Item>
						<Form.Item label='Ghi chú' name='note' rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}>
							<Input.TextArea rows={3} />
						</Form.Item>
						<Form.Item label='Trạng thái' name='status' rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
							<Select options={[{ label: 'Hoàn thành', value: 'completed' }, { label: 'Bỏ lỡ', value: 'missed' }]} />
						</Form.Item>
					</Form>
				</Modal>
			</div>
		</Spin>
	);
};

export default WorkoutLogPage;