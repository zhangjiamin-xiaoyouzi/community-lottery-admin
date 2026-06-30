<template>
  <div class="prize-page">
    <header class="page-header">
      <div class="brand-block">
        <div class="brand-logo">
          <div class="brand-logo-core"></div>
        </div>
        <span class="brand-name">社区运营管理系统</span>
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
                    @click="selectLeaf(item.label, leaf)"
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
        <div class="breadcrumb-bar">{{ breadcrumbText }}</div>

        <section v-if="activeLeaf === '奖品管理'" class="content-card">
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

        <section v-else-if="activeLeaf === '中奖列表'" class="content-card winning-card">
          <div class="winning-filter-row first">
            <div class="winning-field short">
              <label>用户UID:</label>
              <input v-model.trim="winningFilters.uid" type="text" placeholder="请输入" />
            </div>
            <div class="winning-field short">
              <label>中奖序列:</label>
              <input v-model.trim="winningFilters.serial" type="text" placeholder="请输入" />
            </div>
            <div class="winning-field short">
              <label>奖品ID:</label>
              <input v-model.trim="winningFilters.prizeId" type="text" placeholder="请输入" />
            </div>
            <div class="winning-field name">
              <label>奖品名称:</label>
              <div class="select-like-input winning-name-input">
                <input v-model.trim="winningFilters.prizeName" type="text" placeholder="请输入" />
                <span class="field-caret">⌄</span>
              </div>
            </div>
            <div class="winning-field short">
              <label>奖品发放状态:</label>
              <input v-model.trim="winningFilters.issueStatus" type="text" />
            </div>
          </div>

          <div class="winning-filter-row second">
            <div class="winning-field medium-wide">
              <label>快递单号:</label>
              <input v-model.trim="winningFilters.trackingNumber" type="text" />
            </div>
            <div class="winning-field short status-field">
              <label>地址状态:</label>
              <select v-model="winningFilters.addressStatus">
                <option value=""></option>
                <option value="已填写">已填写</option>
                <option value="未填写">未填写</option>
              </select>
            </div>
            <div class="winning-field date-long">
              <label>获奖时间:</label>
              <div class="date-range winning-date-range">
                <input v-model="winningFilters.startDate" type="date" />
                <span class="date-separator">→</span>
                <input v-model="winningFilters.endDate" type="date" />
              </div>
            </div>
            <div class="winning-field short prize-type-field">
              <label>奖品类型:</label>
              <select v-model="winningFilters.prizeType">
                <option value=""></option>
                <option v-for="option in winningPrizeTypeOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
            <div class="winning-actions">
              <button class="btn btn-primary" @click="applyWinningFilters">查询</button>
              <button class="btn btn-default" @click="noopAction">导出</button>
              <button class="btn btn-default" @click="noopAction">导入</button>
              <button class="btn btn-default" @click="noopAction">下载模板</button>
              <span class="winning-import-tip">*请按照模板填写中奖序列和快递单号/公司进行导入</span>
            </div>
          </div>

          <div class="table-shell winning-table-shell">
            <table class="prize-table winning-table">
              <thead>
                <tr>
                  <th>中奖序列</th>
                  <th>用户信息</th>
                  <th>奖品信息</th>
                  <th>奖品图片</th>
                  <th>奖品发放状态</th>
                  <th>收件信息</th>
                  <th>快递公司/快递单号</th>
                  <th>备注</th>
                  <th>获奖时间/过期时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in displayedWinningRows" :key="item.serial">
                  <td>{{ item.serial }}</td>
                  <td class="winning-user-cell">
                    <div>UID： {{ item.uid }}</div>
                    <div>昵称： {{ item.nickname }}</div>
                  </td>
                  <td class="winning-prize-cell">
                    <div>奖品ID： {{ item.prizeId }}</div>
                    <div class="winning-red">奖品名称： {{ item.prizeName }}</div>
                    <div>奖品类型： {{ item.prizeType }}</div>
                  </td>
                  <td>
                    <div class="winning-thumb" :class="item.thumbClass">
                      <div v-if="item.thumbClass === 'flower'" class="flower-core"></div>
                      <div v-else class="doc-card">
                        <div class="doc-line"></div>
                        <div class="doc-line short"></div>
                      </div>
                    </div>
                  </td>
                  <td>{{ item.issueStatus }}</td>
                  <td>{{ item.receiverInfo || '/' }}</td>
                  <td>{{ item.logistics || '' }}</td>
                  <td>{{ item.remark || '' }}</td>
                  <td class="winning-time-cell">
                    <div>{{ item.winTime }}</div>
                    <div>{{ item.expireTime }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-else class="content-card placeholder-card">
          <div class="placeholder-text">{{ activeLeaf }} 页面待补充</div>
        </section>
      </main>
    </div>

    <div v-if="dialog.visible" class="dialog-mask" @click.self="closeDialog">
      <div class="dialog-panel large">
        <div class="dialog-header large">
          <span class="dialog-section-title">奖品信息:</span>
          <button class="dialog-close" @click="closeDialog">×</button>
        </div>

        <div class="dialog-body large">
          <div class="dialog-form">
            <div class="form-row required">
              <label>奖品名称:</label>
              <div class="field-column stretch">
                <input v-model.trim="dialog.form.name" :disabled="dialog.mode === 'view'" type="text" placeholder="请输入" />
              </div>
            </div>

            <div class="form-row">
              <label>奖品备注:</label>
              <div class="field-column stretch">
                <input v-model.trim="dialog.form.remark" :disabled="dialog.mode === 'view'" type="text" />
                <span class="field-tip">(仅后台展示使用)</span>
              </div>
            </div>

            <div class="form-row required compact-row">
              <label>奖品类型:</label>
              <div class="field-column compact">
                <select v-model="dialog.form.type" :disabled="dialog.mode === 'view'">
                  <option value=""></option>
                  <option v-for="option in typeOptions" :key="option" :value="option">{{ option }}</option>
                </select>
              </div>
            </div>

            <div v-if="shouldShowPrizeCode(dialog.form.type)" class="form-row required compact-row">
              <label>关联星火商品:</label>
              <div class="field-column xinghuo-search-outer">
                <div class="xinghuo-search">
                  <input
                    v-model.trim="xinghuoSearchKeyword"
                    :disabled="dialog.mode === 'view'"
                    type="text"
                    placeholder="输入关键词检索星火商品"
                    @input="searchXinghuoProduct"
                    @focus="openXinghuoDropdown"
                    @blur="scheduleCloseDropdown"
                  />
                  <span class="field-caret">⌄</span>
                </div>
                <div v-if="xinghuoDropdownVisible && filteredXinghuoProducts.length" class="xinghuo-dropdown">
                  <div
                    v-for="product in filteredXinghuoProducts"
                    :key="product.code"
                    class="xinghuo-dropdown-item"
                    @mousedown.prevent="selectXinghuoProduct(product)"
                  >
                    {{ product.code }}-{{ product.name }}
                  </div>
                </div>
                <div v-if="dialog.form.selectedXinghuoProduct" class="xinghuo-selected">
                  <div class="xinghuo-stock-price">
                    面额（元）：{{ dialog.form.selectedXinghuoProduct.price ?? '/' }}　　最低折扣限制：{{ formatXinghuoDiscountLimit(dialog.form.selectedXinghuoProduct) }}
                  </div>
                </div>
              </div>
            </div>

            <div v-if="shouldShowTrafficCoupon(dialog.form.type)" class="form-row required compact-row">
              <label>关联流量券:</label>
              <div class="field-column xinghuo-search-outer">
                <div class="xinghuo-search">
                  <input
                    v-model.trim="trafficCouponSearchKeyword"
                    :disabled="dialog.mode === 'view'"
                    type="text"
                    placeholder="输入关键词检索流量券"
                    @input="searchTrafficCoupon"
                    @focus="openTrafficCouponDropdown"
                    @blur="scheduleCloseTrafficCouponDropdown"
                  />
                  <span class="field-caret">⌄</span>
                </div>
                <div v-if="trafficCouponDropdownVisible && filteredTrafficCoupons.length" class="xinghuo-dropdown">
                  <div
                    v-for="coupon in filteredTrafficCoupons"
                    :key="coupon.id"
                    class="xinghuo-dropdown-item"
                    @mousedown.prevent="selectTrafficCoupon(coupon)"
                  >
                    {{ coupon.id }}-{{ coupon.name }}
                  </div>
                </div>
              </div>
            </div>

            <div class="form-row compact-row">
              <label>角标文案:</label>
              <div class="field-column compact">
                <input v-model.trim="dialog.form.cornerText" :disabled="dialog.mode === 'view'" type="text" placeholder="最多4个字" />
              </div>
            </div>

            <div class="form-row required compact-row">
              <label>每份数量:</label>
              <div class="field-column compact">
                <input v-model.number="dialog.form.perCount" :disabled="dialog.mode === 'view'" type="number" min="1" />
              </div>
            </div>

            <div class="form-row required upload-row">
              <label>奖品图片:</label>
              <div class="upload-group">
                <div class="upload-box">+</div>
                <div class="upload-note">请上传比例为 1:1，大小不超过 500KB 的 PNG/JPG/GIF 格式图片</div>
              </div>
            </div>

            <div class="form-row upload-row">
              <label>中奖弹窗图片:</label>
              <div class="upload-group">
                <div class="upload-box">+</div>
                <div class="upload-note">请上传大小不超过 500KB 的 PNG/JPG/GIF 格式图片</div>
              </div>
            </div>

            <div class="form-row upload-row">
              <label>详情图片 <span class="hint-mark">?</span>:</label>
              <div class="upload-group">
                <div class="upload-box">+</div>
                <div class="upload-note">请上传大小不超过 500KB 的 PNG/JPG/GIF 格式图片</div>
              </div>
            </div>

            <div class="form-row required total-row">
              <label>奖品总数:</label>
              <div class="field-column stretch">
                <label class="radio-line">
                  <input v-model="dialog.form.totalMode" :disabled="dialog.mode === 'view'" type="radio" value="unlimited" />
                  <span>无限制</span>
                </label>
                <div class="radio-line inline-control">
                  <label class="radio-line">
                    <input v-model="dialog.form.totalMode" :disabled="dialog.mode === 'view'" type="radio" value="limited" />
                    <span>限制为</span>
                  </label>
                  <input v-model="dialog.form.totalLimit" :disabled="dialog.mode === 'view' || dialog.form.totalMode !== 'limited'" class="short-input" type="number" min="0" />
                </div>
                <label class="checkbox-line stock-warning-line">
                  <input v-model="dialog.form.enableStockWarning" :disabled="dialog.mode === 'view'" type="checkbox" />
                  <span>启动库存预警</span>
                </label>
              </div>
            </div>

            <div class="form-row required compact-row value-row">
              <label>奖品价值:</label>
              <div class="field-column compact value-input-wrap">
                <div class="amount-input-wrap">
                  <input v-model="dialog.form.amount" :disabled="dialog.mode === 'view'" type="number" min="0" placeholder="请输入" />
                  <span class="unit-suffix">元</span>
                </div>
              </div>
            </div>

            <div class="form-row offset-row">
              <label></label>
              <div class="field-column stretch radio-group-row">
                <label v-for="option in valueOptions" :key="option" class="radio-line simple-radio">
                  <input v-model="dialog.form.valueLevel" :disabled="dialog.mode === 'view'" type="radio" :value="option" />
                  <span>{{ option }}</span>
                </label>
                <label class="radio-line simple-radio">
                  <input v-model="dialog.form.valueLevel" :disabled="dialog.mode === 'view'" type="radio" value="无价值" />
                  <span>无价值</span>
                </label>
              </div>
            </div>

            <div class="form-row required date-row">
              <label>奖品有效期:</label>
              <div class="field-column stretch">
                <div class="date-range large">
                  <input v-model="dialog.form.startDate" :disabled="dialog.mode === 'view'" type="date" />
                  <span class="date-separator">→</span>
                  <input v-model="dialog.form.endDate" :disabled="dialog.mode === 'view'" type="date" />
                  <span class="calendar-mark">◫</span>
                </div>
              </div>
            </div>

            <div class="section-split">抽奖策略:</div>

            <div class="form-row strategy-row">
              <label>发放限制:</label>
              <div class="field-column stretch strategy-list">
                <label v-for="limit in strategyLimits" :key="limit.key" class="checkbox-line limit-line">
                  <input v-model="dialog.form.issueLimits[limit.key].enabled" :disabled="dialog.mode === 'view'" type="checkbox" />
                  <span>{{ limit.label }}: {{ limit.sentence }}</span>
                  <input v-model="dialog.form.issueLimits[limit.key].value" :disabled="dialog.mode === 'view' || !dialog.form.issueLimits[limit.key].enabled" class="mini-input" type="number" min="0" />
                  <span>件时，该奖品中奖概率归 0</span>
                </label>
              </div>
            </div>

            <div class="form-row strategy-row same-user-row">
              <label>同一用户获得相同奖品次数限制:</label>
              <div class="field-column stretch same-user-line">
                <span>每</span>
                <button class="step-btn" :disabled="dialog.mode === 'view'" @click="adjustSameUser('everyValue', -1)">−</button>
                <input v-model="dialog.form.sameUser.everyValue" :disabled="dialog.mode === 'view'" class="small-step-input" type="number" min="0" />
                <button class="step-btn" :disabled="dialog.mode === 'view'" @click="adjustSameUser('everyValue', 1)">+</button>
                <select v-model="dialog.form.sameUser.everyUnit" :disabled="dialog.mode === 'view'" class="unit-select">
                  <option value="天">天</option>
                  <option value="周">周</option>
                  <option value="月">月</option>
                </select>
                <span>可获得</span>
                <button class="step-btn" :disabled="dialog.mode === 'view'" @click="adjustSameUser('gainValue', -1)">−</button>
                <input v-model="dialog.form.sameUser.gainValue" :disabled="dialog.mode === 'view'" class="small-step-input" type="number" min="0" />
                <button class="step-btn" :disabled="dialog.mode === 'view'" @click="adjustSameUser('gainValue', 1)">+</button>
                <span>次</span>
              </div>
            </div>
          </div>
        </div>

        <div class="dialog-footer large">
          <button class="btn btn-default footer-btn" @click="closeDialog">取消</button>
          <button v-if="dialog.mode !== 'view'" class="btn btn-primary footer-btn" @click="saveDialog">确定</button>
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
      { label: '中奖管理', children: ['中奖列表', '奖品流水', '用户抽奖行为'] },
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

const createXinghuoProducts = () => [
  { code: 'DG202604171541350362', name: '5元星火数品卡券', denomination: '5元', stock: 9999, price: '5.00', minDiscountLimit: '' },
  { code: 'DG202604291750400378', name: '1点星火数品直充', denomination: '1点', stock: 5000, price: '1.00', minDiscountLimit: '' },
  { code: 'DG20260501001', name: '10元星火数品卡券', denomination: '10元', stock: 3000, price: '10.00', minDiscountLimit: '0.97' },
  { code: 'DG20260501002', name: '20元星火数品卡券', denomination: '20元', stock: 2000, price: '20.00', minDiscountLimit: '0.95' },
  { code: 'DG20260501003', name: '50元星火数品直充', denomination: '50元', stock: 800, price: '50.00', minDiscountLimit: '' },
  { code: 'DG20260501004', name: '100元星火数品卡券', denomination: '100元', stock: 500, price: '100.00', minDiscountLimit: '0.97' },
  { code: 'DG20260501005', name: '2点星火数品直充', denomination: '2点', stock: 1500, price: '2.00', minDiscountLimit: '' },
  { code: 'DG20260501006', name: '30元星火数品卡券', denomination: '30元', stock: 1200, price: '30.00', minDiscountLimit: '0.98' }
]

const createTrafficCoupons = () => [
  { id: 'TC20260601001', name: '爱奇艺日包定向流量券' },
  { id: 'TC20260601002', name: '优酷VIP专属流量券' },
  { id: 'TC20260601003', name: '腾讯视频定向流量券' },
  { id: 'TC20260601004', name: '芒果TV定向流量券' },
  { id: 'TC20260601005', name: '抖音极速版定向流量券' },
  { id: 'TC20260601006', name: '快手定向流量券' }
]

const createEmptyDialogForm = () => ({
  id: '',
  name: '',
  remark: '',
  type: '',
  prizeCode: '',
  selectedXinghuoProduct: null,
  selectedTrafficCoupon: null,
  cornerText: '',
  perCount: 1,
  imageKind: 'clock',
  valueLevel: '',
  amount: '',
  totalMode: 'unlimited',
  totalLimit: '',
  enableStockWarning: false,
  total: '/',
  stock: '/',
  dailyLimit: '/',
  monthlyLimit: '/',
  updatedAt: '2026-06-01 10:00:00',
  startDate: '',
  endDate: '',
  status: 'offline',
  tip: false,
  issueLimits: {
    category: { enabled: false, value: '' },
    time: { enabled: false, value: '' },
    day: { enabled: false, value: '' },
    week: { enabled: false, value: '' },
    month: { enabled: false, value: '' }
  },
  sameUser: {
    everyValue: 1,
    everyUnit: '天',
    gainValue: 1
  }
})

const createWinningRows = () => [
  {
    serial: '92674',
    uid: '220683818',
    nickname: '小仙女姐姐',
    prizeId: '1177',
    prizeName: '挂件',
    prizeType: '挂件',
    thumbClass: 'flower',
    issueStatus: '已发放',
    receiverInfo: '/',
    logistics: '',
    remark: '',
    winTime: '2026-06-01 11:54:47',
    expireTime: '2026-07-01 00:00:00'
  },
  {
    serial: '92673',
    uid: '220683818',
    nickname: '小仙女姐姐',
    prizeId: '1177',
    prizeName: '挂件',
    prizeType: '挂件',
    thumbClass: 'flower',
    issueStatus: '已发放',
    receiverInfo: '/',
    logistics: '',
    remark: '',
    winTime: '2026-06-01 11:53:45',
    expireTime: '2026-07-01 00:00:00'
  },
  {
    serial: '92672',
    uid: '220683818',
    nickname: '小仙女姐姐',
    prizeId: '1177',
    prizeName: '挂件',
    prizeType: '挂件',
    thumbClass: 'flower',
    issueStatus: '已发放',
    receiverInfo: '/',
    logistics: '',
    remark: '',
    winTime: '2026-06-01 11:53:39',
    expireTime: '2026-07-01 00:00:00'
  },
  {
    serial: '92671',
    uid: '220683818',
    nickname: '小仙女姐姐',
    prizeId: '1177',
    prizeName: '挂件',
    prizeType: '挂件',
    thumbClass: 'flower',
    issueStatus: '已发放',
    receiverInfo: '/',
    logistics: '',
    remark: '',
    winTime: '2026-06-01 11:49:42',
    expireTime: '2026-07-01 00:00:00'
  },
  {
    serial: '92670',
    uid: '220665944',
    nickname: '小枣鸡',
    prizeId: '1229',
    prizeName: '抽奖发放失败-卡券-自动化勿动',
    prizeType: '礼品卡',
    thumbClass: 'card',
    issueStatus: '已发放',
    receiverInfo: '/',
    logistics: '',
    remark: '',
    winTime: '2026-06-01 10:56:31',
    expireTime: '2026-09-10 00:00:00'
  }
]

export default {
  name: 'PrizeExchangeDetails',
  setup() {
    const menuSections = createMenuSections()
    const typeOptions = ['兑换码', '实物', '优惠券', '星火数品直充', '星火数品卡券', '流量券']
    const winningPrizeTypeOptions = ['挂件', '礼品卡', '星火数品卡券', '星火数品直充']
    const valueOptions = ['高价值', '中价值', '低价值']
    const strategyLimits = [
      { key: 'category', label: '分类奖上限', sentence: '当分类已发放奖品数量达到' },
      { key: 'time', label: '时获奖上限', sentence: '当时已发放奖品数量达到' },
      { key: 'day', label: '日获奖上限', sentence: '当日已发放奖品数量达到' },
      { key: 'week', label: '周获奖上限', sentence: '当周已发放奖品数量达到' },
      { key: 'month', label: '月获奖上限', sentence: '当月已发放奖品数量达到' }
    ]

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

    const activeSubmenu = ref('抽奖管理')
    const activeLeaf = ref('奖品管理')
    const filters = reactive({
      type: '',
      id: '',
      name: '',
      valueLevel: '',
      startDate: '',
      endDate: ''
    })
    const winningFilters = reactive({
      uid: '',
      serial: '',
      prizeId: '',
      prizeName: '',
      issueStatus: '',
      trackingNumber: '',
      addressStatus: '',
      startDate: '',
      endDate: '',
      prizeType: ''
    })
    const allPrizes = ref(createInitialPrizes())
    const displayedPrizes = ref(createInitialPrizes())
    const allWinningRows = ref(createWinningRows())
    const displayedWinningRows = ref(createWinningRows())
    const dialog = reactive({
      visible: false,
      mode: 'create',
      form: createEmptyDialogForm()
    })

    const xinghuoProducts = createXinghuoProducts()
    const xinghuoSearchKeyword = ref('')
    const xinghuoDropdownVisible = ref(false)
    const filteredXinghuoProducts = ref([...xinghuoProducts])
    let closeDropdownTimer = null

    const trafficCoupons = createTrafficCoupons()
    const trafficCouponSearchKeyword = ref('')
    const trafficCouponDropdownVisible = ref(false)
    const filteredTrafficCoupons = ref([...trafficCoupons])
    let trafficCouponCloseTimer = null

    const searchXinghuoProduct = () => {
      const keyword = xinghuoSearchKeyword.value.toLowerCase()
      filteredXinghuoProducts.value = xinghuoProducts.filter(
        (p) =>
          p.code.toLowerCase().includes(keyword) ||
          p.name.toLowerCase().includes(keyword) ||
          p.denomination.toLowerCase().includes(keyword)
      )
      xinghuoDropdownVisible.value = true
    }

    const openXinghuoDropdown = () => {
      clearTimeout(closeDropdownTimer)
      // 如果已选中商品，点击输入框时清空关键词方便重新搜索
      if (dialog.form.selectedXinghuoProduct) {
        xinghuoSearchKeyword.value = ''
      }
      searchXinghuoProduct()
      xinghuoDropdownVisible.value = true
    }

    const scheduleCloseDropdown = () => {
      closeDropdownTimer = setTimeout(() => {
        xinghuoDropdownVisible.value = false
        // 如果下拉关闭时关键词为空，清除已选商品
        if (!xinghuoSearchKeyword.value && dialog.form.selectedXinghuoProduct) {
          dialog.form.selectedXinghuoProduct = null
          dialog.form.prizeCode = ''
        }
      }, 200)
    }

    const searchTrafficCoupon = () => {
      const keyword = trafficCouponSearchKeyword.value.toLowerCase()
      filteredTrafficCoupons.value = trafficCoupons.filter(
        (t) =>
          t.id.toLowerCase().includes(keyword) ||
          t.name.toLowerCase().includes(keyword)
      )
      trafficCouponDropdownVisible.value = true
    }

    const openTrafficCouponDropdown = () => {
      clearTimeout(trafficCouponCloseTimer)
      if (dialog.form.selectedTrafficCoupon) {
        trafficCouponSearchKeyword.value = ''
      }
      searchTrafficCoupon()
      trafficCouponDropdownVisible.value = true
    }

    const scheduleCloseTrafficCouponDropdown = () => {
      trafficCouponCloseTimer = setTimeout(() => {
        trafficCouponDropdownVisible.value = false
        if (!trafficCouponSearchKeyword.value && dialog.form.selectedTrafficCoupon) {
          dialog.form.selectedTrafficCoupon = null
        }
      }, 200)
    }

    const selectTrafficCoupon = (coupon) => {
      dialog.form.selectedTrafficCoupon = coupon
      trafficCouponSearchKeyword.value = `${coupon.id}-${coupon.name}`
      trafficCouponDropdownVisible.value = false
      filteredTrafficCoupons.value = [...trafficCoupons]
    }

    const selectXinghuoProduct = (product) => {
      dialog.form.selectedXinghuoProduct = product
      dialog.form.prizeCode = `${product.code}-${product.name}-${product.denomination}`
      xinghuoSearchKeyword.value = `${product.code}-${product.name}`
      xinghuoDropdownVisible.value = false
      filteredXinghuoProducts.value = [...xinghuoProducts]
    }

    const breadcrumbText = computed(() => `任务中心后台 / ${activeSubmenu.value} / ${activeLeaf.value}`)

    const formatXinghuoDiscountLimit = (product) => product?.minDiscountLimit || '无限制'

    const getXinghuoMinAllowedAmount = (product) => {
      if (!product?.minDiscountLimit || !product?.price) {
        return null
      }

      const price = Number(product.price)
      const minDiscountLimit = Number(product.minDiscountLimit)

      if (Number.isNaN(price) || Number.isNaN(minDiscountLimit)) {
        return null
      }

      return Number((price * minDiscountLimit).toFixed(2))
    }

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

    const selectLeaf = (submenuLabel, leaf) => {
      activeSubmenu.value = submenuLabel
      activeLeaf.value = leaf
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

    const applyWinningFilters = () => {
      displayedWinningRows.value = allWinningRows.value.filter((item) => {
        const matchesUid = !winningFilters.uid || item.uid.includes(winningFilters.uid)
        const matchesSerial = !winningFilters.serial || item.serial.includes(winningFilters.serial)
        const matchesPrizeId = !winningFilters.prizeId || item.prizeId.includes(winningFilters.prizeId)
        const matchesPrizeName = !winningFilters.prizeName || item.prizeName.includes(winningFilters.prizeName)
        const matchesIssueStatus = !winningFilters.issueStatus || item.issueStatus.includes(winningFilters.issueStatus)
        const matchesPrizeType = !winningFilters.prizeType || item.prizeType === winningFilters.prizeType
        const matchesStart = !winningFilters.startDate || item.winTime.split(' ')[0] >= winningFilters.startDate
        const matchesEnd = !winningFilters.endDate || item.winTime.split(' ')[0] <= winningFilters.endDate

        return matchesUid && matchesSerial && matchesPrizeId && matchesPrizeName && matchesIssueStatus && matchesPrizeType && matchesStart && matchesEnd
      })
    }

    const noopAction = () => {}

    const openCreateDialog = () => {
      dialog.visible = true
      dialog.mode = 'create'
      dialog.form = createEmptyDialogForm()
      xinghuoSearchKeyword.value = ''
      xinghuoDropdownVisible.value = false
      filteredXinghuoProducts.value = [...xinghuoProducts]
      trafficCouponSearchKeyword.value = ''
      trafficCouponDropdownVisible.value = false
      filteredTrafficCoupons.value = [...trafficCoupons]
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

    const shouldShowPrizeCode = (type) => ['星火数品直充', '星火数品卡券'].includes(type)

    const shouldShowTrafficCoupon = (type) => type === '流量券'

    const adjustSameUser = (field, delta) => {
      const nextValue = Number(dialog.form.sameUser[field] || 0) + delta
      dialog.form.sameUser[field] = nextValue < 0 ? 0 : nextValue
    }

    const saveDialog = () => {
      if (!dialog.form.name.trim()) {
        return
      }

      if (shouldShowPrizeCode(dialog.form.type) && !dialog.form.selectedXinghuoProduct) {
        return
      }

      if (shouldShowTrafficCoupon(dialog.form.type) && !dialog.form.selectedTrafficCoupon) {
        return
      }

      if (shouldShowPrizeCode(dialog.form.type)) {
        const minAllowedAmount = getXinghuoMinAllowedAmount(dialog.form.selectedXinghuoProduct)
        const inputAmount = Number(dialog.form.amount)

        if (minAllowedAmount !== null && !Number.isNaN(inputAmount) && inputAmount < minAllowedAmount) {
          window.alert(`奖品价值不能低于最低折扣价“${minAllowedAmount.toFixed(2)}”`)
          return
        }
      }

      const normalizedItem = {
        ...dialog.form,
        total: dialog.form.totalMode === 'limited' && dialog.form.totalLimit !== ''
          ? String(dialog.form.totalLimit)
          : '/',
        stock: dialog.form.stock || '/',
        dailyLimit: dialog.form.issueLimits.day.enabled && dialog.form.issueLimits.day.value !== ''
          ? String(dialog.form.issueLimits.day.value)
          : '/',
        monthlyLimit: dialog.form.issueLimits.month.enabled && dialog.form.issueLimits.month.value !== ''
          ? String(dialog.form.issueLimits.month.value)
          : '/',
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
      activeSubmenu,
      applyWinningFilters,
      applyFilters,
      breadcrumbText,
      closeDialog,
      copyPrize,
      dialog,
      dialogTitle,
      displayValue,
      displayedPrizes,
      displayedWinningRows,
      editPrize,
      adjustSameUser,
      expandedSections,
      expandedSubmenus,
      filters,
      menuSections,
      noopAction,
      openCreateDialog,
      saveDialog,
      selectLeaf,
      shouldShowPrizeCode,
      shouldShowTrafficCoupon,
      strategyLimits,
      toggleSection,
      toggleShelf,
      toggleSubmenu,
      typeOptions,
      valueOptions,
      formatXinghuoDiscountLimit,
      getXinghuoMinAllowedAmount,
      winningFilters,
      winningPrizeTypeOptions,
      viewPrize,
      xinghuoSearchKeyword,
      xinghuoDropdownVisible,
      filteredXinghuoProducts,
      searchXinghuoProduct,
      openXinghuoDropdown,
      scheduleCloseDropdown,
      selectXinghuoProduct,
      trafficCouponSearchKeyword,
      trafficCouponDropdownVisible,
      filteredTrafficCoupons,
      searchTrafficCoupon,
      openTrafficCouponDropdown,
      scheduleCloseTrafficCouponDropdown,
      selectTrafficCoupon
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
  min-height: 38px;
  padding: 9px 20px;
  line-height: 20px;
  white-space: normal;
  word-break: break-all;
}

.menu-submenu-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  cursor: pointer;
}

.menu-subitem {
  display: flex;
  align-items: center;
}

.menu-submenu-title .menu-arrow {
  flex: 0 0 auto;
  margin-left: 8px;
  line-height: 20px;
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

.placeholder-card {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  font-size: 14px;
  color: #909399;
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

/* 星火商品搜索 */
.xinghuo-search-outer {
  position: relative;
  width: 480px;
}

.xinghuo-search {
  position: relative;
}

.xinghuo-search input {
  width: 100%;
  padding-right: 28px;
}

.xinghuo-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-top: none;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.xinghuo-dropdown-item {
  height: 34px;
  line-height: 34px;
  padding: 0 12px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.xinghuo-dropdown-item:hover {
  background: #fff2f5;
  color: #ff5a8c;
}

.xinghuo-selected {
  margin-top: 6px;
  padding: 6px 10px;
  font-size: 13px;
  color: #ff5a8c;
  background: #fff2f5;
  border: 1px solid #ffd6e4;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.xinghuo-stock-price {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
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

.winning-card {
  padding-top: 16px;
}

.winning-filter-row {
  display: grid;
  align-items: center;
  gap: 10px 12px;
}

.winning-filter-row.first {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.winning-filter-row.second {
  margin-top: 10px;
  grid-template-columns: 360px 190px 340px 320px;
  column-gap: 24px;
}

.winning-field {
  display: flex;
  align-items: center;
  min-width: 0;
}

.winning-field label {
  margin-right: 6px;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
}

.winning-field input,
.winning-field select {
  height: 30px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  outline: none;
  color: #606266;
  background: #fff;
}

.winning-field input {
  flex: 1;
  min-width: 0;
}

.winning-field.short input,
.winning-field.short select {
  width: 170px;
}

.winning-field.medium-wide input {
  width: 206px;
}

.winning-field.status-field select {
  width: 96px;
}

.winning-field.prize-type-field input,
.winning-field.prize-type-field select {
  width: 206px;
}

.winning-field.name {
  width: auto;
}

.winning-name-input input {
  width: 170px;
}

.winning-field.date-long {
  width: 340px;
}

.winning-date-range {
  flex: 0 0 240px;
  width: 240px;
}

.winning-field.prize-type-field {
  width: 320px;
  margin-left: 0;
}

.winning-date-range input {
  width: 104px;
}

.winning-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  grid-column: 1 / -1;
  margin-left: 0;
  margin-top: 2px;
  justify-self: start;
  min-width: 0;
}

.winning-actions .btn {
  min-width: 60px;
  padding: 0 14px;
  white-space: nowrap;
}

.winning-actions .btn:last-of-type {
  min-width: 84px;
}

.winning-import-tip {
  font-size: 12px;
  color: #ff5a8c;
  white-space: nowrap;
}

@media (max-width: 1380px) {
  .winning-filter-row.first {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .winning-filter-row.second {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .winning-actions {
    justify-self: start;
    flex-wrap: wrap;
  }
}

.winning-table-shell {
  margin-top: 18px;
}

.winning-table th,
.winning-table td {
  padding: 16px 12px;
  font-size: 13px;
}

.winning-user-cell,
.winning-prize-cell,
.winning-time-cell {
  text-align: left;
  line-height: 24px;
}

.winning-red {
  color: #ff5a8c;
}

.winning-thumb {
  width: 48px;
  height: 48px;
  margin: 0 auto;
  border-radius: 6px;
  position: relative;
  background: #fff5f8;
  border: 1px solid #ffe1ea;
}

.winning-thumb.flower {
  border-radius: 50%;
  background: radial-gradient(circle, #fff 22%, #ffdbe7 23%, #ffdbe7 45%, #fff 46%, #fff 54%, #ffdbe7 55%, #ffdbe7 72%, #fff 73%);
}

.flower-core {
  position: absolute;
  inset: 14px;
  border-radius: 50%;
  background: #ff91b4;
}

.winning-thumb.card {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eaf6ff;
  border-color: #c7e6ff;
}

.doc-card {
  width: 28px;
  height: 34px;
  border-radius: 4px;
  background: #fff;
  border: 1px solid #c7dff7;
  padding: 6px 4px;
}

.doc-line {
  height: 4px;
  border-radius: 3px;
  background: #8cc3ef;
  margin-bottom: 5px;
}

.doc-line.short {
  width: 70%;
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

.dialog-panel.large {
  width: min(768px, calc(100vw - 24px));
  height: calc(100vh - 16px);
  border-radius: 0;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #ebeef5;
  font-size: 16px;
  color: #303133;
}

.dialog-header.large {
  padding: 18px 20px 8px;
  border-bottom: 0;
  align-items: flex-start;
}

.dialog-section-title {
  font-size: 14px;
  font-weight: 700;
  color: #333;
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

.dialog-body.large {
  display: block;
  flex: 1;
  padding: 8px 20px 20px;
  overflow-y: auto;
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.form-row {
  display: flex;
  align-items: flex-start;
}

.form-row > label {
  width: 98px;
  padding-top: 8px;
  font-size: 14px;
  color: #333;
  line-height: 20px;
  flex: 0 0 auto;
  white-space: nowrap;
}

.form-row.required > label::before {
  content: '*';
  margin-right: 4px;
  color: #ff5a8c;
}

.field-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-column.stretch {
  flex: 1;
}

.field-column.compact {
  width: 244px;
}

.dialog-form input,
.dialog-form select {
  height: 30px;
  border: 1px solid #dcdfe6;
  padding: 0 12px;
  color: #606266;
  background: #fff;
  outline: none;
}

.field-tip,
.upload-note {
  font-size: 12px;
  line-height: 22px;
  color: #a6a9ad;
}

.compact-row {
  min-height: 30px;
}

.upload-row {
  min-height: 98px;
}

.upload-group {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.upload-box {
  width: 100px;
  height: 100px;
  border: 1px dashed #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b7bbc3;
  font-size: 28px;
  flex: 0 0 auto;
}

.upload-note {
  width: 190px;
  padding-top: 2px;
}

.hint-mark {
  display: inline-flex;
  width: 14px;
  height: 14px;
  margin-left: 4px;
  align-items: center;
  justify-content: center;
  border: 1px solid #bfc4cd;
  border-radius: 50%;
  font-size: 10px;
  color: #959aa5;
}

.radio-line,
.checkbox-line,
.same-user-line {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  font-size: 14px;
}

.radio-line input,
.checkbox-line input {
  width: 14px;
  height: 14px;
  margin: 0;
  padding: 0;
}

.inline-control {
  gap: 10px;
}

.short-input,
.mini-input {
  width: 194px;
}

.stock-warning-line {
  margin-left: 44px;
}

.amount-input-wrap {
  display: flex;
  align-items: center;
}

.amount-input-wrap input {
  width: 160px;
  border-right: 0;
}

.unit-suffix {
  width: 36px;
  height: 30px;
  border: 1px solid #dcdfe6;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #606266;
  background: #fafafa;
}

.offset-row {
  margin-top: -10px;
}

.radio-group-row {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 18px;
}

.simple-radio {
  gap: 6px;
}

.date-row .date-range.large {
  width: 402px;
}

.date-row .date-range.large input {
  width: 176px;
}

.section-split {
  margin-top: 6px;
  font-size: 14px;
  font-weight: 700;
  color: #333;
}

.strategy-row > label {
  padding-top: 2px;
}

.same-user-row > label {
  width: auto;
  padding-right: 12px;
  white-space: nowrap;
}

.strategy-list {
  gap: 14px;
}

.limit-line {
  flex-wrap: wrap;
  gap: 6px;
  line-height: 20px;
}

.same-user-line {
  flex-direction: row;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
}

.step-btn {
  width: 24px;
  height: 24px;
  border: 1px solid #dcdfe6;
  border-radius: 50%;
  background: #fff;
  color: #b1b5bc;
  cursor: pointer;
  line-height: 1;
}

.small-step-input {
  width: 58px;
  text-align: center;
}

.unit-select {
  width: 82px;
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

.dialog-footer.large {
  padding: 16px 8px 16px 20px;
  border-top: 1px solid #f0f1f5;
  background: #fff;
}

.footer-btn {
  min-width: 70px;
  height: 32px;
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
