import { useState } from 'react'
const reports = [
  {
    id: 'market',
    zh: '市场技术',
    en: 'Market',
    file: 'market_report.md',
    titleZh: '先理解交易背景',
    titleEn: 'Start with market context',
    textZh: '示例：将价格、成交量和波动信息整理为市场背景，区分观察事实与待验证的解释。',
    textEn: 'Example: organize price, volume, and volatility into market context, keeping observations separate from interpretations.',
    inputs: 'price · volume · indicators',
  },
  {
    id: 'fundamentals',
    zh: '基本面',
    en: 'Fundamentals',
    file: 'fundamentals_report.md',
    titleZh: '拆开经营与估值问题',
    titleEn: 'Separate business from valuation',
    textZh: '示例：围绕收入、利润、现金流和估值建立研究问题，并为每个判断保留数据来源与日期。',
    textEn: 'Example: frame questions around revenue, earnings, cash flow, and valuation, retaining source and date for every observation.',
    inputs: 'financial statements · valuation',
  },
  {
    id: 'news',
    zh: '新闻事件',
    en: 'News',
    file: 'news_report.md',
    titleZh: '将事件放回时间线',
    titleEn: 'Put events on a timeline',
    textZh: '示例：按发布时间整理公告与新闻，将已确认事件、观点和仍待核实的信息分别记录。',
    textEn:
      'Example: organize announcements and news by publication time, separating confirmed events, opinions, and unverified information.',
    inputs: 'announcements · dated news',
  },
  {
    id: 'risk',
    zh: '风险复核',
    en: 'Risk review',
    file: 'investment_plan.md',
    titleZh: '让不同观点得到复核',
    titleEn: 'Give competing views a review',
    textZh: '示例：归纳多空论据、关键假设和风险来源，列出研究结论成立所需的条件与下一步验证事项。',
    textEn:
      'Example: assemble bull/bear arguments, assumptions, and risks, then state the conditions and follow-up checks behind a research conclusion.',
    inputs: 'bull / bear debate · assumptions',
  },
]
export default function ResearchDemo({ en = false }: { en?: boolean }) {
  const t = (zh: string, english: string) => (en ? english : zh)
  const [selected, setSelected] = useState(reports.map((r) => r.id))
  const [assembled, setAssembled] = useState(reports.map((r) => r.id))
  const [active, setActive] = useState('market')
  const [notice, setNotice] = useState('')
  const visible = reports.filter((r) => assembled.includes(r.id))
  const report = visible.find((r) => r.id === active) || visible[0]
  const content =
    '# TradingAgents — portfolio sample\n\nFictional fixture. No market data or model execution.\n\n' +
    visible.map((r) => `## ${en ? r.en : r.zh}\n\n${en ? r.textEn : r.textZh}`).join('\n\n')
  const assemble = () => {
    setAssembled(selected)
    setActive(selected[0])
    setNotice(t(`已组合 ${selected.length} 个示例报告模块。`, `${selected.length} sample report modules assembled.`))
  }
  return (
    <div className="project-lab research-lab" data-demo-capture="tradingagents">
      <div className="lab-topbar">
        <span className="lab-brand">
          TradingAgents<span> / RESEARCH DESK</span>
        </span>
        <span className="lab-status">{t('报告交互演示 · 预设内容', 'Report interaction · preset content')}</span>
      </div>
      <div className="research-layout">
        <aside className="research-config">
          <span className="lab-kicker">RESEARCH CONFIGURATION</span>
          <h3>{t('从信息，\n到研究材料。', 'From information\nto research material.')}</h3>
          <div className="sample-symbol">
            <span>{t('虚构研究标的', 'Fictional research subject')}</span>
            <strong>DEMO / Northstar</strong>
            <small>{t('展示报告结构，无真实行情', 'Report structure only · no live data')}</small>
          </div>
          <fieldset>
            <legend>{t('参与报告的模块', 'Report modules')}</legend>
            {reports.map((r) => (
              <label key={r.id}>
                <input
                  type="checkbox"
                  checked={selected.includes(r.id)}
                  onChange={() =>
                    setSelected(
                      selected.includes(r.id)
                        ? selected.filter((id) => id !== r.id)
                        : reports.filter((x) => selected.includes(x.id) || x.id === r.id).map((x) => x.id)
                    )
                  }
                />
                {en ? r.en : r.zh}
              </label>
            ))}
          </fieldset>
          <button className="lab-primary" type="button" disabled={!selected.length} onClick={assemble}>
            {t('组合示例报告', 'Assemble sample report')} →
          </button>
          <p className="lab-muted">
            {t(
              '选择模块，观察最终报告的章节如何变化。这里不调用模型或金融数据接口。',
              'Choose modules to change the final report. This demo makes no model or financial-data requests.'
            )}
          </p>
        </aside>
        <div className="research-report">
          <div className="report-heading">
            <span className="lab-kicker">MODULAR RESEARCH REPORT</span>
            <span className="mini-badge">FIXTURE / DEMO</span>
          </div>
          <h4>{t('一份能回顾研究过程的报告。', 'A report you can reason through.')}</h4>
          <div className="research-flow">
            <span>01 / {t('数据', 'Sources')}</span>
            <i>→</i>
            <span>02 / {t('分析', 'Analysis')}</span>
            <i>→</i>
            <span>03 / {t('复核', 'Review')}</span>
            <i>→</i>
            <span>04 / {t('报告', 'Report')}</span>
          </div>
          <div className="report-tabs" role="group" aria-label={t('查看报告章节', 'Report section')}>
            {visible.map((r) => (
              <button key={r.id} type="button" aria-pressed={report.id === r.id} onClick={() => setActive(r.id)}>
                {en ? r.en : r.zh}
              </button>
            ))}
          </div>
          <div className="report-paper" aria-live="polite">
            <div className="report-file">
              <span>{report.file}</span>
              <span>Markdown</span>
            </div>
            <h5>{en ? report.titleEn : report.titleZh}</h5>
            <p>{en ? report.textEn : report.textZh}</p>
            <div className="report-evidence">
              <span>INPUTS</span>
              <code>{report.inputs}</code>
            </div>
            <div className="report-checklist">
              <div>
                <span>↗</span>
                {t('保留数据来源与分析日期', 'Keep source and analysis date')}
              </div>
              <div>
                <span>↗</span>
                {t('拆分事实、假设与结论', 'Separate facts, assumptions, and conclusions')}
              </div>
              <div>
                <span>↗</span>
                {t('分模块归档，便于复核与导出', 'Archive modules for review and export')}
              </div>
            </div>
          </div>
          <div className="report-footer">
            <span role="status">{notice || t('试试切换模块，或导出这份示例。', 'Switch sections or export this sample.')}</span>
            <a
              className="report-download"
              href={`data:text/markdown;charset=utf-8,${encodeURIComponent(content)}`}
              download="tradingagents-portfolio-sample.md"
            >
              {t('下载示例 .md', 'Download sample .md')} ↓
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
