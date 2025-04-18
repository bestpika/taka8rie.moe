/* 此程式為 Gemini 2.5 Pro 生成，並加入多語言支援、測試模式與煙火特效 */

(() => {
  // 獲取顯示倒數計時的 HTML 元素
  const countdownElement = document.getElementById('countdown')
  // 獲取煙火容器元素
  const fireworksContainer = document.getElementById('fireworks-container')
  // 日本標準時間 (JST) 的 IANA 時區標識符
  const jstTimeZone = 'Asia/Tokyo'
  // JST 與 UTC 的時差（毫秒），用於計算目標時間戳
  const jstOffset = 9 * 60 * 60 * 1000 // 9 小時

  // --- 讀取 URL 參數以啟用測試模式 ---
  const urlParams = new URLSearchParams(window.location.search)
  const isTestToday = urlParams.get('today') === 'true' // 檢查 ?today=true 是否存在

  // --- 煙火相關 ---
  let fireworksInstance = null // 保存煙火實例
  let fireworksStarted = false // 標記煙火是否已啟動

  // --- 多語言翻譯定義 ---
  const translations = {
    'zh-TW': {
      countdownPrefix: '誕生日還有',
      weeks: '週',
      days: '天',
      hours: '時',
      minutes: '分',
      seconds: '秒',
      birthdayMessage: '✨ 今天是高橋李依誕生日 ✨',
      errorMessage: '無法計算倒數'
    },
    'ja': {
      countdownPrefix: '誕生日まであと',
      weeks: '週間',
      days: '日',
      hours: '時間',
      minutes: '分',
      seconds: '秒',
      birthdayMessage: '✨ 今日は高橋李依さんの誕生日です ✨',
      errorMessage: 'カウントダウンを計算できません'
    },
    'en': { // 預設/備援語言
      countdownPrefix: 'Birthday in',
      weeks: 'weeks',
      days: 'days',
      hours: 'hours',
      minutes: 'minutes',
      seconds: 'seconds',
      birthdayMessage: '✨ Today is Rie Takahashi\'s Birthday ✨',
      errorMessage: 'Cannot calculate countdown'
    }
    // 可以繼續添加其他語言, 例如 'zh-CN'
  }

  // --- 選擇語言 ---
  let currentLang = 'en' // 預設為英文
  const browserLang = navigator.language // e.g., 'zh-TW'
  const baseLang = browserLang.split('-')[0] // e.g., 'zh'

  if (translations[browserLang]) {
    currentLang = browserLang
  } else if (translations[baseLang]) {
    // 如果找不到精確匹配 (例如 'en-US')，嘗試基礎語言 (例如 'en')
    currentLang = baseLang
  }
  // 取得選定語言的翻譯物件
  const t = translations[currentLang]

  // --- (其餘程式碼不變) ---

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

      // --- 修改判斷條件：加入 isTestToday 測試模式 ---
      const textLightClass = 'has-text-light'
      if (isBirthdayToday || isTestToday) {
        // 如果是生日當天，或啟用了測試模式，顯示祝福語 (使用選定的語言)
        countdownElement.textContent = t.birthdayMessage // 使用翻譯
        countdownElement.classList.add(textLightClass) // 確保生日文字也是淺色

        // --- 啟動煙火 ---
        if (!fireworksStarted && fireworksContainer) {
          console.log('Starting fireworks...') // 除錯訊息
          fireworksInstance = new Fireworks.default(fireworksContainer)
          fireworksInstance.start()
          fireworksStarted = true // 標記已啟動
        }

        // 不需要再計算倒數或請求下一幀，循環會自然停止
        return true // 返回 true 表示已完成
      } else if (fireworksStarted) {
        location.reload() // 過了生日就重整網頁
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

      // 更新頁面上的倒數計時顯示 (使用選定的語言)
      // 使用 textContent 因為我們不需要插入 HTML 標籤
      countdownElement.textContent = `${t.countdownPrefix} ${weeks} ${t.weeks} ${days} ${t.days} ${hours} ${t.hours} ${minutes} ${t.minutes} ${seconds} ${t.seconds}`
      return false // 返回 false 表示倒數仍在進行
    } catch (error) {
      console.error('計算倒數時發生錯誤:', error)
      countdownElement.textContent = t.errorMessage // 使用翻譯
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
  // 立即執行一次以顯示初始值 (避免顯示'計算中...')
  // 這次呼叫也可能觸發煙火 (如果 isTestToday=true 或剛好是生日)
  updateCountdownDisplay()

  // 啟動 requestAnimationFrame 循環 (如果尚未到生日或測試模式未啟用)
  // 檢查 updateCountdownDisplay 的初始執行結果是否已顯示生日訊息
  if (countdownElement.textContent !== t.birthdayMessage) {
    animationFrameId = window.requestAnimationFrame(animationLoop)
  }
})()
