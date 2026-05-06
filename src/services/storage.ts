import dayjs from 'dayjs';

export type TaskStatus = 'todo' | 'inprogress' | 'done';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface Task {
	id: string;
	name: string;
	description: string;
	deadline: string;
	priority: TaskPriority;
	tags: string[];
	status: TaskStatus;
	order: number;
	createdAt: string;
	updatedAt: string;
}

const STORAGE_KEY = 'kanban_app_tasks';
const STATUS_ORDER: TaskStatus[] = ['todo', 'inprogress', 'done'];

const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const generateId = () => {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return Date.now().toString();
};

const readTasks = (): Task[] => {
	if (!isBrowser()) return [];
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return [];

	try {
		const parsed = JSON.parse(raw) as Task[];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
};

const writeTasks = (tasks: Task[]) => {
	if (!isBrowser()) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

export const initSampleData = () => {
	if (!isBrowser()) return;
	const existing = readTasks();
	if (existing.length > 0) return;

	const now = dayjs();
	const sampleTasks: Task[] = [
		{
			id: generateId(),
			name: 'Lập kế hoạch sprint tuần này',
			description: 'Xác định mục tiêu, phân bổ task và thời hạn cho sprint hiện tại.',
			deadline: now.add(1, 'day').toISOString(),
			priority: 'High',
			tags: ['planning', 'team'],
			status: 'todo',
			order: 0,
			createdAt: now.subtract(7, 'day').toISOString(),
			updatedAt: now.subtract(7, 'day').toISOString(),
		},
		{
			id: generateId(),
			name: 'Soạn draft tài liệu onboarding',
			description: 'Chuẩn bị hướng dẫn cho thành viên mới, gồm quy trình và checklist.',
			deadline: now.add(4, 'day').toISOString(),
			priority: 'Medium',
			tags: ['docs', 'onboarding'],
			status: 'todo',
			order: 1,
			createdAt: now.subtract(5, 'day').toISOString(),
			updatedAt: now.subtract(5, 'day').toISOString(),
		},
		{
			id: generateId(),
			name: 'Nghiên cứu UX cho bảng Kanban',
			description: 'Tổng hợp các pattern drag & drop phù hợp cho người dùng nội bộ.',
			deadline: now.add(6, 'day').toISOString(),
			priority: 'Low',
			tags: ['ux', 'research'],
			status: 'todo',
			order: 2,
			createdAt: now.subtract(4, 'day').toISOString(),
			updatedAt: now.subtract(4, 'day').toISOString(),
		},
		{
			id: generateId(),
			name: 'Thiết kế API mock cho task',
			description: 'Tạo bộ dữ liệu giả để test UI khi chưa có backend.',
			deadline: now.subtract(1, 'day').toISOString(),
			priority: 'High',
			tags: ['mock', 'api'],
			status: 'todo',
			order: 3,
			createdAt: now.subtract(8, 'day').toISOString(),
			updatedAt: now.subtract(8, 'day').toISOString(),
		},
		{
			id: generateId(),
			name: 'Xây dựng component Task Card',
			description: 'Hiển thị tag, ưu tiên, deadline và menu thao tác nhanh.',
			deadline: now.add(2, 'day').toISOString(),
			priority: 'Medium',
			tags: ['ui', 'component'],
			status: 'inprogress',
			order: 0,
			createdAt: now.subtract(3, 'day').toISOString(),
			updatedAt: now.subtract(1, 'day').toISOString(),
		},
		{
			id: generateId(),
			name: 'Cập nhật guideline màu sắc',
			description: 'Điều chỉnh màu ưu tiên theo palette mới của hệ thống.',
			deadline: now.add(3, 'day').toISOString(),
			priority: 'Low',
			tags: ['design', 'theme'],
			status: 'inprogress',
			order: 1,
			createdAt: now.subtract(6, 'day').toISOString(),
			updatedAt: now.subtract(2, 'day').toISOString(),
		},
		{
			id: generateId(),
			name: 'Tối ưu hiển thị thống kê Dashboard',
			description: 'Bổ sung biểu đồ cột và donut cho tổng quan task.',
			deadline: now.add(5, 'day').toISOString(),
			priority: 'High',
			tags: ['dashboard', 'chart'],
			status: 'inprogress',
			order: 2,
			createdAt: now.subtract(10, 'day').toISOString(),
			updatedAt: now.subtract(1, 'day').toISOString(),
		},
		{
			id: generateId(),
			name: 'Kiểm thử flow kéo thả',
			description: 'Test đầy đủ thao tác di chuyển và sắp xếp task.',
			deadline: now.subtract(2, 'day').toISOString(),
			priority: 'High',
			tags: ['qa', 'dnd'],
			status: 'done',
			order: 0,
			createdAt: now.subtract(12, 'day').toISOString(),
			updatedAt: now.subtract(4, 'day').toISOString(),
		},
		{
			id: generateId(),
			name: 'Viết checklist release',
			description: 'Chuẩn bị checklist trước khi triển khai bản cập nhật.',
			deadline: now.subtract(5, 'day').toISOString(),
			priority: 'Medium',
			tags: ['release', 'process'],
			status: 'done',
			order: 1,
			createdAt: now.subtract(15, 'day').toISOString(),
			updatedAt: now.subtract(5, 'day').toISOString(),
		},
		{
			id: generateId(),
			name: 'Phỏng vấn người dùng nội bộ',
			description: 'Thu thập phản hồi về workflow quản lý công việc.',
			deadline: now.subtract(7, 'day').toISOString(),
			priority: 'Low',
			tags: ['research', 'feedback'],
			status: 'done',
			order: 2,
			createdAt: now.subtract(20, 'day').toISOString(),
			updatedAt: now.subtract(7, 'day').toISOString(),
		},
	];

	writeTasks(sampleTasks);
};

export const getAllTasks = (): Task[] => {
	const tasks = readTasks();
	if (tasks.length === 0) {
		initSampleData();
		return readTasks();
	}
	return tasks;
};

export const getTaskById = (id: string): Task | undefined => {
	return getAllTasks().find((task) => task.id === id);
};

export const createTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
	const tasks = getAllTasks();
	const statusTasks = tasks.filter((item) => item.status === task.status);
	const now = new Date().toISOString();
	const newTask: Task = {
		...task,
		id: generateId(),
		order: statusTasks.length,
		createdAt: now,
		updatedAt: now,
	};

	writeTasks([...tasks, newTask]);
	return newTask;
};

export const updateTask = (id: string, data: Partial<Task>): Task => {
	const tasks = getAllTasks();
	const index = tasks.findIndex((task) => task.id === id);
	if (index === -1) {
		throw new Error('Task not found');
	}

	const existing = tasks[index];
	let order = existing.order;
	if (data.status && data.status !== existing.status) {
		const statusTasks = tasks.filter((item) => item.status === data.status);
		order = statusTasks.length;
	}

	const updatedTask: Task = {
		...existing,
		...data,
		order,
		updatedAt: new Date().toISOString(),
	};

	const updatedTasks = [...tasks.slice(0, index), updatedTask, ...tasks.slice(index + 1)];
	writeTasks(updatedTasks);
	return updatedTask;
};

export const deleteTask = (id: string): void => {
	const tasks = getAllTasks();
	const updatedTasks = tasks.filter((task) => task.id !== id);
	writeTasks(updatedTasks);
};

export const reorderTasks = (tasks: Task[]): void => {
	const now = new Date().toISOString();
	const reordered: Task[] = [];

	STATUS_ORDER.forEach((status) => {
		const items = tasks.filter((task) => task.status === status);
		items.forEach((task, index) => {
			reordered.push({
				...task,
				order: index,
				updatedAt: now,
			});
		});
	});

	writeTasks(reordered);
};

export const getTasksByStatus = (status: TaskStatus): Task[] => {
	return getAllTasks()
		.filter((task) => task.status === status)
		.sort((a, b) => a.order - b.order);
};
