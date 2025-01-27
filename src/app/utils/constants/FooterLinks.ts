import FooterLinksObject from "../types/FooterLinkObject";
import { Links } from "./Links";

// Footer Links Constant
export const FooterLinks: FooterLinksObject = {
    ecosystem: Links.filter((_, index) => index <= 7),
    social: Links.filter((_, index) => index > 7 && index <= 9)
}