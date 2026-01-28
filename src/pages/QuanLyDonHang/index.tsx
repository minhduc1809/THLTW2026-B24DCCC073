import { useState, useMemo } from 'react';
import { Table, Button, message, Modal, Form, Input, InputNumber, Tabs, Card, Select, Tag, Row, Col, DatePicker, Statistic, Progress, List, Divider, Space, Typography } from 'antd';
import { PlusOutlined, SearchOutlined, DashboardOutlined, ShoppingCartOutlined, AppstoreOutlined, UserOutlined } from '@ant-design/icons';
import rules from '@/utils/rules';
import moment from 'moment';
import { useSharedState, ORDER_STORAGE_KEY, PRODUCT_STORAGE_KEY, INITIAL_ORDERS, INITIAL_PRODUCTS } from '@/utils/storage';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const QuanLyDonHang = () => {
    const [products, setProducts] = useSharedState(PRODUCT_STORAGE_KEY, INITIAL_PRODUCTS);
    const [orders, setOrders] = useSharedState(ORDER_STORAGE_KEY, INITIAL_ORDERS);
    const [form] = Form.useForm();
    const [state, setState] = useState({
        tab: 'orders', search: '', status: undefined as string | undefined,
        dates: null as any, sort: undefined as string | undefined,
        open: false, detail: null as any, selProds: [] as number[]
    });
    const merge = (s: Partial<typeof state>) => setState(p => ({ ...p, ...s }));

    const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

    const filtered = useMemo(() => {
        let res = orders.filter((o: any) =>
            (!state.search || o.customerName.toLowerCase().includes(state.search.toLowerCase()) || o.id.includes(state.search)) &&
            (!state.status || o.status === state.status) &&
            (!state.dates || moment(o.createdAt).isBetween(state.dates[0], state.dates[1], 'day', '[]'))
        );
        if (state.sort) {
            const [k, d] = state.sort.split('-');
            res.sort((a: any, b: any) => {
                const vA = k === 'totalAmount' ? a.totalAmount : new Date(a.createdAt).getTime();
                const vB = k === 'totalAmount' ? b.totalAmount : new Date(b.createdAt).getTime();
                return (d === 'asc' ? 1 : -1) * (vA - vB);
            });
        } else {
            res.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return res;
    }, [orders, state.search, state.status, state.dates, state.sort]);

    const handleOrder = async () => {
        try {
            const v = await form.validateFields();
            const items = v.pids.map((id: any) => {
                const p = products.find((x: any) => x.id === id);
                const q = v[`q_${id}`];
                if (!p || q > p.quantity) throw new Error(`Sản phẩm ${p?.name || id} không đủ số lượng tồn kho`);
                return { productId: id, productName: p.name, quantity: q, price: p.price };
            });

            setOrders([{
                id: `DH${Date.now()}`, customerName: v.name, phone: v.phone, address: v.addr,
                products: items, totalAmount: items.reduce((s: number, i: any) => s + i.price * i.quantity, 0),
                status: 'Chờ xử lý', createdAt: moment().format('YYYY-MM-DD')
            }, ...orders]);
            merge({ open: false, selProds: [] }); form.resetFields(); message.success('Tạo đơn hàng thành công');
        } catch (e: any) { message.error(e.message); }
    };

    const updateStatus = (id: string, newStatus: string) => {
        const orderIndex = orders.findIndex((o: any) => o.id === id);
        if (orderIndex < 0) return;
        const o = orders[orderIndex];

        if (o.status === newStatus) return;

        if (newStatus === 'Hoàn thành' && o.status !== 'Hoàn thành') {
            const canFulfill = o.products.every((i: any) => {
                const p = products.find((prod: any) => prod.id === i.productId);
                return p && p.quantity >= i.quantity;
            });
            if (!canFulfill) return message.error('Không đủ hàng trong kho!');
            setProducts(products.map((p: any) => {
                const item = o.products.find((i: any) => i.productId === p.id);
                return item ? { ...p, quantity: p.quantity - item.quantity } : p;
            }));
        } else if (o.status === 'Hoàn thành' && newStatus === 'Đã hủy') {
            setProducts(products.map((p: any) => {
                const item = o.products.find((i: any) => i.productId === p.id);
                return item ? { ...p, quantity: p.quantity + item.quantity } : p;
            }));
        }

        const newOrders = [...orders];
        newOrders[orderIndex] = { ...o, status: newStatus };
        setOrders(newOrders);
        message.success(`Cập nhật trạng thái: ${newStatus}`);
    };

    const stats = useMemo(() => {
        const s: any = { 'Chờ xử lý': 0, 'Đang giao': 0, 'Hoàn thành': 0, 'Đã hủy': 0 };
        orders.forEach((o: any) => s[o.status] = (s[o.status] || 0) + 1);
        return s;
    }, [orders]);

    return (
        <Card>
            <Tabs activeKey={state.tab} onChange={k => merge({ tab: k })} type="card">
                <Tabs.TabPane tab="Quản lý Đơn hàng" key="orders">
                    <Card title="Danh sách đơn hàng" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { merge({ open: true, selProds: [] }); form.resetFields(); }}>Tạo đơn mới</Button>}>
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <Row gutter={[16, 16]}>
                                <Col span={8}><Input prefix={<SearchOutlined />} placeholder="Tìm khách hàng, mã đơn..." onChange={e => merge({ search: e.target.value })} /></Col>
                                <Col span={4}><Select placeholder="Trạng thái" allowClear onChange={v => merge({ status: v })} style={{ width: '100%' }}>{['Chờ xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy'].map(s => <Option key={s} value={s}>{s}</Option>)}</Select></Col>
                                <Col span={6}><RangePicker onChange={v => merge({ dates: v })} style={{ width: '100%' }} /></Col>
                                <Col span={6}><Select placeholder="Sắp xếp" allowClear onChange={v => merge({ sort: v })} style={{ width: '100%' }}><Option value="createAt-desc">Mới nhất</Option><Option value="totalAmount-desc">Giá trị cao nhất</Option></Select></Col>
                            </Row>
                            <Table dataSource={filtered} rowKey="id" columns={[
                                { title: 'Mã', dataIndex: 'id', render: t => <Tag>{t}</Tag> },
                                { title: 'Khách hàng', render: (_, r: any) => <div><Text strong>{r.customerName}</Text><br /><Text type="secondary">{r.phone}</Text></div> },
                                { title: 'SP', dataIndex: 'products', render: (p: any[]) => p.length, align: 'center' },
                                { title: 'Tổng', dataIndex: 'totalAmount', render: t => <Text type="danger" strong>{fmt(t)}</Text> },
                                { title: 'Trạng thái', dataIndex: 'status', render: (s, r) => <Select value={s} bordered={false} onChange={v => updateStatus(r.id, v)} dropdownMatchSelectWidth={false}>{['Chờ xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy'].map(o => <Option key={o} value={o}>{o}</Option>)}</Select> },
                                { title: 'Ngày tạo', dataIndex: 'createdAt' },
                                { title: 'Thao tác', render: (_, r) => <Button size="small" onClick={() => merge({ detail: r })}>Chi tiết</Button> }
                            ]} />
                        </Space>
                    </Card>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Thống kê" key="dashboard">
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <Row gutter={[16, 16]}>
                            {[
                                { t: "Tổng sản phẩm", v: products.length, i: <AppstoreOutlined />, c: "#1890ff" },
                                { t: "Giá trị tồn kho", v: products.reduce((s: number, p: any) => s + p.price * p.quantity, 0), i: <ShoppingCartOutlined />, c: "#722ed1" },
                                { t: "Tổng đơn hàng", v: orders.length, i: <UserOutlined />, c: "#faad14" },
                                { t: "Doanh thu", v: orders.filter((o: any) => o.status === 'Hoàn thành').reduce((s: number, o: any) => s + o.totalAmount, 0), i: <DashboardOutlined />, c: "#52c41a" }
                            ].map((d, i) => <Col span={6} key={i}><Card><Statistic title={d.t} value={d.v} prefix={d.i} valueStyle={{ color: d.c }} formatter={v => typeof v === 'number' && v > 1000 ? fmt(v) : v} /></Card></Col>)}
                        </Row>
                        <Card>
                            <Row gutter={24}>
                                <Col span={12}><Space direction="vertical" style={{ width: '100%' }}>{Object.keys(stats).map(k => <div key={k}><Row justify="space-between"><Text>{k}</Text><Text>{stats[k]} ({Math.round((stats[k] / Math.max(orders.length, 1)) * 100)}%)</Text></Row><Progress percent={Math.round((stats[k] / Math.max(orders.length, 1)) * 100)} showInfo={false} status={k === 'Hoàn thành' ? 'success' : k === 'Đã hủy' ? 'exception' : 'active'} strokeColor={k === 'Chờ xử lý' ? '#1890ff' : k === 'Đang giao' ? '#faad14' : undefined} /></div>)}</Space></Col>
                                <Col span={12}><Row justify="center" align="middle" style={{ height: '100%' }}><Statistic title="Tổng số đơn hàng" value={orders.length} /></Row></Col>
                            </Row>
                        </Card>
                    </Space>
                </Tabs.TabPane>
            </Tabs>

            <Modal title="Tạo đơn hàng mới" visible={state.open} onOk={handleOrder} onCancel={() => merge({ open: false })} width={800} destroyOnClose>
                <Form form={form} layout="vertical">
                    <Row gutter={16}><Col span={12}><Form.Item name="name" label="Tên khách hàng" rules={rules.ten}><Input /></Form.Item></Col><Col span={12}><Form.Item name="phone" label="Số điện thoại" rules={rules.soDienThoai}><Input /></Form.Item></Col></Row>
                    <Form.Item name="addr" label="Địa chỉ" rules={rules.required}><Input /></Form.Item>
                    <Divider orientation="left">Sản phẩm</Divider>
                    <Form.Item name="pids" rules={[{ required: true }]}>
                        <Select mode="multiple" placeholder="Chọn sản phẩm..." onChange={v => merge({ selProds: v })} optionFilterProp="children" style={{ width: '100%' }}>
                            {products.map((p: any) => <Option key={p.id} value={p.id} disabled={p.quantity <= 0}><Row justify="space-between"><Text>{p.name}</Text><Text type={p.quantity > 0 ? "secondary" : "danger"}>{fmt(p.price)} - SL: {p.quantity}</Text></Row></Option>)}
                        </Select>
                    </Form.Item>
                    {state.selProds.length > 0 && <Card size="small"><List size="small" dataSource={state.selProds} renderItem={id => {
                        const p = products.find((x: any) => x.id === id);
                        return p ? <List.Item><Row style={{ width: '100%', alignItems: 'center' }}><Col span={12}><Text strong>{p.name}</Text><br /><Text type="secondary">{fmt(p.price)}</Text></Col><Col span={12} style={{ textAlign: 'right' }}><Space><Text>SL:</Text><Form.Item name={`q_${id}`} initialValue={1} noStyle><InputNumber min={1} max={p.quantity} /></Form.Item><Text>/ {p.quantity}</Text></Space></Col></Row></List.Item> : null;
                    }} /></Card>}
                    <div style={{ textAlign: 'right', marginTop: 20 }}><Form.Item shouldUpdate>{() => {
                        const total = (form.getFieldValue('pids') || []).reduce((s: number, id: any) => s + (products.find((x: any) => x.id === id)?.price || 0) * (form.getFieldValue(`q_${id}`) || 0), 0);
                        return <Text style={{ fontSize: 18 }}>Tổng tiền: <Text type="danger" strong>{fmt(total)}</Text></Text>;
                    }}</Form.Item></div>
                </Form>
            </Modal>

            <Modal title="Chi tiết đơn hàng" visible={!!state.detail} onCancel={() => merge({ detail: null })} footer={null} width={700}>
                {state.detail && <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Row gutter={24}>
                        <Col span={12}><Text type="secondary">Khách hàng</Text><div><Text strong style={{ fontSize: 16 }}>{state.detail.customerName}</Text></div><div><Text>{state.detail.phone}</Text></div></Col>
                        <Col span={12} style={{ textAlign: 'right' }}><Text type="secondary">Mã đơn / Ngày tạo</Text><div><Text strong>#{state.detail.id}</Text></div><div><Text>{state.detail.createdAt}</Text></div></Col>
                    </Row>
                    <div><Text strong>Địa chỉ:</Text> <Text>{state.detail.address}</Text></div>
                    <Table size="small" dataSource={state.detail.products} pagination={false} rowKey="productId" columns={[{ title: 'SP', dataIndex: 'productName' }, { title: 'Đơn giá', dataIndex: 'price', render: fmt, align: 'right' }, { title: 'SL', dataIndex: 'quantity', align: 'center' }, { title: 'Thành tiền', render: (_, r: any) => fmt(r.price * r.quantity), align: 'right' }]} summary={d => <Table.Summary.Row><Table.Summary.Cell index={0} colSpan={3} align="right"><Text strong>Tổng cộng</Text></Table.Summary.Cell><Table.Summary.Cell index={1} align="right"><Text type="danger" strong>{fmt(d.reduce((s, c: any) => s + c.price * c.quantity, 0))}</Text></Table.Summary.Cell></Table.Summary.Row>} />
                    <Row justify="end"><Space><Text>Trạng thái:</Text><Tag color={state.detail.status === 'Hoàn thành' ? 'green' : state.detail.status === 'Đã hủy' ? 'red' : 'blue'}>{state.detail.status}</Tag></Space></Row>
                </Space>}
            </Modal>
        </Card>
    );
};
export default QuanLyDonHang;
