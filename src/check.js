#! /usr/bin/env node

const contentful = require('contentful');
const { jsonStdin, jsonStdout, logError } = require('./utils');

jsonStdin()
  .then((result) => {
    const spaceId = result.source['space-id'] || result.source.space_id;
    const accessToken = result.source['access-token'] || result.source.access_token;
    const contentfulEnv = result.source.environment || 'master'; // defaults to 'master' if not set
    const contentfulClient = contentful.createClient({
      space: spaceId,
      environment: contentfulEnv,
      accessToken: accessToken
    });

    // As this var is only set in the relevant places
    const isContentReview = result.source['content-review'];

    if (isContentReview) {
      return contentfulClient.getEntries({
        // See https://www.contentfulcommunity.com/t/how-to-query-on-multiple-content-types/473 and
        // https://www.contentful.com/faq/apis/#:~:text=You%20could-,use,-the%20inclusion%20operator
        'sys.contentType.sys.id[in]': 'newsArticle,person,pagePartner,pageDefault,landingPage'
      }).then((response) => {
        
        if(Boolean(response.items.length)) {
          jsonStdout([{
            stuffToReview: JSON.stringify(response.items),
          }]);
        } else {
          jsonStdout([]);
        }
      });
    } else {

    }

    return contentfulClient.getEntries({ order: '-sys.updatedAt', limit: 1 })
      .then((response) => {
        const highestRevision = response.items.reverse()[0]; // highest 'sys.revision' first
        const updatedTimestamp = Date.parse(highestRevision.sys.updatedAt);

        if(!result.version || parseInt(result.version.revisionNum) < updatedTimestamp) {
          jsonStdout([{
            timestamp: highestRevision.sys.updatedAt,
            revisionNum: updatedTimestamp.toString(),
            spaceId,
            environment: contentfulEnv
          }]);
        } else {
          jsonStdout([]);
        }
      });
  })
  .catch((err) => {
    // logError(err);
    console.error(err);
    process.exit();
  });
