/**
 * 预约文明之境 · 破茧 v0.3
 * scene-engine.js - 场景加载与分支叙事引擎
 * 
 * 职责：
 * 1. 管理场景数据（内嵌三个种子场景）
 * 2. 管理当前场景状态（当前节点、选择路径、对话历史）
 * 3. 驱动分支叙事（根据用户选择推进到下一个节点或结束）
 * 4. 收集用户洞察（用于映照报告生成）
 * 
 * 使用方式：
 *   const engine = new SceneEngine();
 *   engine.loadScenario('family_diary');
 *   const node = engine.getCurrentNode();
 *   engine.makeChoice(0); // 选择第一个选项
 */

class SceneEngine {
  constructor() {
    // ---------- 内嵌场景数据 ----------
    this.scenarios = [
      {
        id: 'family_diary',
        title: '二楼的书房',
        domain: '家庭伦理',
        role: '家长',
        dilemma: '隐私 vs 关爱',
        intro: '你是一位中年父亲。女儿小楠今年高三，距离高考只剩三个月。她近来寡言少语，房门总是关着。周六下午，你独自在家，经过她的房间时，发现抽屉没关严，露出一本带锁的日记本的一角。你站着，心跳微微加速。你想起自己十六岁那年，母亲从枕头下翻出你的信，那种被剥光的感觉至今清晰。但你也担心——万一女儿正经历什么可怕的事而不敢说呢？',
        nodes: [
          {
            id: 'node_1',
            description: '你轻轻拉开抽屉，那把锁只是装饰，一拨就开。日记本就躺在里面，封面上贴着她和朋友的合照。你知道，里面可能有她真实的情绪，也可能只是歌词和涂鸦。你的手停在半空。',
            options: [
              { text: '打开日记，只看一页。如果真的没事，马上放回去。', consequence: '你翻开一页，上面写着："爸妈只关心我的分数，如果我考砸了，他们还会爱我吗？" 你的喉咙发紧。你知道了不该知道的，而女儿毫不知情。', next: 'node_2a' },
              { text: '轻轻推回抽屉，假装从未发现。', consequence: '你松开手，把抽屉合上。你选择相信女儿有自己的处理方式，也选择承担不知情的焦虑。', next: 'node_2b' },
              { text: '放回日记，但决定今晚找女儿聊聊，不提日记的事。', consequence: '晚餐后，你敲开她的门，只说了一句："最近累不累？想聊聊吗？" 她沉默片刻，眼眶忽然红了。', next: 'node_2c' }
            ]
          },
          {
            id: 'node_2a',
            description: '你悄悄把日记放回原处，但那一行字反复在脑海里响起。晚上女儿回家，你看着她换鞋的背影，心里发酸。你该让她知道你看了日记吗？',
            options: [
              { text: '坦诚相告，道歉并承诺以后不这样。', consequence: '女儿先是一愣，然后沉默。她最后说："我恨你翻我东西，但谢谢你没骗我。" 信任出现裂痕，但你们开始了一次真正的对话。', next: null },
              { text: '假装无事发生，但从此更主动表达关心。', consequence: '你开始每天给她留字条，写些鼓励的话。女儿似乎察觉到了什么，但没点破。你们的关系在无声中缓慢修复，但那页日记永远横亘在你心里。', next: null }
            ]
          },
          {
            id: 'node_2b',
            description: '你选择不窥探。但担忧像一根刺，不时扎你一下。几天后，你偶然看到女儿在社交媒体上发了一条动态："有些事，即使说了也没人懂。"',
            options: [
              { text: '立刻发消息问她怎么了。', consequence: '她回了一个"嗯"，然后不再多说。你感到无力，但至少她知道了你在关注。', next: null },
              { text: '默默记下，周末提议一起去散步。', consequence: '你们在公园走了很久，起初沉默，后来她开始讲学校里的压力。你没有逼问，只是听着。回家时她挽住了你的手臂。', next: null }
            ]
          },
          {
            id: 'node_2c',
            description: '那晚谈话后，女儿并没有说太多，但她的房门不再总是关着。一周后，她主动把日记本递给你："爸，给你看一篇，就一篇。"',
            options: [
              { text: '接过日记，认真读那一篇，然后还给她，说声谢谢。', consequence: '你读到她对未来的恐惧，和对你们的内疚。你什么都没说，只是握了握她的手。信任在无声中重建了。', next: null },
              { text: '摇头拒绝："这是你的世界，不需要给我看。那天能聊几句，爸爸已经很开心了。"', consequence: '女儿笑了笑，把日记收回去。但她后来告诉你，你的拒绝反而让她觉得被尊重。', next: null }
            ]
          }
        ]
      },
      {
        id: 'transit_station',
        title: '公交站的陌生人',
        domain: '公共政策',
        role: '决策者',
        dilemma: '少数人的家园 vs 多数人的便利',
        intro: '你是市规划局的副局长。一条规划了五年的地铁线，最后一段需要穿过老城区。那里有200多户低收入家庭，房子老旧但社区纽带紧密。如果原方案执行，他们将被安置到郊区的保障房，远离熟悉的一切。如果线路绕行，成本增加30%，通车推迟三年，每天将有10万通勤者继续忍受拥堵。明天上午，你必须给出最终意见。',
        nodes: [
          {
            id: 'node_1',
            description: '办公桌上摆着两份报告：一份是工程部的，强调绕行将导致财政超支和工期延误；另一份是社情民意调查，记录了老城区居民的恳求。你抬头望向窗外，老城区的屋顶在夕阳下显得破旧而安宁。',
            options: [
              { text: '签署拆迁文件，推动原方案。为了十万人，少数人必须让步。', consequence: '你签下名字的那一刻，手心出汗。文件送出后，你接到社工的电话，说一位老人哭了。', next: 'node_2a' },
              { text: '提议召开紧急听证会，让居民代表和工程方对话。', consequence: '听证会上，一位老太太拉着你的袖子："我在这里住了40年，我丈夫在这条街上走的。你们要的进度，对我来说是人命。" 全场沉默。', next: 'node_2b' },
              { text: '指示团队探索替代方案：能否地下深埋穿过，减少拆迁？', consequence: '工程师表示技术上可行，但成本飙升，审批流程复杂。你面临上级的巨大压力。', next: 'node_2c' }
            ]
          },
          {
            id: 'node_2a',
            description: '拆迁通知贴出后，媒体报道了老城区的抗议。网上舆论两极分化：有人骂"钉子户自私"，有人呼吁"城市应有温度"。',
            options: [
              { text: '坚持原方案，公开解释这是"为了更大的公共利益"。', consequence: '你上了电视，逻辑无懈可击。但你看自己讲话的回放时，觉得那张脸很陌生。地铁按时通车，剪彩那天你没有去。', next: null },
              { text: '亲自走访每一户，试图在搬迁补偿上做到极致人性化。', consequence: '你花了一个月走遍200户。有人骂你"虚伪"，也有人理解。最终他们搬走了，社区散了，但你为他们争取到了比标准更高的安置条件。代价是你被调离岗位。', next: null }
            ]
          },
          {
            id: 'node_2b',
            description: '听证会后，上级找你谈话："进度延误你担得起吗？"',
            options: [
              { text: '采纳听证会收集的部分意见，局部微调方案，减少30%的拆迁量。', consequence: '你折中了。一部分居民得以留下，另一部分依然要搬。留下的感激你，搬走的怨恨你。你说不清自己做得对不对。', next: null },
              { text: '决定向更高层提交一份"社区保留式开发"的完整提案，哪怕影响自己的升迁。', consequence: '提案受到关注，被列为试点。你因此与晋升失之交臂，但老城区保住了，地铁以一种更温和的方式穿过它。多年后你路过那里，听到有人在巷子里唱戏。', next: null }
            ]
          },
          {
            id: 'node_2c',
            description: '深埋方案虽然理想，但财政缺口巨大。你在寻求资金时，一家开发商提出赞助，条件是沿线的商业开发权。',
            options: [
              { text: '接受赞助，推动深埋方案，尽可能减少拆迁。', consequence: '地铁建成，老城区得以保存，但沿线上建起了高级商场，社区的原生小店反而被挤压。你发现保护一种生活比保护房子难得多。', next: null },
              { text: '拒绝赞助，回归原方案，但要求施工方采用最人性化的搬迁流程。', consequence: '你选择了程序上的干净，却必须再次面对那200户的眼泪。你意识到，在复杂的世界里，完全"正确"并不存在。', next: null }
            ]
          }
        ]
      },
      {
        id: 'algorithm_dilemma',
        title: '失控的推荐',
        domain: '技术伦理',
        role: '产品经理',
        dilemma: '商业利益 vs 社会责任',
        intro: '你是某主流社交平台的产品经理。内部数据显示：当推荐算法优先推送引发愤怒、对立或恐惧的内容时，用户日均使用时长增加35%，广告收入大幅上升。如果优先推送温和、理性、多元的内容，留存率预计下滑20%。明天你要向CEO汇报下个季度的推荐策略，你的团队一半渴望晋升，一半良心不安。',
        nodes: [
          {
            id: 'node_1',
            description: '深夜，你盯着AB测试的数据：愤怒组的用户更活跃，但也产生更多举报和辱骂；温和组的用户看似满意，但打开频次明显下降。你的绩效考核和收入奖金都挂在用户时长上。',
            options: [
              { text: '推荐愤怒组策略：优化情绪驱动算法，追求商业指标最大化。', consequence: '你汇报时，CEO频频点头。下个季度，平台活跃度飙升，你的团队拿到最高绩效。但你在一次用户见面会上，听到一个中学生说："这个App让我觉得世界糟透了。"', next: 'node_2a' },
              { text: '推荐温和组策略：坚持理性多元推荐，哪怕收入下降。', consequence: '汇报时会议室气氛冰冷。CFO质问收入缺口怎么补。你据理力争，最后CEO勉强同意试行一个季度，但你的年度考评蒙上阴影。', next: 'node_2b' },
              { text: '提出折中方案：根据用户选择给予不同推荐模式，并透明告知。', consequence: '你提议设置"信息偏好"开关，让用户自选。有人赞你尊重自主，有人质疑你把责任推给用户。', next: 'node_2c' }
            ]
          },
          {
            id: 'node_2a',
            description: '愤怒算法上线后，平台流量飞涨。但媒体开始报道"平台纵容对立"，甚至有广告商担心品牌安全而暂停投放。',
            options: [
              { text: '继续优化，无视外界批评。', consequence: '你成了公司内最年轻的VP。但在一个失眠的夜里，你问自己：如果我的孩子将来活在这样一个信息世界里，我会安心吗？', next: null },
              { text: '在愤怒算法中悄悄加入"降温"机制：当用户连续接触对立内容时，插入一条自然或萌宠视频。', consequence: '这是一个隐性的修正，数据上依然好看，但对立稍有缓和。没人知道你的小心思，除了你自己的良心。', next: null }
            ]
          },
          {
            id: 'node_2b',
            description: '温和策略推行三个月，平台整体流量下滑，但用户满意度调查上升，青少年心理健康投诉减少。',
            options: [
              { text: '坚持温和策略，并联合学术界发布"信息环境健康报告"。', consequence: '报告引发社会讨论，平台被部分政府机构表扬。虽然商业收益短期受损，但吸引了一波高素质用户。', next: null },
              { text: '适当妥协：保留温和为默认模式，但在具体事件热点上允许一定的热度加权。', consequence: '你找到了一个脆弱的平衡点，两边都不完全满意，但也没有人激烈反对。你知道这是暂时的和平，内心依然有不甘。', next: null }
            ]
          },
          {
            id: 'node_2c',
            description: '用户选择模式上线后，数据有趣：大部分用户默认不更改，一小部分人主动调整。主动选择"愤怒模式"的用户留存极高，但也产生最多举报。',
            options: [
              { text: '基于此数据，推动"知情选择"成为公司产品哲学。', consequence: '你成为"算法透明运动"的倡导者，在行业大会上发言。但私下里你明白，让用户自己选择不能完全解决算法放大人性弱点的问题。', next: null },
              { text: '在用户选择基础上，为所有模式增加"冷静提醒"：当使用超过30分钟，弹出休息建议。', consequence: '这个小小的设计让用户投诉略增，但也让不少人留言说"谢谢你的提醒"。你感到，有时微小的干预比宏大的策略更接近人性。', next: null }
            ]
          }
        ]
      }
    ];

    // ---------- 运行时状态 ----------
    this.currentScenario = null;     // 当前加载的场景对象
    this.currentNode = null;        // 当前节点对象
    this.choicePath = [];           // 用户的选择路径 [{nodeId, optionIndex, text}]
    this.conversation = [];         // 对话历史 [{role, text}]
    this.userInsights = {           // 用户洞察收集
      coreConcern: '',              //   S1 溯源：核心关切
      otherSide: '',                //   S2 镜像：看见的另一面
      commonCost: '',               //   S3 代价：共同代价
      commonGround: ''              //   S4 共建：共同地基
    };
    this.scenePhase = 'intro';      // 'intro' | 'choice' | 'consequence' | 'dialogue' | 'report'
  }

