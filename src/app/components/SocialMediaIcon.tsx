import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import LinkType from "../utils/types/LinkType";

// Social Media Icon Custom Component
export default function SocialMediaIcon(socialMediaLink: LinkType) {
    const { href, name } = socialMediaLink;

    switch (name) {
        case "GitHub":
            return (
                <Link href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-100">
                    <FontAwesomeIcon icon={faGithub} className="h-6 w-6" />
                    <span className="sr-only">{name}</span>
                </Link>
            )
        case "Twitter":
            return (
                <Link href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-100">
                    <FontAwesomeIcon icon={faXTwitter} className="h-6 w-6" />
                    <span className="sr-only">{name}</span>
                </Link>
            )
        default:
            return <div />
    }
}
