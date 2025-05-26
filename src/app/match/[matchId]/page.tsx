"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface StreamOption {
  name: string;
  idioma: string | null;
  url: string;
}

function decodeStreamUrl(encodedUrl: string): string {
  try {
    // Handle full URLs that might be passed directly
    if (encodedUrl.startsWith('http')) {
      return encodedUrl;
    }

    // Extract the base64 parameter after ?r=
    const base64Match = encodedUrl.match(/\?r=(.+)/);
    if (!base64Match) {
      console.warn("No base64 parameter found in URL:", encodedUrl);
      return "";
    }
    
    // Decode the base64 string
    const decodedUrl = atob(base64Match[1]);
    return decodedUrl;
  } catch (error) {
    console.error("Error decoding URL:", error);
    return "";
  }
}

export default function MatchPage() {
  const searchParams = useSearchParams();
  const [selectedOption, setSelectedOption] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [streamOptions, setStreamOptions] = useState<StreamOption[]>([]);
  
  const title = searchParams.get("title") || "";
  const embedUrlsParam = searchParams.get("embedUrls") || "[]";

  useEffect(() => {
    try {
      // Parse the JSON string of embed URLs
      const embedOptions: StreamOption[] = JSON.parse(embedUrlsParam);

      // Create stream options with the decoded URLs
      const options: StreamOption[] = embedOptions.map(option => ({
        name: option.name || "Opción sin nombre",
        idioma: option.idioma,
        url: decodeStreamUrl(option.url)
      })).filter(option => option.url); // Filter out options with empty URLs

      setStreamOptions(options);
    } catch (error) {
      console.error("Error parsing embed URLs:", error);
      setError(true);
    }
  }, [embedUrlsParam]);

  if (streamOptions.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{title}</h1>
            <a 
              href="/" 
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
            >
              Volver
            </a>
          </div>
          <div className="text-center py-8 text-gray-600">
            No hay opciones de transmisión disponibles para este partido.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{title}</h1>
          <a 
            href="/" 
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
          >
            Volver
          </a>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video bg-gray-100 mb-6 rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-gray-600">Cargando transmisión...</div>
            </div>
          )}
          
          <iframe
            key={selectedOption}
            src={streamOptions[selectedOption]?.url}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setError(true);
              setIsLoading(false);
            }}
            style={{ border: 'none' }}
          />

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90">
              <div className="text-center text-gray-800 p-4">
                <p className="text-xl mb-2">Error al cargar la transmisión</p>
                <p className="text-sm text-gray-600">Por favor intenta con otra opción</p>
              </div>
            </div>
          )}
        </div>

        {/* Stream Options */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {streamOptions.map((option: StreamOption, index: number) => (
            <button
              key={index}
              onClick={() => {
                setSelectedOption(index);
                setIsLoading(true);
                setError(false);
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedOption === index
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              <div>{option.name}</div>
              {option.idioma && (
                <div className="text-sm opacity-75">{option.idioma}</div>
              )}
            </button>
          ))}
        </div>

        {/* Help Text */}
        <div className="text-gray-600 text-sm space-y-2">
          <p>• Si una opción no funciona, prueba con otra opción disponible.</p>
          <p>• La transmisión puede tardar unos segundos en cargar.</p>
          <p>• Asegúrate de que tu navegador permite la reproducción de contenido multimedia.</p>
        </div>
      </div>
    </main>
  );
}
