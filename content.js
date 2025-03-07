// 添加修改記錄存儲
let changeLog = [];

// 添加編輯模式狀態
let editMode = '';

// 添加訂單項目記錄功能
function recordOrderItemChange(action, itemData, orderId) {
  if (!orderId || orderId.startsWith('未知訂單')) {
    console.warn('無法記錄修改：找不到有效的訂單編號');
    return;
  }
  
  // 格式化訂單項目描述
  let itemDescription = '';
  if (action === 'add') {
    itemDescription = `新增項目：${itemData.content || '未知商品'}`;
    if (itemData.value1) itemDescription += `，數量：${itemData.value1}`;
    if (itemData.value2) itemDescription += `，單價：${itemData.value2}`;
    if (itemData.value3) itemDescription += `，金額：${itemData.value3}`;
  } else if (action === 'delete') {
    itemDescription = `刪除項目：${itemData.content || '未知商品'}`;
    if (itemData.value1) itemDescription += `，數量：${itemData.value1}`;
    if (itemData.value2) itemDescription += `，單價：${itemData.value2}`;
    if (itemData.value3) itemDescription += `，金額：${itemData.value3}`;
  } else if (action === 'update') {
    itemDescription = `修改項目：${itemData.oldContent || '未知商品'} -> ${itemData.newContent || '未知商品'}`;
    if (itemData.oldValue1 && itemData.newValue1) 
      itemDescription += `，數量：${itemData.oldValue1} -> ${itemData.newValue1}`;
    if (itemData.oldValue2 && itemData.newValue2) 
      itemDescription += `，單價：${itemData.oldValue2} -> ${itemData.newValue2}`;
    if (itemData.oldValue3 && itemData.newValue3) 
      itemDescription += `，金額：${itemData.oldValue3} -> ${itemData.newValue3}`;
  }
  
  // 添加到修改記錄
  changeLog.push({
    orderId: orderId,
    timestamp: new Date().toLocaleString(),
    changes: [itemDescription]
  });
  
  // 更新修改記錄視窗
  updateChangeLog();
}

// 創建編輯模態框
function createEditModal() {
  const modal = document.createElement('div');
  modal.className = 'edit-modal';
  modal.innerHTML = `
    <h3>編輯內容</h3>
    <input type="hidden" id="order-id-input" placeholder="訂單編號" readonly>
    <div class="input-group">
      <label for="content-input">品名：</label>
      <input type="text" id="content-input" placeholder="品名">
    </div>
    <div class="input-group">
      <label for="value1-input">數量：</label>
      <input type="text" id="value1-input" placeholder="數量">
    </div>
    <div class="input-group">
      <label for="value2-input">單價：</label>
      <input type="text" id="value2-input" placeholder="單價">
    </div>
    <div class="input-group">
      <label for="value3-input">金額：</label>
      <input type="text" id="value3-input" placeholder="金額">
    </div>
    <div class="button-group">
      <button id="delete-btn">刪除</button>
      <button id="save-btn">保存</button>
      <button id="cancel-btn">取消</button>
    </div>
  `;
  return modal;
}

// 創建修改記錄視窗
function createChangeLogModal() {
  const modal = document.createElement('div');
  modal.className = 'change-log-modal';
  modal.innerHTML = `
    <div class="change-log-header">
      <h3>修改記錄 <span class="change-log-count"></span></h3>
      <div class="download-buttons">
        <button id="download-log-btn" class="download-btn" style="display: none;">下載內容</button>
      </div>
    </div>
    <div id="change-log-content" class="change-log-content"></div>
  `;

  // 添加下載按鈕事件
  setTimeout(() => {
    const downloadBtn = modal.querySelector('#download-log-btn');
    if (downloadBtn) {
      downloadBtn.onclick = () => downloadChangeLog();
      downloadBtn.style.display = changeLog.length > 0 ? 'inline-block' : 'none';
    }
  }, 0);

  return modal;
}

