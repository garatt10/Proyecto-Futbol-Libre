"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDateSpanish, getLocalTimezoneName, convertPeruTimeToLocal } from '@/lib/date-utils';

interface EmbedData {
  id: number;
  attributes: {
    embed_name: string;
    idioma: string | null;
    embed_iframe: string;
  };
}

interface Match {
  id: number;
  attributes: {
    diary_hour: string;
    diary_description: string;
    date_diary: string;
    deportes: string;
    embeds: {
      data: EmbedData[];
    };
  };
}

interface ApiResponse {
  data: Match[];
}

function sortMatchesByTime(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => {
    const timeA = a.attributes.diary_hour;
    const timeB = b.attributes.diary_hour;
    const [hoursA, minutesA] = timeA.split(':').map(Number);
    const [hoursB, minutesB] = timeB.split(':').map(Number);
    
    // Convert to minutes since midnight for comparison
    const totalMinutesA = hoursA * 60 + minutesA;
    const totalMinutesB = hoursB * 60 + minutesB;
    
    // Handle day wrapping (e.g., 23:00 vs 00:30)
    const adjustedMinutesA = totalMinutesA < 360 ? totalMinutesA + 1440 : totalMinutesA; // Add 24 hours if before 6 AM
    const adjustedMinutesB = totalMinutesB < 360 ? totalMinutesB + 1440 : totalMinutesB;
    
    return adjustedMinutesA - adjustedMinutesB;
  });
}

function filterTodayMatches(matches: Match[]): Match[] {
  // Get Peru's date (UTC-5)
  const now = new Date();
  const utcHours = now.getUTCHours();
  const peruHours = utcHours - 5; // Peru is UTC-5
  
  // Adjust date if needed based on Peru's time
  const peruDate = new Date(now);
  if (peruHours < 0) {
    peruDate.setDate(peruDate.getDate() - 1);
  } else if (peruHours >= 24) {
    peruDate.setDate(peruDate.getDate() + 1);
  }
  
  const peruDateStr = peruDate.toISOString().split('T')[0]; // YYYY-MM-DD

  return matches.filter(match => {
    const matchDate = match.attributes.date_diary;
    return matchDate === peruDateStr;
  });
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timezone = getLocalTimezoneName();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('https://golazoplay.com/agenda.json', {
          cache: 'no-store',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar los partidos');
        }

        const data: ApiResponse = await response.json();
        
        if (!data.data || !Array.isArray(data.data)) {
          throw new Error('Formato de datos inválido');
        }

        // Filter today's matches and sort them by time
        const todayMatches = filterTodayMatches(data.data);
        const sortedMatches = sortMatchesByTime(todayMatches);
        setMatches(sortedMatches);
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    // Fetch initially
    fetchMatches();

    // Refresh every minute
    const interval = setInterval(fetchMatches, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto p-4">
          <div className="text-center py-8">Cargando partidos...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Pelota Libre TV</h1>
          <p className="text-lg">
            Ver Pelota Libre TV online en vivo y en directo. Disfruta de canales gratuitos de streaming para ver
            partidos de fútbol argentino, Copa Libertadores, Copa Sudamericana, Champions League y más, en
            FULL HD.
          </p>
          <p className="text-xl mt-4">Ver Pelota Libre TV para todos.</p>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-green-600 text-white px-4 py-2">
            <div className="text-lg">
              {formatDateSpanish(new Date())} - Agenda Deportiva
            </div>
            <div className="text-sm opacity-75">
              Horarios mostrados en {timezone}
            </div>
          </div>
          <table className="w-full">
            <tbody>
              {error ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : matches.length > 0 ? (
                matches.map((match) => {
                  const { id, attributes } = match;
                  const { diary_hour, diary_description, date_diary, embeds } = attributes;
                  const localTime = convertPeruTimeToLocal(diary_hour);
                  const embedData = embeds.data.map(embed => ({
                    name: embed.attributes.embed_name,
                    idioma: embed.attributes.idioma,
                    url: embed.attributes.embed_iframe
                  }));

                  return (
                    <tr key={id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                      <td className="border-r border-gray-200 px-4 py-3 font-mono w-24">
                        {localTime}
                      </td>
                      <td className="px-4 py-3">
                        <Link 
                          href={`/match/${id}?title=${encodeURIComponent(diary_description)}&embedUrls=${encodeURIComponent(JSON.stringify(embedData))}`}
                          className="text-blue-600 hover:underline"
                        >
                          {diary_description}
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                    No hay partidos programados para hoy
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
