import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"; 
import Link from "next/link";
import { stakingSitesList } from "../utils/constants/StakingSitesList";

// Staking Websites Section Component
export default function StakingWebsiteSection() {
    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stakingSitesList.map(platform => (
                    <Card key={platform.id} className="bg-gray-900 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-100">{platform.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-gray-400">{platform.description}</CardDescription>
                                <Link
                                    href={platform.website}
                                    className="mt-4 inline-block text-sm text-gray-100 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Visit Website
                                </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    )
}