// 更新修改記錄
function updateChangeLog() {
  const logContent = document.getElementById('change-log-content');
  if (!logContent) return;

  // 獲取修改記錄視窗
  const changeLogModal = document.querySelector('.change-log-modal');

  // 根據是否有修改記錄來決定顯示狀態
  if (changeLog.length > 0) {
    // 有修改記錄時顯示視窗
    if (changeLogModal) {
      changeLogModal.style.display = 'block';
    }
  } else {
    // 沒有修改記錄時隱藏視窗
    if (changeLogModal) {
      changeLogModal.style.display = 'none';
    }
  }

  // 更新通知數字
  let notification = document.querySelector('.change-log-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'change-log-notification';
    document.body.appendChild(notification);
  }
  notification.textContent = changeLog.length;
  notification.style.display = changeLog.length > 0 ? 'block' : 'none';

  // 更新下載按鈕顯示狀態
  const downloadBtn = document.getElementById('download-log-btn');
  if (downloadBtn) {
    downloadBtn.style.display = changeLog.length > 0 ? 'inline-block' : 'none';
  }

  // 更新修改記錄內容
  logContent.innerHTML = changeLog.length > 0 ? 
    changeLog.map((log, index) => `
      <div class="change-log-item" data-index="${index}">
        <div class="header">
          <p>訂單編號: ${log.orderId}</p>
          <p>${log.timestamp}</p>
        </div>
        <div class="details">
          <ul>
            ${log.changes.map(change => `<li>${change}</li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('') :
    '<p>尚無修改記錄</p>';

  // 添加點擊展開/收合事件
  logContent.querySelectorAll('.change-log-item').forEach(item => {
    item.addEventListener('click', function() {
      this.classList.toggle('expanded');
    });
  });
}

// 修改初始化部分
function initializePlugin() {
  console.log('插件初始化中...');
  
  // 創建並添加修改記錄視窗，但初始時隱藏
  const changeLogModal = createChangeLogModal();
  changeLogModal.style.display = 'none'; // 初始時隱藏
  document.body.appendChild(changeLogModal);

  // 創建通知元素
  const notification = document.createElement('div');
  notification.className = 'change-log-notification';
  notification.style.display = 'none';
  document.body.appendChild(notification);
  
  // 應用表格樣式
  applyTableStyles();
  
  // 添加頁尾編輯功能
  addPagerEditButtons();
  
  // 修改列印前的處理
  window.addEventListener('beforeprint', function() {
    // 保存所有修改過的單元格，以便之後恢復
    window.modifiedCells = Array.from(document.querySelectorAll('.modified-cell')).map(cell => {
      cell.classList.remove('modified-cell');
      return cell;
    });
  });

  // 列印後恢復修改標記
  window.addEventListener('afterprint', function() {
    // 恢復修改標記
    if (window.modifiedCells) {
      window.modifiedCells.forEach(cell => {
        cell.classList.add('modified-cell');
      });
      window.modifiedCells = null;
    }
  });
  
  console.log('插件初始化完成');
}

// 確保在 DOM 完全加載後執行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePlugin);
} else {
  initializePlugin();
}

// 修改消息監聽
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "showBatchReplace") {
    editMode = 'batch';
    showBatchReplaceModal();
  } else if (request.action === "enableSingleEdit") {
    editMode = 'single';
    // 添加編輯模式樣式到body
    document.body.classList.add('edit-mode');
  }
});