  /**
   * 获取所有场景的摘要信息（用于场景广场展示）
   * @returns {Array} 场景摘要数组
   */
  getScenarioList() {
    return this.scenarios.map(s => ({
      id: s.id,
      title: s.title,
      domain: s.domain,
      role: s.role,
      dilemma: s.dilemma
    }));
  }

  /**
   * 加载指定场景
   * @param {string} scenarioId - 场景ID
   * @returns {object|null} 场景的入口节点，失败返回null
   */
  loadScenario(scenarioId) {
    const scenario = this.scenarios.find(s => s.id === scenarioId);
    if (!scenario) return null;

    this.currentScenario = scenario;
    this.currentNode = scenario.nodes[0];
    this.choicePath = [];
    this.conversation = [];
    this.userInsights = { coreConcern: '', otherSide: '', commonCost: '', commonGround: '' };
    this.scenePhase = 'intro';

    return {
      intro: scenario.intro,
      node: this.currentNode
    };
  }

  /**
   * 获取当前节点
   * @returns {object|null} 当前节点对象
   */
  getCurrentNode() {
    return this.currentNode;
  }

  /**
   * 获取当前场景信息
   * @returns {object|null} 当前场景摘要
   */
  getCurrentScenarioInfo() {
    if (!this.currentScenario) return null;
    return {
      id: this.currentScenario.id,
      title: this.currentScenario.title,
      domain: this.currentScenario.domain,
      role: this.currentScenario.role,
      dilemma: this.currentScenario.dilemma
    };
  }

