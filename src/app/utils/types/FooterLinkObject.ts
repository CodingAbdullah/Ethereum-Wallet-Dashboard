import LinkType from './LinkType';

// Custom Footer Links Object Type: data providers in labelled groups, plus social links
export default interface FooterLinksObject {
    providers: { group: string; links: LinkType[] }[];
    social: LinkType[];
};
