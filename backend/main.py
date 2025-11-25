import os
import sys
import html
import re
from typing import List, Dict, Any, Optional

# Set encoding to utf-8 for console output
sys.stdout.reconfigure(encoding='utf-8')

# 1. Setup
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# 1. Setup
if not os.getenv("GOOGLE_API_KEY"):
    print("Error: GOOGLE_API_KEY not found in environment variables.")
    print("Please create a .env file in the backend directory with your API key.")

os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

# Configure Safety Settings to be permissive
safety_settings = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
}

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    temperature=0.3,
    max_retries=3,
    safety_settings=safety_settings
)

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    thread_id: Optional[str] = None

class ApprovalRequest(BaseModel):
    thread_id: str
    approved: bool = True

# 2. Define Tools
screener = ScreenerTool()
tools = [screener]

# GLOBAL CONTEXT
GLOBAL_CONTEXT = """
You are part of a 4-agent financial analysis system.
Follow these rules:
1. NEVER hallucinate missing values.
2. ALWAYS use the data provided in context.
3. If data is insufficient, explain what you need.
4. Always provide a clear, text-based response.
"""

# 3. Data Agent
DATA_AGENT_CONTEXT = f"""
{GLOBAL_CONTEXT}
ROLE:
- You are the DATA AGENT.
- Your job is to fetch financial data using the ScreenerTool.

INSTRUCTIONS:
- When asked about a stock, use the ScreenerTool to fetch the data.
- Call the tool with the stock symbol or company name.
- IMPORTANT: After calling the tool, you MUST wait for the tool result before providing analysis.
- When you receive tool results, provide a brief summary of what data was fetched.

Example: If asked about "Wipro", use the ScreenerTool(stock_name="Wipro") to get the data.
"""

llm_with_tools = llm.bind_tools(tools)

def invoke_with_retry(model, messages, retries=3):
    """Helper to retry model invocation on empty output error"""
    for i in range(retries):
        try:
            response = model.invoke(messages)
            return response
        except Exception as e:
            if "model output must contain either output text or tool calls" in str(e) and i < retries - 1:
                print(f"Empty response error, retrying ({i+1}/{retries})...")
                time.sleep(1)
                continue
            raise e

def dataagent_node(state: MessagesState):
    messages = state["messages"]
    system_msg = SystemMessage(content=DATA_AGENT_CONTEXT)
    try:
        response = invoke_with_retry(llm_with_tools, [system_msg] + messages)
        if not response.content and not (hasattr(response, 'tool_calls') and response.tool_calls):
            print("Warning: Empty response from dataagent, creating fallback...")
            response = AIMessage(content="I'll fetch the data for you now.")
            response.tool_calls = []
        return {"messages": [response]}
    except Exception as e:
        print(f"Error in dataagent_node: {e}")
        return {"messages": [AIMessage(content=f"Error fetching data: {e}")]}

# Tool execution node
tool_node = ToolNode(tools)

# Filter Agent
FILTER_AGENT_CONTEXT = f"""
{GLOBAL_CONTEXT}
ROLE:
- You are the FILTER AGENT.
- You filter and analyze the financial data that was collected.

INSTRUCTIONS:
- Review the conversation history to find the raw financial data.
- Identify stocks with positive metrics (positive ROE, reasonable market cap, etc.).
- Filter out stocks with poor fundamentals.
- If no financial data was found in the conversation history, explicitly state that no data is available for filtering and suggest checking the company name.
- ALWAYS provide a text response summarizing your findings.

IMPORTANT: You MUST generate a text response explaining what you filtered and why.
"""

def filteragent_node(state: MessagesState):
    messages = state["messages"]
    system_message = SystemMessage(content=FILTER_AGENT_CONTEXT)
    try:
        response = invoke_with_retry(llm, [system_message] + messages)
        if not response.content:
            print("Warning: Empty response from filteragent, creating fallback...")
            response = AIMessage(content="Based on the data, I've identified stocks with positive fundamentals for further analysis.")
        return {"messages": [response]}
    except Exception as e:
        print(f"Error in filteragent_node: {e}")
        return {"messages": [AIMessage(content=f"Error filtering data: {e}")]}

