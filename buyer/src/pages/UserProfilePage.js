import { useState } from 'react';
import { MailOutlined, LockOutlined, UserOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Input, Row, Col, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import API from '../api';
import { clearAuthToken, getAuthPayload, saveAuthToken } from '../auth';
import MainNav from '../components/MainNav';
import './UserProfilePage.css';

const { Title, Text } = Typography;

function UserProfilePage() {
    const [authPayload, setAuthPayload] = useState(getAuthPayload());
    const navigate = useNavigate();
    const [emailForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [loadingEmail, setLoadingEmail] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const username = authPayload?.username || 'Not available';
    const email = authPayload?.email || 'Not available';
    const accountType = authPayload?.type || 'Not available';

    const handleUpdateEmail = async (values) => {
        setLoadingEmail(true);
        try {
            const res = await API.patch('/auth/updateEmail', { 
                 email: values.newEmail,
                password: values.password
            });
            if (res.data.success) {
                if (res.data.token) {
                    saveAuthToken(res.data.token);
                }
                setAuthPayload(getAuthPayload());
                toast.success(res.data.message || 'Email updated successfully');
                emailForm.resetFields(['password']);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update email');
        } finally {
            setLoadingEmail(false);
        }
    };

    const handleChangePassword = async (values) => {
        setLoadingPassword(true);
        try {
            const res = await API.patch('/auth/changePassword', {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            });
            if (res.data.success) {
                toast.success('Password changed successfully');
                passwordForm.resetFields();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoadingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
        if (!confirmed) {
            return;
        }

        setLoadingDelete(true);
        try {
            const res = await API.delete('/auth/deleteAccount');
            if (res.data.success) {
                clearAuthToken();
                toast.success('Account deleted successfully');
                navigate('/signin');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete account');
        } finally {
            setLoadingDelete(false);
        }
    };

    return (
        <main className="page-shell profile-page">
            <MainNav />
            <section className="page-header">
                <Title level={2}>User Profile</Title>
                <Text type="secondary">Manage your buyer account, update email, change password, or remove your profile.</Text>
            </section>

            <section className="profile-panel">
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={10}>
                        <div className="profile-card info-card">
                            <div className="profile-card-header">
                                <UserOutlined className="profile-card-icon" />
                                <div>
                                    <Title level={4}>Account overview</Title>
                                    <Text type="secondary">Your current account details.</Text>
                                </div>
                            </div>
                            <div className="profile-info-grid">
                                <div>
                                    <Text>Username</Text>
                                    <strong>{username}</strong>
                                </div>
                                <div>
                                    <Text>Email</Text>
                                    <strong>{email}</strong>
                                </div>
                                <div>
                                    <Text>Account type</Text>
                                    <strong>{accountType}</strong>
                                </div>
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} lg={14}>
                        <div className="profile-card">
                            <div className="profile-card-header">
                                <MailOutlined className="profile-card-icon" />
                                <div>
                                    <Title level={4}>Update email</Title>
                                    <Text type="secondary">Use a new email for login and notifications.</Text>
                                </div>
                            </div>
                            <Form
                                form={emailForm}
                                layout="vertical"
                                name="updateEmail"
                                initialValues={{ newEmail: email }}
                                onFinish={handleUpdateEmail}
                            >
                                <Form.Item
                                    label="New email"
                                    name="newEmail"
                                    rules={[
                                        { required: true, message: 'Please enter your new email' },
                                        { type: 'email', message: 'Enter a valid email address' }
                                    ]}
                                >
                                    <Input prefix={<MailOutlined />} placeholder="new.email@example.com" />
                                </Form.Item>
                                <Form.Item
                                    label="Current password"
                                    name="password"
                                    rules={[{ required: true, message: 'Please enter your current password' }]}
                                >
                                    <Input.Password prefix={<LockOutlined />} placeholder="Current password" />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" loading={loadingEmail} block>
                                        Save new email
                                    </Button>
                                </Form.Item>
                            </Form>

                            <Divider />

                            <div className="profile-card-header">
                                <LockOutlined className="profile-card-icon" />
                                <div>
                                    <Title level={4}>Change password</Title>
                                    <Text type="secondary">Update your password to keep your account secure.</Text>
                                </div>
                            </div>
                            <Form
                                form={passwordForm}
                                layout="vertical"
                                name="changePassword"
                                onFinish={handleChangePassword}
                            >
                                <Form.Item
                                    label="Current password"
                                    name="currentPassword"
                                    rules={[{ required: true, message: 'Please enter your current password' }]}
                                >
                                    <Input.Password prefix={<LockOutlined />} placeholder="Current password" />
                                </Form.Item>

                                <Form.Item
                                    label="New password"
                                    name="newPassword"
                                    rules={[{ required: true, message: 'Please enter your new password' }, { min: 8, message: 'Password must be at least 8 characters' }]}
                                >
                                    <Input.Password prefix={<LockOutlined />} placeholder="New password" />
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" loading={loadingPassword} block>
                                        Change password
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>
                    </Col>
                </Row>

                <div className="profile-card danger-card">
                    <div className="profile-card-header">
                        <DeleteOutlined className="profile-card-icon danger-icon" />
                        <div>
                            <Title level={4}>Delete account</Title>
                            <Text type="danger">This permanently removes your buyer account.</Text>
                        </div>
                    </div>
                    <Text className="danger-text">
                        Deleting your account will remove your profile and stop all future access. Make sure you have saved any order information you need.
                    </Text>
                    <Button danger loading={loadingDelete} onClick={handleDeleteAccount} type="primary">
                        Delete my account
                    </Button>
                </div>
            </section>
        </main>
    );
}

export default UserProfilePage;