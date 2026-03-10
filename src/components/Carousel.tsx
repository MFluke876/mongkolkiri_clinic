import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface Props {
    images: string[];
    isOpen: boolean;
    onClose: () => void;
}


export const fetchImages = async (patientId: string, entityType: string, entityId: string) => {

    const folderPath = `${patientId}/${entityType}/${entityId}`;

    const { data, error } = await supabase.storage
        .from("medical-images")
        .list(folderPath);

    if (error) throw error;
    if (!data) return [];

    const filePaths = data.map((file) => `${folderPath}/${file.name}`);

    const { data: signed, error: signedError } = await supabase.storage
    .from("medical-images")
    .createSignedUrls(filePaths, 3600);

    if (signedError) throw signedError;
    
    return signed.map(i => i?.signedUrl).filter(Boolean) as string[];
    
};

export const Carousel = ({ images, isOpen, onClose }: Props) => {

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        setCurrentIndex(0);
    }, [images]);

    if(!isOpen || images.length === 0) return null;

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };


    return (
         <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50">

            {/* CLOSE BUTTON */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white text-3xl"
            >
                ✕
            </button>

            {/* MAIN IMAGE */}
            <div className="flex items-center gap-4">

                <button onClick={prevImage} className="text-white text-4xl">
                ←
                </button>

                <img
                src={images[currentIndex]}
                className="max-h-[70vh] max-w-[80vw] rounded shadow-lg"
                />

                <button onClick={nextImage} className="text-white text-4xl">
                →
                </button>

            </div>

            {/* THUMBNAILS */}
            <div className="flex gap-2 mt-6 overflow-x-auto max-w-[80vw] p-2">

                {images.map((img, index) => (
                <img
                    key={index}
                    src={img}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-14 w-14 object-cover rounded cursor-pointer border-2
                    ${index === currentIndex ? "border-white" : "border-transparent"}
                    `}
                />
                ))}

            </div>

            </div>
    );
};