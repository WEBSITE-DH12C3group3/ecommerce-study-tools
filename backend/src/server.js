const app = require("./app");

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Backend server chạy tại http://localhost:${PORT}`);
});