// 修改事件監聽
document.addEventListener('click', function(e) {
  // 處理表格行點擊事件 (僅在編輯模式下)
  if (e.target.closest('tr') && editMode === 'single') {
    const row = e.target.closest('tr');
    const cells = row.getElementsByTagName('td');
    
    // 只處理包含td的行（非表頭行）
    if (cells.length > 0) {
      // 移除其他行的選中狀態
      document.querySelectorAll('tr').forEach(tr => {
        tr.classList.remove('selected-row');
      });
      
      // 添加選中狀態
      row.classList.add('selected-row');
      
      // 創建並顯示編輯模態框
      const backdrop = createBackdrop();
      const modal = createEditModal();
      document.body.appendChild(backdrop);
      document.body.appendChild(modal);
      
      // 獲取當前行的數據
      if (cells.length > 0) {
        // 使用新的方式獲取訂單編號
        const orderId = getOrderId(row);
        document.getElementById('order-id-input').value = orderId;
        document.getElementById('content-input').value = cells[0].textContent.trim();
        document.getElementById('value1-input').value = cells[1]?.textContent.trim() || '';
        document.getElementById('value2-input').value = cells[2]?.textContent.trim() || '';
        document.getElementById('value3-input').value = cells[3]?.textContent.trim() || '';
      }
      
      // 刪除按鈕事件
      document.getElementById('delete-btn').onclick = function() {
        if (confirm('確定要刪除這筆資料嗎？')) {
          const orderId = document.getElementById('order-id-input').value;
          const deleteData = {
            content: cells[0].textContent.trim(),
            value1: cells[1]?.textContent.trim() || '',
            value2: cells[2]?.textContent.trim() || '',
            value3: cells[3]?.textContent.trim() || ''
          };
          
          // 記錄刪除操作
          recordOrderItemChange('delete', deleteData, orderId);
          
          // 找到包含該行的 invoice-section
          const invoiceSection = row.closest('.invoice-section');
          if (invoiceSection) {
            // 在移除行之前，創建一個隱藏的標記元素
            const marker = document.createElement('div');
            marker.className = 'modified-cell deleted-row-marker';
            marker.style.display = 'none';
            // 將標記元素添加到 invoice-section
            invoiceSection.appendChild(marker);
          }
          
          // 移除該行
          row.remove();
          
          // 關閉模態框
          closeModal();
        }
      };
      
      // 保存按鈕事件
      document.getElementById('save-btn').onclick = function() {
        // 獲取原始內容用於記錄
        const oldValues = {
          content: cells[0].textContent.trim(),
          value1: cells[1]?.textContent.trim() || '',
          value2: cells[2]?.textContent.trim() || '',
          value3: cells[3]?.textContent.trim() || ''
        };

        // 獲取新的輸入值
        const newValues = {
          content: document.getElementById('content-input').value.trim(),
          value1: document.getElementById('value1-input').value.trim(),
          value2: document.getElementById('value2-input').value.trim(),
          value3: document.getElementById('value3-input').value.trim()
        };

        // 檢查是否有實際修改
        let hasChanges = false;
        if (oldValues.content !== newValues.content) hasChanges = true;
        if (oldValues.value1 !== newValues.value1) hasChanges = true;
        if (oldValues.value2 !== newValues.value2) hasChanges = true;
        if (oldValues.value3 !== newValues.value3) hasChanges = true;

        if (hasChanges) {
          // 更新內容並標記修改的單元格
          if (oldValues.content !== newValues.content) {
            cells[0].textContent = newValues.content;
            cells[0].classList.add('modified-cell');
          }

          // 檢查並更新其他單元格
          if (cells[1] && oldValues.value1 !== newValues.value1) {
            cells[1].textContent = newValues.value1;
            cells[1].classList.add('modified-cell');
          }

          if (cells[2] && oldValues.value2 !== newValues.value2) {
            cells[2].textContent = newValues.value2;
            cells[2].classList.add('modified-cell');
          }

          if (cells[3] && oldValues.value3 !== newValues.value3) {
            cells[3].textContent = newValues.value3;
            cells[3].classList.add('modified-cell');
          }

          // 使用新的記錄函數記錄整行修改
          const orderId = document.getElementById('order-id-input').value;
          if (!orderId.startsWith('未知訂單')) {
            // 創建記錄數據
            const updateData = {
              oldContent: oldValues.content,
              newContent: newValues.content,
              oldValue1: oldValues.value1,
              newValue1: newValues.value1,
              oldValue2: oldValues.value2,
              newValue2: newValues.value2,
              oldValue3: oldValues.value3,
              newValue3: newValues.value3
            };
            
            // 記錄修改
            recordOrderItemChange('update', updateData, orderId);
          }
        }

        // 更新修改記錄視窗
        updateChangeLog();
        closeModal();
      };
      
      // 取消按鈕事件
      document.getElementById('cancel-btn').onclick = closeModal;
      
      // 點擊背景關閉模態框
      backdrop.onclick = closeModal;
    }
  }
});

// 關閉模態框
function closeModal() {
  const modal = document.querySelector('.edit-modal');
  const backdrop = document.querySelector('.modal-backdrop');
  if (modal) modal.remove();
  if (backdrop) backdrop.remove();
  document.querySelectorAll('tr').forEach(tr => {
    tr.classList.remove('selected-row');
  });
}

// 創建背景遮罩
function createBackdrop() {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  return backdrop;
}