  /**
   * 用户做出选择
   * @param {number} optionIndex - 选项索引
   * @returns {object} { consequence, nextNode, isFinished }
   */
  makeChoice(optionIndex) {
    if (!this.currentNode || !this.currentNode.options) {
      return { consequence: '', nextNode: null, isFinished: true };
    }

    const chosen = this.currentNode.options[optionIndex];
    if (!chosen) return { consequence: '', nextNode: null, isFinished: true };

    // 记录选择
    this.choicePath.push({
      nodeId: this.currentNode.id,
      optionIndex,
      text: chosen.text
    });

    // 收集洞察
    if (!this.userInsights.coreConcern) {
      this.userInsights.coreConcern = chosen.text;
    }

    this.scenePhase = 'consequence';

    // 查找下一个节点
    let nextNode = null;
    if (chosen.next) {
      nextNode = this.currentScenario.nodes.find(n => n.id === chosen.next) || null;
    }

    this.currentNode = nextNode;

    return {
      consequence: chosen.consequence,
      nextNode: nextNode,
      isFinished: !nextNode
    };
  }

  /**
   * 推进到下一个节点（用于“继续下一步”按钮）
   * @returns {object|null} 下一个节点，若没有则返回null
   */
  advanceToNextNode() {
    if (!this.currentNode) {
      this.scenePhase = 'dialogue';
      return null;
    }
    this.scenePhase = 'choice';
    return this.currentNode;
  }

