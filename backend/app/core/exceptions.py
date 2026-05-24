from fastapi import Request
from fastapi.responses import JSONResponse


async def validation_exception_handler(request: Request, exc):
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Invalid request data",
            "errors": str(exc),
        },
    )


async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected error occurred. Please try again.",
        },
    )