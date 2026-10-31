import { useState } from 'react'

type Booking = { route: number; day: number; slot: number; boarded: boolean }
const routes = [
  { zh: '本部 → 网安基地', en: 'Main campus → Cybersecurity campus' },
  { zh: '网安基地 → 本部', en: 'Cybersecurity campus → Main campus' },
]
const times = ['08:00', '12:30', '17:30']

export default function BusDemo({ en = false }: { en?: boolean }) {
  const t = (zh: string, english: string) => (en ? english : zh)
  const [role, setRole] = useState(0)
  const [route, setRoute] = useState(0)
  const [day, setDay] = useState(0)
  const [slot, setSlot] = useState(0)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [token, setToken] = useState('')
  const [message, setMessage] = useState('')
  const [receipt, setReceipt] = useState(false)
  const baseSeats = day === 0 ? [18, 0, 9] : [12, 7, 0]
  const matches = (index: number) => booking?.route === route && booking.day === day && booking.slot === index
  const seats = (index: number) => baseSeats[index] - (matches(index) ? 1 : 0)
  const totalReserved = 40 - seats(slot)
  const totalBoarded = Math.min(14, totalReserved - 1) + (matches(slot) && booking?.boarded ? 1 : 0)
  const changeRole = (index: number) => {
    setRole(index)
    setMessage('')
    setReceipt(false)
  }
  const reserve = () => {
    if (booking || seats(slot) <= 0) return
    setBooking({ route, day, slot, boarded: false })
    setMessage(
      t('预约成功。切换司机视角，输入 DEMO-008 可体验核验。', 'Reserved. Switch to Driver and enter DEMO-008 to try boarding verification.')
    )
  }
  const verify = () => {
    if (!booking) {
      setMessage(t('请先在师生视角创建一条演示预约。', 'Create a demo reservation in the Passenger view first.'))
      return
    }
    if (!matches(slot)) {
      setMessage(t('请选择预约对应的路线、日期和班次。', 'Select the route, day, and departure on the reservation.'))
      return
    }
    if (token.trim() !== 'DEMO-008') {
      setMessage(t('演示验证码不匹配，请输入 DEMO-008。', 'Token does not match. Enter DEMO-008.'))
      return
    }
    if (booking.boarded) {
      setMessage(t('该演示预约已核验，无需重复签到。', 'This demo reservation has already been verified.'))
      return
    }
    setBooking({ ...booking, boarded: true })
    setMessage(t('核验成功，预约已更新为已上车。', 'Verified. Reservation status updated to Boarded.'))
  }
  return (
    <div className="project-lab bus-lab" data-demo-capture="ncc-bus">
      <div className="lab-topbar">
        <span className="lab-brand">
          NCC<span>BUS</span>
        </span>
        <span className="lab-status">{t('浏览器演示 · 示例数据', 'Browser adaptation · sample data')}</span>
      </div>
      <div className="bus-layout">
        <aside className="lab-sidebar">
          <span className="lab-kicker">CAMPUS MOBILITY</span>
          <h3>{t('同一班车，\n三个视角。', 'One shuttle.\nThree perspectives.')}</h3>
          <div className="role-switch" role="group" aria-label={t('切换演示角色', 'Demo role')}>
            {[t('师生预约', 'Passenger'), t('司机工作台', 'Driver'), t('管理员', 'Administrator')].map((label, index) => (
              <button key={label} type="button" aria-pressed={role === index} onClick={() => changeRole(index)}>
                <span>0{index + 1}</span>
                {label}
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
          <p className="lab-muted">
            {t(
              '依据原小程序的 WXML 页面与交互流程重建。试着完成一次预约，再切换角色查看变化。',
              'Adapted from the original WXML screens and interaction flow. Make a reservation, then switch roles to follow it.'
            )}
          </p>
          <div className="lab-source-note">
            student-reservation
            <br />
            driver-home · admin-home
          </div>
        </aside>
        <div className="bus-workspace">
          <div className="workspace-heading">
            <div>
              <span className="lab-kicker">{role === 0 ? 'RESERVATION' : role === 1 ? 'BOARDING' : 'OPERATIONS'}</span>
              <h4>
                {
                  [
                    t('下一站，校园。', 'Your next campus stop.'),
                    t('让每次上车有序发生。', 'Every boarding, accounted for.'),
                    t('路线与班次，一目了然。', 'Routes and departures at a glance.'),
                  ][role]
                }
              </h4>
            </div>
            <span className="mini-badge">{t('演示模式', 'DEMO MODE')}</span>
          </div>
          {role < 2 ? (
            <>
              <div className="bus-form-row">
                <label>
                  {t('路线选择', 'Route')}
                  <select
                    value={route}
                    onChange={(e) => {
                      setRoute(Number(e.target.value))
                      setMessage('')
                    }}
                  >
                    {routes.map((r, i) => (
                      <option key={i} value={i}>
                        {en ? r.en : r.zh}
                      </option>
                    ))}
                  </select>
                </label>
                <div>
                  <span className="field-label">{t('日期选择', 'Day')}</span>
                  <div className="day-switch">
                    {[t('今天', 'Today'), t('明天', 'Tomorrow')].map((label, index) => (
                      <button
                        type="button"
                        key={label}
                        aria-pressed={day === index}
                        onClick={() => {
                          setDay(index)
                          setSlot(0)
                          setMessage('')
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <span className="field-label">{t('班次选择', 'Departure')}</span>
              <div className="departure-grid">
                {times.map((time, index) => (
                  <button
                    type="button"
                    className="departure"
                    key={time}
                    aria-pressed={slot === index}
                    disabled={seats(index) <= 0}
                    onClick={() => {
                      setSlot(index)
                      setMessage('')
                    }}
                  >
                    <strong>{time}</strong>
                    <span>{seats(index) > 0 ? `${seats(index)} ${t('个余座', 'seats left')}` : t('已满', 'Full')}</span>
                  </button>
                ))}
              </div>
              {role === 0 ? (
                <>
                  <div className="bus-book-row">
                    <span className="passenger-pill">{t('学生乘客', 'Student passenger')}</span>
                    <button type="button" className="lab-primary" onClick={reserve} disabled={Boolean(booking) || seats(slot) <= 0}>
                      {booking ? t('已有演示预约', 'Reservation created') : t('立即预约', 'Reserve a seat')}{' '}
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                  <div className="booking-card">
                    <div className="booking-card-head">
                      <strong>{t('我的预约', 'My reservation')}</strong>
                      <span>{booking ? 'DEMO-008' : '—'}</span>
                    </div>
                    {booking ? (
                      <>
                        <p>{en ? routes[booking.route].en : routes[booking.route].zh}</p>
                        <div className="booking-meta">
                          <span>
                            {booking.day === 0 ? t('今天', 'Today') : t('明天', 'Tomorrow')} · {times[booking.slot]}
                          </span>
                          <span className="mini-badge">{booking.boarded ? t('已上车', 'Boarded') : t('待乘车', 'Awaiting boarding')}</span>
                        </div>
                        <div className="booking-actions">
                          <button type="button" onClick={() => setReceipt(!receipt)}>
                            {receipt ? t('收起凭证', 'Hide pass') : t('查看凭证', 'View boarding pass')}
                          </button>
                          {!booking.boarded && (
                            <button
                              type="button"
                              onClick={() => {
                                setBooking(null)
                                setReceipt(false)
                                setMessage(t('已取消，演示座位已恢复。', 'Cancelled. The demo seat is available again.'))
                              }}
                            >
                              {t('取消预约', 'Cancel reservation')}
                            </button>
                          )}
                        </div>
                        {receipt && (
                          <div className="demo-ticket">
                            <span>BOARDING PASS / DEMO</span>
                            <strong>DEMO-008</strong>
                            <small>{t('展示凭证，可在司机视角核验', 'Use this token in the Driver view')}</small>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="lab-muted">
                        {t('选择一个班次，创建你的第一条演示预约。', 'Select a departure to create your first demo reservation.')}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="seat-stats">
                    {[
                      [40, t('总座位', 'Capacity')],
                      [totalReserved, t('已预约', 'Reserved')],
                      [totalBoarded, t('已上车', 'Boarded')],
                    ].map(([n, label]) => (
                      <div key={label}>
                        <strong>{n}</strong>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="boarding-form">
                    <label>
                      {t('乘车验证码', 'Boarding token')}
                      <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="DEMO-008" autoComplete="off" />
                    </label>
                    <button className="lab-primary" type="button" onClick={verify}>
                      {t('核验乘车', 'Verify boarding')} →
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="admin-routes">
              {routes.map((r, index) => (
                <div className="admin-route" key={r.en}>
                  <div>
                    <span className="mini-badge">{t('运行中', 'Active')}</span>
                    <h5>{en ? r.en : r.zh}</h5>
                    <p>08:00 / 12:30 / 17:30</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRoute(index)
                      setRole(1)
                      setMessage('')
                    }}
                  >
                    {t('查看班次', 'View departures')} →
                  </button>
                </div>
              ))}
              <div className="admin-note">
                <strong>{t('预约 → 凭证 → 核验', 'Reservation → pass → boarding')}</strong>
                <p>
                  {t(
                    '三个视角共享本次演示中的预约状态。刷新页面即可重置。',
                    'The three views share reservation state for this demo. Reload the page to reset.'
                  )}
                </p>
              </div>
            </div>
          )}
          <div className="lab-feedback" role="status" aria-live="polite">
            {message || t('本地交互体验，不会创建真实班车预约。', 'Local interaction only. No real shuttle reservation is created.')}
          </div>
        </div>
      </div>
    </div>
  )
}
