require("dotenv").config();
const app = require("./src/app");
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(
    `🚀 Streamline Backend API listening at http://localhost:${port}`
  );
});
