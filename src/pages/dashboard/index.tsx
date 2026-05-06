import { ColumnChart, DonutChart } from '@/components/Chart';
import { type Task, type TaskPriority, type TaskStatus, getAllTasks } from '@/services/storage';
import { Badge, Card, Col, List, Row, Spin, Statistic, Tag } from 'antd';
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

const DashboardPage = () => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(false);

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

	const totalCount = tasks.length;
	const doneCount = tasks.filter((task) => task.status === 'done').length;
	const overdueCount = tasks.filter((task) => isOverdue(task)).length;

	const statusCounts = {
		todo: tasks.filter((task) => task.status === 'todo').length,
		inprogress: tasks.filter((task) => task.status === 'inprogress').length,
		done: doneCount,
	};

	const priorityCounts = {
		High: tasks.filter((task) => task.priority === 'High').length,
		Medium: tasks.filter((task) => task.priority === 'Medium').length,
		Low: tasks.filter((task) => task.priority === 'Low').length,
	};

	const upcomingTasks = useMemo(() => {
		return tasks
			.filter((task) => task.status !== 'done')
			.sort((a, b) => dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf())
			.slice(0, 5);
	}, [tasks]);

	return (
		<Spin spinning={loading}>
			<div className='dashboard-page'>
				<Row gutter={[16, 16]}>
					<Col xs={24} md={8}>
						<Card>
							<Statistic title='Tổng số task' value={totalCount} />
						</Card>
					</Col>
					<Col xs={24} md={8}>
						<Card>
							<Statistic title='Task hoàn thành' value={doneCount} />
						</Card>
					</Col>
					<Col xs={24} md={8}>
						<Card>
							<Statistic title='Task quá hạn' value={overdueCount} valueStyle={{ color: '#cf1322' }} />
						</Card>
					</Col>
				</Row>

				<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
					<Col xs={24} lg={12}>
						<Card>
							<ColumnChart
								title='Thống kê task theo trạng thái'
								key={`${statusCounts.todo}-${statusCounts.inprogress}-${statusCounts.done}`}
								xAxis={[statusLabels.todo, statusLabels.inprogress, statusLabels.done]}
								yAxis={[[statusCounts.todo, statusCounts.inprogress, statusCounts.done]]}
								yLabel={['Số lượng']}
								otherOptions={{
									legend: { show: false },
									plotOptions: { bar: { distributed: true } },
									colors: [statusColors.todo, statusColors.inprogress, statusColors.done],
									grid: { padding: { left: 12, right: 12 } },
									chart: { animations: { enabled: false } },
								}}
								height={320}
							/>
						</Card>
					</Col>
					<Col xs={24} lg={12}>
						<Card>
							<DonutChart
								xAxis={[priorityLabels.High, priorityLabels.Medium, priorityLabels.Low]}
								yAxis={[[priorityCounts.High, priorityCounts.Medium, priorityCounts.Low]]}
								colors={[priorityColors.High, priorityColors.Medium, priorityColors.Low]}
								showTotal
								height={320}
							/>
						</Card>
					</Col>
				</Row>

				<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
					<Col xs={24}>
						<Card title='5 task sắp đến hạn'>
							<List
								dataSource={upcomingTasks}
								locale={{ emptyText: 'Chưa có task sắp đến hạn' }}
								renderItem={(task) => (
									<List.Item className={isOverdue(task) ? 'task-overdue' : undefined}>
										<List.Item.Meta
											title={task.name}
											description={
												<div className='task-meta'>
													<Badge color={statusColors[task.status]} text={statusLabels[task.status]} />
													<span className='task-deadline'>
														Hạn: {dayjs(task.deadline).format('DD/MM/YYYY')}
													</span>
													<Tag color={priorityColors[task.priority]}>
														{priorityLabels[task.priority]}
													</Tag>
												</div>
											}
										/>
										<div className='task-tags'>
											{task.tags.map((tag) => (
												<Tag key={tag}>{tag}</Tag>
											))}
										</div>
									</List.Item>
								)}
							/>
						</Card>
					</Col>
				</Row>
			</div>
		</Spin>
	);
};

export default DashboardPage;
