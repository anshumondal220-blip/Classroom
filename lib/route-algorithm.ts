// Graph-based Accessible Route Finder Algorithm

import { CAMPUS_NODES, CAMPUS_EDGES, CampusNode, CampusEdge, AccessibilityIssue } from './campus-data';

export interface RoutePreferences {
  avoidStairs: boolean;
  wheelchairAccessible: boolean;
  preferRamps: boolean;
  elevatorRequired: boolean;
  accessibleWashroomRequired?: boolean;
  avoidReportedHazards?: boolean;
}

export interface NavigationStep {
  stepNumber: number;
  instruction: string;
  subText?: string;
  distance: number;
  icon: 'start' | 'ramp' | 'elevator' | 'stairs' | 'turn' | 'straight' | 'destination' | 'door';
  accessibilityNote?: string;
  nodeId: string;
  floor: number;
}

export interface CalculatedRoute {
  path: CampusNode[];
  edges: CampusEdge[];
  totalDistance: number; // in meters
  estimatedMinutes: number; // in minutes
  stairsCount: number;
  rampsCount: number;
  elevatorsCount: number;
  isFullyAccessible: boolean;
  badges: string[];
  steps: NavigationStep[];
  warnings: string[];
  comparisonNotes: string[];
}

export interface RouteComparisonResult {
  accessibleRoute: CalculatedRoute | null;
  normalRoute: CalculatedRoute | null;
  errorMessage?: string;
}

// Build adjacency map helper
interface Neighbor {
  nodeId: string;
  edge: CampusEdge;
  cost: number;
}

function buildAdjacencyList(
  edges: CampusEdge[],
  activeIssues: AccessibilityIssue[],
  preferences: RoutePreferences,
  isAccessibleSearch: boolean
): Map<string, Neighbor[]> {
  const adj = new Map<string, Neighbor[]>();

  for (const node of CAMPUS_NODES) {
    adj.set(node.id, []);
  }

  // Set of blocked nodes/edges from reported issues
  const blockedNodes = new Set<string>();
  const blockedEdges = new Set<string>();

  if (preferences.avoidReportedHazards !== false) {
    for (const issue of activeIssues) {
      if (issue.status !== 'resolved') {
        if (issue.nodeId && (issue.type === 'broken_elevator' || issue.type === 'inaccessible_entrance')) {
          blockedNodes.add(issue.nodeId);
        }
        if (issue.edgeId) {
          blockedEdges.add(issue.edgeId);
        }
      }
    }
  }

  for (const edge of edges) {
    if (blockedEdges.has(edge.id)) continue;
    if (blockedNodes.has(edge.from) || blockedNodes.has(edge.to)) continue;

    let cost = edge.distance;

    if (isAccessibleSearch) {
      // Accessibility Filters
      if (preferences.avoidStairs && edge.stairs) {
        // Completely exclude or penalize immensely
        continue;
      }

      if (preferences.wheelchairAccessible && !edge.wheelchairAccessible) {
        // Only allow wheelchair accessible
        continue;
      }

      if (preferences.preferRamps && edge.ramp) {
        // Give preference/discount to ramp pathways
        cost = Math.max(5, cost * 0.85);
      }

      if (preferences.elevatorRequired) {
        if (edge.elevator) {
          cost = Math.max(5, cost * 0.5); // Favor elevators
        }
        if (edge.stairs) {
          cost += 1000;
        }
      }

      // Add gentle penalty for outdoor gravel or steep inclines
      if (edge.surfaceType === 'gravel') {
        cost += 50;
      }
    } else {
      // Normal route search: standard physical distance, stairs might even be shorter
      if (edge.stairs) {
        cost = edge.distance * 0.9; // Stairs often shorter physical distance in multi-floor
      }
    }

    // Bidirectional campus paths
    const listFrom = adj.get(edge.from) || [];
    listFrom.push({ nodeId: edge.to, edge, cost });
    adj.set(edge.from, listFrom);

    const listTo = adj.get(edge.to) || [];
    listTo.push({ nodeId: edge.from, edge, cost });
    adj.set(edge.to, listTo);
  }

  return adj;
}

