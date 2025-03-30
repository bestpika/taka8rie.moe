/* 此程式為 Gemini 2.5 Pro 生成 */

(() => {
  // 獲取顯示倒數計時的 HTML 元素
  const countdownElement = document.getElementById('countdown')
  // 日本標準時間 (JST) 的 IANA 時區標識符
  const jstTimeZone = 'Asia/Tokyo'
  // JST 與 UTC 的時差（毫秒），用於計算目標時間戳
  const jstOffset = 9 * 60 * 60 * 1000 // 9 小時

  // 創建一個 Intl.DateTimeFormat 實例來獲取 JST 的日期部分
  const jstDateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: jstTimeZone,
    year: 'numeric',
    month: 'numeric', // 1-based month
    day: 'numeric',
  })

  // requestAnimationFrame 相關變數
  let lastUpdateTime = 0 // 上次更新時間的時間戳
  let animationFrameId = null // 保存 requestAnimationFrame 的 ID，以便可能取消

  // 計算並更新倒數計時顯示的函數
  function updateCountdownDisplay () {
    try {
      // 獲取當前時間
      const now = new Date()
      const nowUTC = now.getTime() // 當前 UTC 時間戳

      // 使用 Intl API 獲取當前在日本時區的年、月、日
      const parts = jstDateFormatter.formatToParts(now)
      let currentJstYear, currentJstMonth, currentJstDay
      parts.forEach(part => {
        if (part.type === 'year') currentJstYear = parseInt(part.value)
        if (part.type === 'month') currentJstMonth = parseInt(part.value) // 1-based
        if (part.type === 'day') currentJstDay = parseInt(part.value)
      })

      // 檢查今天是否是 2 月 27 日 (在日本時區)
      const isBirthdayToday = (currentJstMonth === 2 && currentJstDay === 27)

      if (isBirthdayToday) {
        // 如果是生日當天，顯示祝福語 (使用淺色文字，維持單行)
        countdownElement.textContent = '✨ 今天是高橋李依誕生日 ✨' // 使用 textContent 維持單行
        countdownElement.classList.add('has-text-light') // 確保生日文字也是淺色
        // 不需要再計算倒數或請求下一幀，循環會自然停止
        return true // 返回 true 表示已完成
      }

      // --- 計算下一個生日的目標日期 ---
      let targetYear = currentJstYear

      // 如果當前 JST 日期已經過了 2 月 27 日，目標年份設為明年
      if (currentJstMonth > 2 || (currentJstMonth === 2 && currentJstDay >= 27)) {
        targetYear++
      }

      // 設定目標日期時間 (UTC)：目標年份的 2 月 27 日 00:00:00 JST 的 UTC 時間戳
      const targetDateUTC = Date.UTC(targetYear, 1, 27, 0, 0, 0) - jstOffset // 月份是 0-indexed (1 = Feb)

      // 計算當前時間 (UTC) 與目標時間 (UTC) 的秒數差
      const diffSeconds = Math.max(0, Math.floor((targetDateUTC - nowUTC) / 1000))

      // --- 將總秒數差轉換為週、天、時、分、秒 ---
      const seconds = diffSeconds % 60
      const totalMinutes = Math.floor(diffSeconds / 60)
      const minutes = totalMinutes % 60
      const totalHours = Math.floor(totalMinutes / 60)
      const hours = totalHours % 24
      const totalDays = Math.floor(totalHours / 24)
      const days = totalDays % 7
      const weeks = Math.floor(totalDays / 7)

      // 更新頁面上的倒數計時顯示
      countdownElement.innerHTML = `誕生日還有 ${weeks} 週 ${days} 天 ${hours} 時 ${minutes} 分 ${seconds} 秒`
      return false // 返回 false 表示倒數仍在進行
    } catch (error) {
      console.error('計算倒數時發生錯誤:', error)
      countdownElement.textContent = '無法計算倒數' // 錯誤訊息使用 textContent
      countdownElement.classList.add('has-text-danger') // 錯誤訊息使用 Bulma 的危險色
      return true // 發生錯誤，也停止循環
    }
  }

  // requestAnimationFrame 的循環函數
  function animationLoop (currentTime) {
    // currentTime 是由 requestAnimationFrame 自動傳入的高精度時間戳

    if (!lastUpdateTime) {
      lastUpdateTime = currentTime
    }

    const elapsed = currentTime - lastUpdateTime

    // 控制更新頻率：大約每 1000 毫秒（1秒）才執行一次更新邏輯
    if (elapsed >= 1000) {
      const isFinished = updateCountdownDisplay() // 計算並更新 DOM
      lastUpdateTime = currentTime - (elapsed % 1000) // 校準下一次更新時間

      if (isFinished) {
        // 如果 updateCountdownDisplay 返回 true (生日或錯誤)，則停止循環
        animationFrameId = null
        return
      }
    }

    // 繼續請求下一幀動畫
    animationFrameId = window.requestAnimationFrame(animationLoop)
  }

  // --- 初始化 ---
  // 立即執行一次以顯示初始值 (避免顯示"計算中...")
  updateCountdownDisplay()

  // 啟動 requestAnimationFrame 循環 (如果尚未到生日)
  if (countdownElement.textContent !== '✨ 今天是高橋李依誕生日 ✨') {
    animationFrameId = window.requestAnimationFrame(animationLoop)
  }
})()
