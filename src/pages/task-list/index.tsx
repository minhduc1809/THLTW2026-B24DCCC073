import TaskFormModal, { type TaskFormValues } from '@/components/TaskFormModal';
import {
	createTask,
	deleteTask,
	getAllTasks,
	updateTask,
	type Task,
	type TaskPriority,
	type TaskStatus,
} from '@/services/storage';
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, message, Popconfirm, Select, Spin, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import './style.less';

const statusLabels: Record<TaskStatus, string> = {
	todo: 'Cần làm',
	inprogress: 'Đang làm',
	done: 'Hoàn thành',
};

const statusColors: Record<TaskStatus, string> = {
	todo: '#1677ff',
	inprogress: '#faad14',
	done: '#52c41a',
};

const priorityLabels: Record<TaskPriority, string> = {
	High: 'Cao',
	Medium: 'Trung bình',
	Low: 'Thấp',
};

const priorityColors: Record<TaskPriority, string> = {
	High: 'red',
	Medium: 'gold',
	Low: 'green',
};

const isOverdue = (task: Task) => task.status !== 'done' && dayjs(task.deadline).isBefore(dayjs(), 'day');

const TaskListPage = () => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchText, setSearchText] = useState('');
	const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
	const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
	const [modalOpen, setModalOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | undefined>();
	const [saving, setSaving] = useState(false);

	const loadTasks = () => {
		setLoading(true);
		try {
			setTasks(getAllTasks());
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadTasks();
	}, []);

	const filteredTasks = useMemo(() => {
		return tasks.filter((task) => {
			const matchesSearch = task.name.toLowerCase().includes(searchText.trim().toLowerCase());
			const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
			const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
			return matchesSearch && matchesStatus && matchesPriority;
		});
	}, [tasks, searchText, statusFilter, priorityFilter]);

	const handleSubmit = (values: TaskFormValues) => {
		setSaving(true);
		setLoading(true);
		try {
			const payload = {
				name: values.name,
				description: values.description,
				deadline: values.deadline.toISOString(),
				priority: values.priority,
				tags: values.tags ?? [],
				status: values.status,
				order: 0,
			};

			if (editingTask) {
				updateTask(editingTask.id, payload);
				message.success('Đã cập nhật task');
			} else {
				createTask(payload);
				message.success('Đã tạo task');
			}

			setModalOpen(false);
			setEditingTask(undefined);
			loadTasks();
		} catch (error) {
			message.error('Không thể lưu task');
		} finally {
			setSaving(false);
			setLoading(false);
		}
	};

	const handleDeleteTask = (task: Task) => {
		setLoading(true);
		try {
			deleteTask(task.id);
			message.success('Đã xóa task');
			loadTasks();
		} catch (error) {
			message.error('Không thể xóa task');
		} finally {
			setLoading(false);
		}
	};

	const columns: ColumnsType<Task> = [
		{
			title: 'Tên task',
			dataIndex: 'name',
			key: 'name',
			sorter: (a, b) => a.name.localeCompare(b.name),
			render: (value: string, record) => (
				<a
					className={isOverdue(record) ? 'task-overdue-link' : undefined}
					onClick={() => {
						setEditingTask(record);
						setModalOpen(true);
					}}
				>
					{value}
				</a>
			),
		},
		{
			title: 'Mô tả',
			dataIndex: 'description',
			key: 'description',
			width: 240,
			render: (value: string) => (
				<Tooltip title={value}>
					<span className='task-desc'>{value}</span>
				</Tooltip>
			),
		},
		{
			title: 'Tags',
			dataIndex: 'tags',
			key: 'tags',
			render: (tags: string[]) => (
				<div className='task-tags'>
					{tags.map((tag) => (
						<Tag key={tag}>{tag}</Tag>
					))}
				</div>
			),
		},
		{
			title: 'Deadline',
			dataIndex: 'deadline',
			key: 'deadline',
			sorter: (a, b) => dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf(),
			render: (value: string, record) => (
				<span className={isOverdue(record) ? 'task-deadline-overdue' : undefined}>
					{isOverdue(record) && <ExclamationCircleOutlined />} {dayjs(value).format('DD/MM/YYYY')}
				</span>
			),
		},
		{
			title: 'Ưu tiên',
			dataIndex: 'priority',
			key: 'priority',
			render: (value: TaskPriority) => <Tag color={priorityColors[value]}>{priorityLabels[value]}</Tag>,
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			key: 'status',
			render: (value: TaskStatus) => <Tag color={statusColors[value]}>{statusLabels[value]}</Tag>,
		},
		{
			title: 'Hành động',
			key: 'actions',
			render: (_, record) => (
				<div className='task-actions'>
					<Button
						type='link'
						onClick={() => {
							setEditingTask(record);
							setModalOpen(true);
						}}
					>
						Sửa
					</Button>
					<Popconfirm
						title='Bạn có chắc chắn muốn xóa?'
						onConfirm={() => handleDeleteTask(record)}
						okText='Xóa'
						cancelText='Hủy'
					>
						<Button type='link' danger>
							Xóa
						</Button>
					</Popconfirm>
				</div>
			),
		},
	];

	return (
		<Spin spinning={loading}>
			<div className='task-list-page'>
				<div className='task-list-toolbar'>
					<div className='task-list-filters'>
						<Input.Search
							placeholder='Tìm theo tên task'
							allowClear
							onSearch={(value) => setSearchText(value)}
							onChange={(event) => setSearchText(event.target.value)}
							style={{ width: 220 }}
						/>
						<Select
							value={statusFilter}
							onChange={(value) => setStatusFilter(value)}
							style={{ width: 180 }}
							options={[
								{ label: 'Tất cả trạng thái', value: 'all' },
								{ label: 'Cần làm', value: 'todo' },
								{ label: 'Đang làm', value: 'inprogress' },
								{ label: 'Hoàn thành', value: 'done' },
							]}
						/>
						<Select
							value={priorityFilter}
							onChange={(value) => setPriorityFilter(value)}
							style={{ width: 180 }}
							options={[
								{ label: 'Tất cả ưu tiên', value: 'all' },
								{ label: 'Cao', value: 'High' },
								{ label: 'Trung bình', value: 'Medium' },
								{ label: 'Thấp', value: 'Low' },
							]}
						/>
					</div>
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={() => {
							setEditingTask(undefined);
							setModalOpen(true);
						}}
					>
						Thêm task
					</Button>
				</div>

				<Table
					rowKey='id'
					columns={columns}
					dataSource={filteredTasks}
					pagination={{ pageSize: 10 }}
				/>
			</div>

			<TaskFormModal
				open={modalOpen}
				mode={editingTask ? 'edit' : 'create'}
				initialValues={editingTask}
				confirmLoading={saving}
				onCancel={() => {
					setModalOpen(false);
					setEditingTask(undefined);
				}}
				onSubmit={handleSubmit}
			/>
		</Spin>
	);
};

export default TaskListPage;
