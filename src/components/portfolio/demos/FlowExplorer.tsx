import { useState } from 'react'

type Step = { label: [string, string]; title: [string, string]; description: [string, string]; file: string; code: string }
const flows: Record<string, { name: string; subtitle: [string, string]; steps: Step[] }> = {
  'ragfuzz': {
    name: 'RAGFUZZ',
    subtitle: ['点击阶段，查看输入、上下文与真实驱动片段。', 'Select a stage to inspect inputs, context, and a real archived driver.'],
    steps: [
      {
        label: ['接口分析', 'API analysis'],
        title: ['先让接口变得可描述。', 'Make an API describable.'],
        description: [
          'libclang 从 C/C++ 语法树提取签名、参数类型、结构体定义与调用关系，为生成过程建立边界。',
          'libclang extracts signatures, parameter types, structure definitions, and call relationships from C/C++ syntax trees.',
        ],
        file: 'infra/ast_helper_anza.py',
        code: 'C/C++ source\n  ↓ libclang AST\nFunction signature\nReturn type + parameters\nStructure definitions\nCallers / callees\n  ↓\n*_func.json + *_db.json',
      },
      {
        label: ['代码检索', 'Code retrieval'],
        title: ['把真实用法带入上下文。', 'Bring real usage into context.'],
        description: [
          '源码与示例经过切片，形成带函数与来源信息的文档，再从 Chroma 中检索最多三个相关片段。',
          'Source and example slices become documents with function and source metadata. Chroma retrieves up to three relevant snippets.',
        ],
        file: 'infra/rag_helper_anza.py',
        code: 'Source + examples\n  ↓ backward slicing\nLangChain Documents\n  ↓ embeddings\nPersistent Chroma store\n  ↓ similarity_search\nUp to 3 relevant code snippets',
      },
      {
        label: ['生成驱动', 'Driver generation'],
        title: ['生成可进入编译环节的驱动。', 'A driver, ready for the build stage.'],
        description: [
          '下方为 tinyxml2 的 Success 目录中保存的真实驱动片段，展示参数构造与目标接口调用。',
          'Below is a real driver excerpt from the archived tinyxml2 Success directory, showing parameter setup and the target API call.',
        ],
        file: 'Success/xmltest_tinyxml2_163.cpp',
        code: '#include "tinyxml2/tinyxml2.h"\n#include <stdint.h>\n#include <stdlib.h>\n\nextern "C" int LLVMFuzzerTestOneInput(\n    const uint8_t *data, size_t size) {\n  tinyxml2::StrPair strPair1;\n  tinyxml2::StrPair strPair2;\n\n  strPair1.SetStr(\n    reinterpret_cast<const char*>(data),\n    static_cast<int>(size));\n  strPair1.TransferTo(&strPair2);\n  return 0;\n}',
      },
      {
        label: ['编译与测试', 'Build & test'],
        title: ['让生成结果接受工具链检验。', 'Let the toolchain check the output.'],
        description: [
          'Docker 中的编译环节筛选驱动，失败时有限重试。提示词与尝试分开归档，再衔接运行、复现与覆盖率采集。',
          'Docker compilation screens drivers, with bounded regeneration after failure. Prompts and attempts are archived before fuzzing, reproduction, and coverage collection.',
        ],
        file: 'infra/helper_anza.py',
        code: 'Generated driver\n  ↓ Docker / AddressSanitizer\nCompilation check\n  ├─ pass → Success/\n  └─ fail → Fail/ + bounded retry\n\nSaved prompts → Prom/\nFuzzer execution → coverage report',
      },
    ],
  },
  'mimic-talker': {
    name: 'Mimic-Talker',
    subtitle: ['流程导览：文本、语音与人物视频如何衔接。', 'Pipeline explorer: how text, speech, and portrait video connect.'],
    steps: [
      {
        label: ['文本输入', 'Text'],
        title: ['一句话，是整个流程的起点。', 'A sentence starts the pipeline.'],
        description: [
          '将文本作为待表达内容输入，后续模块分别负责声音和人物动态。这里展示模块关系，不生成真实音视频。',
          'Text supplies the content. Subsequent modules provide speech and portrait motion. This explorer shows the pipeline without generating audio or video.',
        ],
        file: 'PIPELINE / INPUT',
        code: 'Input text\n  ↓\nSpeech content\n  + reference voice\n  ↓\nText-to-speech stage',
      },
      {
        label: ['语音合成', 'Speech'],
        title: ['先有声音，再驱动画面。', 'Speech comes before motion.'],
        description: [
          'F5-TTS 负责将文本转为语音。音频既是最终输出的一部分，也是下一阶段的人物动画输入。',
          'F5-TTS turns text into speech. The audio is both part of the final output and an input to portrait animation.',
        ],
        file: 'PIPELINE / F5-TTS',
        code: 'Text + voice reference\n  ↓ F5-TTS\nSynthesized audio\n  ↓\nSpeech waveform\nTiming / duration\nAudio input for animation',
      },
      {
        label: ['人物动态', 'Motion'],
        title: ['让语音与人物表现衔接。', 'Connect speech with portrait motion.'],
        description: [
          'AniTalker 结合人物图像与语音，构建动态人物视频。流程集成关注音频与视频模块之间的数据衔接。',
          'AniTalker combines a portrait image and speech for talking-head video. Integration connects audio outputs with animation inputs.',
        ],
        file: 'PIPELINE / AniTalker',
        code: 'Portrait image\n  + synthesized audio\n  ↓ AniTalker\nPortrait motion\n  ↓\nAnimated video frames',
      },
      {
        label: ['视频输出', 'Video'],
        title: ['把多个生成模块交付为一个结果。', 'Deliver one result from multiple models.'],
        description: [
          '将声音与人物动态组织为可观看的视频，回顾整条链路中每个模块的输入与输出。',
          'Combine speech and portrait motion in a viewable video, keeping the inputs and outputs of each stage understandable.',
        ],
        file: 'PIPELINE / OUTPUT',
        code: 'Synthesized speech\n  + portrait animation\n  ↓\nVoiced portrait video\n\nText → audio → motion → video',
      },
    ],
  },
  'holdem': {
    name: 'Vesper',
    subtitle: ['从共享规则出发，探索经典联机、策略 AI 与挑战闯关。', 'Explore shared rules, Classic multiplayer, strategy AI, and the Challenge circuit.'],
    steps: [
      {
        label: ['规则引擎', 'Rules'],
        title: ['一套规则，两种玩法。', 'One foundation, two ways to play.'],
        description: [
          '纯 C# 的 Poker.Core 管理 2–8 人牌桌的合法行动、下注、主池／边池和结算。经典与挑战共用扑克基础，闯关通过独立适配层扩展。',
          'Pure C# Poker.Core handles legal actions, betting, main/side pots, and settlement for 2–8 seats. Classic and Challenge share poker foundations, with explicit adapters for runs.',
        ],
        file: 'ARCHITECTURE / Poker.Core',
        code: 'Poker.Core · cards / evaluator / betting\n  ↓\nClassic · 2–8 seats\nOffline practice / private multiplayer\n  +\nPoker.Challenge · explicit adapters\nRoutes / objectives / rewards / saves',
      },
      {
        label: ['实时联机', 'Multiplayer'],
        title: ['以服务端状态为共同事实。', 'A shared authoritative table state.'],
        description: [
          '通过 WebSocket 和牌桌串行命令队列处理行动，区分公开桌面信息与玩家私有信息，并支持重连后的状态恢复。',
          'WebSocket and a serialized per-table command queue process actions. Public and private state are separated, with snapshots supporting reconnection.',
        ],
        file: 'ARCHITECTURE / Poker.Protocol',
        code: 'Player command\n  ↓ WebSocket\nSerialized table queue\n  ↓ Poker.Core validation\nPublic table snapshot\nPrivate player snapshot\n  ↓\nUnity client presentation',
      },
      {
        label: ['策略 AI', 'Strategy AI'],
        title: ['把概率估计变成行动选择。', 'Turn probability into an action.'],
        description: [
          'Hard Bot 结合位置、蒙特卡洛胜率、底池赔率、牌面结构与筹码底池比，在合法行动中做决策。',
          'The Hard bot combines position, Monte Carlo equity, pot odds, board texture, and stack-to-pot ratio to choose among legal actions.',
        ],
        file: 'ARCHITECTURE / BOT POLICY',
        code: 'Public state + own cards\n  ↓\nPosition / preflop policy\nMonte Carlo equity\nPot odds / board texture / SPR\n  ↓\nChoose a legal action',
      },
      {
        label: ['挑战与呈现', 'Challenge & UI'],
        title: ['四桌闯关，共享一张海岸牌桌。', 'Four encounters, one shared coastal table.'],
        description: [
          '四桌路线、目标与奖励通向会根据公开行动调整策略的 Mirror 对手。海岸木屋主题、围桌人物、逐池派奖与结算凭单复用同一套 Unity 表现系统。',
          'A four-table route with objectives and rewards leads to The Mirror, which adapts to public actions. The coastal lodge, seated cast, per-pot payouts, and receipt use the shared Unity presentation.',
        ],
        file: 'ARCHITECTURE / CHALLENGE + UNITY',
        code: 'Route → encounter → reward\n  ↓ four tables\nThe Mirror · public-action adaptation\n  ↓\nSafe-boundary checkpoint / backup\n\nShared coastal UI · EN / 中文\nPer-pot payouts · Reduced motion',
      },
    ],
  },
}
export default function FlowExplorer({ project, en = false }: { project: string; en?: boolean }) {
  const flow = flows[project]
  const [selected, setSelected] = useState(project === 'ragfuzz' ? 2 : 0)
  const step = flow.steps[selected]
  const index = en ? 1 : 0
  return (
    <div className={`project-lab flow-lab flow-${project}`} data-demo-capture={project}>
      <div className="lab-topbar">
        <span className="lab-brand">
          {flow.name}
          <span> / {project === 'ragfuzz' ? 'SOURCE EXPLORER' : 'PIPELINE EXPLORER'}</span>
        </span>
        <span className="lab-status">{en ? 'Select a stage' : '点击阶段查看'}</span>
      </div>
      <div className="flow-stage-nav" role="group" aria-label={en ? 'Pipeline stage' : '流程阶段'}>
        {flow.steps.map((s, i) => (
          <button type="button" key={s.file} aria-pressed={selected === i} onClick={() => setSelected(i)}>
            <span>0{i + 1}</span>
            <strong>{s.label[index]}</strong>
            <i aria-hidden="true">{i === flow.steps.length - 1 ? '◉' : '→'}</i>
          </button>
        ))}
      </div>
      <div className="flow-detail">
        <div className="flow-description">
          <span className="lab-kicker">STEP 0{selected + 1} / 04</span>
          <h3>{step.title[index]}</h3>
          <p className="lab-muted">{step.description[index]}</p>
          {project === 'mimic-talker' && (
            <div className="audio-concept" aria-hidden="true">
              {Array.from({ length: 36 }, (_, i) => (
                <i key={i} style={{ height: `${Math.round(12 + Math.abs(Math.sin(i * 1.7)) * 48)}px` }} />
              ))}
            </div>
          )}
          <div className="flow-small-nav">
            <button type="button" disabled={selected === 0} onClick={() => setSelected(selected - 1)}>
              ← {en ? 'Previous' : '上一步'}
            </button>
            <button type="button" disabled={selected === 3} onClick={() => setSelected(selected + 1)}>
              {en ? 'Next' : '下一步'} →
            </button>
          </div>
          <p className="lab-source-note">{flow.subtitle[index]}</p>
        </div>
        <div className="source-window">
          <div className="source-window-title">
            <span className="window-dots" aria-hidden="true">
              ● ● ●
            </span>
            <span>{step.file}</span>
          </div>
          <span className="source-kind">
            {project === 'ragfuzz' && selected === 2
              ? en
                ? 'ARCHIVED DRIVER EXCERPT'
                : '归档驱动片段'
              : en
                ? 'CONCEPTUAL FLOW · NO EXECUTION'
                : '流程示意 · 不执行代码'}
          </span>
          <pre aria-label={en ? 'Stage detail' : '阶段内容'}>
            <code>{step.code}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