# Risk Assessment Agent
RISK_AGENT_CONTEXT = f"""
{GLOBAL_CONTEXT}
ROLE:
- You are the RISK ASSESSMENT AGENT.
- Your job is to evaluate the financial safety of the companies based on the filtered data.

INSTRUCTIONS:
- Analyze key financial stability metrics if available:
  * Debt-to-Equity Ratio (if inferable from Balance Sheet)
  * Interest Coverage Ratio (if inferable from P&L)
  * P/E Ratio (valuation risk)
  * Current Ratio (liquidity)
- Assign a Risk Level: LOW, MEDIUM, or HIGH.
- JUSTIFY your risk assessment for each stock with specific data points.
- If no financial data is available, state that a risk assessment cannot be performed due to missing data.
- ALWAYS provide a text response summarizing your risk analysis.

IMPORTANT: You MUST generate a text response explaining the risk profile of each stock.
"""

def riskagent_node(state: MessagesState):
    messages = state["messages"]
    system_message = SystemMessage(content=RISK_AGENT_CONTEXT)
    try:
        response = invoke_with_retry(llm, [system_message] + messages)
        if not response.content:
            print("Warning: Empty response from riskagent, creating fallback...")
            response = AIMessage(content="Based on the available data, I've assessed the risk profile of the stocks.")
        return {"messages": [response]}
    except Exception as e:
        print(f"Error in riskagent_node: {e}")
        return {"messages": [AIMessage(content=f"Error assessing risk: {e}")]}

# Report Agent
REPORT_AGENT_CONTEXT = f"""
{GLOBAL_CONTEXT}
ROLE:
- You are the REPORT GENERATION AGENT.
- Your job is to compile all previous analyses into a comprehensive, formatted report.

INSTRUCTIONS:
- Review all previous agent messages (data fetching, filtering, and risk assessment).
- Create a well-structured final report with:
  * Executive Summary
  * Company Overview
  * Financial Data Summary
  * Risk Assessment
  * Recommendation
- Use markdown formatting for better readability.
- ALWAYS provide a complete text response.
"""

def reportagent_node(state: MessagesState):
    messages = state["messages"]
    system_message = SystemMessage(content=REPORT_AGENT_CONTEXT)
    try:
        response = invoke_with_retry(llm, [system_message] + messages)
        if not response.content:
            print("Warning: Empty response from reportagent, creating fallback...")
            response = AIMessage(content="## Financial Analysis Report\n\nBased on the analysis conducted, please refer to the previous agent outputs for details.")
        return {"messages": [response]}
    except Exception as e:
        print(f"Error in reportagent_node: {e}")
        return {"messages": [AIMessage(content=f"Error generating report: {e}")]}

# Build the graph
builder = StateGraph(MessagesState)
builder.add_node("dataagent", dataagent_node)
builder.add_node("tools", tool_node)
builder.add_node("filteragent", filteragent_node)
builder.add_node("riskagent", riskagent_node)
builder.add_node("reportagent", reportagent_node)
builder.add_edge(START, "dataagent")

def route_after_dataagent(state: MessagesState):
    last_msg = state["messages"][-1]
    if hasattr(last_msg, 'tool_calls') and last_msg.tool_calls:
        return "tools"
    return "filteragent"

def route_after_tools(state: MessagesState):
    last_msg = state["messages"][-1]
    if hasattr(last_msg, 'content') and 'error' in str(last_msg.content).lower():
        return "dataagent"
    return "filteragent"

builder.add_conditional_edges("dataagent", route_after_dataagent)
builder.add_conditional_edges("tools", route_after_tools)
builder.add_edge("filteragent", "riskagent")
builder.add_edge("riskagent", "reportagent")
builder.add_edge("reportagent", END)

graph = builder.compile()

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        user_input = request.message
        print(f"Received request: {user_input}")
        inputs = {"messages": [HumanMessage(content=user_input)]}
        
        final_state = graph.invoke(inputs)
        
        final_message = final_state["messages"][-1]
        content = final_message.content if hasattr(final_message, 'content') else "No content generated."
        
        return {"response": content}
    except Exception as e:
        print(f"Error processing request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("Starting FastAPI Server on port 8001...")
    print("Financial Report Agent with OCR correction enabled")
    uvicorn.run(app, host="0.0.0.0", port=8001)