---
title: "子集与真子集"
description: "理解子集、真子集的概念，掌握子集的性质"
order: 2
textbook: "compulsory-1"
chapter: "chapter-1"
tags: ["集合", "子集"]
---

## 子集与真子集

### 子集

如果集合 $A$ 中的每一个元素都是集合 $B$ 的元素，就说集合 $A$ 是集合 $B$ 的**子集**（subset），记作 $A \subseteq B$ 或 $B \supseteq A$。

### 真子集

如果 $A \subseteq B$，但存在元素 $x \in B$ 且 $x \notin A$，则称 $A$ 是 $B$ 的**真子集**（proper subset），记作 $A \subsetneq B$。

### 重要性质

- 任何一个集合是它本身的子集，即 $A \subseteq A$
- 空集是任何集合的子集，即 $\emptyset \subseteq A$
- 传递性：如果 $A \subseteq B$，$B \subseteq C$，则 $A \subseteq C$

### Python 实现

```python
import numpy as np

# 子集判断
A = {1, 2, 3}
B = {1, 2, 3, 4, 5}

print(f"A 是否为 B 的子集: {A.issubset(B)}")
print(f"A 是否为 B 的真子集: {A < B}")
print(f"A 是否为自身的子集: {A <= A}")
print(f"空集是否为 A 的子集: {set().issubset(A)}")
```