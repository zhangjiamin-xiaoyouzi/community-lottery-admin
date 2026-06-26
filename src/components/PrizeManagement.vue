<template>
  <div class="prize-page">
    <header class="page-header">
      <div class="brand-block">
        <div class="brand-logo">
          <div class="brand-logo-core"></div>
        </div>
        <span class="brand-name">兑换系统</span>
      </div>

      <div class="header-user">
        <div class="user-avatar">
          <div class="user-avatar-core"></div>
        </div>
        <span class="user-name">张家敏</span>
        <span class="user-arrow">∨</span>
      </div>
    </header>

    <div class="page-body">
      <aside class="sidebar">
        <div v-for="section in menuSections" :key="section.title" class="menu-group">
          <div
            class="menu-group-title"
            :class="{ active: section.title === '任务中心后台' }"
            @click="toggleSection(section.title)"
          >
            <div class="menu-group-label">
              <span class="menu-grid-icon"></span>
              <span>{{ section.title }}</span>
            </div>
            <span class="menu-arrow">{{ expandedSections[section.title] ? '⌃' : '⌄' }}</span>
          </div>

          <div v-if="expandedSections[section.title]" class="menu-subtree">
            <template v-for="item in section.children" :key="item.label">
              <div v-if="!item.children" class="menu-subitem">
                {{ item.label }}
              </div>

              <div v-else class="menu-submenu">
                <div class="menu-submenu-title" @click="toggleSubmenu(item.label)">
                  <span>{{ item.label }}</span>
                  <span class="menu-arrow small">{{ expandedSubmenus[item.label] ? '⌃' : '⌄' }}</span>
                </div>

                <div v-if="expandedSubmenus[item.label]" class="menu-third-list">
                  <div
                    v-for="leaf in item.children"
                    :key="leaf"
                    class="menu-third-item"
                    :class="{ active: leaf === activeLeaf }"
                    @click="activeLeaf = leaf"
                  >
                    {{ leaf }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </aside>

      <main class="content-area">
        <div class="breadcrumb-bar">任务中心后台 / 抽奖管理 / 奖品管理</div>

        <section class="content-card">
          <div class="filter-row">
            <div class="field-group short">
              <label>奖品类型:</label>
              <select v-model="filters.type">
                <option value=""></option>
                <option v-for="option in typeOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>

            <div class="field-group short">
              <label>奖品ID:</label>
              <input v-model.trim="filters.id" type="text" placeholder="请输入" />
            </div>

            <div class="field-group medium">
              <label>奖品名称:</label>
              <div class="select-like-input">
                <input v-model.trim="filters.name" type="text" placeholder="请输入" />
                <span class="field-caret">⌄</span>
              </div>
            </div>

            <div class="field-group short">
              <label>奖品价值:</label>
              <select v-model="filters.valueLevel">
                <option value=""></option>
                <option v-for="option in valueOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>

            <div class="field-group date-wide">
              <label>奖品有效期:</label>
              <div class="date-range">
                <input v-model="filters.startDate" type="date" />
                <span class="date-separator">→</span>
                <input v-model="filters.endDate" type="date" />
                <span class="calendar-mark">◫</span>
              </div>
            </div>

            <div class="action-group">
              <button class="btn btn-primary" @click="applyFilters">查询</button>
              <button class="btn btn-default" @click="openCreateDialog">添加</button>
            </div>
          </div>

          <div class="table-shell">
            <table class="prize-table">
              <thead>
                <tr>
                  <th>奖品ID</th>
                  <th>奖品名称</th>
                  <th>奖品类型</th>
                  <th>每份数量</th>
                  <th>奖品图片</th>
                  <th>奖品价值</th>
                  <th>奖品总数</th>
                  <th>奖品库存</th>
                  <th>日获奖上限</th>
                  <th>月获奖上限</th>
                  <th>更新时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in displayedPrizes" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td class="name-cell">
                    <span class="prize-name-link">{{ item.name }}</span>
                    <span v-if="item.tip" class="tip-badge">?</span>
                  </td>
                  <td>{{ item.type }}</td>
                  <td>{{ item.perCount }}</td>
                  <td>
                    <div v-if="item.imageKind === 'art'" class="image-thumb art-thumb">
                      <div class="sky"></div>
                      <div class="mountain"></div>
                      <div class="grass"></div>
                    </div>
                    <div v-else class="image-thumb clock-thumb">
                      <div class="clock-circle"></div>
                      <div class="clock-hand short"></div>
                      <div class="clock-hand long"></div>
                      <div class="clock-ear left"></div>
                      <div class="clock-ear right"></div>
                    </div>
                  </td>
                  <td>{{ item.valueLevel }}</td>
                  <td>{{ displayValue(item.total) }}</td>
                  <td>{{ displayValue(item.stock) }}</td>
                  <td>{{ displayValue(item.dailyLimit) }}</td>
                  <td>{{ displayValue(item.monthlyLimit) }}</td>
                  <td>
                    <div>{{ item.updatedAt.split(' ')[0] }}</div>
                    <div>{{ item.updatedAt.split(' ')[1] }}</div>
                  </td>
                  <td class="operation-cell">
                    <button class="text-action" @click="viewPrize(item)">查看</button>
                    <button class="text-action" @click="editPrize(item)">编辑</button>
                    <button class="text-action" @click="toggleShelf(item.id)">
                      {{ item.status === 'online' ? '下架' : '上架' }}
                    </button>
                    <button class="text-action" @click="copyPrize(item)">复制</button>
                  </td>
                </tr>
                <tr v-if="!displayedPrizes.length">
                  <td colspan="12" class="empty-row">暂无符合条件的数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>

    <div v-if="dialog.visible" class="dialog-mask" @click.self="closeDialog">
      <div class="dialog-panel">
        <div class="dialog-header">
          <span>{{ dialogTitle }}</span>
          <button class="dialog-close" @click="closeDialog">×</button>
        </div>

        <div class="dialog-body">
          <div class="dialog-field">
            <label>奖品名称</label>
            <input v-model.trim="dialog.form.name" :disabled="dialog.mode === 'view'" type="text" />
          </div>
          <div class="dialog-field">
            <label>奖品类型</label>
            <select v-model="dialog.form.type" :disabled="dialog.mode === 'view'">
              <option v-for="option in typeOptions" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>
          <div class="dialog-field">
            <label>奖品价值</label>
            <select v-model="dialog.form.valueLevel" :disabled="dialog.mode === 'view'">
              <option v-for="option in valueOptions" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>
          <div class="dialog-field">
            <label>每份数量</label>
            <input v-model.number="dialog.form.perCount" :disabled="dialog.mode === 'view'" type="number" min="1" />
          </div>
          <div class="dialog-field">
            <label>总数</label>
            <input v-model="dialog.form.total" :disabled="dialog.mode === 'view'" type="text" />
          </div>
          <div class="dialog-field">
            <label>库存</label>
            <input v-model="dialog.form.stock" :disabled="dialog.mode === 'view'" type="text" />
          </div>
          <div class="dialog-field">
            <label>有效期开始</label>
            <input v-model="dialog.form.startDate" :disabled="dialog.mode === 'view'" type="date" />
          </div>
          <div class="dialog-field">
            <label>有效期结束</label>
            <input v-model="dialog.form.endDate" :disabled="dialog.mode === 'view'" type="date" />
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-default" @click="closeDialog">关闭</button>
          <button v-if="dialog.mode !== 'view'" class="btn btn-primary" @click="saveDialog">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, reactive, ref } from 'vue'

const createMenuSections = () => [
  { title: '活动管理', children: [] },
  { title: '数据分析', children: [] },
  { title: '评论审核', children: [] },
  { title: '内容管理', children: [] },
  { title: '质检管理', children: [] },
  {
    title: '任务中心后台',
    children: [
      { label: '任务配置' },
      { label: '抽奖管理', children: ['奖品管理', '抽奖券管理'] },
      { label: '中奖管理', children: ['中奖管理'] },
      { label: '外部场景应用管理' }
    ]
  },
  { title: '回复管理', children: [] },
  { title: '运营工具', children: [] },
  { title: '配置管理', children: [] },
  { title: '达人认证管理', children: [] },
  { title: '创作者管理', children: [] },
  { title: '用户激励管理', children: [] },
  { title: '内容分发', children: [] }
]

const createInitialPrizes = () => [
  {
    id: '2908',
    name: '会员兑换码',
    type: '兑换码',
    perCount: 1,
    imageKind: 'art',
    valueLevel: '高价值',
    total: '',
    stock: '',
    dailyLimit: '/',
    monthlyLimit: '/',
    updatedAt: '2026-05-29 16:01:38',
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    status: 'online',
    tip: false
  },
  {
    id: '2907',
    name: '55',
    type: '实物',
    perCount: 1,
    imageKind: 'clock',
    valueLevel: '中价值',
    total: '/',
    stock: '99999999',
    dailyLimit: '/',
    monthlyLimit: '/',
    updatedAt: '2026-05-30 15:09:10',
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    status: 'online',
    tip: true
  },
  {
    id: '2906',
    name: '会员兑换码',
    type: '兑换码',
    perCount: 1,
    imageKind: 'art',
    valueLevel: '高价值',
    total: '1',
    stock: '1',
    dailyLimit: '/',
    monthlyLimit: '/',
    updatedAt: '2026-05-29 15:55:38',
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    status: 'offline',
    tip: false
  },
  {
    id: '2905',
    name: '55',
    type: '实物',
    perCount: 1,
    imageKind: 'clock',
    valueLevel: '中价值',
    total: '/',
    stock: '99999999',
    dailyLimit: '/',
    monthlyLimit: '/',
    updatedAt: '2026-05-30 15:09:10',
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    status: 'online',
    tip: false
  },
  {
    id: '2903',
    name: '55',
    type: '实物',
    perCount: 1,
    imageKind: 'clock',
    valueLevel: '中价值',
    total: '/',
    stock: '99999999',
    dailyLimit: '/',
    monthlyLimit: '/',
    updatedAt: '2026-05-30 15:09:10',
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    status: 'online',
    tip: false
  }
]

