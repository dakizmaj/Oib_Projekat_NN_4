import app from "./app";

const port = process.env.PORT || 5005;

app.listen(port, () => {
  console.log(`\x1b[32m[TCPListen@2.1]\x1b[0m localhost:${port}`);
  console.log(`🚀 Warehouse microservice running on port ${port}`);
})