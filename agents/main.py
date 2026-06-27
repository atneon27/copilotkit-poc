from fastapi import FastAPI

from api.v1.chat import router as chat_router

app = FastAPI(title="Agents Service")
app.include_router(chat_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
