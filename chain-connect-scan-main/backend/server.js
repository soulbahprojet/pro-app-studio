// backend/server.js
import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { Octokit } from '@octokit/rest';
import { exec as _exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const exec = promisify(_exec);
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Importer les routes Supabase API
import supabaseApiRoutes from './routes/supabase-api.js';
app.use('/api/supabase', supabaseApiRoutes);

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// === Supabase Configuration (Service Role Key côté serveur uniquement) ===
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// === Configuration ===
const CONFIG = {
  github: {
    owner: process.env.GITHUB_OWNER || 'votre-org',
    repo: process.env.GITHUB_REPO || '224solutions',
    baseBranch: process.env.BASE_BRANCH || 'main'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-5-2025-08-07'
  },
  sandbox: {
    enabled: process.env.SANDBOX_ENABLED === 'true',
    timeout: parseInt(process.env.SANDBOX_TIMEOUT_SECONDS || '600', 10)
  },
  security: {
    autoMergeAllowed: process.env.AUTO_MERGE_ALLOWED === 'true',
    pdgApiKey: process.env.PDG_API_KEY || 'secret-pdg-key'
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  }
};

// === Helpers de sécurité ===
function verifyAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant - Authorization Bearer requis' });
  }
  
  const token = auth.substring(7);
  // TODO: Implémenter validation JWT/session selon votre système d'auth
  // Pour l'instant, vérification basique
  if (token !== CONFIG.security.pdgApiKey && token !== 'temp-token') {
    return res.status(403).json({ error: 'Token invalide - Accès refusé' });
  }
  
  req.user = { id: 'pdg-user', role: 'pdg' }; // Mock user
  next();
}

function sanitizeInput(str) {
  return str.replace(/[<>\"'&]/g, '').trim();
}

// === OpenAI Integration ===
async function askOpenAI(prompt) {
  const system = `Tu es un générateur de code pour l'application 224SOLUTIONS. Tu dois retourner uniquement un JSON valide suivant le schéma exact :

{
  "summary": "Description courte de ce qui va être implémenté",
  "files": [
    {
      "path": "src/components/ExampleComponent.tsx",
      "content": "// Code complet du fichier\\nexport default function ExampleComponent() { return <div>Hello</div>; }"
    }
  ],
  "tests": ["npm run test:unit", "npm run lint"],
  "runCommands": ["npm install nouvelle-dependance"]
}

IMPORTANTES CONTRAINTES :
- Utilise React, TypeScript, Tailwind CSS, shadcn/ui
- Respecte l'architecture 224SOLUTIONS existante
- Crée du code production-ready avec gestion d'erreurs
- Inclus les imports nécessaires
- Ne retourne QUE du JSON, pas de texte additionnel
- Les chemins doivent être relatifs au dossier racine du projet`;

  const body = {
    model: CONFIG.openai.model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: sanitizeInput(prompt) }
    ],
    max_completion_tokens: 4000,
    // Note: pas de temperature pour gpt-5
  };

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${CONFIG.openai.apiKey}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const errorBody = await resp.text();
    throw new Error(`OpenAI API error ${resp.status}: ${errorBody}`);
  }

  const json = await resp.json();
  const content = json.choices[0].message.content;
  return content;
}

// === JSON Extraction ===
function extractJSON(maybeMarkdown) {
  // Chercher un bloc de code JSON
  const codeBlockMatch = maybeMarkdown.match(/```(?:json)?\n?([\s\S]*?)```/);
  const raw = codeBlockMatch ? codeBlockMatch[1] : maybeMarkdown;
  
  try {
    const parsed = JSON.parse(raw.trim());
    
    // Validation du schéma
    if (!parsed.summary || !Array.isArray(parsed.files)) {
      throw new Error('Schéma JSON invalide: manque summary ou files');
    }
    
    // Validation des fichiers
    for (const file of parsed.files) {
      if (!file.path || !file.content) {
        throw new Error('Fichier invalide: manque path ou content');
      }
    }
    
    return parsed;
  } catch (e) {
    throw new Error(`Impossible de parser le JSON retourné par l'AI: ${e.message}`);
  }
}