// 修改創建批量替換處理模態框函數
function createBatchReplaceModal() {
  const modal = document.createElement('div');
  modal.className = 'batch-replace-modal';
  modal.innerHTML = `
    <h3>批量替換處理內容</h3>
    <div class="search-section">
      <h4>搜尋條件：</h4>
      <div class="input-group">
        <label for="search-content">商品名稱：</label>
        <textarea id="search-content" placeholder="請輸入要搜尋的商品名稱（必填）"></textarea>
      </div>
      <div class="input-group">
        <label for="search-value1">數量：</label>
        <input type="text" id="search-value1" placeholder="選填">
      </div>
      <div class="input-group">
        <label for="search-value2">單價：</label>
        <input type="text" id="search-value2" placeholder="選填">
      </div>
      <div class="input-group">
        <label for="search-value3">金額：</label>
        <input type="text" id="search-value3" placeholder="選填">
      </div>
    </div>

    <div class="replace-section">
      <h4>替換為：</h4>
      <div class="input-group">
        <label for="replace-content">商品名稱：</label>
        <textarea id="replace-content" placeholder="請輸入新的商品名稱"></textarea>
      </div>
      <div class="input-group">
        <label for="replace-value1">數量：</label>
        <input type="text" id="replace-value1" placeholder="不填則保持原值">
      </div>
      <div class="input-group">
        <label for="replace-value2">單價：</label>
        <input type="text" id="replace-value2" placeholder="不填則保持原值">
      </div>
      <div class="input-group">
        <label for="replace-value3">金額：</label>
        <input type="text" id="replace-value3" placeholder="不填則保持原值">
      </div>
    </div>

    <div id="search-preview" class="search-preview">
      <h4>找到的匹配項：</h4>
      <div id="preview-content"></div>
    </div>
    
    <div class="button-group">
      <button id="preview-btn">預覽</button>
      <button id="replace-btn">執行替換</button>
      <button id="cancel-replace-btn">取消</button>
    </div>
  `;
  return modal;
}

// 顯示批量替換處理模態框
function showBatchReplaceModal() {
  const backdrop = createBackdrop();
  const modal = createBatchReplaceModal();
  document.body.appendChild(backdrop);
  document.body.appendChild(modal);

  // 修改預覽按鈕事件
  document.getElementById('preview-btn').onclick = function() {
    const searchContent = document.getElementById('search-content').value.trim();
    if (!searchContent) {
      alert('請輸入要搜尋的商品名稱');
      return;
    }

    // 先只用商品名稱來搜尋
    const searchValues = {
      content: searchContent,
      value1: '',
      value2: '',
      value3: ''
    };
    
    const matchedRows = findMatchingRows(searchValues);
    
    // 如果找到匹配的行，自動填入第一個匹配行的值
    if (matchedRows.length > 0) {
      const firstRow = matchedRows[0];
      const cells = firstRow.getElementsByTagName('td');
      
      // 填入搜尋條件的輸入框
      const searchValue1 = document.getElementById('search-value1');
      const searchValue2 = document.getElementById('search-value2');
      const searchValue3 = document.getElementById('search-value3');

      // 如果搜尋條件的輸入框為空，則填入原始值
      if (!searchValue1.value.trim()) {
        searchValue1.value = cells[1].textContent.trim();
      }
      if (!searchValue2.value.trim()) {
        searchValue2.value = cells[2].textContent.trim();
      }
      if (!searchValue3.value.trim()) {
        searchValue3.value = cells[3].textContent.trim();
      }
      
      // 填入替換值的輸入框
      const replaceContent = document.getElementById('replace-content');
      const replaceValue1 = document.getElementById('replace-value1');
      const replaceValue2 = document.getElementById('replace-value2');
      const replaceValue3 = document.getElementById('replace-value3');

      if (!replaceContent.value.trim()) {
        replaceContent.value = cells[0].textContent.trim();
      }
      if (!replaceValue1.value.trim()) {
        replaceValue1.value = cells[1].textContent.trim();
      }
      if (!replaceValue2.value.trim()) {
        replaceValue2.value = cells[2].textContent.trim();
      }
      if (!replaceValue3.value.trim()) {
        replaceValue3.value = cells[3].textContent.trim();
      }

      // 使用更新後的搜尋值重新搜尋
      const updatedSearchValues = {
        content: searchContent,
        value1: searchValue1.value.trim(),
        value2: searchValue2.value.trim(),
        value3: searchValue3.value.trim()
      };
      
      const updatedMatchedRows = findMatchingRows(updatedSearchValues);
      showPreview(updatedMatchedRows);
    } else {
      showPreview([]);
    }
  };

  // 替換按鈕事件
  document.getElementById('replace-btn').onclick = function() {
    const searchValues = {
      content: document.getElementById('search-content').value.trim(),
      value1: document.getElementById('search-value1').value.trim(),
      value2: document.getElementById('search-value2').value.trim(),
      value3: document.getElementById('search-value3').value.trim()
    };
    const matchedRows = findMatchingRows(searchValues);
    console.table(matchedRows);
    
    if (matchedRows.length === 0) {
      alert('沒有找到匹配的內容！');
      return;
    }

    if (confirm(`確定要替換這 ${matchedRows.length} 筆資料嗎？`)) {
      batchReplace(matchedRows);
      closeBatchReplaceModal();
    }
  };

  // 取消按鈕事件
  document.getElementById('cancel-replace-btn').onclick = closeBatchReplaceModal;
  backdrop.onclick = closeBatchReplaceModal;
}

