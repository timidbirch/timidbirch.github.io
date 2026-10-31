import { useState } from 'react'
export default function SecurityDemo({ en = false }: { en?: boolean }) {
  const t = (zh: string, english: string) => (en ? english : zh)
  const [connected, setConnected] = useState(false)
  const [pending, setPending] = useState(false)
  const [logs, setLogs] = useState<string[]>(['[DEMO] Interface ready. No live endpoint connected.'])
  const add = (line: string) => setLogs((current) => [...current.slice(-7), line])
  return (
    <div className="project-lab security-lab" data-demo-capture="python-rat">
      <div className="lab-topbar">
        <span className="lab-brand">
          Python-RAT<span> / INTERFACE STUDY</span>
        </span>
        <span className="lab-status">{t('界面重建 · 本地模拟', 'Interface recreation · local simulation')}</span>
      </div>
      <div className="security-layout">
        <div className="control-panel">
          <div className="desktop-title">
            <span className="window-dots" aria-hidden="true">
              ● ● ●
            </span>
            <span>{t('远程管理控制面板', 'Remote administration panel')}</span>
            <span>demo</span>
          </div>
          <div className="control-inner">
            <div className="control-state">
              <span className={`connection-dot ${connected ? 'is-on' : ''}`} />
              <span>{connected ? t('演示会话已连接', 'Demo session connected') : t('无演示会话', 'No demo session')}</span>
              <code>LOCAL FIXTURE</code>
            </div>
            <div className="security-actions">
              <button
                className="lab-primary"
                type="button"
                onClick={() => {
                  setConnected(!connected)
                  setPending(false)
                  add(connected ? '[SESSION] Demo session ended.' : '[SESSION] Demo fixture opened. No socket created.')
                }}
              >
                {connected ? t('结束演示会话', 'End demo session') : t('启动演示会话', 'Start demo session')}
              </button>
            </div>
            <span className="field-label">{t('常用操作', 'Common actions')}</span>
            <div className="security-buttons">
              <button type="button" disabled={!connected} onClick={() => add('[INFO] OS: Windows (fixture) · Host: DEMO-PC')}>
                {t('查看示例系统信息', 'Sample system info')}
              </button>
              <button type="button" disabled={!connected} onClick={() => add('[PROCESS] explorer.exe · demo-app.exe (fixture records)')}>
                {t('查看示例进程', 'Sample processes')}
              </button>
              <button
                type="button"
                disabled={!connected || pending}
                onClick={() => {
                  setPending(true)
                  add('[MONITOR] Sample event flagged. Awaiting a demo choice.')
                }}
              >
                {t('模拟监测事件', 'Simulate a monitor event')}
              </button>
            </div>
            <div className="terminal-output" role="log" aria-label={t('演示日志', 'Demo log')} aria-live="polite">
              {logs.map((line, index) => (
                <div key={index}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {line}
                </div>
              ))}
            </div>
            <p className="lab-source-note">
              {t(
                '参照 rat_gui.py 的连接控制、常用操作与响应区重建。',
                'Recreated from rat_gui.py: connection controls, common actions, and response panel.'
              )}
            </p>
          </div>
        </div>
        <aside className="protection-panel">
          <span className="lab-kicker">VISIBILITY & CONSENT</span>
          <div className="shield-mark" aria-hidden="true">
            ⌘
          </div>
          <h3>{t('从可操作，\n到可观察。', 'From control\nto visibility.')}</h3>
          <p className="lab-muted">
            {t(
              '原型通过进程与网络轮询发现可疑行为，以提示和日志让远程管理活动可见。',
              'The protection prototype polls processes and connections, making suspicious activity visible through prompts and logs.'
            )}
          </p>
          <div className={`consent-card ${pending ? 'is-pending' : ''}`}>
            <span className="mini-badge">{pending ? t('待确认', 'Awaiting a choice') : t('等待演示事件', 'Waiting for a demo event')}</span>
            <strong>
              {pending
                ? t('发现一条示例监测事件', 'A sample monitor event was flagged')
                : t('操作提示与审计记录', 'Prompts and audit records')}
            </strong>
            <p>{t('点击“模拟监测事件”，体验允许／拒绝的日志变化。', 'Choose “Simulate a monitor event” to explore allow/deny logging.')}</p>
            <div className="consent-actions">
              <button
                type="button"
                disabled={!pending}
                onClick={() => {
                  setPending(false)
                  add('[AUDIT] User denied the sample event. No process was changed.')
                }}
              >
                {t('拒绝', 'Deny')}
              </button>
              <button
                type="button"
                disabled={!pending}
                onClick={() => {
                  setPending(false)
                  add('[AUDIT] User allowed the sample event. No action was executed.')
                }}
              >
                {t('允许', 'Allow')}
              </button>
            </div>
          </div>
          <p className="lab-source-note">
            {t(
              '所有连接、事件和日志均为示例；不会运行远程管理代码。',
              'Connections, events, and logs are fixtures. No remote-administration code runs.'
            )}
          </p>
        </aside>
      </div>
    </div>
  )
}
