const on = (eventType, listener) => {
  document.addEventListener(eventType, listener)
}

const off = (eventType, listener) => {
  document.removeEventListener(eventType, listener)
}

const once = (eventType, listener) => {
  const handleEventOnce = (event) => {
    listener(event)
    off(eventType, handleEventOnce)
  }
  on(eventType, handleEventOnce)
}

const emit = (eventType, data) => {
  const event = new CustomEvent(eventType, { detail: data })
  document.dispatchEvent(event)
}

export { on, once, off, emit }