// 修改查找匹配的行函數
function findMatchingRows(searchValues) {
  const rows = document.querySelectorAll('tr');
  
  // 過濾符合條件的行
  return Array.from(rows).filter(row => {
    const cells = row.getElementsByTagName('td');
    if (cells.length < 4) return false;

    // 檢查每個欄位是否符合搜尋條件
    const matches = {
      content: !searchValues.content || cells[0].textContent.trim() === searchValues.content,
      value1: !searchValues.value1 || cells[1].textContent.trim() === searchValues.value1,
      value2: !searchValues.value2 || cells[2].textContent.trim() === searchValues.value2,
      value3: !searchValues.value3 || cells[3].textContent.trim() === searchValues.value3
    };

    // 商品名稱必須匹配，其他欄位如果有填寫也必須匹配
    return matches.content && matches.value1 && matches.value2 && matches.value3;
  });
}

// 修改預覽顯示函數
function showPreview(matchedRows) {
  const previewContent = document.getElementById('preview-content');
  if (matchedRows.length === 0) {
    previewContent.innerHTML = '<p style="color: red;">沒有找到相符的資料</p>';
    return;
  }

  // 獲取搜尋值
  const searchValues = {
    content: document.getElementById('search-content').value.trim(),
    value1: document.getElementById('search-value1').value.trim(),
    value2: document.getElementById('search-value2').value.trim(),
    value3: document.getElementById('search-value3').value.trim()
  };

  // 獲取替換值
  const replaceValues = {
    content: document.getElementById('replace-content').value.trim(),
    value1: document.getElementById('replace-value1').value.trim(),
    value2: document.getElementById('replace-value2').value.trim(),
    value3: document.getElementById('replace-value3').value.trim()
  };

  previewContent.innerHTML = `
    <p>找到 ${matchedRows.length} 筆符合的資料：</p>
    <div class="preview-table">
      <table>
        <thead>
          <tr>
            <th>欄位</th>
            <th>原始值</th>
            <th>替換後</th>
          </tr>
        </thead>
        <tbody>
          ${searchValues.content ? `
            <tr>
              <td>商品名稱</td>
              <td>${searchValues.content}</td>
              <td>${replaceValues.content || '(保持原值)'}</td>
            </tr>
          ` : ''}
          ${searchValues.value1 ? `
            <tr>
              <td>數量</td>
              <td>${searchValues.value1}</td>
              <td>${replaceValues.value1 || '(保持原值)'}</td>
            </tr>
          ` : ''}
          ${searchValues.value2 ? `
            <tr>
              <td>單價</td>
              <td>${searchValues.value2}</td>
              <td>${replaceValues.value2 || '(保持原值)'}</td>
            </tr>
          ` : ''}
          ${searchValues.value3 ? `
            <tr>
              <td>金額</td>
              <td>${searchValues.value3}</td>
              <td>${replaceValues.value3 || '(保持原值)'}</td>
            </tr>
          ` : ''}
        </tbody>
      </table>
    </div>
  `;
}

