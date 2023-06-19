const SlackNotify = require('slack-notify');

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

/* Content Review functionality: */
const checkReviewDate = async (dateToReview, pageTitle, pagePath, token) => {
  // Slack setup:
  const slackWebhookUrl = `https://hooks.slack.com/services/${token}`;
  const slack = SlackNotify(slackWebhookUrl);

  // Date calcs:
  const reviewTime = new Date(dateToReview).getTime();
  const nowTime = new Date().getTime();
  const timeDiff = reviewTime - nowTime;
  const dayDiff = timeDiff / (1000 * 3600 * 24);
  const dayLimit = 30; // TO-DO: change back to 14

  // If the difference is at or under the limit, flag this for review:
  if (dayDiff <= dayLimit) {
    let thisDate = new Date(dateToReview);
    thisDate = thisDate.toLocaleDateString('en-GB');

    slack.send({
      channel: '#content-review-notifications',
      text: `The content ' *${pageTitle}* ' at the URL ' *${pagePath}* ' has entered its review period; the content will be out-of-date or inaccurate on *${thisDate}*`
    }).then(() => {
      console.log(`Slack notification for '${pagePath}' successful`);
    }).catch((err)=>{ console.log('Slack notification error:', err)});
  }
};

module.exports = {
  logError,
  jsonStdin,
  jsonStdout,
  checkReviewDate
};
