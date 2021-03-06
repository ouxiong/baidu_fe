class Queue {
  constructor (config) {
    this._Indexmark = 'data-index'                 // 占位属性
    this._$wrap = $(config.wrapSelector)           // 队列容器
    this._arr   = []                               // 队列
    this._maxLength   = config.maxLength   || 60   // 队列最大长度
    this._maxLengthCb = config.maxLengthCb || noop // 队列到达最大长度时的回调
    this._sortCb      = config.sortCb      || noop // 排序时每一步结束时的回调
    this._sortEndCb   = config.sortEndCb   || noop // 排序结束时的回调
  }
  // 生成 li : Number -> return String(html li)
  _renderLi (num, index=0) {
    return (`
      <li ${this._Indexmark}=${index} title=${num} style="height:${num}px;">
        <span>${num}</span>
      </li>
    `)
  }
  // 生成 list : Array -> return String(html list)
  _renderList () {
    return this._arr.map(a => parseInt(a))
      .filter(n => is_number(n))
      .map((n, index) => this._renderLi(n, index))
      .join('')
  }
  // 队列是否达到最大长度了
  _isMax () {
    if (this._arr.length === this._maxLength) {
      this._maxLengthCb(this._maxLength)
      return true
    }
    return false
  }
  // right enter
  push (num) {
    if (this._isMax()) return false
    this._arr.push(num)
    this.init()
    return num
  }
  // left enter
  unshift (num) {
    if (this._isMax()) return false
    this._arr.unshift(num)
    this.init()
    return num
  }
  // right leave
  pop () {
    if (this._arr.length === 0) return false
    this._arr.pop()
    this.init()
    return true
  }
  // left leave
  shift () {
    if (this._arr.length === 0) return false
    this._arr.shift()
    this.init()
    return true
  }
  // 删除指定 index 的队列元素
  remove (index) {
    this._arr.splice(parseInt(index), 1)
    this.init()
  }
  // 排序 : mode(排序算法，默认为 bubble), type(true为正序，false为逆序)
  sort (mode='bubble', type) {
    // 冒泡排序
    if (mode === 'bubble') { // 用 copyArray 保证不产生副作用
      this._arr = bubbleSort(copyArray(this._arr), type,
        (list, a, b) => this._sortCb(type, list, a, b), // 排序中每个步骤的回调(可获取当前排序的状态)
        (list)       => this._sortEndCb(list)           // 排序结束时的回调
      )
    }
    // 选择排序
    else if (mode === 'select') {
      this._arr = selectionSort(copyArray(this._arr), type,
        (list, a, b) => this._sortCb(type, list, a, b),
        (list)       => this._sortEndCb(list)
      )
    }

  }
  // 生成初始队列
  init (arr) {
    this._arr = arr ? arr : this._arr
    this._$wrap.innerHTML = this._renderList()
  }
}
