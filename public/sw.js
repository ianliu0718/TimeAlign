/*
  Basic Service Worker for Web Push notifications
*/

self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : {}
    const title = data.title || (self.registration && '通知')
    const options = {
      body: data.body || '',
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/icon-192.png',
      data: data.data || {},
      vibrate: [100, 50, 100],
    }
    // 同時向所有 clients 發送訊息，讓頁面可內嵌顯示
    event.waitUntil((async () => {
      try {
        const all = await clients.matchAll({ includeUncontrolled: true, type: 'window' })
        for (const c of all) {
          c.postMessage({ type: 'push', payload: { title, body: options.body, data: options.data } })
        }
      } catch (e) {}
      await self.registration.showNotification(title, options)
    })())
  } catch (e) {
    // Fallback if payload is string
    const text = event.data ? event.data.text() : '新通知'
    event.waitUntil(self.registration.showNotification('通知', { body: text }))
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification && event.notification.data && event.notification.data.url) || '/'
  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true })
    let found = null
    for (const c of allClients) {
      if (c.url && c.url.includes(url)) { found = c; break }
    }
    if (found) {
      found.focus()
    } else {
      await clients.openWindow(url)
    }
  })())
})
