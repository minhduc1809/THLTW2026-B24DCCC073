import TaskFormModal, { type TaskFormValues } from '@/components/TaskFormModal';
import {
	createTask,
	deleteTask,
	reorderTasks,
	updateTask,
	getAllTasks,
	type Task,
	type TaskPriority,
	type TaskStatus,
} from '@/services/storage';
import {
	AppstoreOutlined,
	CalendarOutlined,
	CheckSquareOutlined,
	MoreOutlined,
	PlusOutlined,
} from '@ant-design/icons';
import { Badge, Button, Dropdown, Empty, Menu, message, Popconfirm, Spin, Tag } from 'antd';
import dayjs from 'dayjs';
import { DragDropContext, Draggable, Droppable, type DropResult } from 'react-beautiful-dnd';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
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

const columns: { key: TaskStatus; title: string; color: string; icon: JSX.Element }[] = [
	{ key: 'todo', title: 'Cần làm', color: '#1677ff', icon: <AppstoreOutlined /> },
	{ key: 'inprogress', title: 'Đang làm', color: '#faad14', icon: <CalendarOutlined /> },
	{ key: 'done', title: 'Hoàn thành', color: '#52c41a', icon: <CheckSquareOutlined /> },
];

const isOverdue = (task: Task) => task.status !== 'done' && dayjs(task.deadline).isBefore(dayjs(), 'day');

type TaskCardProps = {
	task: Task;
	borderColor: string;
	isDragging: boolean;
	onEdit: (task: Task) => void;
	onDelete: (task: Task) => void;
};

const TaskCard = memo((props: TaskCardProps) => {
	const { task, borderColor, isDragging, onEdit, onDelete } = props;

	const menu = (
		<Menu>
			<Menu.Item key='edit' onClick={() => onEdit(task)}>
				Sửa
			</Menu.Item>
			<Menu.Item key='delete'>
				<Popconfirm
					title='Bạn có chắc chắn muốn xóa?'
					onConfirm={() => onDelete(task)}
					okText='Xóa'
					cancelText='Hủy'
				>
					<span className='kanban-delete-text'>Xóa</span>
				</Popconfirm>
			</Menu.Item>
		</Menu>
	);

	return (
		<div
			className={`kanban-card ${isOverdue(task) ? 'kanban-card-overdue' : ''} ${
				isDragging ? 'kanban-card-dragging' : ''
			}`}
			style={{ borderColor }}
		>
			<div className='kanban-card-header'>
				<strong>{task.name}</strong>
				<Dropdown overlay={menu} trigger={['click']}>
					<Button type='link' icon={<MoreOutlined />} />
				</Dropdown>
			</div>
			<div className='kanban-card-tags'>
				{task.tags.map((tag) => (
					<Tag key={tag}>{tag}</Tag>
				))}
				<Tag color={priorityColors[task.priority]}>{priorityLabels[task.priority]}</Tag>
			</div>
			<div className={`kanban-card-deadline ${isOverdue(task) ? 'is-overdue' : ''}`}>
				<CalendarOutlined />
				<span>{dayjs(task.deadline).format('DD/MM/YYYY')}</span>
			</div>
		</div>
	);
});

TaskCard.displayName = 'TaskCard';

const KanbanPage = () => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalStatus, setModalStatus] = useState<TaskStatus>('todo');
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

	const tasksByStatus = useMemo(() => {
		return {
			todo: tasks.filter((task) => task.status === 'todo').sort((a, b) => a.order - b.order),
			inprogress: tasks
				.filter((task) => task.status === 'inprogress')
				.sort((a, b) => a.order - b.order),
			done: tasks.filter((task) => task.status === 'done').sort((a, b) => a.order - b.order),
		};
	}, [tasks]);

	const handleAddTask = useCallback((status: TaskStatus) => {
		setEditingTask(undefined);
		setModalStatus(status);
		setModalOpen(true);
	}, []);

	const handleEditTask = useCallback((task: Task) => {
		setEditingTask(task);
		setModalStatus(task.status);
		setModalOpen(true);
	}, []);

	const handleSubmit = async (values: TaskFormValues) => {
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

	const handleDeleteTask = useCallback((task: Task) => {
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
	}, []);

	const handleDragEnd = (result: DropResult) => {
		const { destination, source, draggableId } = result;
		if (!destination) return;
		if (destination.droppableId === source.droppableId && destination.index === source.index) return;

		const sourceStatus = source.droppableId as TaskStatus;
		const destStatus = destination.droppableId as TaskStatus;
		const sourceTasks = [...tasksByStatus[sourceStatus]];
		const destTasks = sourceStatus === destStatus ? sourceTasks : [...tasksByStatus[destStatus]];

		const taskIndex = sourceTasks.findIndex((task) => task.id === draggableId);
		if (taskIndex === -1) return;

		const [movedTask] = sourceTasks.splice(source.index, 1);
		const updatedMovedTask = { ...movedTask, status: destStatus };
		destTasks.splice(destination.index, 0, updatedMovedTask);

		const updatedAt = new Date().toISOString();
		const applyOrder = (items: Task[]) =>
			items.map((task, index) => ({
				...task,
				order: index,
				updatedAt,
			}));

		const updatedSource = applyOrder(sourceTasks);
		const updatedDest = sourceStatus === destStatus ? updatedSource : applyOrder(destTasks);
		const otherTasks = tasks.filter((task) => task.status !== sourceStatus && task.status !== destStatus);
		const updatedTasks =
			sourceStatus === destStatus
				? [...otherTasks, ...updatedSource]
				: [...otherTasks, ...updatedSource, ...updatedDest];

		try {
			reorderTasks(updatedTasks);
			setTasks(updatedTasks);
		} catch (error) {
			message.error('Không thể cập nhật thứ tự task');
		}
	};

	return (
		<Spin spinning={loading}>
			<div className='kanban-page'>
				<DragDropContext onDragEnd={handleDragEnd}>
					<div className='kanban-columns'>
						{columns.map((column) => {
							const list = tasksByStatus[column.key];
							return (
								<div className='kanban-column' key={column.key}>
									<div className='kanban-column-header' style={{ borderColor: column.color }}>
										<div className='kanban-column-title'>
											{column.icon}
											<span>{column.title}</span>
										</div>
										<Badge count={list.length} style={{ backgroundColor: column.color }} />
									</div>

									<Droppable droppableId={column.key}>
										{(provided) => (
											<div
												ref={provided.innerRef}
												{...provided.droppableProps}
												className='kanban-column-body'
											>
												{list.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
												{list.map((task, index) => (
													<Draggable key={task.id} draggableId={task.id} index={index}>
														{(dragProvided, snapshot) => (
															<div
																ref={dragProvided.innerRef}
																{...dragProvided.draggableProps}
																{...dragProvided.dragHandleProps}
															>
																<TaskCard
																	task={task}
																	borderColor={column.color}
																	isDragging={snapshot.isDragging}
																	onEdit={handleEditTask}
																	onDelete={handleDeleteTask}
																/>
															</div>
														)}
													</Draggable>
												))}
												{provided.placeholder}
											</div>
										)}
									</Droppable>

									<Button
										block
										type='dashed'
										icon={<PlusOutlined />}
										onClick={() => handleAddTask(column.key)}
									>
										Thêm task
									</Button>
								</div>
							);
						})}
					</div>
				</DragDropContext>
			</div>

			<TaskFormModal
				open={modalOpen}
				mode={editingTask ? 'edit' : 'create'}
				initialValues={editingTask}
				defaultStatus={modalStatus}
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

export default KanbanPage;
