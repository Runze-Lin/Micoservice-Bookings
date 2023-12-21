import time
from starlette.middleware.base import BaseHTTPMiddleware

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = time.time()

        # log request details
        request_details = f"Request: {request.method} {request.url}"
        print(request_details)

        # call the next middleware or route handler
        response = await call_next(request)

        # calculation
        process_time = time.time() - start_time

        # log response details
        response_details = f"Response: Status {response.status_code}, Duration {process_time:.2f} seconds"
        print(response_details)

        return response
