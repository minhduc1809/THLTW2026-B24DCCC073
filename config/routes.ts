export default [
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
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './TrangChu',
		icon: 'HomeOutlined',
	},
	{
		path: '/gioi-thieu',
		name: 'About',
		component: './TienIch/GioiThieu',
		hideInMenu: true,
	},
	{
		name: 'DuLich',
		path: '/du-lich',
		icon: 'CompassOutlined',
		routes: [
			{
				path: '/du-lich',
				redirect: '/du-lich/kham-pha',
			},
			{
				name: 'KhamPha',
				path: 'kham-pha',
				component: './DuLich/KhamPha',
			},
			{
				name: 'LichTrinh',
				path: 'lich-trinh',
				component: './DuLich/LichTrinh',
			},
			{
				name: 'NganSach',
				path: 'ngan-sach',
				component: './DuLich/NganSach',
			},
			{
				name: 'AdminDuLich',
				path: 'admin',
				component: './DuLich/Admin',
			},
		],
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
		path: '/',
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
