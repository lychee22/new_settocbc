/**
 * 动态菜单类型定义。
 *
 * 对应后端接口 `userAccessGridMsg_GetUserMenu` 的返回结构。
 * 字段对齐真实响应样本（见 getmenu.txt，TEST_MAKER_N2 账号）。
 */

/**
 * 后端返回的单条菜单项（扁平结构）。
 *
 * 后端返回的是 `hvb` 数组，每项即此结构。字段含义：
 * - `item`：层级路径编码，点号分隔，每段 3 位数字（如 "001"、"001.001"、"002.007.001"）。
 *   父子关系靠此字段推导：`item.split('.').slice(0, -1).join('.')` 得父路径。
 * - `header`：`"true"`=分组标题节点（可展开），`"false"`=可点击叶子功能节点。
 * - `functionid`：功能标识（全小写），菜单点击时按此查 FUNCTIONID_TO_PAGE 映射打开页面。
 * - `accessmode`：权限码组合。V=View, A=Add, E=Edit, D=Delete, X=报表导出。
 *   如 "VAED" 表示增删改查全权限，"VX" 表示查看+导出。
 * - `functype`：功能类型。报表类为 `"COMMRPT"`，其他为空。
 * - `jsfile`：旧前端动态加载的 JS 文件名（新项目不用，仅参考）。
 */
export interface RawMenuItem {
  /** 功能标识（全小写） */
  functionid: string;
  /** 显示文字 */
  funcdesc: string;
  /** 层级路径编码，如 "001.001" */
  item: string;
  /** 节点类型："true"=分组，"false"=叶子 */
  header: string;
  /** 权限码，如 "VAED" / "VE" / "V" / "X" / "VX" */
  accessmode?: string;
  /** 功能类型，报表类为 "COMMRPT" */
  functype?: string;
  /** 旧前端 JS 文件（新项目不用） */
  jsfile?: string;
  /** 功能参数 */
  parm?: string;
  /** 是否走审批流："0"=否，"1"=是 */
  isapproval?: string;
  /** 是否允许多窗口："true" / "false" */
  allowmultiwindow?: string;
}

/**
 * 树形菜单节点（前端构建，供 antd Menu 渲染用）。
 *
 * 由 {@link buildMenuTree} 把扁平 {@link RawMenuItem}[] 转换而来。
 */
export interface MenuTreeNode {
  /** 节点 key，等于原始 item 路径编码（保证唯一） */
  key: string;
  /** 显示文字（funcdesc） */
  label: string;
  /** 是否分组标题节点（header==="true"） */
  isHeader: boolean;
  /** 功能标识（仅叶子节点有） */
  functionid?: string;
  /** 权限码（仅叶子节点有） */
  accessmode?: string;
  /** 功能类型（报表类为 "COMMRPT"） */
  functype?: string;
  /** 子节点 */
  children: MenuTreeNode[];
}
