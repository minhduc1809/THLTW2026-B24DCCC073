import React, { useState } from 'react';
import { Table, Button, Modal } from 'antd';
import { UserOutlined } from '@ant-design/icons';
const NguoiDung = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'key',
            key: 'key',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
        },
    ];
    const data = [
        {
            key: '1',
            name: 'John Brown',
            age: 32,
            address: 'New York No. 1 Lake Park',
        },
        {
            key: '2',
            name: 'Jim Green',
            age: 42,
            address: 'London No. 1 Lake Park',
        },
        {
            key: '3',
            name: 'Joe Black',
            age: 32,
            address: 'Sidney No. 1 Lake Park',
        },
    ];
    return <>
        <h1>Quản lý người dùng</h1>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
            <UserOutlined />
            Thêm người dùng
        </Button>
        <Table columns={columns} dataSource={data} />

        <Modal
            title="Thêm người dùng mới"
            visible={isModalOpen}
            onOk={() => setIsModalOpen(false)}
            onCancel={() => setIsModalOpen(false)}
        >
            <p>Nội dung form thêm người dùng sẽ ở đây...</p>
        </Modal>
    </>;
}
export default NguoiDung;
