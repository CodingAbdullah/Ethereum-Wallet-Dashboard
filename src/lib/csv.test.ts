import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "./csv";

describe("csv", () => {
    it("quotes commas, quotes and newlines", () => {
        expect(csvCell('a,b')).toBe('"a,b"');
        expect(csvCell('say "hi"')).toBe('"say ""hi"""');
        expect(csvCell('line\nbreak')).toBe('"line\nbreak"');
        expect(csvCell(null)).toBe('');
        expect(csvCell(1.5)).toBe('1.5');
    });

    it("neutralizes spreadsheet formulas in text cells", () => {
        expect(csvCell('=HYPERLINK("http://evil")')).toBe('"\'=HYPERLINK(""http://evil"")"');
        expect(csvCell('+1')).toBe("'+1");
        expect(csvCell('@SUM(A1)')).toBe("'@SUM(A1)");
        // Numbers stay numbers
        expect(csvCell(-5)).toBe('-5');
    });

    it("builds rows with CRLF line endings", () => {
        expect(toCsv(['a', 'b'], [[1, 'x'], [2, null]])).toBe('a,b\r\n1,x\r\n2,\r\n');
    });
});
