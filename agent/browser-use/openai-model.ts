/**
 * OpenAI integration for browser-use
 * Configures and initializes a LangChain OpenAI model with browser-use Agent
 */

import { ChatOpenAI } from "@langchain/openai";
import { TaskRequest, TaskResponse, TaskStatus, TaskStep, TaskDetails } from "./types";
import { BrowserUseClient } from "./api";

/**
 * Configuration options for creating an OpenAI-powered browser-use agent
 */
export interface OpenAIBrowserAgentConfig {
  /**
   * The user's question that needs to be answered.
   */
  question: string;
  /**
   * General task instruction, e.g., "Answer the question using web search"
   */
  taskDescription?: string;
  /**
   * OpenAI API key (required for the LLM brain)
   */
  openAIApiKey: string;
  /**
   * Browser-Use service API key (required for actual browsing)
   */
  browserUseApiKey: string;
  /**
   * Optional: Base URL for the Browser-Use API
   */
  browserUseBaseUrl?: string;
  /**
   * Model to use (defaults to gpt-4o)
   */
  model?: string;
  /**
   * Temperature setting (defaults to 0.0 for deterministic outputs)
   */
  temperature?: number;
  /**
   * Whether to use vision capabilities (defaults to true)
   */
  useVision?: boolean;
}

/**
 * Agent class for browser automation with LLM
 */
