from fastapi import APIRouter, Request
from pydantic_ai import Agent
from pydantic_ai.ui.ag_ui import AGUIAdapter
from starlette.responses import Response

router = APIRouter(prefix="/v1/chat", tags=["chat"])

agent = Agent("openai:gpt-4o-mini", instructions="You are a helpful assistant.")


@router.post("")
async def chat(request: Request) -> Response:
    return await AGUIAdapter.dispatch_request(request, agent=agent)
