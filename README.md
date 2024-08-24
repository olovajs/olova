<div align="center">
  <img src="https://i.postimg.cc/Pq1ZWCg3/Black-and-White-Initial-D-Creative-Studio-Logo.png" alt="DeshiJS Logo" height="150" />
  <h1>DeshiJS</h1>
  <p>A smooth, minimal framework for infusing JavaScript with dynamic behavior.</p>
</div>

## Hi there 👋
### Welcome to the sleek and minimal framework that brings dynamic behavior to JavaScript! ✨

---
# Features

- Smooth Integration: Easy-to-use framework for adding dynamic functionality to your JavaScript projects.
- Minimalistic Design: Focus on what matters with a clean and simple setup.
- Dynamic State Management: Manage and update your state with ease.
- Explore more and start building with DeshiJS today! 🚀



---

```html
<script src="https://cdn.jsdelivr.net/gh/DeshiJS/DeshiJS@main/dev/v1.js" defer></script>
<div $data='{"count": 10}'>
  <p $text="{count}"></p>
  <button on:click="incrementCount">Increase Count</button>
</div>

<script>
  const $ = {}
  function incrementCount() {
    $.count++;
  }
</script>
```

author: [Nazmul Hossain](https://www.facebook.com/codervai)