export class Agent {
  private question: string;
  private taskDescription: string;
  private llm: ChatOpenAI;
  private browserUseClient: BrowserUseClient;
  private useVision: boolean;
  private steps: TaskStep[] = [];
  private readonly startStepRegex = /^(?:\d+[\.\)]\s+|[-*]\s+)/;
  
  constructor(config: {
    question: string;
    taskDescription?: string;
    llm: ChatOpenAI;
    browserUseClient: BrowserUseClient;
    use_vision?: boolean;
  }) {
    this.question = config.question;
    this.taskDescription =
      config.taskDescription ||
      "Answer the provided question by searching the web using a browser automation service, then provide a consolidated answer.";
    this.llm = config.llm;
    this.browserUseClient = config.browserUseClient;
    this.useVision = config.use_vision ?? true;
  }
  
  /**
   * Adds a new step to the task execution log
   */
  private addStep(action: string, description: string, data?: any) {
    // Create a new step with timestamp
    this.steps.push({
      action,
      description,
      timestamp: new Date().toISOString(),
      data
    });
  }

  /**
   * Run the browser task and return results with detailed steps
   */
  async run(): Promise<TaskDetails> {
    this.steps = []; // Reset steps for a new run
    this.addStep("initialize", `Starting task: ${this.taskDescription} for question: "${this.question}"`);
    
    try {
      this.addStep("understand_question", `Received question: "${this.question}"`);

      // Step 2: Formulate a precise task for the Browser-Use service
      // This step can still use an LLM to refine the raw question into a good instruction 
      // for the Browser-Use service, or we can use a template.
      // For now, let's use a template incorporating the original question and optionally a search query.
      
      // Optional: Generate a search query first if it helps formulate a better Browser-Use task
      this.addStep("formulate_search_query_start", "(Optional) Formulating a web search query to guide the browser automation task.");
      const searchQueryPrompt = `Based on the question: "${this.question}", what would be an effective web search query? Respond with only the search query.`;
      let llmResponseForQuery = await this.llm.invoke([{ role: "user", content: searchQueryPrompt }]);
      const searchQuery = llmResponseForQuery.content.toString().trim();
      this.addStep("formulate_search_query_complete", `(Optional) Generated search query: "${searchQuery}"`);

      // Formulate the task for Browser-Use service - BE EXPLICIT about content extraction
      const browserTaskInstruction = 
        `To answer the question: "${this.question}", please perform the following steps: ` +
        `1. Use a web search (you can use the query "${searchQuery}" as a starting point if helpful) to find the most relevant webpage. ` +
        `2. Navigate to that webpage. ` +
        `3. Extract the main textual content from that webpage. ` +
        `4. Return this extracted textual content as your output.`;

      this.addStep("formulate_browser_task", `Formulated task for Browser-Use service: "${browserTaskInstruction}"`);

      // Step 3: Execute task using Browser-Use service for actual web interaction
      this.addStep("execute_browser_task_start", `Requesting Browser-Use service to perform task.`);
      
      const taskRequest: TaskRequest = { task: browserTaskInstruction };
      const createdTask = await this.browserUseClient.createTask(taskRequest);
      this.addStep("execute_browser_task_created", `Browser-Use task created with ID: ${createdTask.id}. Waiting for completion...`);

      const browserTaskDetails = await this.browserUseClient.waitForCompletion(createdTask.id);

      if (browserTaskDetails.status === "failed") {
        this.addStep("execute_browser_task_failed", `Browser-Use task ${createdTask.id} failed.`, browserTaskDetails.error);
        throw new Error(`Browser-Use task failed: ${browserTaskDetails.error?.message || 'Unknown error'}`);
      }
      
      const actualWebSearchResults = browserTaskDetails.output || "";
      this.addStep("execute_browser_task_complete", `Browser-Use task ${createdTask.id} completed. Output received.`, { output: actualWebSearchResults, fullDetails: browserTaskDetails });
      
      // Add steps from Browser-Use service if available
      if (browserTaskDetails.steps && browserTaskDetails.steps.length > 0) {
        browserTaskDetails.steps.forEach((step, index) => {
          this.addStep(`browser_use_step_${index + 1}`, `(Browser-Use) ${step.description}`, step.data);
        });
      }

      // Step 4: Formulate Answer based on information from Browser-Use service
      this.addStep("formulate_answer_start", "Formulating the final answer using information from Browser-Use service.");
      const finalAnswerPrompt = `Based on the following information gathered from the web: "${actualWebSearchResults}", provide a comprehensive answer to the question: "${this.question}". If the gathered information is insufficient or irrelevant, please state that. Also, list the key steps you took in your reasoning process to arrive at this answer.`;
      let llmResponseForAnswer = await this.llm.invoke([{ role: "user", content: finalAnswerPrompt }]);
      const finalAnswerAndSteps = llmResponseForAnswer.content.toString().trim();
      
      // Attempt to parse out an answer and reasoning steps if the LLM provides them separately
      // This is a simple heuristic; more robust parsing might be needed.
      let finalAnswer = finalAnswerAndSteps;
      let reasoningSteps: string[] = [];
      
      const reasoningHeaderRegex = /reasoning steps:|key steps:|steps taken:/i;
      const splitByReasoning = finalAnswerAndSteps.split(reasoningHeaderRegex);
      
      if (splitByReasoning.length > 1) {
        finalAnswer = splitByReasoning[0].trim();
        const stepsText = splitByReasoning.slice(1).join(" ").trim();
        reasoningSteps = this.extractStepsFromResponse(stepsText);
      } else {
        reasoningSteps = this.extractStepsFromResponse(finalAnswerAndSteps);
        if (reasoningSteps.length > 0) {
            let tempAnswer = finalAnswerAndSteps;
            reasoningSteps.forEach(step => {
                tempAnswer = tempAnswer.replace(step, "").trim();
            });
            if (!this.startStepRegex.test(finalAnswer) || tempAnswer.length > finalAnswer.length / 2) {
                 finalAnswer = tempAnswer.trim();
            }
        }
      }
      
      // If finalAnswer is empty after trying to extract steps, use the original full response.
      if (!finalAnswer && finalAnswerAndSteps) {
          finalAnswer = finalAnswerAndSteps;
      }
      // If the final answer is still empty AND actualWebSearchResults existed, use a message indicating that.
      // This handles cases where the LLM might return an empty string after processing browser results.
      if (!finalAnswer && actualWebSearchResults) {
        finalAnswer = "The web browsing task was completed, but a final answer could not be formulated based on the retrieved content.";
      } else if (!finalAnswer && !actualWebSearchResults) {
        finalAnswer = "The web browsing task did not yield any content, and no final answer could be formulated.";
      }


      this.addStep("formulate_answer_complete", "Final answer formulated.", { answer: finalAnswer });

      // Add extracted reasoning steps to the main steps list
      if (reasoningSteps.length > 0) {
        reasoningSteps.forEach((step, index) => {
          this.addStep(`reasoning_step_${index + 1}`, step);
        });
      } else {
        this.addStep("reasoning_steps_note", "No separate reasoning steps were explicitly extracted from the LLM's final response.");
      }
      
      this.addStep("complete", "Task completed successfully.");
      
      return {
        id: `task-${Date.now()}`,
        status: "finished" as TaskStatus,
        live_url: "", // Not applicable for this simulated agent
        created_at: new Date().toISOString(),
        output: finalAnswer, // The final answer
        steps: this.steps,
      };
    } catch (error: any) {
      // Log the error as a step
      this.addStep("error", `Task failed: ${error.message}`);
      
      // Return task details with error information
      return {
        id: `task-${Date.now()}`,
        status: "failed" as TaskStatus,
        live_url: "",
        created_at: new Date().toISOString(),
        error: {
          message: error.message,
          code: "EXECUTION_ERROR"
        },
        steps: this.steps,
      };
    }
  }
  
  /**
   * Extracts structured steps from the OpenAI response
   */
  private extractStepsFromResponse(response: string): string[] {
    // Try to find numbered steps (e.g., "1. First step")
    // Using a regular expression without the 's' flag for compatibility
    // const stepRegex = /(\d+\.\s.*?)(?=\d+\.|$)/g; // Original regex commented out for clarity on new logic below
    
    const steps: string[] = [];
    if (!response) return steps;

    const lines = response.split('\n');
    let currentStep = '';
    let inStep = false;
    
    // Regex to identify the start of a numbered or bulleted step
    // Supports "1. ", "1) ", "- ", "* "
    // const startStepRegex = /^(?:\d+[\.\)]\s+|[-*]\s+)/; // Now a class member
    
    for (const line of lines) {
      if (this.startStepRegex.test(line)) {
        // If we were already in a step, save it
        if (inStep && currentStep.trim()) {
          steps.push(currentStep.trim());
        }
        // Start a new step
        currentStep = line;
        inStep = true;
      } else if (inStep) {
        // Continue current step
        currentStep += ' ' + line;
      }
    }
    
    // Add the last step if exists
    if (inStep && currentStep.trim()) {
      steps.push(currentStep.trim());
    }
    
    // If no steps were found, fall back to paragraph splitting
    if (steps.length === 0) {
      return response.split('\n\n')
        .filter(p => p.trim().length > 0)
        .map(p => p.trim());
    }
    
    return steps;
  }
}

