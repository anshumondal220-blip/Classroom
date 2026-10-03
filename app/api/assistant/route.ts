import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { CAMPUS_NODES, CAMPUS_FACILITIES, INITIAL_ISSUES } from '@/lib/campus-data';

// Fallback intelligent responder if Gemini API key is missing or encounters a rate limit/offline issue
function generateFallbackResponse(query: string): { reply: string; suggestedDestinationId?: string; suggestedAction?: string } {
  const q = query.toLowerCase();

  if (q.includes('305') || q.includes('room 305')) {
    return {
      reply: 'To reach Room 305 without using stairs:\n\n1. From the Central Quad or West perimeter, take **Academic Building West Ramp (Slope 1:12)**.\n2. Enter through the automated push-plate sliding doors into the Academic Hall ground lobby.\n3. Proceed straight to the **Central Accessible Elevator** (equipped with voice cues and braille buttons).\n4. Ride to **Floor 3**.\n5. Exit elevator and follow the wide, level corridor 30 meters directly to **Room 305**.\n\nRoom 305 features motorized tiered seating access and an audio induction hearing loop.',
      suggestedDestinationId: 'academic-room-305',
      suggestedAction: 'Route to Room 305',
    };
  }

  if (q.includes('elevator') || q.includes('lift')) {
    return {
      reply: 'There are 4 high-capacity accessible elevators across campus:\n\n• **Williamson Memorial Library Central Elevator**: Serves Floors G, 1, 2, 3 (Glass-walled, 100cm wide door).\n• **Academic Hall Central Elevator**: Serves Floors G, 1, 2, 3 (Direct access to Room 305 & 2nd Floor accessible washroom).\n• **Science & Engineering Complex Heavy-Duty Lift**: Serves Floors G, 1, 2 (120cm wide door, 1600kg capacity).\n• **Hall of Administration Elevator**: Serves Floors G, 1, 2.\n\nAll campus elevators have braille control panels mounted at 90cm height and audio chimes.',
      suggestedDestinationId: 'academic-elevator',
      suggestedAction: 'View Academic Elevator',
    };
  }

  if (q.includes('washroom') || q.includes('restroom') || q.includes('toilet') || q.includes('bathroom')) {
    return {
      reply: 'The two closest primary accessible washrooms are:\n\n1. **Quad Central Universal Washroom** (Located in Central Quad Pavilion South) — Features an electric ceiling hoist, adult changing table, power push-button door, and red emergency call cord.\n2. **Academic Hall 2nd Floor Restroom** (Room 215B) — Right next to the central elevator on Floor 2, with fold-down grab bars and anti-scald automatic faucets.\n\nBoth are 100% wheelchair accessible and all-gender.',
      suggestedDestinationId: 'accessible-washroom-quad',
      suggestedAction: 'Route to Quad Washroom',
    };
  }

  if (q.includes('lab') || q.includes('computer') || q.includes('engineering')) {
    return {
      reply: 'The **Advanced Computer Engineering Lab (Lab 101)** is located on the ground floor of the Science & Engineering Complex.\n\n**Accessible Route**:\n• From Main Gate / Quad: Follow the smooth-paved diagonal path to **Science Complex East Ramp (1:14 grade)**.\n• Enter via automatic sensor doors into the Central Atrium.\n• Follow the yellow tactile guideline strip directly into Lab 101.\n\nLab 101 is equipped with 4 motorized sit-stand desks, screen magnification software, and 1.2m wide aisles.',
      suggestedDestinationId: 'computer-lab',
      suggestedAction: 'Route to Computer Lab',
    };
  }

  if (q.includes('ramp')) {
    return {
      reply: 'Campus accessible ramps with ADA-compliant grades (< 1:12):\n\n• **Williamson Library Heated North Ramp** (Grade 1:16, heated non-slip surface, avoids 22 steps)\n• **Admin Building South Ramp** (Grade 1:14, dual handrails, connects Parking Lot A to lobby)\n• **Academic Hall West Ramp** (Grade 1:12, weather canopy)\n• **Science Complex East Ramp** (Grade 1:14, direct lab access)\n• **SAC Entry Ramp** (Grade 1:12 with level rest landings)',
      suggestedDestinationId: 'library-ramp',
      suggestedAction: 'View Library Ramp',
    };
  }

  if (q.includes('emergency') || q.includes('evacuat') || q.includes('help') || q.includes('police')) {
    return {
      reply: '🚨 **Emergency Accessibility Information**:\n\n• **Campus Security & Crisis Response**: Call +1 (555) 019-9111 or press any outdoor Blue Light emergency station.\n• **Nearest Evacuation Refuge Zone**: Science Complex 2nd Floor East Stairwell Enclosure (has 2-hour fire rating, direct two-way callbox, and Evac-Chair 300H).\n• **West Step-Free Evacuation Gate**: Next to Parking Lot A, featuring panic push-bars and zero threshold.\n• **Disability Escort Service**: Golf carts equipped with wheelchair ramps are available 24/7.',
      suggestedDestinationId: 'security-desk',
      suggestedAction: 'View Emergency Hub',
    };
  }

  if (q.includes('charge') || q.includes('battery') || q.includes('power wheelchair')) {
    return {
      reply: '⚡ **Electric Wheelchair Recharging Station** is available in the **Student Activity Centre (SAC) Lounge** on the Ground Floor.\n\nIt features free high-amperage 24V & 48V plugs compatible with Pride, Permobil, and Quantum chairs, standard USB-C fast ports, and a tire inflation pump.',
      suggestedDestinationId: 'sac-main',
      suggestedAction: 'Route to SAC Recharging Station',
    };
  }

  return {
    reply: `I can help you navigate campus safely without encountering barriers. You can ask me:\n• "How do I reach Room 305 without stairs?"\n• "Where is the nearest accessible washroom?"\n• "Which elevators are currently operational?"\n• "Show me the gentlest ramp into the Library"\n• "Where can I charge my motorized wheelchair?"\n\nAll routes calculated avoid stairs and utilize step-free, ADA-compliant paths.`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, startLocationId, destinationLocationId } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    // Check if GEMINI_API_KEY is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      const fallback = generateFallbackResponse(prompt);
      return NextResponse.json(fallback);
    }

    const campusContext = `
You are the AI Accessibility Assistant for "Accessibility Navigator", a college campus navigation system designed for students with mobility difficulties, wheelchair users, and individuals needing accessible facilities.

CAMPUS KNOWLEDGE BASE:
Locations: ${CAMPUS_NODES.map((n) => `${n.name} (ID: ${n.id}, Category: ${n.category}, Floor: ${n.floor}, Features: ${n.features?.join(', ') || 'Accessible'})`).join('\n')}

Facilities: ${CAMPUS_FACILITIES.map((f) => `${f.name} (Location: ${f.location}, Floor: ${f.floor}, Door: ${f.doorWidth}, Features: ${f.features.join(', ')})`).join('\n')}

Active Barrier Reports: ${INITIAL_ISSUES.map((i) => `${i.type} at ${i.location}: ${i.description} (Status: ${i.status})`).join('\n')}

RULES:
1. Always prioritize step-free, wheelchair-friendly, and ramp/elevator routes.
2. If the user asks about Room 305: Room 305 is on Floor 3 of Academic Hall. They must use the West Ramp, enter Academic Hall lobby, take the Central Elevator to Floor 3, and take the wide level hallway. Never suggest the stairs.
3. If an elevator or ramp has maintenance, inform them of alternate routes.
4. Keep answers concise, welcoming, respectful, and crystal clear.
5. If recommending a specific destination, mention its exact name and ID.
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: campusContext,
        },
      });

      const reply = response.text || generateFallbackResponse(prompt).reply;

      // Detect if a specific location was recommended
      let suggestedDestinationId: string | undefined = undefined;
      let suggestedAction: string | undefined = undefined;

      const lowerReply = reply.toLowerCase();
      if (lowerReply.includes('room 305')) {
        suggestedDestinationId = 'academic-room-305';
        suggestedAction = 'Route to Room 305';
      } else if (lowerReply.includes('quad central') || lowerReply.includes('accessible washroom')) {
        suggestedDestinationId = 'accessible-washroom-quad';
        suggestedAction = 'Route to Accessible Washroom';
      } else if (lowerReply.includes('computer') || lowerReply.includes('lab 101')) {
        suggestedDestinationId = 'computer-lab';
        suggestedAction = 'Route to Computer Lab';
      } else if (lowerReply.includes('library elevator') || lowerReply.includes('academic elevator')) {
        suggestedDestinationId = 'academic-elevator';
        suggestedAction = 'View Elevator Location';
      }

      return NextResponse.json({
        reply,
        suggestedDestinationId,
        suggestedAction,
      });
    } catch (genError) {
      console.warn('Gemini generateContent error, using fallback:', genError);
      const fallback = generateFallbackResponse(prompt);
      return NextResponse.json(fallback);
    }
  } catch (error) {
    console.error('API Assistant Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
