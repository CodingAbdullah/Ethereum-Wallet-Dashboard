"use client";

import { Card, CardHeader, CardDescription } from "./../components/ui/card";
import Image from "next/image";

// ERC721 Token Picture Section Custom Component
export default function ERC721TokenPictureSection(props: { name: string, url: string }) {
    const { name, url } = props;

    // Render ERC721 Token Picture Section Custom Component
    return (
        <>
            <Card style={{ marginLeft: 'auto', marginRight: 'auto', width: '50%' }} className="bg-gray-900 border-gray-800 mt-10 mb-10 shadow-xl w-full">
                <CardHeader className="border-b border-gray-800 pb-6 ">
                    <Image className="mx-auto" alt="ERC20_Token_Image.png" src={url} width={50} height={50} />
                    <CardDescription className="mx-auto text-gray-400 text-lg font-light">
                        <i>{name}</i>
                    </CardDescription>
                </CardHeader>
            </Card>
        </>
    )
}