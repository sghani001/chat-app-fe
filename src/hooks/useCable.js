import { useEffect, useRef, useCallback } from 'react'
import { createConsumer } from '@rails/actioncable'
import { getToken } from '../lib/api'

export function useCable() {
  const consumerRef = useRef(null)

  useEffect(() => {
    const token = getToken()
    if (!token) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const consumer = createConsumer(`${protocol}//${host}/cable?token=${token}`)
    consumerRef.current = consumer

    return () => {
      consumer.disconnect()
      consumerRef.current = null
    }
  }, [])

  const subscribe = useCallback((identifier, onMessage) => {
    const consumer = consumerRef.current
    if (!consumer) return () => {}

    const channel = JSON.parse(identifier)
    const sub = consumer.subscriptions.create(channel, {
      received(data) { onMessage(data) }
    })

    return () => { sub.unsubscribe() }
  }, [])

  return { subscribe }
}