import { createApp } from "//unpkg.com/olova";

const app = createApp({
  data: {
    count: 0,
  },
  methods: {
    increment() {
      this.count += 1;
    },
  },
  template: `<h1>{count}</h1>
    <button @click="increment">Increment</button>
    `,
});

app.mount("#app");
