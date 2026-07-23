/**
 * Ollama Integration Module
 * Communicates with local Ollama instance running Llama
 */

const axios = require('axios');

class Ollama {
  constructor(config) {
    this.config = config;
    this.baseURL = `http://${config.ollama.host}:${config.ollama.port}`;
    this.model = config.ollama.model;
    this.timeout = config.ollama.timeout || 30000;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout
    });
  }

  /**
   * Check if Ollama is running
   */
  async isRunning() {
    try {
      const response = await this.client.get('/api/tags');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Test connection to Ollama
   */
  async testConnection() {
    try {
      const response = await this.client.get('/api/tags');
      
      // Check if llama2 model is available
      const models = response.data.models || [];
      const hasModel = models.some(m => m.name.includes(this.model));
      
      if (!hasModel) {
        throw new Error(`Model ${this.model} tidak ditemukan. Jalankan: ollama pull ${this.model}`);
      }

      return true;
    } catch (error) {
      throw new Error(`Tidak bisa terhubung ke Ollama: ${error.message}`);
    }
  }

  /**
   * Query Ollama with a prompt
   */
  async query(prompt) {
    try {
      const systemPrompt = `Anda adalah Bucek, asisten AI yang helpful, harmless, dan honest. 
Anda berbicara dalam Bahasa Indonesia yang natural dan friendly.
Jawab dengan singkat dan jelas (maksimal 2-3 kalimat).
Hindari penjelasan teknis yang rumit.`;

      console.log(`[Ollama] Querying ${this.model} with: ${prompt}`);

      const response = await this.client.post('/api/generate', {
        model: this.model,
        prompt: prompt,
        system: systemPrompt,
        stream: false,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40
      });

      if (response.data && response.data.response) {
        let text = response.data.response.trim();
        
        // Clean up response
        text = text.replace(/[\*\#]/g, ''); // Remove markdown symbols
        text = text.split('\n')[0]; // Take first line only
        
        return text;
      }

      return null;

    } catch (error) {
      console.error('[Ollama] Error:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Ollama tidak berjalan. Jalankan: ollama serve');
      }
      
      throw error;
    }
  }

  /**
   * Get streaming response from Ollama
   */
  async *queryStream(prompt) {
    try {
      const response = await this.client.post('/api/generate', {
        model: this.model,
        prompt: prompt,
        stream: true
      }, {
        responseType: 'stream'
      });

      for await (const chunk of response.data) {
        const line = chunk.toString().trim();
        if (line) {
          const json = JSON.parse(line);
          if (json.response) {
            yield json.response;
          }
        }
      }
    } catch (error) {
      console.error('[Ollama] Stream error:', error.message);
      throw error;
    }
  }

  /**
   * Get model info
   */
  async getModelInfo() {
    try {
      const response = await this.client.get('/api/show', {
        params: { name: this.model }
      });
      
      return response.data;
    } catch (error) {
      console.error('[Ollama] Error getting model info:', error.message);
      throw error;
    }
  }

  /**
   * List available models
   */
  async listModels() {
    try {
      const response = await this.client.get('/api/tags');
      return response.data.models || [];
    } catch (error) {
      console.error('[Ollama] Error listing models:', error.message);
      throw error;
    }
  }
}

module.exports = Ollama;