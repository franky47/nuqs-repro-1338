import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { PropsWithChildren, Suspense } from 'react'

// Instrumentation: wrap document.startViewTransition to detect whether the
// DOM mutation happens inside the transition's update callback (animates)
// or before it (old & new snapshots identical -> nothing to animate).
const instrumentation = `
window.__vtLog = [];
const read = () =>
  Array.from(document.querySelectorAll('section p'), p => p.textContent).join(' / ');
const report = () => {
  const el = document.getElementById('vt-log');
  if (!el) return;
  el.textContent = window.__vtLog
    .map((e, i) => {
      const verdict =
        e.before === e.after
          ? '⚠️ no-op: DOM was mutated BEFORE the transition'
          : '✅ DOM mutated inside the transition';
      return '#' + (i + 1) + ' [' + e.before + '] -> [' + e.after + '] ' + verdict;
    })
    .join('\\n');
};
const orig = Document.prototype.startViewTransition;
if (orig) {
  Document.prototype.startViewTransition = function (arg) {
    const entry = { before: read(), after: '(pending)' };
    window.__vtLog.push(entry);
    const cb = typeof arg === 'function' ? arg : arg && arg.update;
    const wrapped = async () => {
      const res = await (cb && cb());
      entry.after = read();
      report();
      return res;
    };
    return orig.call(this, typeof arg === 'function' ? wrapped : { ...arg, update: wrapped });
  };
}
`

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html>
      <head>
        <script dangerouslySetInnerHTML={{ __html: instrumentation }} />
      </head>
      <body style={{ fontFamily: 'sans-serif', margin: '2rem' }}>
        <NuqsAdapter>
          <Suspense>{children}</Suspense>
        </NuqsAdapter>
        <h3>startViewTransition calls</h3>
        <pre id="vt-log">(none yet)</pre>
      </body>
    </html>
  )
}
