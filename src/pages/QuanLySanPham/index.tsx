import { useState, useMemo } from 'react';
import { Table, Button, Popconfirm, message, Modal, Form, Input, InputNumber, Space, Card, Select, Tag, Row, Col, Slider, Typography } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import rules from '@/utils/rules';
import { useSharedState, PRODUCT_STORAGE_KEY, INITIAL_PRODUCTS } from '@/utils/storage';

const { Option } = Select;
const { Text } = Typography;

const SanPham = () => {
    const [products, setProducts] = useSharedState(PRODUCT_STORAGE_KEY, INITIAL_PRODUCTS);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<string>();
    const [priceRange, setPrice] = useState<[number, number]>([0, 100000000]);
    const [status, setStatus] = useState<string>();
    const [sort, setSort] = useState<string>();
    const [isOpen, setIsOpen] = useState(false);
    const [curr, setCurr] = useState<any>(null);
    const [form] = Form.useForm();

    const filtered = useMemo(() => {
        let res = products.filter((p: any) =>
            (!search || p.name.toLowerCase().includes(search.toLowerCase())) &&
            (!category || p.category === category) &&
            (p.price >= priceRange[0] && p.price <= priceRange[1]) &&
            (!status || (status === 'in' ? p.quantity > 10 : status === 'low' ? p.quantity > 0 && p.quantity <= 10 : p.quantity === 0))
        );
        if (sort) {
            const [k, d] = sort.split('-');
            res.sort((a: any, b: any) => {
                if (k === 'name') return (d === 'asc' ? 1 : -1) * a.name.localeCompare(b.name);
                return (d === 'asc' ? 1 : -1) * (a[k] - b[k]);
            });
        }
        return res;
    }, [products, search, category, priceRange, status, sort]);

    const handleSave = async () => {
        try {
            const v = await form.validateFields();
            setProducts((prev: any[]) => curr ? prev.map(p => p.id === curr.id ? { ...p, ...v } : p) : [{ id: Date.now(), ...v }, ...prev]);
            message.success(curr ? 'Cập nhật xong' : 'Thêm mới xong');
            setIsOpen(false);
        } catch { }
    };

    const fmt = (n?: number) => n !== undefined ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : '';
    const openModal = (item: any = null) => { setCurr(item); form.setFieldsValue(item || {}); setIsOpen(true); };

    return (
        <div>
            <Card title="Quản lý Sản phẩm" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Thêm SP</Button>}>
                <Space direction="vertical" size="middle">
                    <Row gutter={[16, 16]}>
                        <Col span={6}><Input prefix={<SearchOutlined />} placeholder="Tìm tên..." onChange={e => setSearch(e.target.value)} /></Col>
                        <Col span={4}><Select placeholder="Danh mục" allowClear onChange={setCategory}>{
                            [...new Set(products.map((p: any) => p.category))].map((c: any) => <Option key={c} value={c}>{c}</Option>)
                        }</Select></Col>
                        <Col span={6}>
                            <Space direction="vertical" size={0}>
                                <Text type="secondary">Khoảng giá: {fmt(priceRange[0])} - {fmt(priceRange[1])}</Text>
                                <Slider range max={100000000} step={1000000} value={priceRange} onChange={(v: [number, number]) => setPrice(v)} tipFormatter={fmt} />
                            </Space>
                        </Col>
                        <Col span={4}><Select placeholder="Trạng thái" allowClear onChange={setStatus}>
                            <Option value="in">Còn hàng (&gt;10)</Option><Option value="low">Sắp hết (1-10)</Option><Option value="out">Hết hàng (0)</Option>
                        </Select></Col>
                        <Col span={4}><Select placeholder="Sắp xếp" allowClear onChange={setSort}>
                            <Option value="name-asc">Tên A-Z</Option>
                            <Option value="price-asc">Giá tăng dần</Option><Option value="price-desc">Giá giảm dần</Option>
                            <Option value="quantity-asc">Số lượng tăng</Option><Option value="quantity-desc">Số lượng giảm</Option>
                        </Select></Col>
                    </Row>
                    <Table dataSource={filtered} rowKey="id" pagination={{ pageSize: 5 }} columns={[
                        { title: 'STT', render: (_, __, i) => i + 1, width: 60 },
                        { title: 'Tên sản phẩm', dataIndex: 'name', render: t => <Text strong>{t}</Text> },
                        { title: 'Danh mục', dataIndex: 'category', render: t => <Tag color='blue'>{t}</Tag> },
                        { title: 'Giá', dataIndex: 'price', render: fmt, sorter: (a, b) => a.price - b.price },
                        {
                            title: 'Số lượng',
                            dataIndex: 'quantity',
                            render: q => <Text strong>{q}</Text>,
                            sorter: (a, b) => a.quantity - b.quantity
                        },
                        {
                            title: 'Trạng thái',
                            key: 'status',
                            render: (_, r) => {
                                let color = 'green';
                                let text = 'Còn hàng';
                                if (r.quantity === 0) { color = 'red'; text = 'Hết hàng'; }
                                else if (r.quantity <= 10) { color = 'orange'; text = 'Sắp hết'; }
                                return <Tag color={color}>{text}</Tag>;
                            }
                        },
                        {
                            title: 'Thao tác', render: (_, r) => <Space>
                                <Button size="small" icon={<EditOutlined />} onClick={() => openModal(r)} />
                                <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => setProducts((prev: any[]) => prev.filter(p => p.id !== r.id))}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
                            </Space>
                        },
                    ]} />
                </Space>
                <Modal title={curr ? "Sửa sản phẩm" : "Thêm sản phẩm"} visible={isOpen} onOk={handleSave} onCancel={() => setIsOpen(false)}>
                    <Form form={form} layout="vertical">
                        <Form.Item name="name" label="Tên sản phẩm" rules={rules.ten}><Input /></Form.Item>
                        <Form.Item name="category" label="Danh mục" rules={rules.required}><Select>{['Laptop', 'Điện thoại', 'Máy tính bảng', 'Phụ kiện'].map(c => <Option key={c} value={c}>{c}</Option>)}</Select></Form.Item>
                        <Row gutter={16}>
                            <Col span={12}><Form.Item name="price" label="Giá" rules={rules.number(1e9, 0)}><InputNumber formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v!.replace(/\$\s?|(,*)/g, '')} /></Form.Item></Col>
                            <Col span={12}><Form.Item name="quantity" label="Số lượng" rules={rules.number(10000, 0, false)}><InputNumber /></Form.Item></Col>
                        </Row>
                    </Form>
                </Modal>
            </Card>
        </div>
    );
};
export default SanPham;