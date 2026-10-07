import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { FooterLinks } from '../utils/constants/FooterLinks'
import SocialMediaIcon from './SocialMediaIcon'

// Footer Custom Component: data providers by group, social links and copyright
export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <p className="text-center text-sm text-gray-500 mb-6">Powered by free and keyless data providers</p>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {FooterLinks.providers.map(({ group, links }) => (
                        <div key={group} className="text-center sm:text-left">
                            <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-3">{group}</h2>
                            <ul className="space-y-2">
                                {links.map(link => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-400 hover:text-gray-100 transition-colors duration-300 inline-flex items-center group"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <span className="font-mono tracking-wider">{link.name}</span>
                                            <ExternalLink className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center space-x-6 mb-8 pt-10 pb-7">
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
