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
    <div class="change-log-header">
      <h3>修改記錄 <span class="change-log-count"></span></h3>
      <button id="download-log-btn" class="download-btn">下載記錄</button>
    </div>
    <div id="change-log-content"></div>
  `;

  // 添加下載按鈕事件
  setTimeout(() => {
    const downloadBtn = modal.querySelector('#download-log-btn');
    if (downloadBtn) {
      downloadBtn.onclick = downloadChangeLog;
    }
  }, 0);

  return modal;
}

// 更新修改記錄
function updateChangeLog() {
  const logContent = document.getElementById('change-log-content');
  if (!logContent) return;

  // 更新通知數字
  let notification = document.querySelector('.change-log-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'change-log-notification';
    document.body.appendChild(notification);
  }
  notification.textContent = changeLog.length;
  notification.style.display = changeLog.length > 0 ? 'block' : 'none';

  // 更新修改記錄內容
  logContent.innerHTML = changeLog.map((log, index) => `
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
  `).join('');

  // 添加點擊展開/收合事件
  logContent.querySelectorAll('.change-log-item').forEach(item => {
    item.addEventListener('click', function() {
      this.classList.toggle('expanded');
    });
  });
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

  // 創建通知元素
  const notification = document.createElement('div');
  notification.className = 'change-log-notification';
  notification.style.display = 'none';
  document.body.appendChild(notification);
  
  console.log('插件初始化完成'); // 用於調試
}

// 確保在 DOM 完全加載後執行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePlugin);
} else {
  initializePlugin();
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

// 修改事件監聽中獲取訂單編號的部分
document.addEventListener('click', function(e) {
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
      // 使用新的方式獲取訂單編號
      const orderId = getOrderId(row);
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
        changes.push(`內容: ${oldValues.content} -><br> ${newValues.content}`);
      }
      if (oldValues.value1 !== newValues.value1) {
        changes.push(`數值1: ${oldValues.value1} -><br> ${newValues.value1}`);
      }
      if (oldValues.value2 !== newValues.value2) {
        changes.push(`數值2: ${oldValues.value2} -><br> ${newValues.value2}`);
      }
      if (oldValues.value3 !== newValues.value3) {
        changes.push(`數值3: ${oldValues.value3} -><br> ${newValues.value3}`);
      }

      if (changes.length > 0) {
        const orderId = document.getElementById('order-id-input').value;
        // 只有在能獲取到有效訂單編號時才記錄
        if (!orderId.startsWith('未知訂單')) {
          changeLog.push({
            orderId: orderId,
            timestamp: new Date().toLocaleString(),
            changes: changes
          });
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
    console.table(matchedRows);
    
    if (matchedRows.length === 0) {
      alert('沒有找到匹配的內容！');
      return;
    }

    if (confirm(`確定要替換這 ${matchedRows.length/2} 筆資料嗎？`)) {
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

// 修改預覽顯示函數，修正匹配資訊的計算
function showPreview(matchedRows) {
  const previewContent = document.getElementById('preview-content');
  if (matchedRows.length === 0) {
    previewContent.innerHTML = '<p style="color: red;">沒有找到相符的資料</p>';
    return;
  }

  const searchContent = document.getElementById('search-content').value.trim();
  // 修正：只計算第一欄內容相符的數量
  const firstTdMatches = Array.from(document.querySelectorAll('tr')).filter(row => {
    const firstCell = row.querySelector('td');
    return firstCell && firstCell.textContent.trim() === searchContent;
  }).length;

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

// 修改批量替換函數
function batchReplace(matchedRows, replaceContent) {
  matchedRows.forEach(row => {
    const cells = row.getElementsByTagName('td');
    if (cells.length > 0) {
      const oldContent = cells[0].textContent.trim();
      cells[0].textContent = replaceContent;
      cells[0].classList.add('modified-cell');

      // 使用新的方式獲取訂單編號
      const orderId = getOrderId(row);
      
      // 只有在能獲取到有效訂單編號時才記錄
      if (!orderId.startsWith('未知訂單')) {
        changeLog.push({
          orderId: orderId,
          timestamp: new Date().toLocaleString(),
          changes: [`商品名稱: ${oldContent} -> ${replaceContent}`]
        });
      }
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

// 添加下載修改記錄函數
function downloadChangeLog() {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // 設置標題
  doc.setFontSize(16);
  doc.text('修改記錄', pageWidth/2, 20, { align: 'center' });
  
  let yPosition = 40;
  const lineHeight = 7;

  // 添加每筆修改記錄
  changeLog.forEach((log, index) => {
    // 檢查是否需要新頁
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.text(`訂單編號: ${log.orderId}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`修改時間: ${log.timestamp}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text('修改內容:', 20, yPosition);
    yPosition += lineHeight;

    // 添加修改內容
    log.changes.forEach(change => {
      const lines = doc.splitTextToSize(change.replace(/<br>/g, ' → '), pageWidth - 40);
      lines.forEach(line => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 30, yPosition);
        yPosition += lineHeight;
      });
    });

    yPosition += lineHeight;
  });

  // 下載 PDF
  doc.save(`修改記錄_${new Date().toLocaleDateString()}.pdf`);
} 