// Dijkstra Shortest Path Solver
export function solveDijkstra(
  startId: string,
  destId: string,
  edges: CampusEdge[],
  activeIssues: AccessibilityIssue[],
  preferences: RoutePreferences,
  isAccessibleSearch: boolean
): { pathNodeIds: string[]; pathEdges: CampusEdge[]; totalDistance: number } | null {
  if (startId === destId) {
    const node = CAMPUS_NODES.find((n) => n.id === startId);
    return node ? { pathNodeIds: [startId], pathEdges: [], totalDistance: 0 } : null;
  }

  const adj = buildAdjacencyList(edges, activeIssues, preferences, isAccessibleSearch);

  const distances = new Map<string, number>();
  const previous = new Map<string, { nodeId: string; edge: CampusEdge } | null>();
  const visited = new Set<string>();

  for (const node of CAMPUS_NODES) {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
  }

  distances.set(startId, 0);

  while (visited.size < CAMPUS_NODES.length) {
    // Find unvisited node with smallest distance
    let currentId: string | null = null;
    let smallestDist = Infinity;

    for (const [id, dist] of distances.entries()) {
      if (!visited.has(id) && dist < smallestDist) {
        smallestDist = dist;
        currentId = id;
      }
    }

    if (!currentId || smallestDist === Infinity) {
      break; // Unreachable nodes
    }

    if (currentId === destId) {
      break; // Found destination!
    }

    visited.add(currentId);

    const neighbors = adj.get(currentId) || [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor.nodeId)) continue;

      const alt = distances.get(currentId)! + neighbor.cost;
      if (alt < distances.get(neighbor.nodeId)!) {
        distances.set(neighbor.nodeId, alt);
        previous.set(neighbor.nodeId, { nodeId: currentId, edge: neighbor.edge });
      }
    }
  }

  if (distances.get(destId) === Infinity) {
    return null; // No route found with current constraints
  }

  // Reconstruct path
  const pathNodeIds: string[] = [];
  const pathEdges: CampusEdge[] = [];
  let curr: string | null = destId;

  while (curr) {
    pathNodeIds.unshift(curr);
    const prevEntry = previous.get(curr);
    if (prevEntry) {
      pathEdges.unshift(prevEntry.edge);
      curr = prevEntry.nodeId;
    } else {
      break;
    }
  }

  const totalDistance = pathEdges.reduce((sum, e) => sum + e.distance, 0);
  return { pathNodeIds, pathEdges, totalDistance };
}

// Convert path to step-by-step navigation cues
export function generateNavigationSteps(
  path: CampusNode[],
  edges: CampusEdge[],
  isAccessible: boolean
): NavigationStep[] {
  if (path.length === 0) return [];
  if (path.length === 1) {
    return [
      {
        stepNumber: 1,
        instruction: `You are already at ${path[0].name}.`,
        distance: 0,
        icon: 'destination',
        nodeId: path[0].id,
        floor: path[0].floor,
      },
    ];
  }

  const steps: NavigationStep[] = [];

  // Step 1: Start
  steps.push({
    stepNumber: 1,
    instruction: `Start at ${path[0].name}`,
    subText: path[0].description,
    distance: 0,
    icon: 'start',
    accessibilityNote: path[0].hasTactilePaving
      ? 'Tactile paving guidance strips present underfoot.'
      : 'Level step-free staging area.',
    nodeId: path[0].id,
    floor: path[0].floor,
  });

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    const targetNode = path[i + 1];
    const stepNumber = steps.length + 1;

    let instruction = `Head toward ${targetNode.name}`;
    let icon: NavigationStep['icon'] = 'straight';
    let accessibilityNote: string | undefined = undefined;

    if (edge.ramp) {
      icon = 'ramp';
      instruction = `Take ${targetNode.name}`;
      accessibilityNote = `Accessible ramp (Slope ${edge.rampGrade || '1:12'}) with dual continuous handrails.`;
    } else if (edge.elevator) {
      icon = 'elevator';
      instruction = `Use elevator to reach Floor ${targetNode.floor}: ${targetNode.name}`;
      accessibilityNote = 'Braille buttons, wide door clearance (100cm+), and audio floor announcement.';
    } else if (edge.stairs) {
      icon = 'stairs';
      instruction = `Climb stairs (${edge.stairCount || 16} steps) to ${targetNode.name}`;
      accessibilityNote = '⚠️ Note: Flight of stairs present. Not suitable for wheelchairs.';
    } else if (edge.automaticDoor) {
      icon = 'door';
      instruction = `Enter via automatic power door to ${targetNode.name}`;
      accessibilityNote = 'Motion sensor or wave-to-open push button installed.';
    } else if (targetNode.category === 'washroom') {
      icon = 'destination';
      instruction = `Arrive at ${targetNode.name}`;
      accessibilityNote = 'ADA compliant universal accessible washroom.';
    }

    steps.push({
      stepNumber,
      instruction,
      subText: edge.notes,
      distance: edge.distance,
      icon,
      accessibilityNote,
      nodeId: targetNode.id,
      floor: targetNode.floor,
    });
  }

  // Final Step: Destination arrival
  const finalNode = path[path.length - 1];
  steps.push({
    stepNumber: steps.length + 1,
    instruction: `You have arrived at your destination: ${finalNode.name}`,
    subText: finalNode.building ? `Located inside ${finalNode.building}` : undefined,
    distance: 0,
    icon: 'destination',
    accessibilityNote: 'Step-free entrance and accessible seating available.',
    nodeId: finalNode.id,
    floor: finalNode.floor,
  });

  return steps;
}

