export default [
	{
		path: '/',
		redirect: '/dashboard',
	},
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Bảng điều khiển',
		component: './dashboard',
		icon: 'HomeOutlined',
	},
	{
		path: '/workout-log',
		name: 'Nhật ký tập luyện',
		component: './workout-log',
		icon: 'ProfileOutlined',
	},
	{
		path: '/health-metrics',
		name: 'Chỉ số sức khỏe',
		component: './health-metrics',
		icon: 'HeartOutlined',
	},
	{
		path: '/goals',
		name: 'Mục tiêu',
		component: './goals',
		icon: 'AimOutlined',
	},
	{
		path: '/exercise-library',
		name: 'Thư viện bài tập',
		component: './exercise-library',
		icon: 'BookOutlined',
	},

	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];