// 修改批量替換處理函數
function batchReplace(matchedRows) {
  // 獲取替換值
  const replaceValues = {
    content: document.getElementById('replace-content').value.trim(),
    value1: document.getElementById('replace-value1').value.trim(),
    value2: document.getElementById('replace-value2').value.trim(),
    value3: document.getElementById('replace-value3').value.trim()
  };

  matchedRows.forEach(row => {
    const cells = row.getElementsByTagName('td');
    if (cells.length < 4) return;

    // 記錄舊值
    const oldValues = {
      content: cells[0].textContent.trim(),
      value1: cells[1].textContent.trim(),
      value2: cells[2].textContent.trim(),
      value3: cells[3].textContent.trim()
    };

    // 檢查是否有實際修改
    let hasChanges = false;
    if (replaceValues.content && replaceValues.content !== oldValues.content) hasChanges = true;
    if (replaceValues.value1 && replaceValues.value1 !== oldValues.value1) hasChanges = true;
    if (replaceValues.value2 && replaceValues.value2 !== oldValues.value2) hasChanges = true;
    if (replaceValues.value3 && replaceValues.value3 !== oldValues.value3) hasChanges = true;

    if (hasChanges) {
      // 修改單元格內容
      if (replaceValues.content && replaceValues.content !== oldValues.content) {
        cells[0].textContent = replaceValues.content;
        cells[0].classList.add('modified-cell');
      }
      if (replaceValues.value1 && replaceValues.value1 !== oldValues.value1) {
        cells[1].textContent = replaceValues.value1;
        cells[1].classList.add('modified-cell');
      }
      if (replaceValues.value2 && replaceValues.value2 !== oldValues.value2) {
        cells[2].textContent = replaceValues.value2;
        cells[2].classList.add('modified-cell');
      }
      if (replaceValues.value3 && replaceValues.value3 !== oldValues.value3) {
        cells[3].textContent = replaceValues.value3;
        cells[3].classList.add('modified-cell');
      }

      // 使用新的記錄函數記錄整行修改
      const orderId = getOrderId(row);
      // 創建記錄數據
      const updateData = {
        oldContent: oldValues.content,
        newContent: replaceValues.content || oldValues.content,
        oldValue1: oldValues.value1,
        newValue1: replaceValues.value1 || oldValues.value1,
        oldValue2: oldValues.value2,
        newValue2: replaceValues.value2 || oldValues.value2,
        oldValue3: oldValues.value3,
        newValue3: replaceValues.value3 || oldValues.value3
      };
      
      // 記錄修改
      recordOrderItemChange('update', updateData, orderId);
    }
  });

  // 更新修改記錄視窗
  updateChangeLog();
}

// 關閉批量替換處理模態框
function closeBatchReplaceModal() {
  const modal = document.querySelector('.batch-replace-modal');
  const backdrop = document.querySelector('.modal-backdrop');
  if (modal) modal.remove();
  if (backdrop) backdrop.remove();
}

// 修改下載修改記錄函數
function downloadChangeLog() {
  try {
    // 獲取當前時間，包含時分秒
    const now = new Date();
    const dateString = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;

    // 下載修改記錄 txt
    const content = changeLog.map(log => {
      const header = `訂單編號: ${log.orderId}\n時間: ${log.timestamp}\n修改內容:`;
      const changes = log.changes.map(change => 
        `  ${change.replace(/<br>/g, ' → ')}`
      ).join('\n');
      return `${header}\n${changes}\n------------------------`;
    }).join('\n\n');

    const logBlob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const logLink = document.createElement('a');
    logLink.href = URL.createObjectURL(logBlob);
    logLink.download = `修改記錄_${dateString}.txt`;
    document.body.appendChild(logLink);
    logLink.click();
    document.body.removeChild(logLink);
    URL.revokeObjectURL(logLink.href);

    // 創建一個新的文檔副本用於完整內容
    const fullDoc = document.cloneNode(true);
    // 創建一個新的文檔副本用於修改內容
    const modifiedDoc = document.cloneNode(true);
    
    // 移除所有插件添加的元素
    const elementsToRemove = [
      '.change-log-modal',
      '.change-log-notification',
      '.download-btn',
      '.batch-replace-modal',
      '.modal-backdrop',
      '.edit-modal'
    ];

    elementsToRemove.forEach(selector => {
      const fullElements = fullDoc.querySelectorAll(selector);
      const modifiedElements = modifiedDoc.querySelectorAll(selector);
      fullElements.forEach(el => el.remove());
      modifiedElements.forEach(el => el.remove());
    });

    // 在修改內容的文檔中移除未修改的 invoice-section
    const sections = modifiedDoc.querySelectorAll('.invoice-section');
    sections.forEach(section => {
      const hasModifiedCells = section.querySelector('.modified-cell, .deleted-row-marker');
      if (!hasModifiedCells) {
        section.remove();
      } else {
        // 移除標記元素
        const markers = section.querySelectorAll('.deleted-row-marker');
        markers.forEach(marker => marker.remove());
      }
    });

    // 下載完整內容 HTML
    const fullHtmlBlob = new Blob([fullDoc.documentElement.outerHTML], { type: 'text/html;charset=utf-8' });
    const fullHtmlLink = document.createElement('a');
    fullHtmlLink.href = URL.createObjectURL(fullHtmlBlob);
    fullHtmlLink.download = `訂單內容_${dateString}.html`;
    document.body.appendChild(fullHtmlLink);
    fullHtmlLink.click();
    document.body.removeChild(fullHtmlLink);
    URL.revokeObjectURL(fullHtmlLink.href);

    // 下載修改內容 HTML
    const modifiedHtmlBlob = new Blob([modifiedDoc.documentElement.outerHTML], { type: 'text/html;charset=utf-8' });
    const modifiedHtmlLink = document.createElement('a');
    modifiedHtmlLink.href = URL.createObjectURL(modifiedHtmlBlob);
    modifiedHtmlLink.download = `修改內容_${dateString}.html`;
    document.body.appendChild(modifiedHtmlLink);
    modifiedHtmlLink.click();
    document.body.removeChild(modifiedHtmlLink);
    URL.revokeObjectURL(modifiedHtmlLink.href);

  } catch (error) {
    console.error('生成檔案時發生錯誤:', error);
    alert('下載檔案時發生錯誤，請稍後再試');
  }
}

