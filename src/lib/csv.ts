// CSV export helpers.
// Token names and symbols come from on-chain contracts anyone can deploy, so cells that a spreadsheet
// would run as a formula (=, +, -, @, tab, CR) are prefixed with a quote.

const FORMULA_START = /^[=+\-@\t\r]/;

export function csvCell(value: unknown): string {
    if (value === null || value === undefined) return '';
    let text = String(value);
    if (typeof value === 'string' && FORMULA_START.test(text)) text = "'" + text;
    return /[",\r\n]/.test(text) || text !== text.trim() ? '"' + text.replace(/"/g, '""') + '"' : text;
}

export function toCsv(header: string[], rows: unknown[][]): string {
    return [header, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
