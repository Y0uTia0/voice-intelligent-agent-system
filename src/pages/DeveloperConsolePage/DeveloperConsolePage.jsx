import React, { useState, useEffect } from 'react';
import { List, Form, Input, Button, TextArea, Toast, Dialog, Collapse } from 'antd-mobile';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getDevTools, createDevTool, updateDevTool, deleteDevTool } from '../../services/apiClient';
import styles from './DeveloperConsolePage.module.css';
import { Link } from 'react-router-dom';
import '../../styles/MainPage.css'; // 引入主页样式

function DeveloperConsolePage() {
  const { role } = useAuth();
  const { theme } = useTheme(); // 获取当前主题
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [form] = Form.useForm();

  // 判断是否为开发者角色或管理员角色
  const isDevOrAdmin = role === 'developer' || role === 'admin';

  // 根据当前主题设置样式变量
  const themeStyles = {
    backgroundColor: theme === 'dark' ? '#0f172a' : '#f5f7fa',
    textColor: theme === 'dark' ? '#f1f1f1' : '#333333',
    cardBg: theme === 'dark' ? '#1a1a2e' : '#ffffff',
    borderColor: theme === 'dark' ? '#334155' : '#d1d9e6',
    accentColor: theme === 'dark' ? '#ff6b8b' : '#e94560',
    buttonHover: theme === 'dark' ? '#4870a9' : '#1a4b8c',
    secondaryBg: theme === 'dark' ? '#1e293b' : '#edf2f7',
    errorColor: theme === 'dark' ? '#ff6b6b' : '#e74c3c'
  };

  useEffect(() => {
    if (isDevOrAdmin) {
      fetchDevTools();
    }
  }, [isDevOrAdmin]);

  // 获取开发者工具列表
  const fetchDevTools = async () => {
    setLoading(true);
    try {
      const response = await getDevTools();
      setTools(response.tools || []);
    } catch (error) {
      Toast.show({
        content: `获取工具失败: ${error.message}`,
        position: 'bottom'
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理表单提交
  const handleFormSubmit = async (values) => {
    setLoading(true);
    try {
      // 格式化endpoint字段（确保是对象）
      let endpoint = values.endpoint;
      if (typeof endpoint === 'string') {
        try {
          endpoint = JSON.parse(endpoint);
        } catch (e) {
          throw new Error('接口配置格式不正确，请提供有效的JSON对象');
        }
      }

      // 格式化schema字段（确保是对象）
      let requestSchema = values.request_schema;
      if (typeof requestSchema === 'string') {
        try {
          requestSchema = JSON.parse(requestSchema);
        } catch (e) {
          throw new Error('请求结构定义不正确，请提供有效的JSON对象');
        }
      }

      const toolData = {
        ...values,
        endpoint,
        request_schema: requestSchema
      };

      if (editingTool) {
        // 更新现有工具
        await updateDevTool(editingTool.tool_id, toolData);
        Toast.show({
          content: '工具更新成功',
          position: 'bottom'
        });
      } else {
        // 创建新工具
        await createDevTool(toolData);
        Toast.show({
          content: '工具创建成功',
          position: 'bottom'
        });
      }

      // 关闭表单并重新加载工具列表
      setFormVisible(false);
      setEditingTool(null);
      form.resetFields();
      fetchDevTools();
    } catch (error) {
      Toast.show({
        content: `操作失败: ${error.message}`,
        position: 'bottom'
      });
    } finally {
      setLoading(false);
    }
  };

  // 打开创建表单
  const openCreateForm = () => {
    setEditingTool(null);
    form.resetFields();
    setFormVisible(true);
  };

  // 打开编辑表单
  const openEditForm = (tool) => {
    setEditingTool(tool);
    form.setFieldsValue({
      ...tool,
      endpoint: JSON.stringify(tool.endpoint, null, 2),
      request_schema: JSON.stringify(tool.request_schema, null, 2)
    });
    setFormVisible(true);
  };

  // 处理删除工具
  const handleDeleteTool = async (toolId) => {
    const result = await Dialog.confirm({
      content: '确定要删除此工具吗？此操作不可撤销。'
    });

    if (result) {
      setLoading(true);
      try {
        await deleteDevTool(toolId);
        Toast.show({
          content: '工具删除成功',
          position: 'bottom'
        });
        fetchDevTools();
      } catch (error) {
        Toast.show({
          content: `删除失败: ${error.message}`,
          position: 'bottom'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // 如果用户不是开发者或管理员角色，显示无权限提示
  if (!isDevOrAdmin) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: '1rem',
        backgroundColor: themeStyles.backgroundColor,
        color: themeStyles.textColor
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>无访问权限</h2>
        <p>只有开发者或管理员可以访问此页面</p>
        <Link 
          to="/" 
          style={{
            marginTop: '1rem',
            padding: '8px 16px',
            backgroundColor: themeStyles.accentColor,
            color: 'white',
            borderRadius: '4px',
            textDecoration: 'none'
          }}
        >
          返回主页
        </Link>
      </div>
    );
  }

  return (
    <div className="main-container" style={{
      backgroundColor: themeStyles.backgroundColor,
      color: themeStyles.textColor
    }}>
      <div className="header-container">
        <h2 style={{ fontSize: '1.5rem', margin: 0, color: themeStyles.textColor }}>开发者控制台</h2>
        <Link 
          to="/" 
          className="nav-link"
          style={{
            backgroundColor: themeStyles.accentColor
          }}
        >
          返回主页
        </Link>
      </div>
      
      {/* 工具列表 */}
      <div style={{ 
        marginBottom: '1.5rem', 
        backgroundColor: themeStyles.cardBg,
        padding: '1rem',
        borderRadius: '0.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1rem',
          borderBottom: `1px solid ${themeStyles.borderColor}`,
          paddingBottom: '0.5rem'
        }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0, color: themeStyles.textColor }}>我的工具列表</h3>
          <Button
            color="primary"
            onClick={openCreateForm}
            loading={loading}
            style={{
              backgroundColor: themeStyles.accentColor,
              color: 'white'
            }}
          >
            创建新工具
          </Button>
        </div>

        {tools.length === 0 ? (
          <p style={{ 
            textAlign: 'center', 
            padding: '1rem 0', 
            color: themeStyles.textColor,
            opacity: 0.7
          }}>暂无工具，点击"创建新工具"添加</p>
        ) : (
          <List style={{ 
            backgroundColor: themeStyles.cardBg,
            borderRadius: '0.375rem',
            overflow: 'hidden'
          }}>
            {tools.map((tool) => (
              <List.Item
                key={tool.tool_id}
                title={tool.name}
                description={tool.description}
                onClick={() => {}}
                arrow={false}
                style={{
                  backgroundColor: themeStyles.cardBg,
                  color: themeStyles.textColor,
                  borderBottom: `1px solid ${themeStyles.borderColor}`
                }}
                extra={
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditForm(tool);
                      }}
                      style={{
                        backgroundColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                        color: themeStyles.textColor
                      }}
                    >
                      编辑
                    </Button>
                    <Button
                      size="small"
                      color="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTool(tool.tool_id);
                      }}
                      style={{
                        backgroundColor: theme === 'dark' ? '#ef4444' : '#f87171',
                        color: 'white'
                      }}
                    >
                      删除
                    </Button>
                  </div>
                }
              >
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: themeStyles.textColor }}>
                  <div><strong>ID:</strong> {tool.tool_id}</div>
                  <div><strong>类型:</strong> {tool.type}</div>
                </div>
              </List.Item>
            ))}
          </List>
        )}
      </div>

      {/* 工具表单 */}
      {formVisible && (
        <div style={{ 
          borderRadius: '0.375rem', 
          backgroundColor: theme === 'dark' ? '#1a1a2e' : '#ffffff', 
          padding: '1rem', 
          marginTop: '1rem',
          color: themeStyles.textColor,
          border: `1px solid ${themeStyles.borderColor}`
        }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: themeStyles.textColor }}>
            {editingTool ? '编辑工具' : '创建新工具'}
          </h3>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
            footer={
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  block
                  onClick={() => setFormVisible(false)}
                  style={{
                    backgroundColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                    color: themeStyles.textColor
                  }}
                >
                  取消
                </Button>
                <Button
                  block
                  type="submit"
                  color="primary"
                  loading={loading}
                  style={{
                    backgroundColor: themeStyles.accentColor,
                    color: 'white'
                  }}
                >
                  {editingTool ? '更新' : '创建'}
                </Button>
              </div>
            }
          >
            <Form.Item
              name="tool_id"
              label={<span style={{ color: themeStyles.textColor }}>工具ID</span>}
              rules={[{ 
                required: true, 
                message: <span style={{ color: themeStyles.errorColor }}>请输入工具ID</span> 
              }]}
              disabled={!!editingTool}
            >
              <Input 
                placeholder="例如: weather-tool" 
                disabled={!!editingTool} 
                style={{ 
                  backgroundColor: theme === 'dark' ? '#1a1a2e' : '#f5f7fa',
                  color: themeStyles.textColor,
                  borderColor: themeStyles.borderColor
                }}
              />
            </Form.Item>

            <Form.Item
              name="name"
              label={<span style={{ color: themeStyles.textColor }}>工具名称</span>}
              rules={[{ 
                required: true, 
                message: <span style={{ color: themeStyles.errorColor }}>请输入工具名称</span> 
              }]}
            >
              <Input 
                placeholder="例如: 天气查询工具" 
                style={{ 
                  backgroundColor: theme === 'dark' ? '#1a1a2e' : '#f5f7fa',
                  color: themeStyles.textColor,
                  borderColor: themeStyles.borderColor
                }}
              />
            </Form.Item>

            <Form.Item
              name="type"
              label={<span style={{ color: themeStyles.textColor }}>工具类型</span>}
              rules={[{ 
                required: true, 
                message: <span style={{ color: themeStyles.errorColor }}>请选择工具类型</span> 
              }]}
              initialValue="http"
            >
              <Input 
                placeholder="例如: http, mcp, custom" 
                style={{ 
                  backgroundColor: theme === 'dark' ? '#1a1a2e' : '#f5f7fa',
                  color: themeStyles.textColor,
                  borderColor: themeStyles.borderColor
                }}
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={<span style={{ color: themeStyles.textColor }}>工具描述</span>}
              rules={[{ 
                required: true, 
                message: <span style={{ color: themeStyles.errorColor }}>请输入工具描述</span> 
              }]}
            >
              <Input 
                placeholder="请输入工具功能描述" 
                style={{ 
                  backgroundColor: theme === 'dark' ? '#1a1a2e' : '#f5f7fa',
                  color: themeStyles.textColor,
                  borderColor: themeStyles.borderColor
                }}
              />
            </Form.Item>

            <Form.Item
              name="endpoint"
              label={<span style={{ color: themeStyles.textColor }}>接口配置</span>}
              rules={[{ 
                required: true, 
                message: <span style={{ color: themeStyles.errorColor }}>请输入接口配置</span> 
              }]}
              help={<span style={{ color: themeStyles.textColor }}>请输入合法的JSON对象</span>}
            >
              <TextArea
                placeholder='{"platform":"generic","api_key":"xxx","app_config":{"url":"https://api.example.com/endpoint","method":"POST"}}'
                rows={5}
                style={{ 
                  backgroundColor: theme === 'dark' ? '#1a1a2e' : '#f5f7fa',
                  color: themeStyles.textColor,
                  borderColor: themeStyles.borderColor,
                  fontFamily: 'monospace'
                }}
              />
            </Form.Item>

            <Form.Item
              name="request_schema"
              label={<span style={{ color: themeStyles.textColor }}>请求结构定义</span>}
              rules={[{ 
                required: true, 
                message: <span style={{ color: themeStyles.errorColor }}>请输入请求结构定义</span> 
              }]}
              help={<span style={{ color: themeStyles.textColor }}>请输入合法的JSON Schema对象</span>}
            >
              <TextArea
                placeholder='{"type":"object","properties":{"query":{"type":"string"}}}'
                rows={5}
                style={{ 
                  backgroundColor: theme === 'dark' ? '#1a1a2e' : '#f5f7fa',
                  color: themeStyles.textColor,
                  borderColor: themeStyles.borderColor,
                  fontFamily: 'monospace'
                }}
              />
            </Form.Item>
          </Form>
        </div>
      )}
    </div>
  );
}

export default DeveloperConsolePage; 