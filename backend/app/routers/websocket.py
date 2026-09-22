from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
import json
import logging
from backend.app.services.connection_manager import manager
from backend.app.services.auth import decode_access_token

router = APIRouter(tags=["websocket"])
logger = logging.getLogger("nagarnetra.ws")

@router.websocket("/v1/live")
async def websocket_live_endpoint(
    websocket: WebSocket,
    token: str = Query(None)
):
    # Optional token validation for WebSocket stream
    client_user = "anonymous"
    if token:
        try:
            token_data = decode_access_token(token)
            client_user = token_data.email
        except Exception as e:
            logger.warning(f"WebSocket auth failed: {e}")

    await manager.connect(websocket)
    try:
        await websocket.send_json({
            "type": "CONNECTION_ESTABLISHED",
            "message": "NagarNetra Telemetry WebSocket Connected",
            "status": "ONLINE",
            "client": client_user
        })
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("action") == "ping":
                    await websocket.send_json({"type": "PONG", "timestamp": msg.get("timestamp")})
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

async def broadcast_live_event(event_type: str, payload: dict):
    await manager.broadcast({"type": event_type, "payload": payload})
