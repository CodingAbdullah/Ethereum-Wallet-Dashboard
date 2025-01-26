import LinkType from './LinkType';

// Custom Navbar Link Object Type
export default interface NavbarLinkObject {
    name: String,
    dropdown: LinkType[];
};