import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { FooterLinks } from '../utils/constants/FooterLinks'
import SocialMediaIcon from './SocialMediaIcon'

// Footer Custom Component
export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-wrap justify-center gap-4 w-full md:w-auto">
                    <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
                        {
                            FooterLinks.ecosystem.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-gray-400 hover:text-gray-100 transition-colors duration-300 flex items-center group"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span className="font-mono tracking-wider">{ link.name }</span>
                                    <ExternalLink className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex justify-center space-x-6 mb-8 py-7">
                    {
                        FooterLinks.social.map(link => (
                            <SocialMediaIcon {...link} key={link.name} />
                    ))}
                </div>
                <div className="border-t border-gray-800 pt-5 text-center">
                    <p className="text-gray-500 text-sm font-mono">
                        &copy; { new Date().getFullYear() } ΞTHERΞUM DASHBOARD. Powered by Next.js
                    </p>
                </div>
            </div>
        </footer>
    )
}