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

	///////////////////////////////////
	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './TrangChu',
		icon: 'HomeOutlined',
	},
	{
		path: '/quan-ly-van-bang',
		name: 'Quản lý văn bằng',
		icon: 'SolutionOutlined',
		routes: [
			{
				path: '/quan-ly-van-bang/so-van-bang',
				name: 'Quản lý sổ văn bằng',
				component: './VanBang/SoVanBang',
			},
			{
				path: '/quan-ly-van-bang/quyet-dinh',
				name: 'Quyết định tốt nghiệp',
				component: './VanBang/QuyetDinh',
			},
			{
				path: '/quan-ly-van-bang/bieu-mau',
				name: 'Cấu hình biểu mẫu',
				component: './VanBang/BieuMau',
			},
			{
				path: '/quan-ly-van-bang/thong-tin',
				name: 'Thông tin văn bằng',
				component: './VanBang/ThongTinVanBang',
			},
		],
	},
	{
		path: '/tra-cuu-van-bang',
		name: 'Tra cứu văn bằng',
		icon: 'SearchOutlined',
		component: './VanBang/TraCuuVanBang',
	},
	{
		path: '/gioi-thieu',
		name: 'About',
		component: './TienIch/GioiThieu',
		hideInMenu: true,
	},

	// DANH MUC HE THONG
	// {
	// 	name: 'DanhMuc',
	// 	path: '/danh-muc',
	// 	icon: 'copy',
	// 	routes: [
	// 		{
	// 			name: 'ChucVu',
	// 			path: 'chuc-vu',
	// 			component: './DanhMuc/ChucVu',
	// 		},
	// 	],
	// },

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
