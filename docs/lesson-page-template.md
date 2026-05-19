# Lesson Page Template

Use this template when drafting a new lesson page under `src/content/`.

## Writing rules

- Teach learners who only have junior-high-school math background.
- One page should cover one complete knowledge unit.
- Use guided, classroom-style language.
- Explain every definition, theorem, formula, and conclusion in detail.
- Show derivations and inference chains step by step.
- End with exactly five exercises.
- Exercises 1-3: textbook-level foundational practice.
- Exercises 4-5: gaokao major-problem difficulty, but still limited to this page's knowledge scope.
- Every exercise must include: answer, full explanation, Python implementation.

## Frontmatter template

```md
---
title: ...
description: ...
order: ...
textbook: ...
chapter: ...
tags:
  - ...
pythonSnippets:
  - title: ...
    description: ...
    code: |
      ...
---
```

## Page body template

```md
# ...

## 学习目标

## 为什么要学这个内容

## 预备知识

## 概念 / 定义 / 定理

## 直观理解

## 推导或证明

## 例题 1

## 例题 2

## 方法总结

## 常见错误

## 练习 1

### 答案

### 讲解

### Python 实现

## 练习 2

### 答案

### 讲解

### Python 实现

## 练习 3

### 答案

### 讲解

### Python 实现

## 练习 4

### 答案

### 讲解

### Python 实现

## 练习 5

### 答案

### 讲解

### Python 实现
```

## Pre-write checklist

- Have I read the textbook outline and source material for this topic?
- Does this page teach exactly one complete knowledge unit?
- Have I explained symbols and notation that a beginner may not know?
- Have I avoided hidden reasoning jumps?
- Do exercises 4-5 feel difficult enough while staying within scope?
- Does every exercise include answer, explanation, and Python code?
