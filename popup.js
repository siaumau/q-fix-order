document.getElementById('single-edit-btn').addEventListener('click', function() {
  // 向當前標籤頁發送消息
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "enableSingleEdit"});
  });
  // 關閉 popup
  window.close();
});

document.getElementById('batch-replace-btn').addEventListener('click', function() {
  // 向當前標籤頁發送消息
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "showBatchReplace"});
  });
  // 關閉 popup
  window.close();
}); 