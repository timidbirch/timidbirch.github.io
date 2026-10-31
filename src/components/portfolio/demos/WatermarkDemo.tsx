import { useState } from 'react'
const source = '/media/projects/pimog/experiment-strip.png'
const panels = [
  { zh: '原始图像', en: 'Original', noteZh: '水印嵌入前的输入图像', noteEn: 'The input image before embedding' },
  { zh: '嵌入水印', en: 'Embedded', noteZh: '编码器输出，保留原图视觉内容', noteEn: 'Encoder output preserves the visual content' },
  {
    zh: '模拟拍摄',
    en: 'Capture noise',
    noteZh: '透视、光照、摩尔纹与高斯噪声共同作用',
    noteEn: 'Perspective, illumination, moiré and Gaussian noise',
  },
  {
    zh: '梯度掩码',
    en: 'Gradient mask',
    noteZh: '依据消息损失梯度构建的空间权重',
    noteEn: 'Spatial weights derived from the message-loss gradient',
  },
  {
    zh: '放大残差',
    en: 'Residual ×5',
    noteZh: '嵌入图与原图的差异，放大 5 倍显示',
    noteEn: 'The difference between embedded and original images, amplified 5×',
  },
]
function Panel({ index, className = '' }: { index: number; className?: string }) {
  return (
    <div className={`watermark-panel ${className}`}>
      <img src={source} alt={panels[index].en} width="640" height="128" style={{ transform: `translateX(-${index * 20}%)` }} />
    </div>
  )
}
export default function WatermarkDemo({ en = false }: { en?: boolean }) {
  const [split, setSplit] = useState(50)
  const [selected, setSelected] = useState(2)
  const t = (zh: string, english: string) => (en ? english : zh)
  return (
    <div className="project-lab watermark-lab" data-demo-capture="pimog">
      <div className="lab-topbar">
        <span className="lab-brand">
          PIMoG<span> / IMAGE LAB</span>
        </span>
        <span className="lab-status">{t('真实实验文件', 'Original experiment artifact')}</span>
      </div>
      <div className="watermark-layout">
        <div className="watermark-comparison">
          <div className="comparison-stage">
            <Panel index={selected} />
            <div className="comparison-overlay" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
              <Panel index={0} />
            </div>
            <div className="comparison-divider" style={{ left: `${split}%` }}>
              <span aria-hidden="true">↔</span>
            </div>
            <span className="image-label image-label-left">{t('原图', 'Original')}</span>
            <span className="image-label image-label-right">{en ? panels[selected].en : panels[selected].zh}</span>
          </div>
          <label className="comparison-control">
            <span>{t('拖动，对比图像变化', 'Drag to compare the images')}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={split}
              onChange={(e) => setSplit(Number(e.target.value))}
              aria-label={t('图像对比分隔位置', 'Image comparison position')}
            />
          </label>
        </div>
        <div className="watermark-detail">
          <span className="lab-kicker">SCREEN → CAMERA → MESSAGE</span>
          <h3>{t('看见水印，\n也看见失真。', 'A watermark.\nA capture channel.')}</h3>
          <p className="lab-muted">
            {t(
              '点击切换实验输出，再拖动分隔线与原图比较。全部五张图来自同一份原始实验结果。',
              'Choose an experiment output and compare it with the original. All five panels come from the same archived result.'
            )}
          </p>
          <div className="artifact-switch" role="group" aria-label={t('选择实验输出', 'Experiment output')}>
            {panels.slice(1).map((panel, index) => (
              <button type="button" key={panel.en} aria-pressed={selected === index + 1} onClick={() => setSelected(index + 1)}>
                <span>0{index + 1}</span>
                {en ? panel.en : panel.zh}
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
          <p className="artifact-note" aria-live="polite">
            {en ? panels[selected].noteEn : panels[selected].noteZh}
          </p>
          <span className="lab-source-note">
            images_embed_99/29.png
            <br />
            {t('原始尺寸：每张 128 × 128 px', 'Native resolution: 128 × 128 px per panel')}
          </span>
        </div>
      </div>
      <div className="watermark-strip">
        {panels.map((panel, index) => (
          <figure key={panel.en}>
            <Panel index={index} />
            <figcaption>
              0{index + 1} / {en ? panel.en : panel.zh}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