  /**
   * 获取对话开场白（由AI发出的第一条反思引导语）
   * @returns {string}
   */
  getDialogueOpening() {
    return '你已经走过了这个困境的关键抉择。现在，我想邀请你回顾一下：在这个过程中，你最想守护的是什么？或者，有什么是你之前没注意到、现在才意识到的？';
  }

  /**
   * 生成模拟AI回复（基于用户输入的关键词）
   * @param {string} userText - 用户输入
   * @returns {string} AI回复
   */
  generateAIResponse(userText) {
    // 收集洞察
    if (!this.userInsights.otherSide && (userText.includes('对方') || userText.includes('另一') || userText.includes('他们'))) {
      this.userInsights.otherSide = userText;
    }
    if (!this.userInsights.commonCost && (userText.includes('代价') || userText.includes('失去'))) {
      this.userInsights.commonCost = userText;
    }
    if (!this.userInsights.commonGround && (userText.includes('共同') || userText.includes('都希望'))) {
      this.userInsights.commonGround = userText;
    }

    // 基于关键词的简单回复生成
    if (userText.includes('保护') || userText.includes('守护')) {
      return '你提到了"保护"。这似乎是你很看重的价值。能再具体说说，你真正想保护的是什么吗？';
    }
    if (userText.includes('后悔') || userText.includes('如果')) {
      return '你似乎在思考另一种可能性。每一个选择都有它的重量，你能感受到这份重量，本身就很珍贵。';
    }
    if (userText.includes('不知道') || userText.includes('迷茫')) {
      return '迷茫是真实的。有时候，承认自己不知道，比假装知道更需要勇气。';
    }
    return '我听到了。这个困境没有容易的答案。你愿意再深入一点：在这个过程中，有没有哪个瞬间让你心头一颤？';
  }