// 美化表格樣式
function applyTableStyles() {
  const style = document.createElement('style');
  style.textContent = `
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 1rem;
      background-color: transparent;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    th, td {
      padding: 12px;
      vertical-align: middle;
    }

    th {
      background-color: #f8f9fa;
      font-weight: bold;
      text-align: left;
      color: #495057;
    }


    tr:hover {
      background-color: #f2f2f2;
    }

    .selected-row {
      background-color: #e8f4f8 !important;
      border-left: 4px solid #0097AA;
    }

    .modified-cell {
      color: #0097AA !important;
      font-weight: bold;
    }

    .preview-table table {
      margin: 10px 0;
    }

    .preview-table th {
      background-color: #0097AA;
      color: white;
      font-weight: normal;
    }

    .preview-table tr:hover {
      background-color: #e8f4f8;
    }
  `;
  document.head.appendChild(style);
}

// 修改獲取訂單編號的函數
function getOrderId(row) {
  try {
    // 從點擊的 tr 往上找到 class="list" 的 table
    const listTable = row.closest('table.list');
    if (!listTable) return '未知訂單1';

    // 找到同層的 info 元素
    const infoElement = listTable.parentElement.querySelector('.info');
    console.table(infoElement);
    if (!infoElement) return '未知訂單2';

    // 從 info 元素中獲取訂單編號
    const orderIdText = infoElement.textContent.trim();
    // 修改正則表達式以匹配訂單編號格式：數字+(MB|PC)+數字
    const orderIdMatch = orderIdText.match(/\d+(MB|PC)\d+/i);
    return orderIdMatch ? orderIdMatch[0] : '未知訂單3';
  } catch (error) {
    console.error('獲取訂單編號時發生錯誤:', error);
    return '未知訂單4';
  }
}

// 添加頁尾編輯按鈕功能
function addPagerEditButtons() {
  // 尋找具有 pager text-right 類的元素
  const pagerElements = document.querySelectorAll('.pager.text-right, .pager, .text-right');
  
  pagerElements.forEach(pager => {
    // 為元素添加編輯屬性，在編輯模式下生效
    pager.setAttribute('data-editable', 'pager');
    
    // 添加點擊事件
    pager.addEventListener('click', function(e) {
      // 只在單筆編輯模式下響應
      if (editMode === 'single') {
        // 防止事件冒泡
        e.stopPropagation();
        showPagerEditModal(this);
      }
    });
  });
}

