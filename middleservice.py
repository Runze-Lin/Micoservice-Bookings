import time
from starlette.middleware.base import BaseHTTPMiddleware

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):

        # log request details
        request_details = f"Request: {request.method} {request.url}"
        print(request_details)

        # call the next middleware or route handler
        response = await call_next(request)


        # log response details
        response_details = f"Response: Status {response.status_code}"
        print(response_details)

        return response
