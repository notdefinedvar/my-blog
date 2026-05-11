---
title: "Harness Engineering 浅识"
description: "对于 Harness Engineering 的概念认知"
pubDate: 2026-05-11
author: "notdefinedvar"
tags: ["ai", "harness engineering"]
---

## 概要

本文旨在对 Harness Engineering 进行初步介绍。
文章将从演化历史与核心要素两个维度，阐述 Harness Engineering 的起源及其主要组成部分。
演化历史部分，将沿着 Prompt Engineering、Context Engineering 至 Harness Engineering 的脉络，分析各阶段所解决的问题。
要素部分则聚焦于 Harness Engineering 的实施要素，帮助读者建立整体认知。

在笔者看来，Harness Engineering 是对人类工程实践的凝练——将人类的工程经验转化为 AI 实践，用以解决模型能力边界之外的问题。 

## 演化历史

### Prompt Engineering

Prompt Engineering 是一种方法论。人们通过清晰、明确地表述问题，来引导 AI 给出预期的回答，从而获得更为精确的结果。

常用的方法包括：设定角色、列举步骤、示例说明等，用于生成结构化数据。其本质是一种语言运用的艺术——通过精准的词汇选择与条理清晰的语言描述，来解决 AI 输出不准确的问题。

Prompt Engineering 本质上是 AI 的原子操作。对于简单且不涉及外部资源的任务，它确实表现出色。然而，当任务涉及外部工具或未知背景信息时，由于缺乏依据，AI 无法自主做出判断并给出回答。 

### Context Engineering

顾名思义，Context Engineering 即上下文工程。其核心目的是弥补 Prompt Engineering 的不足——为 AI 提供充足的、可用于分析与解决问题的上下文信息。

例如 AGENT.md、ClAUDEmdD、CURSOR.md，以及各类可检索到的工程实践、代码风格、项目背景等，均可作为 AI 的上下文被整合到文档中。这确实为 AI 提供了丰富的背景信息。然而，AI 的上下文如同人类的注意力一样，是一种有限资源。当文档涵盖多方面的内容时，AI 的注意力便会分散，难以从大量背景中提取有效信息。

OpenAI 提出的有效实践是渐进式披露（Progressive Disclosure）。该方法将 AI 所需的关键信息以目录形式组织在 Agent.md 中，如项目背景、架构设计、代码规范、质量检验等。当 AI 需要某一具体内容时，先在 Agent.md 中定位对应目录，再检索具体内容。 

 

### Harness Engineering

Harness 一词本意为控制与利用、为马匹套上挽具。这一意象生动地描绘了 AI 工程如同难以驾驭的野马，需要通过特定方法来加以管控。

Harness Engineering 旨在用工程规范约束模型行为，将团队协作流程、SOP 等抽象为工程工作流模型，从而解决长时任务、复杂任务中的出错与偏离问题。

Agent Skill 便是这一理念的具体实现。它具备两大优点：其一，按需加载机制解决了 Context Engineering 上下文过大的问题；其二，契合了 Harness Engineering 的任务编排思想，提供完整的 SOP 指导 AI 如何解决特定问题。 



## 要素

Harness Engineering 包含以下核心要素，但并非所有要素都不可或缺：

- 上下文管理
- 工具系统
- 任务编排
- 状态与记忆
- 测试与反馈

**上下文管理**旨在明确 AI 对项目范围与任务所需信息的认知，对应人类工作中的需求获取与分析阶段。

**工具系统**赋予 AI 调用外部工具的能力，例如联网检索、浏览器操作等，以解决特定问题。

**任务编排**对应需求分解后的任务抽象与任务分割，包括任务优先级分级与大任务拆分为小任务等工作。

**状态与记忆**旨在应对 AI 上下文资源有限的问题。可通过经验总结提供跨 Session 的状态与记忆，或借助专门的记忆系统为 AI 赋予记忆能力。

**测试与反馈**是保障 AI 工作质量、纠正偏离的有效手段，类似于人类工作中的质量与安全角色，提供纠错与反馈功能。

## 关系

Harness Engineering目前是AI工程的集大成者。它包含了Prompt Engineering，同时也包含了Context Engineering。 