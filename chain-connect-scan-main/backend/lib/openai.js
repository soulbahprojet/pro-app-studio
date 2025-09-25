// backend/lib/openai.js
import fetch from 'node-fetch';

export class OpenAIService {
  constructor(apiKey, model = 'gpt-5-2025-08-07') {
    this.apiKey = apiKey;
    this.model = model;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async generateCode(prompt, systemPrompt = null) {
    const defaultSystemPrompt = `Tu es un expert développeur pour l'application 224SOLUTIONS (plateforme de services en Guinée).

Architecture technique:
- Frontend: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Supabase (PostgreSQL + Edge Functions)
- State management: React Query + Context API
- Routing: React Router v6
- Authentification: Supabase Auth

CONTRAINTES IMPORTANTES:
1. Retourne UNIQUEMENT un JSON valide suivant ce schéma:
{
  "summary": "Description courte",
  "files": [{"path": "src/...", "content": "code complet"}],
  "tests": ["commandes de test"],
  "runCommands": ["npm install ..."]
}

2. Code production-ready avec:
   - Gestion d'erreurs complète
   - Types TypeScript stricts
   - Composants réutilisables
   - Responsive design (mobile-first)
   - Accessibilité (ARIA, semantic HTML)

3. Respecte les conventions 224SOLUTIONS:
   - Utilise les composants UI existants (src/components/ui/)
   - Applique les tokens de design (couleurs, spacing)
   - Intègre avec Supabase pour les données
   - Suit les patterns d'auth existants

4. Optimisations:
   - Lazy loading pour les gros composants
   - Memoization avec React.memo/useMemo
   - Code splitting si nécessaire
   - Images optimisées avec WebP

Ne retourne JAMAIS de texte en dehors du JSON.`;

    const messages = [
      { 
        role: 'system', 
        content: systemPrompt || defaultSystemPrompt 
      },
      { 
        role: 'user', 
        content: this.sanitizePrompt(prompt) 
      }
    ];

    try {
      const response = await this.callAPI({
        model: this.model,
        messages,
        max_completion_tokens: 4000,
        // Note: GPT-5 ne supporte pas le paramètre temperature
      });

      return response.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  async generateTests(files, description) {
    const systemPrompt = `Tu génères des tests unitaires pour une application React/TypeScript.

Utilise:
- @testing-library/react pour les tests de composants
- Jest pour les tests unitaires
- MSW pour le mocking des API calls

Retourne un JSON avec:
{
  "summary": "Tests générés",
  "files": [{"path": "src/__tests__/...", "content": "code test"}],
  "tests": ["npm run test"],
  "runCommands": ["npm install --save-dev @testing-library/react"]
}`;

    const prompt = `Génère des tests pour ces fichiers:

${files.map(f => `File: ${f.path}\n${f.content.substring(0, 500)}...`).join('\n\n')}

Description: ${description}`;

    return this.generateCode(prompt, systemPrompt);
  }

  async optimizeCode(code, filePath) {
    const systemPrompt = `Tu optimises du code React/TypeScript pour:
- Performance (memoization, lazy loading)
- Lisibilité et maintenabilité
- Accessibilité
- Sécurité

Retourne le code optimisé dans le même format JSON.`;

    const prompt = `Optimise ce code:

File: ${filePath}
${code}`;

    return this.generateCode(prompt, systemPrompt);
  }

  async callAPI(payload) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }

    return await response.json();
  }

  sanitizePrompt(prompt) {
    return prompt
      .replace(/[<>\"'&]/g, '') // Enlever caractères dangereux
      .trim()
      .substring(0, 8000); // Limiter la taille
  }

  extractJSON(content) {
    // Extraire JSON d'un contenu qui peut contenir du markdown
    const codeBlockMatch = content.match(/```(?:json)?\n?([\s\S]*?)```/);
    const raw = codeBlockMatch ? codeBlockMatch[1] : content;
    
    try {
      const parsed = JSON.parse(raw.trim());
      
      // Validation du schéma
      if (!parsed.summary || !Array.isArray(parsed.files)) {
        throw new Error('Schema invalide: manque summary ou files');
      }
      
      // Validation des fichiers
      for (const file of parsed.files) {
        if (!file.path || typeof file.content !== 'string') {
          throw new Error(`Fichier invalide: ${JSON.stringify(file)}`);
        }
      }
      
      return parsed;
    } catch (e) {
      throw new Error(`Impossible de parser le JSON: ${e.message}\nContenu: ${raw.substring(0, 200)}...`);
    }
  }

  async generateDocumentation(files, description) {
    const systemPrompt = `Tu génères de la documentation technique en markdown.

Inclus:
- README.md avec instructions d'installation
- Guide d'utilisation
- Documentation API si applicable
- Exemples de code

Format de retour JSON standard.`;

    const prompt = `Génère la documentation pour:

Description: ${description}

Fichiers:
${files.map(f => `- ${f.path}`).join('\n')}`;

    return this.generateCode(prompt, systemPrompt);
  }
}

export default OpenAIService;