// Full Route Calculation with Normal vs Accessible Comparison
export function calculateRouteComparison(
  startId: string,
  destId: string,
  preferences: RoutePreferences,
  activeIssues: AccessibilityIssue[] = []
): RouteComparisonResult {
  const nodeMap = new Map(CAMPUS_NODES.map((n) => [n.id, n]));

  // 1. Calculate Accessible Route
  let accessibleSolution = solveDijkstra(startId, destId, CAMPUS_EDGES, activeIssues, preferences, true);

  // Fallback relaxation if no strict route was found
  let isFallback = false;
  if (!accessibleSolution && preferences.avoidStairs) {
    // Try relaxing just the elevator requirement if that was blocking, or notify user
    const relaxedPrefs = { ...preferences, elevatorRequired: false };
    accessibleSolution = solveDijkstra(startId, destId, CAMPUS_EDGES, activeIssues, relaxedPrefs, true);
    if (accessibleSolution) {
      isFallback = true;
    }
  }

  // 2. Calculate Normal (Shortest standard) Route
  const normalPrefs: RoutePreferences = {
    avoidStairs: false,
    wheelchairAccessible: false,
    preferRamps: false,
    elevatorRequired: false,
    avoidReportedHazards: false,
  };
  const normalSolution = solveDijkstra(startId, destId, CAMPUS_EDGES, activeIssues, normalPrefs, false);

  if (!accessibleSolution && !normalSolution) {
    return {
      accessibleRoute: null,
      normalRoute: null,
      errorMessage: 'Sorry, we couldn’t find an accessible route between these locations. Try another destination or modify your accessibility preferences.',
    };
  }

  // Helper to compile CalculatedRoute
  const buildRouteObject = (
    sol: { pathNodeIds: string[]; pathEdges: CampusEdge[]; totalDistance: number },
    isAccessible: boolean
  ): CalculatedRoute => {
    const pathNodes = sol.pathNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);
    const stairsCount = sol.pathEdges.reduce((sum, e) => sum + (e.stairCount || (e.stairs ? 16 : 0)), 0);
    const rampsCount = sol.pathEdges.filter((e) => e.ramp).length;
    const elevatorsCount = sol.pathEdges.filter((e) => e.elevator).length;

    // Time calculation: wheelchair ~ 1.0 m/s (~60 m/min); walking ~ 1.3 m/s (~78 m/min)
    const speedMPerMin = isAccessible ? 60 : 75;
    const elevatorWaitMins = elevatorsCount * 1.2;
    const rampTimeMins = rampsCount * 0.4;
    const stairTimeMins = stairsCount * 0.05;
    const totalMinutes = Math.max(1, Math.round((sol.totalDistance / speedMPerMin) + elevatorWaitMins + rampTimeMins + stairTimeMins));

    const badges: string[] = [];
    const warnings: string[] = [];
    const comparisonNotes: string[] = [];

    if (stairsCount === 0) {
      badges.push('✓ No stairs');
      comparisonNotes.push('✓ Completely step-free journey');
    } else {
      warnings.push(`Contains ${stairsCount} stairs`);
      comparisonNotes.push(`Includes ${stairsCount} stairs`);
    }

    if (isAccessible && stairsCount === 0) {
      badges.push('✓ Wheelchair accessible');
      comparisonNotes.push('✓ 100% Wheelchair accessible paths');
    }

    if (rampsCount > 0) {
      badges.push(`✓ ${rampsCount} Accessible Ramp${rampsCount > 1 ? 's' : ''}`);
      comparisonNotes.push('✓ Compliant low-gradient ramps');
    }

    if (elevatorsCount > 0) {
      badges.push('✓ Elevator available');
      comparisonNotes.push('✓ Braille and voice-equipped elevator');
    }

    const steps = generateNavigationSteps(pathNodes, sol.pathEdges, isAccessible);

    return {
      path: pathNodes,
      edges: sol.pathEdges,
      totalDistance: sol.totalDistance,
      estimatedMinutes: totalMinutes,
      stairsCount,
      rampsCount,
      elevatorsCount,
      isFullyAccessible: stairsCount === 0,
      badges,
      steps,
      warnings,
      comparisonNotes,
    };
  };

  const accessibleRoute = accessibleSolution ? buildRouteObject(accessibleSolution, true) : null;
  const normalRoute = normalSolution ? buildRouteObject(normalSolution, false) : null;

  return {
    accessibleRoute,
    normalRoute,
    errorMessage: accessibleRoute
      ? undefined
      : 'No fully accessible route is currently available without encountering physical barriers. Here are the closest alternatives.',
  };
}
