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

    // As this is only set the CRcom review context
    const isContentReview = result.source['content-review'] || result.source.content_review;

    if (isContentReview) {
      return contentfulClient.getEntries({
        'sys.contentType.sys.id[in]': 'newsArticle,person,pagePartner,pageDefault,landingPage'
      }).then((response) => {
        let itemsToReview = false;

        response.items.forEach((item) => {
          // Update the flag if we find ANY review dates (date checking and calculation itself happens via a Concourse job)
          if (item.fields.reviewDate) {
            itemsToReview = true;
          }
        });

        if(itemsToReview) {
          // Keeping these in place as it's useful info
          const highestRevision = response.items.reverse()[0]; // highest 'sys.revision' first
          const updatedTimestamp = Date.parse(highestRevision.sys.updatedAt);
          
          jsonStdout([{
            timestamp: highestRevision.sys.updatedAt,
            revisionNum: updatedTimestamp.toString(),
            spaceId,
            environment: contentfulEnv,
            itemsToReview
          }]);
        } else {
          jsonStdout([]);
        }
      });
    } else {
      return contentfulClient.getEntries({ order: '-sys.updatedAt', limit: 1 })
      .then((response) => {
        const highestRevision = response.items.reverse()[0]; // highest 'sys.revision' first
        const updatedTimestamp = Date.parse(highestRevision.sys.updatedAt);
        if(!result.version || parseInt(result.version.revisionNum) < updatedTimestamp) {
          jsonStdout([{
            timestamp: highestRevision.sys.updatedAt,
            revisionNum: updatedTimestamp.toString(),
            spaceId,
            environment: contentfulEnv,
          }]);
        } else {
          jsonStdout([]);
        }
      });
    }
  })
  .catch((err) => {
    // logError(err);
    console.error(err);
    process.exit();
  });