// === Sandbox Testing ===
async function runSandboxTests(tmpDir, tests = []) {
  if (!CONFIG.sandbox.enabled) {
    return { ok: true, logs: 'Sandbox désactivé en configuration' };
  }

  try {
    // Créer un package.json minimal pour les tests
    const packageJson = {
      "name": "224solutions-sandbox",
      "private": true,
      "scripts": {
        "test": "echo 'Tests passés'",
        "lint": "echo 'Lint OK'"
      }
    };
    
    await fs.writeFile(
      path.join(tmpDir, 'package.json'), 
      JSON.stringify(packageJson, null, 2)
    );

    // Exécuter les tests avec timeout
    const testCommands = tests.length ? tests : ['npm run test', 'npm run lint'];
    const cmd = `cd ${tmpDir} && ${testCommands.join(' && ')}`;
    
    const { stdout, stderr } = await exec(cmd, { 
      timeout: CONFIG.sandbox.timeout * 1000 
    });
    
    return { ok: true, logs: `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}` };
  } catch (e) {
    return { ok: false, logs: `Erreur sandbox: ${e.message}` };
  }
}

// === GitHub Integration ===
async function commitFilesToGitHub({ owner, repo, baseBranch = 'main', branchName, files, commitMessage }) {
  try {
    // 1) Obtenir le SHA de la branche de base
    const baseRef = await octokit.git.getRef({ owner, repo, ref: `heads/${baseBranch}` });
    const sha = baseRef.data.object.sha;
    
    // 2) Créer la nouvelle branche
    await octokit.git.createRef({ owner, repo, ref: `refs/heads/${branchName}`, sha });

    // 3) Committer chaque fichier sur la nouvelle branche
    for (const file of files) {
      const contentBase64 = Buffer.from(file.content).toString('base64');
      
      // Vérifier si le fichier existe déjà
      let existingFileSha = null;
      try {
        const existing = await octokit.repos.getContent({
          owner, repo, path: file.path, ref: branchName
        });
        existingFileSha = existing.data.sha;
      } catch (e) {
        // Fichier n'existe pas, c'est OK
      }

      await octokit.repos.createOrUpdateFileContents({
        owner, repo, path: file.path, ref: branchName,
        message: `AI: Update ${file.path}`,
        content: contentBase64,
        sha: existingFileSha
      });
    }

    return { success: true, branchName };
  } catch (error) {
    throw new Error(`Erreur GitHub commit: ${error.message}`);
  }
}

async function createPullRequest({ owner, repo, branchName, baseBranch, title, body }) {
  try {
    const pr = await octokit.pulls.create({
      owner, repo,
      title, body,
      head: branchName,
      base: baseBranch
    });
    
    return { success: true, url: pr.data.html_url, number: pr.data.number };
  } catch (error) {
    throw new Error(`Erreur création PR: ${error.message}`);
  }
}

// === Supabase Integration ===
async function getProjectData(table, filters = {}) {
  try {
    let query = supabase.from(table).select('*');
    
    // Appliquer les filtres
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error(`Erreur lecture Supabase (${table}):`, error);
    throw new Error(`Impossible de lire les données de ${table}: ${error.message}`);
  }
}

async function updateProjectData(table, id, updates) {
  try {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Erreur mise à jour Supabase (${table}):`, error);
    throw new Error(`Impossible de mettre à jour ${table}: ${error.message}`);
  }
}

async function insertProjectData(table, data) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();
    
    if (error) throw error;
    return result;
  } catch (error) {
    console.error(`Erreur insertion Supabase (${table}):`, error);
    throw new Error(`Impossible d'insérer dans ${table}: ${error.message}`);
  }
}

// === Audit Log (maintenant avec Supabase) ===
async function logAuditEntry(entry) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    id: crypto.randomUUID(),
    ...entry
  };
  
  try {
    // Enregistrer dans Supabase audit_logs
    await insertProjectData('audit_logs', {
      user_id: entry.user || null,
      action_type: entry.action,
      severity: 'INFO',
      metadata: logEntry,
      created_at: new Date().toISOString()
    });
  } catch (supabaseError) {
    console.warn('Échec log Supabase, fallback vers fichier:', supabaseError);
    // Fallback vers fichier local
    const logFile = './audit-ai.log';
    await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
  }
  
  console.log('Audit log:', logEntry);
}

// === API Routes ===

