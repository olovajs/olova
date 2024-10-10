# OlovaJS &mdash; A Smooth, Minimal Framework for Dynamic JavaScript Behavior

**OlovaJS** is a lightweight and minimalistic JavaScript framework that makes
dynamic behavior easy to manage and integrate into your web projects.

## 🚀 Features

- **Smooth Integration**: Quickly add dynamic functionality to your JavaScript
  projects without the bloat.
- **Minimalistic Design**: Focus on the essentials with a clean and simple
  setup.
- **Dynamic State Management**: Easily manage and update your state as your
  application grows.

Explore more and start building with **OlovaJS** today!

## 🛠️ Quick Start Example

```html
<div id="app">
  <template>
    <div>
      <div>{ count }</div>
      <button @click="increment">Increment</button>
    </div>
  </template>
</div>

<script type="module">
  import { createApp } from "//unpkg.com/olova";

  const app = createApp({
    data: {
      count: 0,
    },
    methods: {
      increment() {
        this.count++;
      },
    },
  });
  app.mount("#app");
</script>
```
