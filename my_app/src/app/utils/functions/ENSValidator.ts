// Verify that the domain name ends with a .eth handle
export default function ENSValidator(domain: string): boolean {
    if (domain.substring(domain.length - 4) !== '.eth') {
        return false;
    }
    else {
        return true;
    }
}