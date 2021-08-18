import * as core from '@actions/core';
import { Octokit } from "@octokit/core";
import { IncomingWebhook } from '@slack/webhook';

async function run(): Promise<void> {
  try {
    const username = core.getInput('username');
    const icon_url = core.getInput('icon_url');
    const channel = core.getInput('channel');
    const tag_sha = core.getInput('tag_sha');
    const color = core.getInput('color');
    const owner = core.getInput('owner');
    const repo = core.getInput('repo');

    const octokit = new Octokit();
    core.debug(`sending octokit request to GET /repos/${owner}/${repo}/git/tags/${tag_sha}`)
    const response = await octokit.request(`GET /repos/${owner}/${repo}/git/tags/${tag_sha}`);

    core.debug(response.data)

    const webHook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

    const payload = {
      username,
      icon_url,
      channel,
      attachments: [{
        color,
        title: `Release tag created: ${response.data.tag}`,
        title_link: `https://github.com/${owner}/${repo}/releases/tag/${response.data.tag}`,
        text: response.data.message,
      }],
    };

    await webHook.send(payload);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