  /**
   * 添加对话记录
   * @param {string} role - 'user' | 'ai'
   * @param {string} text - 对话内容
   */
  addDialogue(role, text) {
    this.conversation.push({ role, text });
  }

  /**
   * 获取对话历史
   * @returns {Array}
   */
  getConversation() {
    return this.conversation;
  }

  /**
   * 检查是否应该触发报告生成
   * @returns {boolean}
   */
  shouldGenerateReport() {
    const userMessageCount = this.conversation.filter(c => c.role === 'user').length;
    return userMessageCount >= 2;
  }

  /**
   * 生成映照报告
   * @returns {string} HTML格式的报告内容
   */
  generateReport() {
    const core = this.userInsights.coreConcern || this.choicePath.map(c => c.text).join(' → ') || '（未记录）';
    const other = this.userInsights.otherSide || '（你在对话中尚未深入探讨对立面）';
    const cost = this.userInsights.commonCost || '（未明确提及共同代价）';
    const ground = this.userInsights.commonGround || '（仍在探寻中）';

    return `
【你的核心关切】
${core}
<span style="color:#8b7b69;">这只是一个观察。你的自我判断更重要。</span>

【你尝试看见的另一面】
${other}
<span style="color:#8b7b69;">视角练习的记录，不代表任何评判。</span>

【你感知到的代价】
${cost}
<span style="color:#8b7b69;">这个感受是真实的，值得被尊重。</span>

【你发现的共同地基】
${ground}
<span style="color:#8b7b69;">映照结束。你是自己最终的权威。</span>`;
  }

  /**
   * 重置引擎状态
   */
  reset() {
    this.currentScenario = null;
    this.currentNode = null;
    this.choicePath = [];
    this.conversation = [];
    this.userInsights = { coreConcern: '', otherSide: '', commonCost: '', commonGround: '' };
    this.scenePhase = 'intro';
  }

  /**
   * 获取当前阶段
   * @returns {string}
   */
  getPhase() {
    return this.scenePhase;
  }

  /**
   * 设置当前阶段
   * @param {string} phase 
   */
  setPhase(phase) {
    this.scenePhase = phase;
  }
}

// 如果作为模块使用（未来可扩展），导出引擎
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SceneEngine;
}


