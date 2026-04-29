import React, { useEffect, useState } from 'react';
import { Card, Col, Empty, Progress, Row, Spin, Statistic, Timeline, Typography } from 'antd';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import dayjs from 'dayjs';
import {
	getAllGoals,
	getAllHealthMetrics,
	getAllWorkoutSessions,
	getWorkoutStatusColor,
	getWorkoutTypeLabel,
	Goal,
	HealthMetric,
	WorkoutSession,
} from '@/services/storage';

const DashboardPage: React.FC = () => {
	const [loading, setLoading] = useState(true);
	const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
	const [metrics, setMetrics] = useState<HealthMetric[]>([]);
	const [goals, setGoals] = useState<Goal[]>([]);

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setWorkouts(getAllWorkoutSessions());
			setMetrics(getAllHealthMetrics());
			setGoals(getAllGoals());
			setLoading(false);
		}, 200);

		return () => window.clearTimeout(timer);
	}, []);

	const currentMonth = dayjs();
	const monthWorkouts = workouts.filter((item) => dayjs(item.date).isSame(currentMonth, 'month'));
	const totalWorkouts = monthWorkouts.length;
	const totalCalories = monthWorkouts.filter((item) => item.status === 'completed').reduce((sum, item) => sum + item.calories, 0);
	const completedDays = new Set(
		workouts
			.filter((item) => item.status === 'completed')
			.map((item) => dayjs(item.date).format('YYYY-MM-DD')),
	);

	let streak = 0;
	let cursor = dayjs();
	while (completedDays.has(cursor.format('YYYY-MM-DD'))) {
		streak += 1;
		cursor = cursor.subtract(1, 'day');
	}

	const activeGoals = goals.filter((goal) => goal.status === 'active');
	const goalProgressAverage = activeGoals.length
		? activeGoals.reduce((sum, goal) => sum + Math.min((goal.currentValue / goal.targetValue) * 100, 100), 0) / activeGoals.length
		: 0;

	const weeklyBuckets = [0, 0, 0, 0];
	monthWorkouts
		.filter((item) => item.status === 'completed')
		.forEach((item) => {
			const weekIndex = Math.min(Math.floor((dayjs(item.date).date() - 1) / 7), 3);
			weeklyBuckets[weekIndex] += 1;
		});

	const weightSeries = [...metrics].sort((left, right) => dayjs(left.date).valueOf() - dayjs(right.date).valueOf());
	const recentWorkouts = [...workouts]
		.sort((left, right) => dayjs(right.date).valueOf() - dayjs(left.date).valueOf())
		.slice(0, 5);

	const workoutChartOptions: ApexOptions = {
		chart: {
			type: 'bar',
			height: 280,
			toolbar: { show: false },
		},
		plotOptions: {
			bar: {
				borderRadius: 10,
				columnWidth: '48%',
			},
		},
		colors: ['#1677ff'],
		dataLabels: { enabled: false },
		grid: { strokeDashArray: 4 },
		xaxis: {
			categories: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
		},
		tooltip: { enabled: true },
	};

	const weightChartOptions: ApexOptions = {
		chart: {
			type: 'line',
			height: 280,
			toolbar: { show: false },
		},
		stroke: {
			curve: 'smooth',
			width: 3,
		},
		colors: ['#fa8c16'],
		markers: { size: 4 },
		grid: { strokeDashArray: 4 },
		xaxis: {
			categories: weightSeries.map((item) => dayjs(item.date).format('DD/MM')),
		},
		yaxis: {
			title: { text: 'kg' },
		},
	};

	return (
		<Spin spinning={loading}>
			<Row gutter={[16, 16]}>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic title='Tổng buổi tập trong tháng' value={totalWorkouts} />
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic title='Calo đã đốt trong tháng' value={totalCalories} suffix='kcal' />
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic title='Streak ngày tập liên tiếp' value={streak} suffix='ngày' />
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic title='Mục tiêu hoàn thành trung bình' value={goalProgressAverage.toFixed(1)} suffix='%' />
						<div style={{ marginTop: 12 }}>
							<Progress percent={Math.round(goalProgressAverage)} />
						</div>
					</Card>
				</Col>

				<Col xs={24} lg={12}>
					<Card title='Số buổi tập hoàn thành theo tuần' style={{ height: '100%' }}>
						{monthWorkouts.length ? (
							<ReactApexChart options={workoutChartOptions} series={[{ name: 'Buổi tập', data: weeklyBuckets }]} type='bar' height={280} />
						) : (
							<Empty description='Chưa có dữ liệu tập luyện trong tháng' />
						)}
					</Card>
				</Col>
				<Col xs={24} lg={12}>
					<Card title='Xu hướng cân nặng' style={{ height: '100%' }}>
						{weightSeries.length ? (
							<ReactApexChart options={weightChartOptions} series={[{ name: 'Cân nặng', data: weightSeries.map((item) => item.weight) }]} type='line' height={280} />
						) : (
							<Empty description='Chưa có dữ liệu chỉ số sức khỏe' />
						)}
					</Card>
				</Col>

				<Col span={24}>
					<Card title='5 buổi tập gần nhất'>
						{recentWorkouts.length ? (
							<Timeline>
								{recentWorkouts.map((item) => (
									<Timeline.Item key={item.id} color={getWorkoutStatusColor(item.status)}>
										<div>
											<Typography.Text strong>{dayjs(item.date).format('DD/MM/YYYY')}</Typography.Text>
											<div>
												<Typography.Text>{getWorkoutTypeLabel(item.exerciseType)}</Typography.Text>
												<span style={{ margin: '0 8px' }}>•</span>
												<Typography.Text>{item.duration} phút</Typography.Text>
												<span style={{ margin: '0 8px' }}>•</span>
												<Typography.Text>{item.calories} kcal</Typography.Text>
												<span style={{ margin: '0 8px' }}>•</span>
												<Typography.Text type='secondary'>{item.note}</Typography.Text>
											</div>
										</div>
									</Timeline.Item>
								))}
							</Timeline>
						) : (
							<Empty description='Chưa có buổi tập nào' />
						)}
					</Card>
				</Col>
			</Row>
		</Spin>
	);
};

export default DashboardPage;