// 顯示頁尾編輯對話框
function showPagerEditModal(pagerElement) {
  // 獲取訂單ID
  const orderId = getOrderIdFromPage();
  
  // 獲取當前內容
  const originalContent = pagerElement.innerHTML;
  const plainTextContent = pagerElement.innerText.trim();
  
  // 創建背景和模態框
  const backdrop = createBackdrop();
  const modal = document.createElement('div');
  modal.className = 'edit-modal pager-edit-modal';
  modal.innerHTML = `
    <h3>編輯頁尾內容</h3>
    <input type="hidden" id="pager-order-id" value="${orderId}" readonly>
    <div class="input-group pager-edit-group">
      <label for="pager-content-input">內容：</label>
      <textarea id="pager-content-input" rows="4" style="width: 100%; resize: vertical;">${plainTextContent}</textarea>
    </div>
    <div class="button-group">
      <button id="pager-save-btn">保存</button>
      <button id="pager-cancel-btn">取消</button>
    </div>
  `;
  
  document.body.appendChild(backdrop);
  document.body.appendChild(modal);
  
  // 保存按鈕事件
  document.getElementById('pager-save-btn').onclick = function() {
    const newContent = document.getElementById('pager-content-input').value.trim();
    
    if (newContent !== plainTextContent) {
      // 保留原有的HTML結構和類，但更新顯示的文本內容
      const updatedContent = updateTextInHTML(originalContent, newContent);
      pagerElement.innerHTML = updatedContent;
      
      // 標記為已修改
      pagerElement.classList.add('modified-cell');
      
      // 記錄修改
      recordPagerChange(plainTextContent, newContent, orderId);
    }
    
    // 關閉模態框
    closePagerEditModal();
  };
  
  // 取消按鈕事件
  document.getElementById('pager-cancel-btn').onclick = closePagerEditModal;
  backdrop.onclick = closePagerEditModal;
}

// 更新HTML中的文本，保留原有的HTML結構
function updateTextInHTML(originalHTML, newText) {
  // 檢查是否為簡單文本或有編輯按鈕
  if (originalHTML.indexOf('<button') >= 0) {
    // 提取編輯按鈕，保留它
    const editButtonMatch = originalHTML.match(/<button[^>]*class="pager-edit-btn"[^>]*>.*?<\/button>/);
    const editButton = editButtonMatch ? editButtonMatch[0] : '';
    
    // 使用新文本加上編輯按鈕
    return newText + ' ' + editButton;
  }
  
  // 如果是簡單的HTML，直接替換文本
  return newText;
}

// 記錄頁尾修改
function recordPagerChange(oldContent, newContent, orderId) {
  if (!orderId || orderId.startsWith('未知訂單')) {
    console.warn('無法記錄修改：找不到有效的訂單編號');
    return;
  }
  
  // 添加到修改記錄
  changeLog.push({
    orderId: orderId,
    timestamp: new Date().toLocaleString(),
    changes: [`頁尾內容: ${oldContent} -> ${newContent}`]
  });
  
  // 更新修改記錄視窗
  updateChangeLog();
}

// 關閉頁尾編輯模態框
function closePagerEditModal() {
  const modal = document.querySelector('.pager-edit-modal');
  const backdrop = document.querySelector('.modal-backdrop');
  if (modal) modal.remove();
  if (backdrop) backdrop.remove();
}

// 從頁面獲取訂單編號
function getOrderIdFromPage() {
  try {
    // 從不同位置嘗試獲取訂單編號
    const infoElements = document.querySelectorAll('.info');
    
    for (let i = 0; i < infoElements.length; i++) {
      const infoText = infoElements[i].textContent.trim();
      const orderIdMatch = infoText.match(/\d+(MB|PC)\d+/i);
      if (orderIdMatch) return orderIdMatch[0];
    }
    
    // 如果上面找不到，嘗試從標題或其他地方找
    const titleElements = document.querySelectorAll('h1, h2, h3, .title');
    for (let i = 0; i < titleElements.length; i++) {
      const titleText = titleElements[i].textContent.trim();
      const orderIdMatch = titleText.match(/\d+(MB|PC)\d+/i);
      if (orderIdMatch) return orderIdMatch[0];
    }
    
    // 最後嘗試從整個頁面內容中查找
    const bodyText = document.body.textContent;
    const orderIdMatch = bodyText.match(/\d+(MB|PC)\d+/i);
    return orderIdMatch ? orderIdMatch[0] : '未知訂單';
  } catch (error) {
    console.error('獲取訂單編號時發生錯誤:', error);
    return '未知訂單';
  }
} 