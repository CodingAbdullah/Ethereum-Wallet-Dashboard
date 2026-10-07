import NavbarLinkObject from "../types/NavbarLinkObject";
import { SITE_PAGES } from "./SitePages";

// Navbar menus, built from the site page list (src/app/utils/constants/SitePages.ts)
export const NavbarLinks: NavbarLinkObject[] = SITE_PAGES.map(group => ({
    name: group.name,
    dropdown: group.pages.map(page => ({ name: page.name, href: page.href }))
}));
