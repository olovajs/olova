## Hi there 👋

# A smooth, minimal framework for infusing JavaScript with dynamic behaviorA smooth, minimal framework for infusing JavaScript with dynamic behavior

![](https://i.postimg.cc/Pq1ZWCg3/Black-and-White-Initial-D-Creative-Studio-Logo.png)


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
