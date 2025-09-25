// backend/lib/github.js
import { Octokit } from '@octokit/rest';
import crypto from 'crypto';

export class GitHubService {
  constructor(token) {
    this.octokit = new Octokit({ auth: token });
  }

  async createBranchFromBase({ owner, repo, baseBranch, branchName }) {
    try {
      const baseRef = await this.octokit.git.getRef({
        owner, repo, ref: `heads/${baseBranch}`
      });
      
      await this.octokit.git.createRef({
        owner, repo,
        ref: `refs/heads/${branchName}`,
        sha: baseRef.data.object.sha
      });
      
      return { success: true, branchName, sha: baseRef.data.object.sha };
    } catch (error) {
      throw new Error(`Erreur création branche: ${error.message}`);
    }
  }

  async commitFiles({ owner, repo, branchName, files, commitMessage }) {
    try {
      for (const file of files) {
        await this.commitSingleFile({
          owner, repo, branchName,
          path: file.path,
          content: file.content,
          message: commitMessage || `Update ${file.path}`
        });
      }
      return { success: true };
    } catch (error) {
      throw new Error(`Erreur commit fichiers: ${error.message}`);
    }
  }

  async commitSingleFile({ owner, repo, branchName, path, content, message }) {
    const contentBase64 = Buffer.from(content).toString('base64');
    
    // Vérifier si le fichier existe
    let existingFileSha = null;
    try {
      const existing = await this.octokit.repos.getContent({
        owner, repo, path, ref: branchName
      });
      existingFileSha = existing.data.sha;
    } catch (e) {
      // Fichier n'existe pas
    }

    await this.octokit.repos.createOrUpdateFileContents({
      owner, repo, path, ref: branchName,
      message, content: contentBase64,
      sha: existingFileSha
    });
  }

  async createPullRequest({ owner, repo, baseBranch, branchName, title, body, assignees = [] }) {
    try {
      const pr = await this.octokit.pulls.create({
        owner, repo,
        title, body,
        head: branchName,
        base: baseBranch
      });

      // Assigner des reviewers si spécifiés
      if (assignees.length > 0) {
        await this.octokit.pulls.requestReviewers({
          owner, repo,
          pull_number: pr.data.number,
          reviewers: assignees
        });
      }

      return {
        success: true,
        url: pr.data.html_url,
        number: pr.data.number,
        id: pr.data.id
      };
    } catch (error) {
      throw new Error(`Erreur création PR: ${error.message}`);
    }
  }

  async mergePullRequest({ owner, repo, pullNumber, mergeMethod = 'squash' }) {
    try {
      await this.octokit.pulls.merge({
        owner, repo,
        pull_number: pullNumber,
        merge_method: mergeMethod
      });
      return { success: true };
    } catch (error) {
      throw new Error(`Erreur merge PR: ${error.message}`);
    }
  }

  async triggerWorkflow({ owner, repo, workflowId, ref = 'main', inputs = {} }) {
    try {
      await this.octokit.actions.createWorkflowDispatch({
        owner, repo,
        workflow_id: workflowId,
        ref, inputs
      });
      return { success: true };
    } catch (error) {
      throw new Error(`Erreur déclenchement workflow: ${error.message}`);
    }
  }

  async getWorkflowRuns({ owner, repo, workflowId, perPage = 10 }) {
    try {
      const response = await this.octokit.actions.listWorkflowRunsForRepo({
        owner, repo,
        workflow_id: workflowId,
        per_page: perPage
      });
      return response.data.workflow_runs;
    } catch (error) {
      throw new Error(`Erreur récupération workflow runs: ${error.message}`);
    }
  }

  generateBranchName(prefix = 'ai', description = '') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const slug = description
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
    
    return `${prefix}/${timestamp}-${slug}`;
  }

  generateCommitHash() {
    return crypto.randomBytes(20).toString('hex');
  }
}

export default GitHubService;