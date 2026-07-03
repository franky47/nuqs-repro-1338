'use client'

import { parseAsBoolean, useQueryState } from 'nuqs'
import { useState, useTransition, ViewTransition } from 'react'

export default function HomePage() {
  return (
    <main style={{ display: 'flex', gap: '4rem' }}>
      <NativeState />
      <QueryState />
    </main>
  )
}

function NativeState() {
  const [on, setOn] = useState(false)
  const [, startTransition] = useTransition()
  return (
    <Section
      title="useState"
      on={on}
      prefix="native"
      onToggle={() => startTransition(() => setOn(prev => !prev))}
    />
  )
}

function QueryState() {
  const [on, setOn] = useQueryState('on', parseAsBoolean.withDefault(false))
  const [, startTransition] = useTransition()
  return (
    <Section
      title="useQueryState"
      on={on}
      prefix="query"
      onToggle={() => startTransition(() => setOn(prev => !prev))}
    />
  )
}

function Section(props: {
  title: string
  prefix: string
  on: boolean
  onToggle: () => void
}) {
  const { title, prefix, on, onToggle } = props
  return (
    <section>
      <h2>{title}</h2>
      {on ? (
        <ViewTransition name={`${prefix}-on`}>
          <p>ON</p>
        </ViewTransition>
      ) : (
        <ViewTransition name={`${prefix}-off`}>
          <p>OFF</p>
        </ViewTransition>
      )}
      <button data-testid={`${prefix}-toggle`} onClick={onToggle}>
        Toggle
      </button>
    </section>
  )
}
