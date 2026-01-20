import { useState } from 'react';
import { Table, Button, Popconfirm, message, Modal, Form, Input, InputNumber, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const SanPham = () => {
    const [data, setData] = useState([
        { id: 1, name: 'Laptop Dell XPS 13', price: 25000000, quantity: 10 },
        { id: 2, name: 'iPhone 15 Pro Max', price: 30000000, quantity: 15 },
        { id: 3, name: 'Samsung Galaxy S24', price: 22000000, quantity: 20 },
        { id: 4, name: 'iPad Air M2', price: 18000000, quantity: 12 },
        { id: 5, name: 'MacBook Air M3', price: 28000000, quantity: 8 },
    ]);
    const [visible, setVisible] = useState(false);
    const [curr, setCurr] = useState<any>(null);
    const [form] = Form.useForm();

    const handleOk = async () => {
        try {
            const v = await form.validateFields();
            setData(prev => curr ? prev.map(i => i.id === curr.id ? { ...i, ...v } : i) : [{ id: Math.random(), ...v }, ...prev]);
            setVisible(false);
            message.success(curr ? 'Cập nhật thành công' : 'Thêm mới thành công');
        } catch { }
    };

    const openModal = (item: any = null) => {
        setCurr(item);
        setVisible(true);
        if (item) form.setFieldsValue(item); else form.resetFields();
    };

    return (
        <div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} style={{ marginBottom: 16 }}>Thêm sản phẩm</Button>
            <Table rowKey="id" dataSource={data} pagination={{ pageSize: 5 }} columns={[
                { title: 'STT', render: (_, __, i) => i + 1 },
                { title: 'Tên SP', dataIndex: 'name' },
                { title: 'Giá', dataIndex: 'price', render: v => v.toLocaleString() + ' ₫' },
                { title: 'SL', dataIndex: 'quantity' },
                {
                    title: 'Thao tác', render: (_, r) => <Space>
                        <Button size="small" onClick={() => openModal(r)}>Sửa</Button>
                        <Popconfirm title="Xóa?" onConfirm={() => setData(d => d.filter(i => i.id !== r.id))}><Button danger size="small">Xóa</Button></Popconfirm>
                    </Space>
                }
            ]} />
            <Modal
                title={curr ? "Sửa SP" : "Thêm SP"}
                visible={visible}
                onOk={handleOk}
                onCancel={() => setVisible(false)}
                okText="Lưu"
                cancelText="Hủy"
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="price" label="Giá" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item>
                    <Form.Item name="quantity" label="Số lượng" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
export default SanPham;