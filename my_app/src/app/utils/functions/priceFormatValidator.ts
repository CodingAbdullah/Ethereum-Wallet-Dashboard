// Conditionally determine if pricing needs formatting
export default function priceFormatValidator(value: number): boolean {

    // Determine the precision based on numeric values
    // Small values require no formatting
    if (value < 0.1){
        return false;
    }
    else {
        return true;
    }
}