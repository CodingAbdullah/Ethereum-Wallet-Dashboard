"use client";

import { Card, CardHeader, CardDescription } from "./../components/ui/card";

// ERC721 Token Picture Section Custom Component
export default function ERC721TokenPictureSection(props: { name: string, url: string }) {
    const { name, url } = props;

    // Render ERC721 Token Picture Section Custom Component
    return (
        <>
            <Card style={{ marginLeft: 'auto', marginRight: 'auto', width: '50%' }} className="bg-gray-900 border-gray-800 mt-10 mb-10 shadow-xl w-full">
                <CardHeader className="border-b border-gray-800 pb-6 ">
                    {url?.startsWith('https://')
                        ? <img className="mx-auto h-[50px] w-[50px] object-contain" alt={name} src={url} />
                        : <div className="mx-auto h-[50px] w-[50px] bg-gray-700 rounded" />}
                    <CardDescription className="mx-auto text-gray-400 text-lg font-light">
                        <i>{name}</i>
                    </CardDescription>
                </CardHeader>
            </Card>
        </>
    )
}