/**
 * Creates a browser-use agent powered by OpenAI models
 */
export async function createOpenAIBrowserAgent(config: OpenAIBrowserAgentConfig) {
  if (!config.openAIApiKey) {
    throw new Error("OpenAI API key is required");
  }
  if (!config.browserUseApiKey) {
    throw new Error("Browser-Use service API key is required");
  }
  if (!config.question) {
    throw new Error("User question is required");
  }

  // Initialize the LangChain ChatOpenAI model
  const llm = new ChatOpenAI({
    openAIApiKey: config.openAIApiKey,
    modelName: config.model || "gpt-4o",
    temperature: config.temperature ?? 0.0,
  });

  // Initialize the BrowserUseClient
  const browserUseClient = new BrowserUseClient({
    apiKey: config.browserUseApiKey,
    baseUrl: config.browserUseBaseUrl,
  });

  // Create the browser-use agent with the configured model and client
  const agent = new Agent({
    question: config.question,
    taskDescription: config.taskDescription,
    llm: llm,
    browserUseClient: browserUseClient,
    use_vision: config.useVision ?? true,
  });

  return agent;
}

/**
 * Runs a browser task using OpenAI-powered agent
 */
export async function runOpenAIBrowserTask(config: OpenAIBrowserAgentConfig): Promise<TaskDetails> {
  const agent = await createOpenAIBrowserAgent(config);
  return await agent.run();
} 