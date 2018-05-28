

const jsonStdin = () => {
  return new Promise((resolve, reject) => {
      let content = '';
      process.stdin.resume();
      process.stdin.on('data', buf => (content += buf.toString()));
      process.stdin.on('end', () => {
        try {
          resolve(JSON.parse(content));
        } catch (e) {
          reject(e);
        }
    });
  });
};
const jsonStdout = (val) => {
  process.stdout.write(JSON.stringify(val));
}
const logError = (val) => {
  process.stderr.write(val.toString() + "\n");
}
module.exports = {
  logError,
  jsonStdin,
  jsonStdout
};
