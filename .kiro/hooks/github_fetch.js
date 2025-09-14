// .kiro/hooks/github_fetch.js - GitHub file fetching hook
const { Octokit } = require('@octokit/rest');

/**
 * Fetches a file from a GitHub repository
 * 
 * Usage example:
 * const result = await fetchFile({
 *   owner: 'facebook',
 *   repo: 'react',
 *   path: 'packages/react/src/React.js',
 *   branch: 'main'
 * });
 * console.log(result.content); // File content as string
 * console.log(result.sha);     // Git SHA hash
 * 
 * @param {Object} params - Fetch parameters
 * @param {string} params.owner - Repository owner (username or organization)
 * @param {string} params.repo - Repository name
 * @param {string} params.path - File path within the repository
 * @param {string} [params.branch='main'] - Branch name (defaults to 'main')
 * @returns {Promise<Object>} Object with content and sha properties
 * @throws {Error} If file not found or GitHub API error occurs
 */
async function fetchFile({ owner, repo, path, branch = 'main' }) {
  // Validate GitHub token
  if (!process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN environment variable is required. Please set it in your .env file.');
  }

  // Initialize Octokit client
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    userAgent: 'Bug Whisperer GitHub Fetch Hook v1.0.0'
  });

  try {
    // Fetch file content from GitHub API
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch
    });

    // Handle directory case (not a file)
    if (Array.isArray(response.data)) {
      throw new Error(`Path '${path}' is a directory, not a file. Please specify a file path.`);
    }

    // Handle file case
    if (response.data.type !== 'file') {
      throw new Error(`Path '${path}' is not a regular file (type: ${response.data.type}).`);
    }

    // Decode base64 content
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');

    return {
      content: content,
      sha: response.data.sha
    };

  } catch (error) {
    // Handle specific GitHub API errors
    if (error.status === 404) {
      throw new Error(`File not found: '${path}' does not exist in ${owner}/${repo} on branch '${branch}'. Please check the file path and branch name.`);
    }
    
    if (error.status === 403) {
      throw new Error(`Access denied to ${owner}/${repo}. Please check your GitHub token permissions or if the repository is private.`);
    }
    
    if (error.status === 401) {
      throw new Error('GitHub authentication failed. Please check your GITHUB_TOKEN is valid and has not expired.');
    }

    // Re-throw other errors with context
    throw new Error(`GitHub API error: ${error.message}`);
  }
}

module.exports = { fetchFile };