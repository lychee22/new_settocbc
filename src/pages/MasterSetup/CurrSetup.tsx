import React, { useState, useCallback, useRef } from 'react';
import {
  Button,
  Space,
  Input,
  InputNumber,
  Form,
  Modal,
  message,
  Card,
  Typography,
  Row,
  Col,
  Table,
  Empty,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { currencySetup } from '../../api/modules/currencySetup';
import type {
  CurrencyMaster,
  CurrencySearchCriteria,
} from '../../types/api/currencySetup';

const { Title, Text } = Typography;

/**
 * 货币设置（Currency Setup）。
 *
 * 还原旧 MFX-BO「单条表单」范式（func.currSetup.js + frmCurrSetup.tpl）：
 *   货币代码搜索（弹窗表格）→ 选中加载到单条表单 → Add/Edit/View/Delete 模式按钮 → Save/Cancel/OK。
 *
 * 可见字段（对齐旧 tpl 可见区域）：curr / desc / dpsamt。
 * 隐藏字段（dayperyear/cls/margingrp/tradelmt/gl/deliverable）不在 UI 渲染，但提交时
 *   按旧 buildObj 行为带上值（add 用默认/空，edit/view 回填 currentRecord 原值），不丢字段。
 *
 * 本次不纳入 Override/审批工作流（maker-checker），Override/Reject 按钮先不渲染。
 */

/** 当前表单模式。 */
type FormMode = 'idle' | 'view' | 'add' | 'edit';

/** 仅可见的三个表单字段。 */
interface VisibleFormValues {
  curr: string;
  desc: string;
  dpsamt: number;
}

/** 访问权限位（对齐菜单 accessmode：V/A/E/D）。后续从菜单注入，此处先全开。 */
const ACCESS_MODE = 'VAED';
const hasAccess = (flag: string): boolean => ACCESS_MODE.includes(flag);

/** 新增时隐藏字段的默认值（与旧 buildObj 行为一致：仅 dayperyear 默认 360）。 */
const HIDDEN_DEFAULTS: Pick<
  CurrencyMaster,
  'dayperyear' | 'cls' | 'margingrp' | 'tradelmt' | 'gl' | 'deliverable'
> = {
  dayperyear: '360',
  cls: '',
  margingrp: '',
  tradelmt: '',
  gl: '',
  deliverable: '',
};

const CurrSetup: React.FC = () => {
  const [form] = Form.useForm<VisibleFormValues>();

  const [mode, setMode] = useState<FormMode>('idle');
  const [currentRecord, setCurrentRecord] = useState<CurrencyMaster | null>(null);
  const [saving, setSaving] = useState(false);

  // 搜索弹窗状态
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchValues, setSearchValues] = useState<CurrencySearchCriteria>({});
  const [searchResults, setSearchResults] = useState<CurrencyMaster[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPagination, setSearchPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const searchInFlightRef = useRef(false);

  /** 清空表单并回到 idle 模式（对齐旧 reset()）。 */
  const reset = useCallback(() => {
    form.resetFields();
    setCurrentRecord(null);
    setMode('idle');
  }, [form]);

  /** 加载搜索结果（货币搜索弹窗）。 */
  const loadSearch = useCallback(
    async (page = 1, pageSize = 10, criteria?: CurrencySearchCriteria) => {
      if (searchInFlightRef.current) return;
      searchInFlightRef.current = true;
      setSearchLoading(true);
      const c = criteria ?? searchValues;
      try {
        const result = await currencySetup.search(
          { curr: c.curr },
          { offset: (page - 1) * pageSize, length: pageSize },
        );
        setSearchResults(result.dtbldata ?? []);
        setSearchPagination({
          current: page,
          pageSize,
          total: result.dtblinfo?.total ?? 0,
        });
      } catch (err) {
        message.error(err instanceof Error ? err.message : '搜索货币失败');
      } finally {
        setSearchLoading(false);
        searchInFlightRef.current = false;
      }
    },
    [searchValues],
  );

  /** 打开搜索弹窗（对齐旧 openCurrSearch）。 */
  const openSearch = useCallback(() => {
    setSearchValues({});
    setSearchResults([]);
    setSearchPagination({ current: 1, pageSize: 10, total: 0 });
    setSearchVisible(true);
    void loadSearch(1, 10, {});
  }, [loadSearch]);

  /** 搜索弹窗：执行搜索。 */
  const handleSearchSubmit = (values: CurrencySearchCriteria) => {
    setSearchValues(values);
    void loadSearch(1, searchPagination.pageSize, values);
  };

  /** 搜索弹窗：重置条件。 */
  const handleSearchReset = () => {
    setSearchValues({});
    void loadSearch(1, searchPagination.pageSize, {});
  };

  /** 选中一条货币（对齐旧 onCurrSearchDone）。 */
  const onSearchDone = (record: CurrencyMaster) => {
    setCurrentRecord(record);
    form.setFieldsValue({
      curr: record.curr,
      desc: record.desc,
      dpsamt: Number(record.dpsamt),
    });
    setMode('view');
    setSearchVisible(false);
  };

  /** 进入新增模式（对齐旧 add()）。 */
  const handleAdd = () => {
    form.resetFields();
    setCurrentRecord(null);
    setMode('add');
  };

  /** 进入编辑模式（对齐旧 edit()）。 */
  const handleEdit = () => {
    if (!currentRecord) return;
    setMode('edit');
  };

  /** 进入查看模式（对齐旧 view()）。 */
  const handleView = () => {
    if (!currentRecord) return;
    setMode('view');
  };

  /** 删除当前货币（对齐旧 del()）。 */
  const handleDelete = () => {
    if (!currentRecord) return;
    const { curr } = currentRecord;
    Modal.confirm({
      title: '确认删除',
      content: `确认删除货币 ${curr} 吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await currencySetup.delete({ curr });
          message.success('货币已成功删除');
          reset();
        } catch (err) {
          message.error(err instanceof Error ? err.message : '删除失败');
        }
      },
    });
  };

  /** 保存（对齐旧 save()）：add → create，edit → update。 */
  const handleSave = async () => {
    let values: VisibleFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return; // 校验失败，antd 已展示
    }
    setSaving(true);
    try {
      if (mode === 'add') {
        // 新增：隐藏字段用默认/空值（与旧 buildObj 一致）
        const data: CurrencyMaster = {
          ...HIDDEN_DEFAULTS,
          curr: values.curr.toUpperCase(),
          desc: values.desc,
          dpsamt: String(values.dpsamt),
        };
        await currencySetup.create({ data });
        message.success('货币已成功新增');
        reset();
      } else if (mode === 'edit' && currentRecord) {
        // 编辑：保留隐藏字段原值，覆盖可见字段，回传 luptime（乐观锁）
        const data: CurrencyMaster = {
          ...currentRecord,
          curr: values.curr.toUpperCase(),
          desc: values.desc,
          dpsamt: String(values.dpsamt),
          luptime: currentRecord.luptime,
        };
        await currencySetup.update({ original: { curr: currentRecord.curr }, data });
        message.success('货币已成功更新');
        reset();
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  /** 整表单是否禁用（view/idle 模式禁用）。 */
  const formDisabled = mode === 'idle' || mode === 'view';
  /** 货币代码是否禁用（编辑时主键不可改；搜索在搜索弹窗里做，不在主表单输入框里直接搜）。 */
  const currDisabled = mode === 'edit' || mode === 'view';

  /** 搜索弹窗表格列。 */
  const searchColumns: ColumnsType<CurrencyMaster> = [
    { title: '货币代码', dataIndex: 'curr', width: 140 },
    { title: '描述', dataIndex: 'desc' },
    {
      title: '操作',
      width: 90,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => onSearchDone(record)}>
          选择
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={<Title level={4} style={{ margin: 0 }}>货币设置 Currency Setup</Title>}
        extra={
          <Space>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              disabled={!hasAccess('A')}
              onClick={handleAdd}
            >
              新增
            </Button>
            <Button
              icon={<EditOutlined />}
              disabled={!currentRecord || !hasAccess('E')}
              onClick={handleEdit}
            >
              编辑
            </Button>
            <Button
              icon={<EyeOutlined />}
              disabled={!currentRecord || !hasAccess('V')}
              onClick={handleView}
            >
              查看
            </Button>
            <Button
              icon={<DeleteOutlined />}
              danger
              disabled={!currentRecord || !hasAccess('D')}
              onClick={handleDelete}
            >
              删除
            </Button>
          </Space>
        }
      >
        {mode === 'idle' && (
          <Empty
            description="请搜索并选择货币，或点新增"
            style={{ margin: '48px 0' }}
          />
        )}

        <Form<VisibleFormValues>
          form={form}
          layout="vertical"
          disabled={formDisabled}
          style={{ display: mode === 'idle' ? 'none' : undefined }}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="货币代码"
                name="curr"
                rules={[
                  { required: true, message: '请输入货币代码' },
                  { pattern: /^[A-Z]{3}$/, message: '货币代码须为3位大写字母' },
                ]}
              >
                <Input
                  maxLength={3}
                  placeholder="如 USD"
                  disabled={currDisabled}
                  onChange={(e) =>
                    form.setFieldValue('curr', e.target.value.toUpperCase())
                  }
                  suffix={
                    <SearchOutlined
                      style={{ color: '#999', cursor: 'pointer' }}
                      onClick={() => openSearch()}
                    />
                  }
                  onPressEnter={() => openSearch()}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="货币描述"
                name="desc"
                rules={[
                  { required: true, message: '请输入货币描述' },
                  { max: 30, message: '描述最多 30 个字符' },
                ]}
              >
                <Input maxLength={30} showCount placeholder="货币描述" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="小数位数（金额）"
                name="dpsamt"
                rules={[
                  { required: true, message: '请输入小数位数' },
                  {
                    type: 'number',
                    min: 0,
                    max: 9,
                    message: '小数位数为 0-9 的整数',
                  },
                ]}
              >
                <InputNumber min={0} max={9} precision={0} style={{ width: '100%' }} placeholder="如 2" />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end">
            <Space>
              <Button
                icon={<SaveOutlined />}
                type="primary"
                disabled={mode !== 'add' && mode !== 'edit'}
                loading={saving}
                onClick={() => void handleSave()}
              >
                保存
              </Button>
              <Button icon={<CloseOutlined />} onClick={reset}>
                取消
              </Button>
              <Button onClick={reset}>重置</Button>
            </Space>
          </Row>
        </Form>

        {/* 隐藏字段提示（开发参考，确认数据完整） */}
        {currentRecord && mode !== 'idle' && (
          <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
            最后更新人：{currentRecord.lupuser ?? '-'} ｜ 最后更新时间：{currentRecord.luptime ?? '-'}
          </Text>
        )}
      </Card>

      {/* 货币搜索弹窗（对齐旧 dlgCurrSearch.tpl + func.currSearch） */}
      <Modal
        open={searchVisible}
        title="货币搜索"
        width={600}
        footer={null}
        onCancel={() => setSearchVisible(false)}
        destroyOnClose
      >
        <Form<CurrencySearchCriteria>
          layout="inline"
          onFinish={handleSearchSubmit}
          initialValues={{}}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="curr" label="货币代码">
            <Input
              allowClear
              placeholder="如 USD"
              onChange={(e) =>
                e.target.value === '' &&
                void loadSearch(1, searchPagination.pageSize, { curr: '' })
              }
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={searchLoading}>
                搜索
              </Button>
              <Button onClick={handleSearchReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>

        <Table<CurrencyMaster>
          rowKey="curr"
          size="small"
          columns={searchColumns}
          dataSource={searchResults}
          loading={searchLoading}
          pagination={{
            ...searchPagination,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={(pag) =>
            void loadSearch(pag.current ?? 1, pag.pageSize ?? 10)
          }
          onRow={(record) => ({ onDoubleClick: () => onSearchDone(record) })}
        />
      </Modal>
    </div>
  );
};

export default CurrSetup;
