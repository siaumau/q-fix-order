// 添加修改記錄存儲
let changeLog = [];

// 創建編輯模態框
function createEditModal() {
  const modal = document.createElement('div');
  modal.className = 'edit-modal';
  modal.innerHTML = `
    <h3>編輯內容</h3>
    <input type="text" id="order-id-input" placeholder="訂單編號" readonly>
    <input type="text" id="content-input" placeholder="內容">
    <input type="text" id="value1-input" placeholder="數值1">
    <input type="text" id="value2-input" placeholder="數值2">
    <input type="text" id="value3-input" placeholder="數值3">
    <div>
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
    <h3>修改記錄</h3>
    <div id="change-log-content"></div>
  `;
  return modal;
}

// 更新修改記錄
function updateChangeLog() {
  const logContent = document.getElementById('change-log-content');
  if (!logContent) return;

  logContent.innerHTML = changeLog.map(log => `
    <div class="change-log-item">
      <div>訂單編號: ${log.orderId}</div>
      <div>修改時間: ${log.timestamp}</div>
      <div>修改內容:</div>
      <ul>
        ${log.changes.map(change => `<li>${change}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

// 修改初始化部分
function initializePlugin() {
  console.log('插件初始化中...'); // 用於調試
  
  // 創建並添加批量替換按鈕
  const batchReplaceButton = document.createElement('div');
  batchReplaceButton.className = 'batch-replace-button';
  batchReplaceButton.textContent = '批量替換';
  batchReplaceButton.onclick = showBatchReplaceModal;
  document.body.appendChild(batchReplaceButton);

  // 創建並添加修改記錄視窗
  const changeLogModal = createChangeLogModal();
  document.body.appendChild(changeLogModal);
  
  console.log('插件初始化完成'); // 用於調試
}

// 確保在 DOM 完全加載後執行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePlugin);
} else {
  initializePlugin();
}

// 初始化事件監聽
document.addEventListener('click', function(e) {
  // 檢查是否點擊了表格行
  if (e.target.closest('tr')) {
    const row = e.target.closest('tr');
    
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
    const cells = row.getElementsByTagName('td');
    if (cells.length > 0) {
      // 假設訂單編號在第一個 td 之前的某個元素中
      const orderId = row.querySelector('[data-order-id]')?.dataset.orderId || '未知訂單';
      document.getElementById('order-id-input').value = orderId;
      document.getElementById('content-input').value = cells[0].textContent.trim();
      document.getElementById('value1-input').value = cells[1]?.textContent.trim() || '';
      document.getElementById('value2-input').value = cells[2]?.textContent.trim() || '';
      document.getElementById('value3-input').value = cells[3]?.textContent.trim() || '';
    }
    
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

      // 添加到修改記錄（只記錄有修改的欄位）
      const changes = [];
      if (oldValues.content !== newValues.content) {
        changes.push(`內容: ${oldValues.content} -> ${newValues.content}`);
      }
      if (oldValues.value1 !== newValues.value1) {
        changes.push(`數值1: ${oldValues.value1} -> ${newValues.value1}`);
      }
      if (oldValues.value2 !== newValues.value2) {
        changes.push(`數值2: ${oldValues.value2} -> ${newValues.value2}`);
      }
      if (oldValues.value3 !== newValues.value3) {
        changes.push(`數值3: ${oldValues.value3} -> ${newValues.value3}`);
      }

      if (changes.length > 0) {
        changeLog.push({
          orderId: document.getElementById('order-id-input').value,
          timestamp: new Date().toLocaleString(),
          changes: changes
        });
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

// 創建批量替換模態框
function createBatchReplaceModal() {
  const modal = document.createElement('div');
  modal.className = 'batch-replace-modal';
  modal.innerHTML = `
    <h3>批量替換內容</h3>
    <div>
      <p>請輸入要搜尋的商品名稱：</p>
      <textarea id="search-content" placeholder="例如：2%水楊酸精華液 118ml"></textarea>
    </div>
    <div>
      <p>替換為：</p>
      <textarea id="replace-content" placeholder="請輸入新的商品名稱"></textarea>
    </div>
    <div id="search-preview" class="search-preview">
      <p>找到的匹配項：</p>
      <div id="preview-content"></div>
    </div>
    <div>
      <button id="preview-btn">預覽</button>
      <button id="replace-btn">執行替換</button>
      <button id="cancel-replace-btn">取消</button>
    </div>
  `;
  return modal;
}

// 顯示批量替換模態框
function showBatchReplaceModal() {
  const backdrop = createBackdrop();
  const modal = createBatchReplaceModal();
  document.body.appendChild(backdrop);
  document.body.appendChild(modal);

  // 預覽按鈕事件
  document.getElementById('preview-btn').onclick = function() {
    const searchContent = document.getElementById('search-content').value.trim();
    const matchedRows = findMatchingRows(searchContent);
    showPreview(matchedRows);
  };

  // 替換按鈕事件
  document.getElementById('replace-btn').onclick = function() {
    const searchContent = document.getElementById('search-content').value.trim();
    const replaceContent = document.getElementById('replace-content').value.trim();
    const matchedRows = findMatchingRows(searchContent);
    
    if (matchedRows.length === 0) {
      alert('沒有找到匹配的內容！');
      return;
    }

    if (confirm(`確定要替換這 ${matchedRows.length} 筆資料嗎？`)) {
      batchReplace(matchedRows, replaceContent);
      closeBatchReplaceModal();
    }
  };

  // 取消按鈕事件
  document.getElementById('cancel-replace-btn').onclick = closeBatchReplaceModal;
  backdrop.onclick = closeBatchReplaceModal;
}

// 修改查找匹配的行函數
function findMatchingRows(searchContent) {
  const rows = document.querySelectorAll('tr');
  
  // 先找出第一個 td 內容相符的所有行
  const firstTdMatches = Array.from(rows).filter(row => {
    const cells = row.getElementsByTagName('td');
    if (cells.length === 0) return false;
    return cells[0].textContent.trim() === searchContent;
  });

  if (firstTdMatches.length === 0) return [];

  // 獲取第一個匹配行的完整內容作為比較基準
  const firstMatchFullContent = firstTdMatches[0].textContent.trim();

  // 在第一個 td 相符的行中，找出整列內容完全相同的行
  return firstTdMatches.filter(row => 
    row.textContent.trim() === firstMatchFullContent
  );
}

// 修改預覽顯示函數，添加匹配資訊
function showPreview(matchedRows) {
  const previewContent = document.getElementById('preview-content');
  if (matchedRows.length === 0) {
    previewContent.innerHTML = '<p style="color: red;">沒有找到相符的資料</p>';
    return;
  }

  const searchContent = document.getElementById('search-content').value.trim();
  const firstTdMatches = document.querySelectorAll('tr td:first-child').length;

  previewContent.innerHTML = `
    <p>商品名稱 "${searchContent}" 找到 ${firstTdMatches} 筆資料</p>
    <p>其中完全相同的資料有 ${matchedRows.length} 筆：</p>
    <div class="preview-table" style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="padding: 5px; border-bottom: 2px solid #ddd;">商品名稱</th>
            <th style="padding: 5px; border-bottom: 2px solid #ddd;">數值1</th>
            <th style="padding: 5px; border-bottom: 2px solid #ddd;">數值2</th>
            <th style="padding: 5px; border-bottom: 2px solid #ddd;">數值3</th>
          </tr>
        </thead>
        <tbody>
          ${matchedRows.map(row => `
            <tr>
              ${Array.from(row.getElementsByTagName('td')).map(cell => 
                `<td style="padding: 5px; border-bottom: 1px solid #eee;">${cell.textContent.trim()}</td>`
              ).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// 執行批量替換
function batchReplace(matchedRows, replaceContent) {
  matchedRows.forEach(row => {
    const cells = row.getElementsByTagName('td');
    if (cells.length > 0) {
      const oldContent = cells[0].textContent.trim();
      cells[0].textContent = replaceContent;
      cells[0].classList.add('modified-cell');

      // 添加到修改記錄
      changeLog.push({
        orderId: row.querySelector('[data-order-id]')?.dataset.orderId || '未知訂單',
        timestamp: new Date().toLocaleString(),
        changes: [`商品名稱: ${oldContent} -> ${replaceContent}`]
      });
    }
  });

  // 更新修改記錄視窗
  updateChangeLog();
}

// 關閉批量替換模態框
function closeBatchReplaceModal() {
  const modal = document.querySelector('.batch-replace-modal');
  const backdrop = document.querySelector('.modal-backdrop');
  if (modal) modal.remove();
  if (backdrop) backdrop.remove();
} 