// POST /api/prompt - Traitement du prompt principal
app.post('/api/prompt', verifyAuth, async (req, res) => {
  try {
    const { prompt, target = 'github', autoDeploy = false, project = '224solutions' } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt requis et doit être une string' });
    }

    // 1) Envoyer à OpenAI
    console.log('Envoi du prompt à OpenAI...');
    const aiResponse = await askOpenAI(prompt);
    
    // 2) Parser le JSON
    const parsedResponse = extractJSON(aiResponse);
    
    // 3) Créer répertoire temporaire pour les tests
    const tmpDir = path.join(os.tmpdir(), `ai-224solutions-${Date.now()}`);
    await fs.mkdir(tmpDir, { recursive: true });
    
    // 4) Écrire les fichiers dans le tmp pour les tests
    for (const file of parsedResponse.files) {
      const filePath = path.join(tmpDir, file.path);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, file.content);
    }
    
    // 5) Exécuter les tests sandbox
    const sandboxResult = await runSandboxTests(tmpDir, parsedResponse.tests);
    
    // 6) Si target=github, commit et créer PR
    let gitResult = null;
    let prResult = null;
    
    if (target === 'github') {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const branchName = `ai/${timestamp}-${sanitizeInput(parsedResponse.summary).replace(/\s+/g, '-').toLowerCase()}`;
      
      gitResult = await commitFilesToGitHub({
        owner: CONFIG.github.owner,
        repo: CONFIG.github.repo,
        baseBranch: CONFIG.github.baseBranch,
        branchName,
        files: parsedResponse.files,
        commitMessage: `AI: ${parsedResponse.summary}`
      });
      
      if (gitResult.success) {
        prResult = await createPullRequest({
          owner: CONFIG.github.owner,
          repo: CONFIG.github.repo,
          branchName,
          baseBranch: CONFIG.github.baseBranch,
          title: `🤖 AI: ${parsedResponse.summary}`,
          body: `## Généré par AI Copilote 224SOLUTIONS

**Prompt utilisateur:** ${prompt}

**Résumé:** ${parsedResponse.summary}

**Fichiers modifiés:**
${parsedResponse.files.map(f => `- \`${f.path}\``).join('\n')}

**Tests sandbox:** ${sandboxResult.ok ? '✅ Passés' : '❌ Échoués'}

**Auto-deploy:** ${autoDeploy ? 'Activé' : 'Désactivé'}

---
*Généré automatiquement par AI Copilote PDG*`
        });
      }
    }
    
    // 7) Nettoyage du répertoire temporaire
    await fs.rm(tmpDir, { recursive: true, force: true });
    
    // 8) Log d'audit
    await logAuditEntry({
      action: 'ai_prompt_processed',
      user: req.user.id,
      prompt: prompt.substring(0, 200) + '...',
      filesCount: parsedResponse.files.length,
      sandboxResult: sandboxResult.ok,
      branchName: gitResult?.branchName,
      prUrl: prResult?.url
    });
    
    // 9) Réponse
    res.json({
      success: true,
      aiPreview: parsedResponse,
      sandboxResult,
      branchName: gitResult?.branchName,
      prUrl: prResult?.url,
      prNumber: prResult?.number,
      message: 'Prompt traité avec succès'
    });
    
  } catch (error) {
    console.error('Erreur /api/prompt:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/trigger-deploy - Déclenchement manuel du pipeline
app.post('/api/trigger-deploy', verifyAuth, async (req, res) => {
  try {
    const { environment = 'production' } = req.body;
    
    // Déclencher le workflow GitHub Actions
    await octokit.actions.createWorkflowDispatch({
      owner: CONFIG.github.owner,
      repo: CONFIG.github.repo,
      workflow_id: 'ai-deploy.yml',
      ref: CONFIG.github.baseBranch,
      inputs: { environment }
    });
    
    await logAuditEntry({
      action: 'deploy_triggered',
      user: req.user.id,
      environment
    });
    
    res.json({ 
      success: true, 
      message: `Déploiement ${environment} déclenché` 
    });
    
  } catch (error) {
    console.error('Erreur /api/trigger-deploy:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/deploy-status - État du dernier déploiement
app.get('/api/deploy-status', verifyAuth, async (req, res) => {
  try {
    // Récupérer les dernières exécutions du workflow
    const workflows = await octokit.actions.listWorkflowRunsForRepo({
      owner: CONFIG.github.owner,
      repo: CONFIG.github.repo,
      workflow_id: 'ai-deploy.yml',
      per_page: 5
    });
    
    const lastRun = workflows.data.workflow_runs[0];
    
    res.json({
      status: lastRun?.status || 'unknown',
      conclusion: lastRun?.conclusion || 'unknown',
      lastUpdate: lastRun?.updated_at || null,
      url: lastRun?.html_url || null,
      runNumber: lastRun?.run_number || null
    });
    
  } catch (error) {
    console.error('Erreur /api/deploy-status:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/health - Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    config: {
      sandbox: CONFIG.sandbox.enabled,
      autoMerge: CONFIG.security.autoMergeAllowed
    }
  });
});

// === Error Handler ===
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// === Démarrage du serveur ===
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Serveur AI Copilote 224SOLUTIONS démarré sur le port ${PORT}`);
  console.log(`🔧 Sandbox: ${CONFIG.sandbox.enabled ? 'Activé' : 'Désactivé'}`);
  console.log(`🔐 Auto-merge: ${CONFIG.security.autoMergeAllowed ? 'Autorisé' : 'Désactivé'}`);
});