const createEmptyDialogForm = () => ({
  id: '',
  name: '',
  type: '实物',
  perCount: 1,
  imageKind: 'clock',
  valueLevel: '中价值',
  total: '/',
  stock: '/',
  dailyLimit: '/',
  monthlyLimit: '/',
  updatedAt: '2026-06-01 10:00:00',
  startDate: '2026-06-01',
  endDate: '2026-06-30',
  status: 'offline',
  tip: false
})

export default {
  name: 'PrizeManagement',
  setup() {
    const menuSections = createMenuSections()
    const typeOptions = ['兑换码', '实物', '优惠券']
    const valueOptions = ['高价值', '中价值', '低价值']

    const expandedSections = reactive({
      活动管理: false,
      数据分析: false,
      评论审核: false,
      内容管理: false,
      质检管理: false,
      任务中心后台: true,
      回复管理: false,
      运营工具: false,
      配置管理: false,
      达人认证管理: false,
      创作者管理: false,
      用户激励管理: false,
      内容分发: false
    })

    const expandedSubmenus = reactive({
      抽奖管理: true,
      中奖管理: false
    })

    const activeLeaf = ref('奖品管理')
    const filters = reactive({
      type: '',
      id: '',
      name: '',
      valueLevel: '',
      startDate: '',
      endDate: ''
    })
    const allPrizes = ref(createInitialPrizes())
    const displayedPrizes = ref(createInitialPrizes())
    const dialog = reactive({
      visible: false,
      mode: 'create',
      form: createEmptyDialogForm()
    })

    const dialogTitle = computed(() => {
      if (dialog.mode === 'view') {
        return '查看奖品'
      }
      if (dialog.mode === 'edit') {
        return '编辑奖品'
      }
      return '添加奖品'
    })

    const displayValue = (value) => value || '/'

    const toggleSection = (title) => {
      expandedSections[title] = !expandedSections[title]
    }

    const toggleSubmenu = (label) => {
      expandedSubmenus[label] = !expandedSubmenus[label]
    }

    const filterPrizeList = () => {
      displayedPrizes.value = allPrizes.value.filter((item) => {
        const matchesType = !filters.type || item.type === filters.type
        const matchesId = !filters.id || item.id.includes(filters.id)
        const matchesName = !filters.name || item.name.includes(filters.name)
        const matchesValue = !filters.valueLevel || item.valueLevel === filters.valueLevel
        const matchesStart = !filters.startDate || item.startDate >= filters.startDate
        const matchesEnd = !filters.endDate || item.endDate <= filters.endDate

        return matchesType && matchesId && matchesName && matchesValue && matchesStart && matchesEnd
      })
    }

    const applyFilters = () => {
      filterPrizeList()
    }

    const openCreateDialog = () => {
      dialog.visible = true
      dialog.mode = 'create'
      dialog.form = createEmptyDialogForm()
    }

    const viewPrize = (item) => {
      dialog.visible = true
      dialog.mode = 'view'
      dialog.form = { ...item }
    }

    const editPrize = (item) => {
      dialog.visible = true
      dialog.mode = 'edit'
      dialog.form = { ...item }
    }

    const copyPrize = (item) => {
      const nextId = String(Math.max(...allPrizes.value.map((prize) => Number(prize.id))) + 1)
      const copiedItem = {
        ...item,
        id: nextId,
        name: `${item.name}-复制`,
        status: 'offline',
        updatedAt: '2026-06-01 10:30:00'
      }

      allPrizes.value = [copiedItem, ...allPrizes.value]
      filterPrizeList()
    }

    const toggleShelf = (id) => {
      allPrizes.value = allPrizes.value.map((item) => {
        if (item.id !== id) {
          return item
        }

        return {
          ...item,
          status: item.status === 'online' ? 'offline' : 'online',
          updatedAt: '2026-06-01 10:45:00'
        }
      })

      filterPrizeList()
    }

    const closeDialog = () => {
      dialog.visible = false
    }

    const saveDialog = () => {
      if (!dialog.form.name.trim()) {
        return
      }

      const normalizedItem = {
        ...dialog.form,
        total: dialog.form.total || '/',
        stock: dialog.form.stock || '/',
        dailyLimit: dialog.form.dailyLimit || '/',
        monthlyLimit: dialog.form.monthlyLimit || '/',
        updatedAt: '2026-06-01 11:00:00'
      }

      if (dialog.mode === 'edit') {
        allPrizes.value = allPrizes.value.map((item) => (
          item.id === normalizedItem.id ? normalizedItem : item
        ))
      } else {
        const nextId = String(Math.max(...allPrizes.value.map((item) => Number(item.id))) + 1)
        allPrizes.value = [{ ...normalizedItem, id: nextId }, ...allPrizes.value]
      }

      filterPrizeList()
      closeDialog()
    }

    return {
      activeLeaf,
      applyFilters,
      closeDialog,
      copyPrize,
      dialog,
      dialogTitle,
      displayValue,
      displayedPrizes,
      editPrize,
      expandedSections,
      expandedSubmenus,
      filters,
      menuSections,
      openCreateDialog,
      saveDialog,
      toggleSection,
      toggleShelf,
      toggleSubmenu,
      typeOptions,
      valueOptions,
      viewPrize
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.prize-page {
  min-height: 100vh;
  background: #f5f5f7;
  color: #333;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 18px 0 14px;
  background: #fff;
  border-bottom: 1px solid #ebedf0;
}

.brand-block,
.header-user,
.menu-group-title,
.menu-group-label,
.menu-submenu-title,
.action-group,
.dialog-header,
.dialog-footer {
  display: flex;
  align-items: center;
}

.brand-logo {
  position: relative;
  width: 27px;
  height: 27px;
  margin-right: 10px;
  border-radius: 8px;
  background: linear-gradient(160deg, #ffdb3b, #ff5c9b);
}

.brand-logo-core,
.user-avatar-core {
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
}

.brand-name {
  font-size: 18px;
  font-weight: 600;
  color: #ff4f8f;
}

.user-avatar {
  position: relative;
  width: 28px;
  height: 28px;
  margin-right: 8px;
  border-radius: 50%;
  background: linear-gradient(180deg, #ffd86f, #ff8daf);
}

.user-name {
  font-size: 14px;
  color: #f45d8d;
}

.user-arrow {
  margin-left: 6px;
  color: #f45d8d;
}

.page-body {
  display: flex;
  min-height: calc(100vh - 50px);
}

.sidebar {
  width: 152px;
  background: #fff;
  border-right: 1px solid #eceef2;
  padding-top: 8px;
}

.menu-group-title {
  justify-content: space-between;
  height: 38px;
  padding: 0 12px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.menu-group-title.active {
  color: #ff5a8c;
}

.menu-grid-icon {
  width: 11px;
  height: 11px;
  margin-right: 8px;
  border: 1px solid currentColor;
  background-image:
    linear-gradient(currentColor, currentColor),
    linear-gradient(currentColor, currentColor),
    linear-gradient(currentColor, currentColor),
    linear-gradient(currentColor, currentColor);
  background-repeat: no-repeat;
  background-size: 3px 3px;
  background-position: 1px 1px, 6px 1px, 1px 6px, 6px 6px;
  opacity: 0.85;
}

.menu-arrow {
  color: #8f96a3;
  font-size: 12px;
}

.menu-arrow.small {
  font-size: 11px;
}

.menu-subtree {
  padding-bottom: 4px;
}

.menu-subitem,
.menu-submenu-title,
.menu-third-item {
  font-size: 14px;
  color: #555;
}

.menu-subitem,
.menu-submenu-title {
  height: 38px;
  line-height: 38px;
  padding: 0 20px;
}

.menu-submenu-title {
  display: flex;
  justify-content: space-between;
  cursor: pointer;
}

.menu-third-list {
  background: #fff;
}

.menu-third-item {
  position: relative;
  height: 40px;
  line-height: 40px;
  padding: 0 0 0 34px;
  cursor: pointer;
}

.menu-third-item.active {
  color: #ff5a8c;
  background: #fff2f5;
}

.menu-third-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ff5a8c;
}

.content-area {
  flex: 1;
  padding: 10px 14px 14px;
}

.breadcrumb-bar {
  height: 40px;
  padding: 0 18px;
  line-height: 40px;
  font-size: 14px;
  color: #80879a;
  background: #fff;
  border: 1px solid #eceef2;
}

.content-card {
  margin-top: 14px;
  padding: 18px 16px 14px;
  background: #fff;
  border: 1px solid #eceef2;
}

.filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px 12px;
}

.field-group {
  display: flex;
  align-items: center;
}

.field-group label {
  margin-right: 6px;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
}

.field-group input,
.field-group select,
.dialog-field input,
.dialog-field select {
  height: 30px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  outline: none;
  color: #606266;
  background: #fff;
}

.field-group.short select,
.field-group.short input {
  width: 170px;
}

.field-group.medium {
  width: 230px;
}

.select-like-input {
  position: relative;
}

.select-like-input input {
  width: 170px;
  padding-right: 28px;
}

.field-caret {
  position: absolute;
  top: 7px;
  right: 10px;
  color: #9aa2af;
  pointer-events: none;
}

.field-group.date-wide {
  flex: 1;
  min-width: 300px;
}

.date-range {
  position: relative;
  display: flex;
  align-items: center;
  width: 270px;
}

.date-range input {
  width: 118px;
}

.date-separator {
  margin: 0 8px;
  color: #8f96a3;
}

.calendar-mark {
  margin-left: 8px;
  color: #8f96a3;
}

.action-group {
  margin-left: auto;
  gap: 10px;
}

.btn {
  min-width: 56px;
  height: 30px;
  padding: 0 16px;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  color: #fff;
  background: #ff5a8c;
}

.btn-default {
  color: #606266;
  background: #fff;
  border-color: #dcdfe6;
}

.table-shell {
  margin-top: 18px;
  border: 1px solid #ebeef5;
  overflow: hidden;
}

.prize-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.prize-table th,
.prize-table td {
  padding: 14px 10px;
  border-bottom: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
  font-size: 14px;
  color: #606266;
  text-align: center;
  vertical-align: middle;
}

.prize-table th:last-child,
.prize-table td:last-child {
  border-right: 0;
}

.prize-table th {
  color: #909399;
  font-weight: 500;
  background: #fafafa;
}

.name-cell {
  color: #ff5a8c;
}

.prize-name-link {
  color: #ff5a8c;
}

.tip-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  margin-left: 5px;
  border: 1px solid #aeb5c1;
  border-radius: 50%;
  font-size: 10px;
  color: #7f8794;
}

.image-thumb {
  position: relative;
  width: 78px;
  height: 78px;
  margin: 0 auto;
  overflow: hidden;
}

.art-thumb {
  background: linear-gradient(180deg, #95d0ff 0%, #bde3ff 54%, #8ec76f 54%, #4aa85f 100%);
}

.sky {
  position: absolute;
  top: 10px;
  left: 18px;
  width: 40px;
  height: 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: -12px 4px 0 0 rgba(255, 255, 255, 0.85), 8px 4px 0 0 rgba(255, 255, 255, 0.85);
}

.mountain {
  position: absolute;
  bottom: 22px;
  left: -8px;
  width: 92px;
  height: 26px;
  background: linear-gradient(90deg, #6e6acc, #9a69c3, #5f77c7);
  clip-path: polygon(0 100%, 16% 56%, 32% 80%, 50% 26%, 67% 78%, 84% 45%, 100% 100%);
}

.grass {
  position: absolute;
  bottom: 0;
  left: -8px;
  width: 94px;
  height: 32px;
  background: linear-gradient(180deg, #aee15d, #5ea646);
  clip-path: polygon(0 100%, 0 58%, 18% 68%, 32% 52%, 50% 70%, 68% 48%, 84% 61%, 100% 44%, 100% 100%);
}

.clock-thumb {
  background: #fff;
}

.clock-circle {
  position: absolute;
  left: 16px;
  top: 15px;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #ffefc2;
}

.clock-hand {
  position: absolute;
  left: 39px;
  top: 30px;
  width: 3px;
  border-radius: 2px;
  background: #fff;
  transform-origin: bottom center;
}

.clock-hand.short {
  height: 13px;
  transform: rotate(-44deg);
}

.clock-hand.long {
  height: 18px;
  transform: rotate(18deg);
}

.clock-ear {
  position: absolute;
  top: 6px;
  width: 18px;
  height: 6px;
  border-radius: 10px;
  background: #ffe6aa;
}

.clock-ear.left {
  left: 14px;
  transform: rotate(-37deg);
}

.clock-ear.right {
  right: 14px;
  transform: rotate(37deg);
}

.operation-cell {
  white-space: nowrap;
}

.text-action {
  padding: 0;
  margin: 0 8px 0 0;
  border: 0;
  background: transparent;
  color: #ff5a8c;
  cursor: pointer;
}

.text-action:last-child {
  margin-right: 0;
}

.empty-row {
  padding: 24px 0;
  color: #909399;
}

.dialog-mask {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.dialog-panel {
  width: 520px;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
}

.dialog-header {
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #ebeef5;
  font-size: 16px;
  color: #303133;
}

.dialog-close {
  border: 0;
  background: transparent;
  font-size: 20px;
  color: #909399;
  cursor: pointer;
}

.dialog-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 18px;
}

.dialog-field label {
  display: block;
  margin-bottom: 6px;
  color: #606266;
  font-size: 13px;
}

.dialog-field input,
.dialog-field select {
  width: 100%;
}

.dialog-footer {
  justify-content: flex-end;
  gap: 10px;
  padding: 0 18px 18px;
}

@media (max-width: 1280px) {
  .table-shell {
    overflow-x: auto;
  }

  .prize-table {
    min-width: 1280px;
  }
}
</style><template>
  <div class="prize-page">
    <header class="page-header">
      <div class="brand-block">
        <div class="brand-logo">
          <div class="brand-logo-core"></div>
        </div>
        <span class="brand-name">兑换系统</span>
      </div>

      <div class="header-user">
        <div class="user-avatar">
          <div class="user-avatar-core"></div>
        </div>
        <span class="user-name">张家敏</span>
        <span class="user-arrow">∨</span>
      </div>
    </header>

    <div class="page-body">
      <aside class="sidebar">
        <div v-for="section in menuSections" :key="section.title" class="menu-group">
          <div
            class="menu-group-title"
            :class="{ active: section.title === '任务中心后台' }"
            @click="toggleSection(section.title)"
          >
            <div class="menu-group-label">
              <span class="menu-grid-icon"></span>
              <span>{{ section.title }}</span>
            </div>
            <span class="menu-arrow">{{ expandedSections[section.title] ? '⌃' : '⌄' }}</span>
          </div>

          <div v-if="expandedSections[section.title]" class="menu-subtree">
            <template v-for="item in section.children" :key="item.label">
              <div
                v-if="!item.children"
                class="menu-subitem"
              >
                {{ item.label }}
              </div>

              <div v-else class="menu-submenu">
                <div class="menu-submenu-title" @click="toggleSubmenu(item.label)">
                  <span>{{ item.label }}</span>
                  <span class="menu-arrow small">{{ expandedSubmenus[item.label] ? '⌃' : '⌄' }}</span>
                </div>

                <div v-if="expandedSubmenus[item.label]" class="menu-third-list">
                  <div
                    v-for="leaf in item.children"
                    :key="leaf"
                    class="menu-third-item"
                    :class="{ active: leaf === activeLeaf }"
                    @click="activeLeaf = leaf"
                  >
                    {{ leaf }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </aside>

      <main class="content-area">
        <div class="breadcrumb-bar">任务中心后台 / 抽奖管理 / 奖品管理</div>

        <section class="content-card">
          <div class="filter-row">
            <div class="field-group short">
              <label>奖品类型:</label>
              <select v-model="filters.type">
                <option value="">请选择</option>
                <option v-for="option in typeOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>

            <div class="field-group short">
              <label>奖品ID:</label>
              <input v-model.trim="filters.id" type="text" placeholder="请输入" />
            </div>

            <div class="field-group medium">
              <label>奖品名称:</label>
              <div class="select-like-input">
                <input v-model.trim="filters.name" type="text" placeholder="请输入" />
                <span class="field-caret">⌄</span>
              </div>
            </div>

            <div class="field-group short">
              <label>奖品价值:</label>
              <select v-model="filters.valueLevel">
                <option value="">请选择</option>
                <option v-for="option in valueOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>

            <div class="field-group date-wide">
              <label>奖品有效期:</label>
              <div class="date-range">
                <input v-model="filters.startDate" type="date" />
                <span class="date-separator">→</span>
                <input v-model="filters.endDate" type="date" />
                <span class="calendar-mark">◫</span>
              </div>
            </div>

            <div class="action-group">
              <button class="btn btn-primary" @click="applyFilters">查询</button>
              <button class="btn btn-default" @click="openCreateDialog">添加</button>
            </div>
          </div>

          <div class="table-shell">
            <table class="prize-table">
              <thead>
                <tr>
                  <th>奖品ID</th>
                  <th>奖品名称</th>
                  <th>奖品类型</th>
                  <th>每份数量</th>
                  <th>奖品图片</th>
                  <th>奖品价值</th>
                  <th>奖品总数</th>
                  <th>奖品库存</th>
                  <th>日获奖上限</th>
                  <th>月获奖上限</th>
                  <th>更新时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in displayedPrizes" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td class="name-cell">
                    <span class="prize-name-link">{{ item.name }}</span>
                    <span v-if="item.tip" class="tip-badge">?</span>
                  </td>
                  <td>{{ item.type }}</td>
                  <td>{{ item.perCount }}</td>
                  <td>
                    <div v-if="item.imageKind === 'art'" class="image-thumb art-thumb">
                      <div class="sky"></div>
                      <div class="mountain"></div>
                      <div class="grass"></div>
                    </div>
                    <div v-else class="image-thumb clock-thumb">
                      <div class="clock-circle"></div>
                      <div class="clock-hand short"></div>
                      <div class="clock-hand long"></div>
                      <div class="clock-ear left"></div>
                      <div class="clock-ear right"></div>
                    </div>
                  </td>
                  <td>{{ item.valueLevel }}</td>
                  <td>{{ displayValue(item.total) }}</td>
                  <td>{{ displayValue(item.stock) }}</td>
                  <td>{{ displayValue(item.dailyLimit) }}</td>
                  <td>{{ displayValue(item.monthlyLimit) }}</td>
                  <td>
                    <div>{{ item.updatedAt.split(' ')[0] }}</div>
                    <div>{{ item.updatedAt.split(' ')[1] }}</div>
                  </td>
                  <td class="operation-cell">
                    <button class="text-action" @click="viewPrize(item)">查看</button>
                    <button class="text-action" @click="editPrize(item)">编辑</button>
                    <button
                      class="text-action"
                      @click="toggleShelf(item.id)"
                    >
                      {{ item.status === 'online' ? '下架' : '上架' }}
                    </button>
                    <button class="text-action" @click="copyPrize(item)">复制</button>
                  </td>
                </tr>
                <tr v-if="!displayedPrizes.length">
                  <td colspan="12" class="empty-row">暂无符合条件的数据</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>

    <div v-if="dialog.visible" class="dialog-mask" @click.self="closeDialog">
      <div class="dialog-panel">
        <div class="dialog-header">
          <span>{{ dialogTitle }}</span>
          <button class="dialog-close" @click="closeDialog">×</button>
        </div>

        <div class="dialog-body">
          <div class="dialog-field">
            <label>奖品名称</label>
            <input v-model.trim="dialog.form.name" :disabled="dialog.mode === 'view'" type="text" />
          </div>
          <div class="dialog-field">
            <label>奖品类型</label>
            <select v-model="dialog.form.type" :disabled="dialog.mode === 'view'">
              <option v-for="option in typeOptions" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>
          <div class="dialog-field">
            <label>奖品价值</label>
            <select v-model="dialog.form.valueLevel" :disabled="dialog.mode === 'view'">
              <option v-for="option in valueOptions" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>
          <div class="dialog-field">
            <label>每份数量</label>
            <input v-model.number="dialog.form.perCount" :disabled="dialog.mode === 'view'" type="number" min="1" />
          </div>
          <div class="dialog-field">
            <label>总数</label>
            <input v-model="dialog.form.total" :disabled="dialog.mode === 'view'" type="text" />
          </div>
          <div class="dialog-field">
            <label>库存</label>
            <input v-model="dialog.form.stock" :disabled="dialog.mode === 'view'" type="text" />
          </div>
          <div class="dialog-field">
            <label>有效期开始</label>
            <input v-model="dialog.form.startDate" :disabled="dialog.mode === 'view'" type="date" />
          </div>
          <div class="dialog-field">
            <label>有效期结束</label>
            <input v-model="dialog.form.endDate" :disabled="dialog.mode === 'view'" type="date" />
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-default" @click="closeDialog">关闭</button>
          <button v-if="dialog.mode !== 'view'" class="btn btn-primary" @click="saveDialog">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, reactive, ref } from 'vue'

const createMenuSections = () => [
  { title: '活动管理', children: [] },
  { title: '数据分析', children: [] },
  { title: '评论审核', children: [] },
  { title: '内容管理', children: [] },
  { title: '质检管理', children: [] },
  {
    title: '任务中心后台',
    children: [
      { label: '任务配置' },
      { label: '抽奖管理', children: ['奖品管理', '抽奖券管理'] },
      { label: '中奖管理', children: ['中奖管理'] },
      { label: '外部场景应用管理' }
    ]
  },
  { title: '回复管理', children: [] },
  { title: '运营工具', children: [] },
  { title: '配置管理', children: [] },
  { title: '达人认证管理', children: [] },
  { title: '创作者管理', children: [] },
  { title: '用户激励管理', children: [] },
  { title: '内容分发', children: [] }
]

const createInitialPrizes = () => [
  {
    id: '2908',
    name: '会员兑换码',
    type: '兑换码',
    perCount: 1,
    imageKind: 'art',
    valueLevel: '高价值',
    total: '',
    stock: '',
    dailyLimit: '/',
    monthlyLimit: '/',
    updatedAt: '2026-05-29 16:01:38',
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    status: 'online',
    tip: false
  },
  {
    id: '2907',
    name: '55',
    type: '实物',
    perCount: 1,
    imageKind: 'clock',
    valueLevel: '中价值',
    total: '/',
    stock: '99999999',
    dailyLimit: '/',
    monthlyLimit: '/',
    updatedAt: '2026-05-30 15:09:10',
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    status: 'online',
    tip: true
  },
  {
    id: '2906',
    name: '会员兑换码',
    type: '兑换码',
    perCount: 1,
    imageKind: 'art',
    valueLevel: '高价值',
    total: '1',
    stock: '1',
    dailyLimit: '/',
    monthlyLimit: '/',
    updatedAt: '2026-05-29 15:55:38',
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    status: 'offline',
    tip: false
  },
  {
    id: '2905',
    name: '55',
    type: '实物',
    perCount: 1,
    imageKind: 'clock',
    valueLevel: '中价值',
    total: '/',
    stock: '99999999',
    dailyLimit: '/',
    monthlyLimit: '/',
    updatedAt: '2026-05-30 15:09:10',
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    status: 'online',
    tip: false
  },
  {
    id: '2903',
    name: '55',
    type: '实物',
    perCount: 1,
    imageKind: 'clock',
    valueLevel: '中价值',
    total: '/',
    stock: '99999999',
    dailyLimit: '/',
    monthlyLimit: '/',
    updatedAt: '2026-05-30 15:09:10',
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    status: 'online',
    tip: false
  }
]

const createEmptyDialogForm = () => ({
  id: '',
  name: '',
  type: '实物',
  perCount: 1,
  imageKind: 'clock',
  valueLevel: '中价值',
  total: '/',
  stock: '/',
  dailyLimit: '/',
  monthlyLimit: '/',
  updatedAt: '2026-06-01 10:00:00',
  startDate: '2026-06-01',
  endDate: '2026-06-30',
  status: 'offline',
  tip: false
})

export default {
  name: 'PrizeManagement',
  setup() {
    const menuSections = createMenuSections()
    const typeOptions = ['兑换码', '实物', '优惠券']
    const valueOptions = ['高价值', '中价值', '低价值']

    const expandedSections = reactive({
      活动管理: false,
      数据分析: false,
      评论审核: false,
      内容管理: false,
      质检管理: false,
      任务中心后台: true,
      回复管理: false,
      运营工具: false,
      配置管理: false,
      达人认证管理: false,
      创作者管理: false,
      用户激励管理: false,
      内容分发: false
    })

    const expandedSubmenus = reactive({
      抽奖管理: true,
      中奖管理: false
    })

    const activeLeaf = ref('奖品管理')
    const filters = reactive({
      type: '',
      id: '',
      name: '',
      valueLevel: '',
      startDate: '',
      endDate: ''
    })
    const allPrizes = ref(createInitialPrizes())
    const displayedPrizes = ref(createInitialPrizes())
    const dialog = reactive({
      visible: false,
      mode: 'create',
      form: createEmptyDialogForm()
    })

    const dialogTitle = computed(() => {
      if (dialog.mode === 'view') {
        return '查看奖品'
      }
      if (dialog.mode === 'edit') {
        return '编辑奖品'
      }
      return '添加奖品'
    })

    const displayValue = (value) => value || '/'

    const toggleSection = (title) => {
      expandedSections[title] = !expandedSections[title]
    }

    const toggleSubmenu = (label) => {
      expandedSubmenus[label] = !expandedSubmenus[label]
    }

    const filterPrizeList = () => {
      displayedPrizes.value = allPrizes.value.filter((item) => {
        const matchesType = !filters.type || item.type === filters.type
        const matchesId = !filters.id || item.id.includes(filters.id)
        const matchesName = !filters.name || item.name.includes(filters.name)
        const matchesValue = !filters.valueLevel || item.valueLevel === filters.valueLevel
        const matchesStart = !filters.startDate || item.startDate >= filters.startDate
        const matchesEnd = !filters.endDate || item.endDate <= filters.endDate

        return matchesType && matchesId && matchesName && matchesValue && matchesStart && matchesEnd
      })
    }

    const applyFilters = () => {
      filterPrizeList()
    }

    const openCreateDialog = () => {
      dialog.visible = true
      dialog.mode = 'create'
      dialog.form = createEmptyDialogForm()
    }

    const viewPrize = (item) => {
      dialog.visible = true
      dialog.mode = 'view'
      dialog.form = { ...item }
    }

    const editPrize = (item) => {
      dialog.visible = true
      dialog.mode = 'edit'
      dialog.form = { ...item }
    }

    const copyPrize = (item) => {
      const nextId = String(Math.max(...allPrizes.value.map((prize) => Number(prize.id))) + 1)
      const copiedItem = {
        ...item,
        id: nextId,
        name: `${item.name}-复制`,
        status: 'offline',
        updatedAt: '2026-06-01 10:30:00'
      }

      allPrizes.value = [copiedItem, ...allPrizes.value]
      filterPrizeList()
    }

    const toggleShelf = (id) => {
      allPrizes.value = allPrizes.value.map((item) => {
        if (item.id !== id) {
          return item
        }

        return {
          ...item,
          status: item.status === 'online' ? 'offline' : 'online',
          updatedAt: '2026-06-01 10:45:00'
        }
      })

      filterPrizeList()
    }

    const closeDialog = () => {
      dialog.visible = false
    }

    const saveDialog = () => {
      if (!dialog.form.name.trim()) {
        return
      }

      const normalizedItem = {
        ...dialog.form,
        total: dialog.form.total || '/',
        stock: dialog.form.stock || '/',
        dailyLimit: dialog.form.dailyLimit || '/',
        monthlyLimit: dialog.form.monthlyLimit || '/',
        updatedAt: '2026-06-01 11:00:00'
      }

      if (dialog.mode === 'edit') {
        allPrizes.value = allPrizes.value.map((item) => (
          item.id === normalizedItem.id ? normalizedItem : item
        ))
      } else {
        const nextId = String(Math.max(...allPrizes.value.map((item) => Number(item.id))) + 1)
        allPrizes.value = [{ ...normalizedItem, id: nextId }, ...allPrizes.value]
      }

      filterPrizeList()
      closeDialog()
    }

    return {
      activeLeaf,
      applyFilters,
      closeDialog,
      copyPrize,
      dialog,
      dialogTitle,
      displayValue,
      displayedPrizes,
      editPrize,
      expandedSections,
      expandedSubmenus,
      filters,
      menuSections,
      openCreateDialog,
      saveDialog,
      toggleSection,
      toggleShelf,
      toggleSubmenu,
      typeOptions,
      valueOptions,
      viewPrize
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.prize-page {
  min-height: 100vh;
  background: #f5f5f7;
  color: #333;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 18px 0 14px;
  background: #fff;
  border-bottom: 1px solid #ebedf0;
}

.brand-block,
.header-user,
.menu-group-title,
.menu-group-label,
.menu-submenu-title,
.action-group,
.dialog-header,
.dialog-footer {
  display: flex;
  align-items: center;
}

.brand-logo {
  position: relative;
  width: 27px;
  height: 27px;
  margin-right: 10px;
  border-radius: 8px;
  background: linear-gradient(160deg, #ffdb3b, #ff5c9b);
}

.brand-logo-core,
.user-avatar-core {
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
}

.brand-name {
  font-size: 18px;
  font-weight: 600;
  color: #ff4f8f;
}

.user-avatar {
  position: relative;
  width: 28px;
  height: 28px;
  margin-right: 8px;
  border-radius: 50%;
  background: linear-gradient(180deg, #ffd86f, #ff8daf);
}

.user-name {
  font-size: 14px;
  color: #f45d8d;
}

.user-arrow {
  margin-left: 6px;
  color: #f45d8d;
}

.page-body {
  display: flex;
  min-height: calc(100vh - 50px);
}

.sidebar {
  width: 152px;
  background: #fff;
  border-right: 1px solid #eceef2;
  padding-top: 8px;
}

.menu-group-title {
  justify-content: space-between;
  height: 38px;
  padding: 0 12px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.menu-group-title.active {
  color: #ff5a8c;
}

.menu-grid-icon {
  width: 11px;
  height: 11px;
  margin-right: 8px;
  border: 1px solid currentColor;
  background-image:
    linear-gradient(currentColor, currentColor),
    linear-gradient(currentColor, currentColor),
    linear-gradient(currentColor, currentColor),
    linear-gradient(currentColor, currentColor);
  background-repeat: no-repeat;
  background-size: 3px 3px;
  background-position: 1px 1px, 6px 1px, 1px 6px, 6px 6px;
  opacity: 0.85;
}

.menu-arrow {
  color: #8f96a3;
  font-size: 12px;
}

.menu-arrow.small {
  font-size: 11px;
}

.menu-subtree {
  padding-bottom: 4px;
}

.menu-subitem,
.menu-submenu-title,
.menu-third-item {
  font-size: 14px;
  color: #555;
}

.menu-subitem,
.menu-submenu-title {
  height: 38px;
  line-height: 38px;
  padding: 0 20px;
}

.menu-submenu-title {
  display: flex;
  justify-content: space-between;
  cursor: pointer;
}

.menu-third-list {
  background: #fff;
}

.menu-third-item {
  position: relative;
  height: 40px;
  line-height: 40px;
  padding: 0 0 0 34px;
  cursor: pointer;
}

.menu-third-item.active {
  color: #ff5a8c;
  background: #fff2f5;
}

.menu-third-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ff5a8c;
}

.content-area {
  flex: 1;
  padding: 10px 14px 14px;
}

.breadcrumb-bar {
  height: 40px;
  padding: 0 18px;
  line-height: 40px;
  font-size: 14px;
  color: #80879a;
  background: #fff;
  border: 1px solid #eceef2;
}

.content-card {
  margin-top: 14px;
  padding: 18px 16px 14px;
  background: #fff;
  border: 1px solid #eceef2;
}

.filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px 12px;
}

.field-group {
  display: flex;
  align-items: center;
}

.field-group label {
  margin-right: 6px;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
}

.field-group input,
.field-group select,
.dialog-field input,
.dialog-field select {
  height: 30px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  outline: none;
  color: #606266;
  background: #fff;
}

.field-group.short select,
.field-group.short input {
  width: 170px;
}

.field-group.medium {
  width: 230px;
}

.select-like-input {
  position: relative;
}

.select-like-input input {
  width: 170px;
  padding-right: 28px;
}

.field-caret {
  position: absolute;
  top: 7px;
  right: 10px;
  color: #9aa2af;
  pointer-events: none;
}

.field-group.date-wide {
  flex: 1;
  min-width: 300px;
}

.date-range {
  position: relative;
  display: flex;
  align-items: center;
  width: 270px;
}

.date-range input {
  width: 118px;
}

.date-separator {
  margin: 0 8px;
  color: #8f96a3;
}

.calendar-mark {
  margin-left: 8px;
  color: #8f96a3;
}

.action-group {
  margin-left: auto;
  gap: 10px;
}

.btn {
  min-width: 56px;
  height: 30px;
  padding: 0 16px;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  color: #fff;
  background: #ff5a8c;
}

.btn-default {
  color: #606266;
  background: #fff;
  border-color: #dcdfe6;
}

.table-shell {
  margin-top: 18px;
  border: 1px solid #ebeef5;
  overflow: hidden;
}

.prize-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.prize-table th,
.prize-table td {
  padding: 14px 10px;
  border-bottom: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
  font-size: 14px;
  color: #606266;
  text-align: center;
  vertical-align: middle;
}

.prize-table th:last-child,
.prize-table td:last-child {
  border-right: 0;
}

.prize-table th {
  color: #909399;
  font-weight: 500;
  background: #fafafa;
}

.name-cell {
  color: #ff5a8c;
}

.prize-name-link {
  color: #ff5a8c;
}

.tip-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  margin-left: 5px;
  border: 1px solid #aeb5c1;
  border-radius: 50%;
  font-size: 10px;
  color: #7f8794;
}

.image-thumb {
  position: relative;
  width: 78px;
  height: 78px;
  margin: 0 auto;
  overflow: hidden;
}

.art-thumb {
  background: linear-gradient(180deg, #95d0ff 0%, #bde3ff 54%, #8ec76f 54%, #4aa85f 100%);
}

.sky {
  position: absolute;
  top: 10px;
  left: 18px;
  width: 40px;
  height: 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: -12px 4px 0 0 rgba(255, 255, 255, 0.85), 8px 4px 0 0 rgba(255, 255, 255, 0.85);
}

.mountain {
  position: absolute;
  bottom: 22px;
  left: -8px;
  width: 92px;
  height: 26px;
  background: linear-gradient(90deg, #6e6acc, #9a69c3, #5f77c7);
  clip-path: polygon(0 100%, 16% 56%, 32% 80%, 50% 26%, 67% 78%, 84% 45%, 100% 100%);
}

.grass {
  position: absolute;
  bottom: 0;
  left: -8px;
  width: 94px;
  height: 32px;
  background: linear-gradient(180deg, #aee15d, #5ea646);
  clip-path: polygon(0 100%, 0 58%, 18% 68%, 32% 52%, 50% 70%, 68% 48%, 84% 61%, 100% 44%, 100% 100%);
}

.clock-thumb {
  background: #fff;
}

.clock-circle {
  position: absolute;
  left: 16px;
  top: 15px;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #ffefc2;
}

.clock-hand {
  position: absolute;
  left: 39px;
  top: 30px;
  width: 3px;
  border-radius: 2px;
  background: #fff;
  transform-origin: bottom center;
}

.clock-hand.short {
  height: 13px;
  transform: rotate(-44deg);
}

.clock-hand.long {
  height: 18px;
  transform: rotate(18deg);
}

.clock-ear {
  position: absolute;
  top: 6px;
  width: 18px;
  height: 6px;
  border-radius: 10px;
  background: #ffe6aa;
}

.clock-ear.left {
  left: 14px;
  transform: rotate(-37deg);
}

.clock-ear.right {
  right: 14px;
  transform: rotate(37deg);
}

.operation-cell {
  white-space: nowrap;
}

.text-action {
  padding: 0;
  margin: 0 8px 0 0;
  border: 0;
  background: transparent;
  color: #ff5a8c;
  cursor: pointer;
}

.text-action:last-child {
  margin-right: 0;
}

.empty-row {
  padding: 24px 0;
  color: #909399;
}

.dialog-mask {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.dialog-panel {
  width: 520px;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
}

.dialog-header {
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #ebeef5;
  font-size: 16px;
  color: #303133;
}

.dialog-close {
  border: 0;
  background: transparent;
  font-size: 20px;
  color: #909399;
  cursor: pointer;
}

.dialog-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 18px;
}

.dialog-field label {
  display: block;
  margin-bottom: 6px;
  color: #606266;
  font-size: 13px;
}

.dialog-field input,
.dialog-field select {
  width: 100%;
}

.dialog-footer {
  justify-content: flex-end;
  gap: 10px;
  padding: 0 18px 18px;
}

@media (max-width: 1280px) {
  .table-shell {
    overflow-x: auto;
  }

  .prize-table {
    min-width: 1280px;
  }
}
</style>
                <option value="">全部</option>
                <option v-for="option in valueLevelOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>

            <div class="field date-field">
              <label>奖品有效期：</label>
              <div class="date-range">
                <input v-model="filters.startDate" type="date" />
                <span class="date-divider">→</span>
                <input v-model="filters.endDate" type="date" />
                <span class="calendar-mark">◫</span>
              </div>
            </div>

            <button type="button" class="btn btn-search" @click="searchPrizes">查询</button>
            <button type="button" class="btn btn-add" @click="openAddDialog">添加</button>
          </div>

          <div class="table-shell">
            <table class="prize-table">
              <thead>
                <tr>
                  <th>奖品ID</th>
                  <th>奖品名称</th>
                  <th>奖品类型</th>
                  <th>每份数量</th>
                  <th>奖品图片</th>
                  <th>奖品价值</th>
                  <th>奖品总数</th>
                  <th>奖品库存</th>
                  <th>日获奖上限</th>
                  <th>月获奖上限</th>
                  <th>更新时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in displayedPrizes" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>
                    <div class="name-cell">
                      <span class="name-link">{{ item.name }}</span>
                      <span v-if="item.tip" class="tip-badge" :title="item.tip">?</span>
                    </div>
                  </td>
                  <td>{{ item.type }}</td>
                  <td>{{ item.perCount }}</td>
                  <td>
                    <div class="image-box" :class="item.imageKind">
                      <template v-if="item.imageKind === 'scenery'">
                        <span class="scenery-cloud"></span>
                        <span class="scenery-hill"></span>
                      </template>
                      <template v-else>
                        <span class="clock-ring"></span>
                        <span class="clock-hand short"></span>
                        <span class="clock-hand long"></span>
                      </template>
                    </div>
                  </td>
                  <td>{{ item.valueLevel }}</td>
                  <td>{{ item.totalCount }}</td>
                  <td>{{ item.stock }}</td>
                  <td>{{ item.dayLimit }}</td>
                  <td>{{ item.monthLimit }}</td>
                  <td>
                    <div class="time-cell">
                      <span>{{ item.updatedAt.split(' ')[0] }}</span>
                      <span>{{ item.updatedAt.split(' ')[1] }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="actions">
                      <button type="button" class="link-btn" @click="viewPrize(item)">查看</button>
                      <button type="button" class="link-btn" @click="editPrize(item)">编辑</button>
                      <button
                        v-if="item.status === 'online'"
                        type="button"
                        class="link-btn danger"
                        @click="togglePrizeStatus(item.id)"
                      >
                        下架
                      </button>
                      <button
                        v-else
                        type="button"
                        class="link-btn success"
                        @click="togglePrizeStatus(item.id)"
                      >
                        上架
                      </button>
                      <button type="button" class="link-btn" @click="copyPrize(item)">复制</button>
                    </div>
                  </td>
                </tr>

                <tr v-if="!displayedPrizes.length">
                  <td colspan="12" class="empty-cell">没有符合条件的奖品</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>

    <div v-if="dialogVisible" class="dialog-mask" @click.self="closeDialog">
      <div class="dialog-card">
        <div class="dialog-header">
          <h3>{{ dialogMode === 'add' ? '新增奖品' : dialogMode === 'edit' ? '编辑奖品' : '查看奖品' }}</h3>
          <button type="button" class="dialog-close" @click="closeDialog">×</button>
        </div>

        <div class="dialog-body">
          <div class="dialog-grid">
            <label>
              <span>奖品名称</span>
              <input v-model.trim="form.name" :disabled="dialogMode === 'view'" type="text" placeholder="请输入奖品名称" />
            </label>
            <label>
              <span>奖品类型</span>
              <select v-model="form.type" :disabled="dialogMode === 'view'">
                <option v-for="option in typeOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </label>
            <label>
              <span>奖品价值</span>
              <select v-model="form.valueLevel" :disabled="dialogMode === 'view'">
                <option v-for="option in valueLevelOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </label>
            <label>
              <span>每份数量</span>
              <input v-model.number="form.perCount" :disabled="dialogMode === 'view'" type="number" min="1" />
            </label>
            <label>
              <span>奖品总数</span>
              <input v-model="form.totalCount" :disabled="dialogMode === 'view'" type="text" placeholder="请输入" />
            </label>
            <label>
              <span>奖品库存</span>
              <input v-model="form.stock" :disabled="dialogMode === 'view'" type="text" placeholder="请输入" />
            </label>
            <label>
              <span>日获奖上限</span>
              <input v-model="form.dayLimit" :disabled="dialogMode === 'view'" type="text" placeholder="/ 或数字" />
            </label>
            <label>
              <span>月获奖上限</span>
              <input v-model="form.monthLimit" :disabled="dialogMode === 'view'" type="text" placeholder="/ 或数字" />
            </label>
          </div>
        </div>

        <div class="dialog-footer">
          <button v-if="dialogMode !== 'view'" type="button" class="btn btn-search" @click="savePrize">保存</button>
          <button type="button" class="btn btn-secondary" @click="closeDialog">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, reactive, ref } from 'vue'

const basePrizes = [
  {
    id: 2908,
    name: '会员兑换码',
    type: '兑换码',
    perCount: 1,
    imageKind: 'scenery',
    valueLevel: '高价值',
    totalCount: '',
    stock: '',
    dayLimit: '/',
    monthLimit: '/',
    updatedAt: '2026-05-29 16:01:38',
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    status: 'online'
  },
  {
    id: 2907,
    name: '55',
    tip: '实物奖品需要关注库存与物流配置',
    type: '实物',
    perCount: 1,
    imageKind: 'clock',
    valueLevel: '中价值',
    totalCount: '/',
    stock: '999999999',
    dayLimit: '/',
    monthLimit: '/',
    updatedAt: '2026-05-30 15:09:10',
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    status: 'draft'
  },
  {
    id: 2906,
    name: '会员兑换码',
    type: '兑换码',
    perCount: 1,
    imageKind: 'scenery',
    valueLevel: '高价值',
    totalCount: '1',
    stock: '1',
    dayLimit: '/',
    monthLimit: '/',
    updatedAt: '2026-05-29 15:55:38',
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    status: 'online'
  },
  {
    id: 2905,
    name: '55',
    tip: '该奖品为实物奖品',
    type: '实物',
    perCount: 1,
    imageKind: 'clock',
    valueLevel: '中价值',
    totalCount: '/',
    stock: '999999999',
    dayLimit: '/',
    monthLimit: '/',
    updatedAt: '2026-05-30 15:09:10',
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    status: 'online'
  },
  {
    id: 2903,
    name: '55',
    tip: '当前奖品默认对所有用户开放',
    type: '实物',
    perCount: 1,
    imageKind: 'clock',
    valueLevel: '中价值',
    totalCount: '/',
    stock: '999999999',
    dayLimit: '/',
    monthLimit: '/',
    updatedAt: '2026-05-30 15:09:10',
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    status: 'online'
  }
]

const createDefaultForm = () => ({
  id: '',
  name: '',
  type: '兑换码',
  perCount: 1,
  imageKind: 'scenery',
  valueLevel: '中价值',
  totalCount: '',
  stock: '',
  dayLimit: '/',
  monthLimit: '/',
  updatedAt: '',
  startDate: '',
  endDate: '',
  status: 'draft'
})

export default {
  name: 'PrizeManagement',
  setup() {
    const menuSections = [
      { label: '活动管理' },
      { label: '数据分析' },
      { label: '评论审核' },
      { label: '内容管理' },
      { label: '质检管理' },
      {
        label: '任务中心后台',
        children: [
          { label: '任务配置' },
          { label: '抽奖管理', children: ['奖品管理', '抽奖券管理'] },
          { label: '中奖管理', children: ['中奖列表', '中奖流水'] }
        ]
      },
      { label: '外部场景应用管理' },
      { label: '回复管理' },
      { label: '运营工具' },
      { label: '配置管理' },
      { label: '达人认证管理' },
      { label: '创作者管理' },
      { label: '用户激励管理' },
      { label: '内容分发' }
    ]

    const typeOptions = ['兑换码', '实物', '优惠券', '会员卡']
    const valueLevelOptions = ['高价值', '中价值', '低价值']
    const prizes = ref(basePrizes)
    const displayedPrizes = ref(basePrizes)
    const activeThirdMenu = ref('奖品管理')
    const dialogVisible = ref(false)
    const dialogMode = ref('add')
    const filters = reactive({
      type: '',
      id: '',
      name: '',
      valueLevel: '',
      startDate: '',
      endDate: ''
    })
    const form = reactive(createDefaultForm())

    const expandedSections = reactive(
      menuSections.reduce((result, section) => {
        result[section.label] = section.label === '任务中心后台'
        return result
      }, {})
    )
    const expandedSubmenus = reactive({
      抽奖管理: true,
      中奖管理: false
    })

    const normalizedPrizes = computed(() => [...prizes.value].sort((left, right) => right.id - left.id))

    const searchPrizes = () => {
      displayedPrizes.value = normalizedPrizes.value.filter((item) => {
        const matchType = !filters.type || item.type === filters.type
        const matchId = !filters.id || String(item.id).includes(filters.id)
        const matchName = !filters.name || item.name.includes(filters.name)
        const matchValue = !filters.valueLevel || item.valueLevel === filters.valueLevel
        const matchStart = !filters.startDate || item.startDate >= filters.startDate
        const matchEnd = !filters.endDate || item.endDate <= filters.endDate
        return matchType && matchId && matchName && matchValue && matchStart && matchEnd
      })
    }

    const resetForm = () => {
      Object.assign(form, createDefaultForm())
    }

    const openAddDialog = () => {
      resetForm()
      dialogMode.value = 'add'
      dialogVisible.value = true
    }

    const viewPrize = (item) => {
      Object.assign(form, { ...item })
      dialogMode.value = 'view'
      dialogVisible.value = true
    }

    const editPrize = (item) => {
      Object.assign(form, { ...item })
      dialogMode.value = 'edit'
      dialogVisible.value = true
    }

    const closeDialog = () => {
      dialogVisible.value = false
    }

    const savePrize = () => {
      if (!form.name.trim()) {
        window.alert('请填写奖品名称')
        return
      }

      const nextRecord = {
        ...form,
        updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
        startDate: form.startDate || '2026-06-01',
        endDate: form.endDate || '2026-12-31'
      }

      if (dialogMode.value === 'edit') {
        prizes.value = prizes.value.map((item) => (item.id === nextRecord.id ? nextRecord : item))
      } else {
        nextRecord.id = Math.max(...prizes.value.map((item) => item.id)) + 1
        prizes.value = [nextRecord, ...prizes.value]
      }

      closeDialog()
      searchPrizes()
    }

    const togglePrizeStatus = (id) => {
      prizes.value = prizes.value.map((item) => {
        if (item.id !== id) {
          return item
        }

        return {
          ...item,
          status: item.status === 'online' ? 'draft' : 'online',
          updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
        }
      })
      searchPrizes()
    }

    const copyPrize = (item) => {
      const copied = {
        ...item,
        id: Math.max(...prizes.value.map((record) => record.id)) + 1,
        name: `${item.name}-复制`,
        status: 'draft',
        updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      }
      prizes.value = [copied, ...prizes.value]
      searchPrizes()
    }

    const toggleSection = (label) => {
      expandedSections[label] = !expandedSections[label]
    }

    const toggleSubmenu = (label) => {
      expandedSubmenus[label] = !expandedSubmenus[label]
    }

    searchPrizes()

    return {
      activeThirdMenu,
      dialogMode,
      dialogVisible,
      displayedPrizes,
      expandedSections,
      expandedSubmenus,
      filters,
      form,
      menuSections,
      typeOptions,
      valueLevelOptions,
      searchPrizes,
      openAddDialog,
      viewPrize,
      editPrize,
      closeDialog,
      savePrize,
      togglePrizeStatus,
      copyPrize,
      toggleSection,
      toggleSubmenu
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.prize-page {
  min-height: 100vh;
  background: #f5f6fa;
  color: #333;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 0 18px 0 14px;
  background: #fff;
  border-bottom: 1px solid #ececec;
}

.brand-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(180deg, #ffbf45 0%, #ff6a87 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  line-height: 28px;
  text-align: center;
}

.brand-title {
  color: #ff4f79;
  font-size: 18px;
  font-weight: 600;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ff7395;
  font-size: 13px;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(180deg, #ffe69a 0%, #ff8fb0 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  line-height: 28px;
  text-align: center;
}

.layout {
  display: flex;
  min-height: calc(100vh - 52px);
}

.sidebar {
  width: 152px;
  background: #fff;
  border-right: 1px solid #ececec;
  padding: 8px 0;
  overflow-y: auto;
}

.menu-item,
.submenu-trigger {
  width: 100%;
  border: 0;
  background: transparent;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
}

.menu-item.current {
  color: #ff4f79;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-square {
  width: 10px;
  height: 10px;
  border: 1px solid #666;
}

.menu-arrow {
  color: #777;
  font-size: 12px;
}

.menu-arrow.small {
  font-size: 11px;
}

.submenu {
  margin-top: 2px;
}

.submenu-item {
  padding: 10px 24px;
  color: #4c4c4c;
  font-size: 13px;
}

.submenu-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.third-menu {
  background: #fff;
}

.third-menu-item {
  padding: 10px 20px 10px 32px;
  color: #555;
  font-size: 13px;
  cursor: pointer;
}

.third-menu-item.active {
  color: #ff4f79;
  background: #fff2f5;
  border-right: 2px solid #ff6f8c;
}

.content-area {
  flex: 1;
  padding: 18px 14px;
}

.breadcrumb-card,
.content-card {
  background: #fff;
  border: 1px solid #efefef;
}

.breadcrumb-card {
  margin-bottom: 16px;
  padding: 14px 20px;
  color: #787878;
  font-size: 14px;
}

.content-card {
  padding: 18px 18px 8px;
}

.filter-row {
  display: grid;
  grid-template-columns: 190px 170px 230px 170px minmax(260px, 1fr) 68px 68px;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.field {
  display: flex;
  align-items: center;
  min-width: 0;
}

.field label {
  flex: 0 0 auto;
  color: #4a4a4a;
  font-size: 13px;
}

.field input,
.field select,
.select-like {
  width: 100%;
  height: 28px;
}

.field input,
.field select,
.select-like input {
  border: 1px solid #e3e3e3;
  background: #fff;
  color: #444;
  font-size: 12px;
  outline: none;
}

.field input,
.field select {
  padding: 0 10px;
}

.field select {
  appearance: none;
}

.select-like {
  position: relative;
}

.select-like input {
  width: 100%;
  height: 100%;
  padding: 0 28px 0 10px;
}

.select-caret {
  position: absolute;
  top: 6px;
  right: 10px;
  color: #909090;
  font-size: 12px;
}

.date-range {
  display: grid;
  grid-template-columns: 1fr 18px 1fr 18px;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.date-divider,
.calendar-mark {
  color: #999;
  font-size: 12px;
  text-align: center;
}

.btn {
  height: 28px;
  border: 0;
  border-radius: 2px;
  font-size: 12px;
  cursor: pointer;
}

.btn-search {
  background: #ff5f86;
  color: #fff;
}

.btn-add {
  background: #fff;
  border: 1px solid #e8e8e8;
  color: #333;
}

.btn-secondary {
  min-width: 72px;
  background: #fff;
  border: 1px solid #ddd;
  color: #666;
}

.table-shell {
  overflow-x: auto;
}

.prize-table {
  width: 100%;
  min-width: 1180px;
  border-collapse: collapse;
}

.prize-table th,
.prize-table td {
  border: 1px solid #f0f0f0;
  padding: 14px 10px;
  color: #4a4a4a;
  font-size: 13px;
  text-align: center;
  vertical-align: middle;
}

.prize-table th {
  background: #fafafa;
  color: #555;
  font-weight: 500;
}

.name-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.name-link,
.link-btn {
  color: #ff5f86;
}

.tip-badge {
  width: 14px;
  height: 14px;
  border: 1px solid #9c9c9c;
  border-radius: 50%;
  color: #777;
  font-size: 10px;
  line-height: 12px;
  text-align: center;
}

.image-box {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
  border-radius: 2px;
  overflow: hidden;
}

.image-box.scenery {
  background: linear-gradient(180deg, #8fd2ff 0%, #dff2ff 50%, #88c95f 51%, #58a944 100%);
}

.scenery-cloud {
  position: absolute;
  top: 14px;
  left: 16px;
  width: 46px;
  height: 22px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 18px;
  box-shadow: 10px 4px 0 0 rgba(255, 255, 255, 0.9), -10px 5px 0 0 rgba(255, 255, 255, 0.85);
}

.scenery-hill {
  position: absolute;
  left: -4px;
  right: -4px;
  bottom: 10px;
  height: 26px;
  background: linear-gradient(180deg, #7d53b2 0%, #3b7f42 100%);
  border-radius: 50% 50% 0 0;
}

.image-box.clock {
  background: #ffefc9;
}

.clock-ring {
  position: absolute;
  inset: 15px;
  border-radius: 50%;
  background: rgba(255, 214, 123, 0.45);
}

.clock-ring::before,
.clock-ring::after {
  content: '';
  position: absolute;
  top: -10px;
  width: 22px;
  height: 6px;
  border-radius: 8px;
  background: rgba(255, 214, 123, 0.65);
}

.clock-ring::before {
  left: -2px;
  transform: rotate(-35deg);
}

.clock-ring::after {
  right: -2px;
  transform: rotate(35deg);
}

.clock-hand {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: top left;
  background: #fff;
  border-radius: 999px;
}

.clock-hand.short {
  width: 3px;
  height: 16px;
  transform: translate(-50%, -85%) rotate(0deg);
}

.clock-hand.long {
  width: 3px;
  height: 20px;
  transform: translate(-50%, -68%) rotate(50deg);
}

.time-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  white-space: nowrap;
}

.link-btn {
  border: 0;
  background: transparent;
  padding: 0;
  font-size: 13px;
  cursor: pointer;
}

.link-btn.danger {
  color: #ff6a8e;
}

.link-btn.success {
  color: #31a16f;
}

.empty-cell {
  padding: 40px 0;
  color: #999;
}

.dialog-mask {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.28);
}

.dialog-card {
  width: 720px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.18);
}

.dialog-header,
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}

.dialog-header {
  border-bottom: 1px solid #f0f0f0;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.dialog-close {
  border: 0;
  background: transparent;
  color: #999;
  font-size: 24px;
  cursor: pointer;
}

.dialog-body {
  padding: 20px;
}

.dialog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 16px;
}

.dialog-grid label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #555;
  font-size: 13px;
}

.dialog-grid input,
.dialog-grid select {
  height: 36px;
  border: 1px solid #e1e1e1;
  padding: 0 12px;
  outline: none;
}

.dialog-footer {
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 1280px) {
  .filter-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    border-right: 0;
    border-bottom: 1px solid #ececec;
  }

  .filter-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dialog-card {
    width: calc(100vw - 24px);
  }

  .dialog-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 640px) {
  .topbar {
    height: auto;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
  }

  .content-area {
    padding: 12px;
  }

  .filter-row {
    grid-template-columns: minmax(0, 1fr);
  }

  .field {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .field label {
    margin-bottom: 0;
  }
}
</style><template>
  <div class="prize-management">
    <!-- 左侧菜单栏 -->
    <div class="sidebar">
      <div class="menu-section collapsible">
        <div class="menu-item active">任务中心后台 <span class="expand-icon">▼</span></div>
        <div class="submenu">
          <div class="submenu-item">任务配置</div>
          <div class="submenu-item collapsible-submenu">
            <div class="submenu-item-header" @click="toggleThirdLevel('lottery')">
              抽奖管理 <span class="expand-icon-small">▼</span>
            </div>
            <div class="third-menu" v-show="thirdMenuStates.lottery">
              <div class="third-menu-item active">奖品管理</div>
              <div class="third-menu-item">抽奖券管理</div>
            </div>
          </div>
          <div class="submenu-item collapsible-submenu">
            <div class="submenu-item-header" @click="toggleThirdLevel('prize')">
              中奖管理 <span class="expand-icon-small">▼</span>
            </div>
            <div class="third-menu" v-show="thirdMenuStates.prize">
              <div class="third-menu-item">中奖列表</div>
              <div class="third-menu-item">奖品流水</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部面包屑导航 -->
      <div class="breadcrumb">
        <span>任务中心后台 / 抽奖管理 / 奖品管理</span>
      </div>

      <!-- 搜索和操作栏 -->
      <div class="toolbar">
        <div class="search-group">
          <label>奖品类型：</label>
          <input type="text" placeholder="搜索" class="search-input">
          <label>奖品ID：</label>
          <input type="text" placeholder="搜索" class="search-input">
        </div>
        <button class="btn-add" @click="openAddDialog">添加</button>
      </div>

      <!-- 奖品表格 -->
      <div class="table-container">
        <table class="prize-table">
          <thead>
            <tr>
              <th>奖品ID</th>
              <th>奖品名称</th>
              <th>奖品类型</th>
              <th>数值</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prize in prizes" :key="prize.id">
              <td>{{ prize.id }}</td>
              <td>{{ prize.name }}</td>
              <td>{{ prize.type }}</td>
              <td>{{ prize.value }}</td>
              <td>{{ prize.updateTime }}</td>
              <td class="action-cell">
                <button class="btn-action" @click="editPrize(prize)">编辑</button>
                <button class="btn-action" @click="deletePrize(prize.id)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 奖品信息对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click.self="closeDialog">
      <div class="dialog">
        <div class="dialog-header">
          <span class="dialog-title">奖品信息：</span>
          <button class="close-btn" @click="closeDialog">×</button>
        </div>

        <div class="dialog-content">
          <!-- 奖品名称 -->
          <div class="form-group">
            <label>
              <span class="required">*</span>
              <span>奖品名称：</span>
            </label>
            <input 
              v-model="formData.name" 
              type="text" 
              placeholder="请输入" 
              class="form-input"
            >
          </div>

          <!-- 奖品备注 -->
          <div class="form-group">
            <label>
              <span>奖品备注：</span>
            </label>
            <textarea 
              v-model="formData.remark" 
              placeholder="（仅在查看模式下使用）" 
              class="form-textarea"
            ></textarea>
          </div>

          <!-- 奖品类型 -->
          <div class="form-group">
            <label>
              <span class="required">*</span>
              <span>奖品类型：</span>
            </label>
            <select v-model="formData.type" class="form-select">
              <option value="">请选择</option>
              <option value="直充卡">直充卡</option>
              <option value="礼品卡">礼品卡</option>
              <option value="兑换券">兑换券</option>
              <option value="其他">其他</option>
            </select>
          </div>

          <!-- 角标文字 -->
          <div class="form-group">
            <label>
              <span>角标文字：</span>
            </label>
            <input 
              v-model="formData.tag" 
              type="text" 
              maxlength="4"
              placeholder="最多4个字" 
              class="form-input"
            >
          </div>

          <!-- 每份数量 -->
          <div class="form-group">
            <label>
              <span class="required">*</span>
              <span>每份数量：</span>
            </label>
            <input 
              v-model.number="formData.quantity" 
              type="number" 
              placeholder="1" 
              class="form-input"
            >
          </div>

          <!-- 关键ID -->
          <div class="form-group">
            <label>
              <span class="required">*</span>
              <span>关键ID：</span>
            </label>
            <select 
              v-model="formData.keyId" 
              class="form-select"
              :class="{ 'error': !formData.keyId && submitted }"
            >
              <option value="">请选择关键ID</option>
              <option value="id1">关键ID 1</option>
              <option value="id2">关键ID 2</option>
              <option value="id3">关键ID 3</option>
            </select>
            <span v-if="!formData.keyId && submitted" class="error-text">请选择关键ID</span>
          </div>

          <!-- 奖品图片 -->
          <div class="form-group">
            <label>
              <span class="required">*</span>
              <span>奖品图片：</span>
            </label>
            <div class="image-upload">
              <div class="image-preview" v-if="formData.prizeImage">
                <img :src="formData.prizeImage" :alt="formData.name">
              </div>
              <button class="btn-upload" @click="uploadPrizeImage">
                <span class="upload-icon">+</span>
              </button>
              <div class="upload-hint">
                请上传不超过500KB的PNG/JPG/GIF格式图片
              </div>
            </div>
          </div>

          <!-- 详情图片 -->
          <div class="form-group">
            <label>
              <span>详情图片：</span>
            </label>
            <div class="image-upload">
              <div class="image-preview" v-if="formData.detailImage">
                <img :src="formData.detailImage" :alt="formData.name">
              </div>
              <button class="btn-upload" @click="uploadDetailImage">
                <span class="upload-icon">+</span>
              </button>
              <div class="upload-hint">
                请上传大小不超过500KB的PNG/JPG/GIF格式图片
              </div>
            </div>
          </div>

          <!-- 奖品数量 -->
          <div class="form-group">
            <label>
              <span class="required">*</span>
              <span>奖品数量：</span>
            </label>
            <select v-model="formData.quantityType" class="form-select">
              <option value="">请选择</option>
              <option value="无需创">无需创</option>
              <option value="限制为">限制为</option>
            </select>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-primary" @click="savePrize">保存</button>
          <button class="btn btn-secondary" @click="clearForm">清空</button>
          <button class="btn btn-default" @click="closeDialog">关闭</button>
        </div>
      </div>
    </div>

    <!-- 文件输入（隐藏） -->
    <input 
      ref="fileInput" 
      type="file" 
      style="display: none" 
      accept="image/png,image/jpeg,image/gif"
      @change="handleImageSelect"
    >
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  name: 'PrizeManagement',
  setup() {
    const showDialog = ref(false)
    const thirdMenuStates = reactive({
      lottery: true,
      prize: false
    })
    const submitted = ref(false)
    const fileInput = ref(null)
    const currentImageType = ref('')

    const formData = reactive({
      id: '',
      name: '',
      remark: '',
      type: '',
      tag: '',
      quantity: 1,
      keyId: '',
      prizeImage: '',
      detailImage: '',
      quantityType: '',
      updateTime: new Date().toLocaleString('zh-CN')
    })

    const prizes = ref([
      {
        id: '2747',
        name: '会员权限码',
        type: '权限码',
        value: '1',
        updateTime: '2026-04-22 00:58:58'
      },
      {
        id: '2616',
        name: '互联网诊券',
        type: '互联网诊券',
        value: '1',
        updateTime: '2026-03-31 17:05:10'
      },
      {
        id: '2615',
        name: '互联网诊券',
        type: '互联网诊券',
        value: '1',
        updateTime: '2026-03-31 16:37:10'
      },
      {
        id: '2614',
        name: '互联网诊券',
        type: '互联网诊券',
        value: '1',
        updateTime: '2026-03-31 16:37:10'
      }
    ])

    const openAddDialog = () => {
      clearForm()
      showDialog.value = true
      submitted.value = false
    }

    const editPrize = (prize) => {
      Object.assign(formData, prize)
      showDialog.value = true
      submitted.value = false
    }

    const closeDialog = () => {
      showDialog.value = false
      submitted.value = false
    }

    const clearForm = () => {
      formData.id = ''
      formData.name = ''
      formData.remark = ''
      formData.type = ''
      formData.tag = ''
      formData.quantity = 1
      formData.keyId = ''
      formData.prizeImage = ''
      formData.detailImage = ''
      formData.quantityType = ''
    }

    const savePrize = () => {
      submitted.value = true

      // 验证必填字段
      if (!formData.name || !formData.type || !formData.keyId || !formData.quantityType) {
        alert('请填写所有必填字段')
        return
      }

      // 添加或更新奖品
      if (formData.id) {
        const index = prizes.value.findIndex(p => p.id === formData.id)
        if (index > -1) {
          prizes.value[index] = { ...formData }
        }
      } else {
        formData.id = Date.now().toString()
        prizes.value.push({ ...formData })
      }

      alert('保存成功')
      closeDialog()
    }

    const deletePrize = (id) => {
      if (confirm('确定删除该奖品吗？')) {
        prizes.value = prizes.value.filter(p => p.id !== id)
        alert('删除成功')
      }
    }

    const uploadPrizeImage = () => {
      currentImageType.value = 'prize'
      fileInput.value?.click()
    }

    const uploadDetailImage = () => {
      currentImageType.value = 'detail'
      fileInput.value?.click()
    }

    const handleImageSelect = (event) => {
      const file = event.target.files?.[0]
      if (file) {
        // 验证文件大小
        if (file.size > 500 * 1024) {
          alert('文件大小不能超过500KB')
          return
        }

        // 读取文件
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageData = e.target?.result
          if (currentImageType.value === 'prize') {
            formData.prizeImage = imageData
          } else if (currentImageType.value === 'detail') {
            formData.detailImage = imageData
          }
        }
        reader.readAsDataURL(file)
      }

      // 重置文件输入
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    const toggleThirdLevel = (key) => {
      thirdMenuStates[key] = !thirdMenuStates[key]
    }

    return {
      showDialog,
      thirdMenuStates,
      submitted,
      fileInput,
      formData,
      prizes,
      openAddDialog,
      editPrize,
      closeDialog,
      clearForm,
      savePrize,
      deletePrize,
      uploadPrizeImage,
      uploadDetailImage,
      handleImageSelect,
      toggleThirdLevel
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.prize-management {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 侧边栏样式 */
.sidebar {
  width: 200px;
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.menu-section {
  padding: 8px 0;
}

.menu-item {
  padding: 12px 16px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background-color: #f9f9f9;
}

.menu-item.active {
  color: #ff1744;
  background-color: #fff5f7;
  border-left: 3px solid #ff1744;
  padding-left: 13px;
}

.submenu {
  background-color: #fafafa;
  padding-left: 16px;
}

.submenu-item {
  padding: 8px 16px;
  cursor: pointer;
  color: #666;
  font-size: 13px;
  transition: all 0.3s ease;
}

.submenu-item:hover {
  background-color: #f0f0f0;
}

.submenu-item.active {
  color: #ff1744;
  background-color: #fff5f7;
  border-left: 3px solid #ff1744;
  padding-left: 13px;
}

.expand-icon {
  font-size: 12px;
}

.submenu-item-header {
  padding: 8px 16px;
  cursor: pointer;
  color: #666;
  font-size: 13px;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.submenu-item-header:hover {
  background-color: #f0f0f0;
}

.expand-icon-small {
  font-size: 12px;
  margin-left: 8px;
}

.collapsible-submenu {
  padding: 0;
}

.third-menu {
  background-color: #f5f5f5;
  padding-left: 32px;
}

.third-menu-item {
  padding: 8px 16px;
  cursor: pointer;
  color: #666;
  font-size: 12px;
  transition: all 0.3s ease;
}

.third-menu-item:hover {
  background-color: #ececec;
}

.third-menu-item.active {
  color: #ff1744;
  background-color: #fff5f7;
  border-left: 3px solid #ff1744;
  padding-left: 13px;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.breadcrumb {
  padding: 16px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  font-size: 13px;
  color: #999;
}

.toolbar {
  padding: 16px 20px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-group {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-group label {
  font-size: 13px;
  color: #666;
}

.search-input {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 13px;
  width: 150px;
}

.btn-add {
  padding: 8px 16px;
  background-color: #ff1744;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.3s ease;
}

.btn-add:hover {
  background-color: #e8143f;
}

.table-container {
  flex: 1;
  overflow-y: auto;
  background-color: #fff;
  margin: 0 20px 20px;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.prize-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.prize-table thead {
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
}

.prize-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
}

.prize-table td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
}

.prize-table tbody tr:hover {
  background-color: #fafafa;
}

.action-cell {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 4px 12px;
  background-color: transparent;
  color: #ff1744;
  border: 1px solid #ff1744;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.btn-action:hover {
  background-color: #ff1744;
  color: white;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background-color: #fff;
  border-radius: 3px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-title {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #333;
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 13px;
  color: #333;
}

.required {
  color: #ff1744;
  margin-right: 4px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #ff1744;
}

.form-input.error,
.form-select.error {
  border-color: #ff1744;
  background-color: #fff5f7;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.error-text {
  color: #ff1744;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.image-upload {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.image-preview {
  width: 80px;
  height: 80px;
  border: 1px solid #ddd;
  border-radius: 3px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-upload {
  width: 80px;
  height: 80px;
  border: 1px solid #ddd;
  border-radius: 3px;
  background-color: #f9f9f9;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.btn-upload:hover {
  border-color: #ff1744;
  background-color: #fff5f7;
}

.upload-icon {
  font-size: 32px;
  color: #ddd;
  transition: color 0.3s ease;
}

.btn-upload:hover .upload-icon {
  color: #ff1744;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  line-height: 1.5;
}

.dialog-footer {
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 8px 20px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #ff1744;
  color: white;
  border-color: #ff1744;
}

.btn-primary:hover {
  background-color: #e8143f;
  border-color: #e8143f;
}

.btn-secondary {
  background-color: #fff;
  color: #333;
  border-color: #ddd;
}

.btn-secondary:hover {
  background-color: #f9f9f9;
}

.btn-default {
  background-color: #fff;
  color: #666;
  border-color: #ddd;
}

.btn-default:hover {
  background-color: #f9f9f9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .prize-management {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }

  .dialog {
    width: 95%;
  }
}
</style>
