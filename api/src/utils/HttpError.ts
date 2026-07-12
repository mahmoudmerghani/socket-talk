export class HttpError extends Error {
    public status: number;
    public code?: string;

    constructor(status: number, message: string, code?: string) {
        super(message);
        this.status = status;
        if (code !== undefined) {
            this.code = code;
        }
    }
}
