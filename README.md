<div style="text-align: center;">
  <h1>OlovaJS &mdash;</h1>
</div>
<p>A Smooth, Minimal Framework for Dynamic JavaScript Behavior</p>

<p><strong>OlovaJS</strong> is a lightweight and minimalistic JavaScript framework that makes dynamic behavior easy to manage and integrate into your web projects.</p>

<h2>🚀 Features</h2>
<ul>
  <li><strong>Smooth Integration</strong>: Quickly add dynamic functionality to your JavaScript projects without the bloat.</li>
  <li><strong>Minimalistic Design</strong>: Focus on the essentials with a clean and simple setup.</li>
  <li><strong>Dynamic State Management</strong>: Easily manage and update your state as your application grows.</li>
</ul>

<p>Explore more and start building with <strong>OlovaJS</strong> today!</p>

<h2>🛠️ Quick Start Example</h2>

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
