// An error with an HTTP status that withErrorHandling returns as-is ({ error: message }, status)
export class HttpError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
    }
}
