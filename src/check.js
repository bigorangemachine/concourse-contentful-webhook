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
