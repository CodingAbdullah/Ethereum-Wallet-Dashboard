import Link from "next/link";
import { Github, X } from 'lucide-react';
import LinkType from "../utils/types/LinkType";

// Socia Media Icon Custom Component
export default function SocialMediaIcon(socialMediaLink: LinkType) {
    const { href, name } = socialMediaLink;
    
    // Conditionally render Social Media icons based on name
    switch (name) {
        case "Twitter":
            return (
                <Link href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-100">
                    <Github className="h-6 w-6" />
                    <span className="sr-only">{name}</span>
                </Link>    
            )
        case "GitHub":
            return (
                <Link href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-100">
                    <X className="h-6 w-6" />
                    <span className="sr-only">{name}</span>
                </Link>
            )
        default:
            return <div />
    }
}