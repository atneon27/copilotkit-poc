import os

from fastapi import APIRouter, Request
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.litellm import LiteLLMProvider
from pydantic_ai.ui.ag_ui import AGUIAdapter
from starlette.responses import Response

router = APIRouter(prefix="/v1/chat", tags=["chat"])

BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
API_KEY = os.getenv("OPENROUTER_API_KEY")
PRIMARY_LLM = os.getenv("OPENROUTER_PRIMARY_LLM", "openai/gpt-4o-mini")

model = OpenAIChatModel(
    PRIMARY_LLM,
    provider=LiteLLMProvider(
        api_base=BASE_URL,
        api_key=API_KEY,
    ),
)

agent = Agent(model, instructions="You are a helpful assistant.")


@router.post("")
async def chat(request: Request) -> Response:
    return await AGUIAdapter.dispatch_request(request, agent=agent)
