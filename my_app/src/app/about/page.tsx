import { AboutPageCardList } from '../utils/constants/AboutPageCardList'
import AboutPageCardType from '../utils/types/AboutPageCardType'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'

// Custom About Page Component
export default function AboutPage() {
    return (
        <main className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
            <section className="text-center py-10 px-4">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400">
                        ABOUT
                    </h1>
                    <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                        Explore the world of Ethereum with just one click. View wallet activity, recent transactions, asset holdings, ERC20/721 token data, prices, and so much more!
                    </p>
                    <a 
                        href="https://github.com/CodingAbdullah" 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-block bg-gradient-to-r from-gray-600 to-gray-400 text-white py-3 px-6 rounded-full hover:from-gray-500 hover:to-gray-300 transition-all duration-300 transform hover:scale-105"
                    >
                        Learn About the Developer
                    </a>
                </div>
            </section>
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {
                        AboutPageCardList.map((feature: AboutPageCardType, index: Number) => (
                            <div key={index} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105">
                                <div className="p-8 flex flex-col items-center text-center h-full justify-between">
                                    <div>
                                        <FontAwesomeIcon icon={feature.icon} className="text-7xl text-gray-400 mb-6" />
                                        <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                                        <p className="text-gray-400 mb-6">
                                            {feature.description}
                                        </p>
                                    </div>
                                    <Link
                                        target='_blank' 
                                        rel='noreferrer'
                                        href={String(feature.link)}
                                        className="inline-block bg-gradient-to-r from-gray-600 to-gray-400 text-white py-2 px-6 rounded-full hover:from-gray-500 hover:to-gray-300 transition-all duration-300 transform hover:scale-105"
                                        >
                                        {feature.linkText}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
}