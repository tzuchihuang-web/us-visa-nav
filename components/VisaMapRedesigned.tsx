'use client';

import React, { useMemo } from 'react';
import { VISA_KNOWLEDGE_BASE, Visa, VisaStage } from '@/src/data/visaKnowledgeBase';
import { UserProfile } from '@/lib/types';
import { getVisaRecommendations } from '@/lib/visa-matching-engine';

interface VisaMapRedesignedProps {
  userProfile: UserProfile;
  selectedVisa?: string | null;
  onVisaSelect: (visaId: string) => void;
}

/** 地圖上要顯示的簽證大分類（排除旅遊等） */
const INCLUDED_CATEGORIES = ['student', 'work', 'immigrant', 'investment'] as const;

/** stage 映射 - 根據 visa stage 決定顯示列位置 */
type StageKey = 'column0' | 'column1' | 'column2' | 'column3';

// Map visa.stage to display columns - STRICT MAPPING
const STAGE_MAPPING: Record<VisaStage, StageKey> = {
  current: 'column0',
  next: 'column1',
  future: 'column2',
  long_term: 'column3',
};

const STAGE_ORDER: StageKey[] = ['column0', 'column1', 'column2', 'column3'];

/** difficulty 數值 → Y座標 offset */
const DIFFICULTY_OFFSET: Record<string, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

const VisaMapRedesigned: React.FC<VisaMapRedesignedProps> = ({
  userProfile,
  selectedVisa,
  onVisaSelect,
}) => {
  // ========================================================================
  // 1. 把 VISA_KNOWLEDGE_BASE (Array) 變成好查詢的 map（id → visa）
  // ========================================================================
  const visaById = useMemo(() => {
    const map: Record<string, Visa> = {};
    VISA_KNOWLEDGE_BASE.forEach((visa) => {
      map[visa.id.toLowerCase()] = visa;
    });
    return map;
  }, []);

  // ========================================================================
  // 2. 中央 click handler
  // ========================================================================
  const handleNodeClick = (visaId: string) => {
    console.log('[VisaMap] Node clicked:', visaId);
    onVisaSelect(visaId);
  };

  // ========================================================================
  // 3. Matching engine – 取得每個 visa 的推薦狀態
  // ========================================================================
  const visaRecommendations = useMemo(
    () => getVisaRecommendations(userProfile),
    [userProfile]
  );

  // ========================================================================
  // 4. 建 adjacency graph：id → [nextId...]
  // ========================================================================
  const adjacencyGraph = useMemo(() => {
    const graph: Record<string, string[]> = {};

    VISA_KNOWLEDGE_BASE.forEach((visa) => {
      // 只圖上顯示特定類別
      if (!INCLUDED_CATEGORIES.includes(visa.category as any)) return;

      const id = visa.id.toLowerCase();
      const nextSteps =
        visa.commonNextSteps
          ?.map((step) => step.toLowerCase())
          .filter((nextId) => {
            const nextVisa = visaById[nextId];
            return !!nextVisa && INCLUDED_CATEGORIES.includes(nextVisa.category as any);
          }) ?? [];

      graph[id] = nextSteps;
    });

    console.info('[VisaMapRedesigned] Built adjacency graph:', graph);
    return graph;
  }, [visaById]);

  // ========================================================================
  // 5. BFS：算從 currentVisa 出發「可到達的所有簽證」
  // ========================================================================
  const reachableVisaIds = useMemo(() => {
    const current = userProfile.currentVisa?.toLowerCase();
    const reachable = new Set<string>();

    // 沒有 currentVisa：先把所有簽證當成 reachable
    if (!current) {
      VISA_KNOWLEDGE_BASE.forEach((visa) => {
        if (!INCLUDED_CATEGORIES.includes(visa.category as any)) return;
        reachable.add(visa.id.toLowerCase());
      });
      console.info('[VisaMapRedesigned] No current visa – treating all visas as reachable.');
      return reachable;
    }

    // 有 currentVisa：從 currentVisa BFS
    if (!visaById[current]) {
      console.warn('[VisaMapRedesigned] currentVisa not found in knowledge base:', current);
      return reachable;
    }

    const queue: string[] = [current];
    reachable.add(current);

    while (queue.length > 0) {
      const id = queue.shift()!;
      const neighbors = adjacencyGraph[id] || [];
      for (const nextId of neighbors) {
        if (!reachable.has(nextId)) {
          reachable.add(nextId);
          queue.push(nextId);
        }
      }
    }

    console.info('[VisaMapRedesigned] Reachable visas from current:', Array.from(reachable));
    return reachable;
  }, [userProfile.currentVisa, adjacencyGraph, visaById]);

  // ========================================================================
  // 6. 用 stage → column 排版欄位，但只顯示 reachable 的簽證
  // ========================================================================
  const visasByStage = useMemo(() => {
    const stages: Record<StageKey, string[]> = {
      column0: [],
      column1: [],
      column2: [],
      column3: [],
    };

    const currentVisaId = userProfile.currentVisa?.toLowerCase() ?? null;

    VISA_KNOWLEDGE_BASE.forEach((visa) => {
      if (!INCLUDED_CATEGORIES.includes(visa.category as any)) return;

      const id = visa.id.toLowerCase();

      // 有 currentVisa 時，只顯示 reachable 的簽證
      if (currentVisaId && !reachableVisaIds.has(id)) return;

      // 根據 visa.stage 映射到顯示欄位 - STRICT MAPPING
      const stageKey = STAGE_MAPPING[visa.stage];
      
      // 如果是當前簽證，強制放在 column0 (override stage)
      if (currentVisaId && id === currentVisaId) {
        stages.column0.push(id);
      } else {
        stages[stageKey].push(id);
      }
    });

    // 沒有 currentVisa：在 column0 加一個「START」假的節點（可選）
    if (!userProfile.currentVisa) {
      stages.column0 = ['start'];
    }

    console.info('[VisaMapRedesigned] Final stage structure (by stage):', stages);
    return stages;
  }, [reachableVisaIds, userProfile.currentVisa]);

  // ========================================================================
  // 7. BFS 找 currentVisa → selectedVisa 的 path，用來做 highlight
  // ========================================================================
  const findPathBetweenVisas = (
    adjacency: Record<string, string[]>,
    fromId: string,
    toId: string
  ): string[] | null => {
    const start = fromId.toLowerCase();
    const target = toId.toLowerCase();

    if (start === target) return [start];

    const queue: Array<{ visaId: string; path: string[] }> = [
      { visaId: start, path: [start] },
    ];
    const visited = new Set<string>([start]);

    while (queue.length > 0) {
      const { visaId, path } = queue.shift()!;
      const neighbors = adjacency[visaId] || [];

      for (const next of neighbors) {
        if (visited.has(next)) continue;
        visited.add(next);
        const newPath = [...path, next];
        if (next === target) return newPath;
        queue.push({ visaId: next, path: newPath });
      }
    }

    return null;
  };

  const highlightedPathIds = useMemo(() => {
    if (!selectedVisa) return null;

    const current = userProfile.currentVisa?.toLowerCase();
    const selected = selectedVisa.toLowerCase();

    // 沒有 currentVisa：只 highlight 被點的那顆
    if (!current) {
      return new Set([selected]);
    }

    const path = findPathBetweenVisas(adjacencyGraph, current, selected);
    if (!path) {
      console.info('[VisaMapRedesigned] No path found – highlighting only endpoints');
      return new Set([current, selected]);
    }

    console.info('[VisaMapRedesigned] Highlighted path:', path);
    return new Set(path);
  }, [selectedVisa, userProfile.currentVisa, adjacencyGraph]);

  // ========================================================================
  // 8. layout：依 stage 排 X (column)，依 index + difficulty 排 Y
  // ========================================================================
  const getVisaPosition = (
    stage: StageKey,
    index: number,
    total: number,
    visa?: Visa
  ) => {
    const stageIdx = STAGE_ORDER.indexOf(stage);
    const baseX = 160; // 起始 X
    const stageSpacingX = 260;
    const x = baseX + stageIdx * stageSpacingX;

    const baseY = 260; // 整張圖往下移一點，避免貼頂
    const verticalSpacing = 110;

    const difficultyValue = visa?.difficulty ?? 'medium';
    const difficultyOffset = (DIFFICULTY_OFFSET[difficultyValue] ?? 0) * -12;

    const y =
      baseY +
      (index - (total - 1) / 2) * verticalSpacing +
      difficultyOffset;

    return { x, y };
  };

  const getLineStyle = (status: 'recommended' | 'available' | 'locked') => {
    switch (status) {
      case 'recommended':
        return { stroke: '#22c55e', strokeWidth: 3, strokeDasharray: 'none' };
      case 'available':
        return { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: 'none' };
      case 'locked':
      default:
        return { stroke: '#9ca3af', strokeWidth: 2, strokeDasharray: '5,5' };
    }
  };

  // ========================================================================
  // 9. 畫 edge（只畫 commonNextSteps）＋ path dimming
  // ========================================================================
  const renderConnections = () => {
    const lines: React.ReactNode[] = [];
    let lineId = 0;

    const visaPositionMap = new Map<string, { stage: StageKey; index: number; total: number }>();

    STAGE_ORDER.forEach((stage) => {
      const visas = visasByStage[stage] || [];
      visas.forEach((visaId, index) => {
        visaPositionMap.set(visaId, { stage, index, total: visas.length });
      });
    });

    STAGE_ORDER.forEach((stage) => {
      const visasInStage = visasByStage[stage] || [];

      visasInStage.forEach((visaId) => {
        // pseudo "start" node 沒有 edges
        if (visaId === 'start') return;

        const fromMeta = visaPositionMap.get(visaId);
        if (!fromMeta) return;

        const fromVisa = visaById[visaId];
        const fromPos = getVisaPosition(fromMeta.stage, fromMeta.index, fromMeta.total, fromVisa);
        const neighbors = adjacencyGraph[visaId] || [];

        neighbors.forEach((nextId) => {
          const toMeta = visaPositionMap.get(nextId);
          if (!toMeta) return;

          const toVisa = visaById[nextId];
          const toPos = getVisaPosition(toMeta.stage, toMeta.index, toMeta.total, toVisa);
          const status = (visaRecommendations[nextId]?.status ?? 'locked') as
            | 'recommended'
            | 'available'
            | 'locked';
          const style = getLineStyle(status);

          const isOnPath =
            !highlightedPathIds ||
            (highlightedPathIds.has(visaId) && highlightedPathIds.has(nextId));
          const opacity = isOnPath ? 0.7 : 0.15;

          lines.push(
            <line
              key={`line-${lineId++}`}
              x1={fromPos.x + 40}
              y1={fromPos.y}
              x2={toPos.x - 40}
              y2={toPos.y}
              {...style}
              opacity={opacity}
            />
          );
        });
      });
    });

    return lines;
  };

  // ========================================================================
  // 10. 畫每個簽證的 node（含「You are here」＋ hover tooltip）
  // ========================================================================
  const renderVisaNodes = () => {
    const nodes: React.ReactNode[] = [];
    const currentVisaId = userProfile.currentVisa?.toLowerCase() ?? null;

    STAGE_ORDER.forEach((stage) => {
      const visaIds = visasByStage[stage] || [];
      const total = visaIds.length;

      visaIds.forEach((visaId, index) => {
        if (visaId === 'start') {
          // 新手沒有 currentVisa 的 "Start" 節點
          const pos = getVisaPosition('column0', 0, 1);
          nodes.push(
            <div
              key="start-node"
              className="absolute w-24 h-24 rounded-full flex flex-col items-center justify-center text-sm font-semibold text-yellow-300 border border-yellow-400/60 bg-slate-800 shadow-lg shadow-yellow-400/40"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="text-lg mb-1">🚀</div>
              Start
            </div>
          );
          return;
        }

        const visa = visaById[visaId];
        if (!visa) return;

        const pos = getVisaPosition(stage, index, total, visa);

        const status = (visaRecommendations[visaId]?.status ?? 'locked') as
          | 'recommended'
          | 'available'
          | 'locked';

        const isSelected = selectedVisa?.toLowerCase() === visaId;
        const isCurrentVisa = currentVisaId === visaId;

        const isOnHighlightedPath =
          !highlightedPathIds || highlightedPathIds.has(visaId);
        const isDimmed = !!highlightedPathIds && !isOnHighlightedPath;

        const statusLabel =
          status === 'recommended'
            ? 'May be eligible'
            : status === 'available'
              ? 'Could be a path'
              : 'Strengthen skills first';

        nodes.push(
          <button
            key={visaId}
            onClick={() => handleNodeClick(visaId)}
            className={`absolute rounded-full flex flex-col items-center justify-center font-bold text-center transition-all duration-200 cursor-pointer group
              ${isSelected ? 'ring-2 ring-yellow-400 scale-110 z-30' : 'hover:scale-105 z-10'}
              ${
                isCurrentVisa
                  ? 'w-28 h-28 ring-2 ring-yellow-300 ring-opacity-70 shadow-2xl shadow-yellow-400/50'
                  : 'w-20 h-20'
              }
              ${
                status === 'recommended'
                  ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/50'
                  : status === 'available'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-gradient-to-br from-gray-600 to-gray-700 text-gray-300 shadow-lg shadow-gray-600/30'
              }`}
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: 'translate(-50%, -50%)',
              opacity: isDimmed ? 0.25 : 1,
            }}
          >
            <div className="text-2xl">
              {visa.iconEmoji ?? '🛂'}
            </div>
            <div className="text-xs font-semibold leading-tight">
              {visa.shortName ?? visa.id.toUpperCase()}
            </div>

            {/* "You are here" 標籤 */}
            {isCurrentVisa && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-yellow-300 font-bold text-xs whitespace-nowrap">
                ⭐ You are here
              </div>
            )}

            {/* Hover 小浮窗 */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 border border-slate-700">
              <div className="font-semibold">{visa.name}</div>
              <div className="text-slate-400 text-[11px]">{statusLabel}</div>
            </div>
          </button>
        );
      });
    });

    return nodes;
  };

  // ========================================================================
  // 11. 實際 render Map（下移一點 + legend 改放右下角）
  // ========================================================================
  const hasCurrent = !!userProfile.currentVisa;

  return (
    <div className="relative w-full h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden">
      {/* Legend 移到右下角，不擋標題 */}
      <div className="absolute right-4 bottom-4 bg-slate-800/80 backdrop-blur rounded-lg p-3 text-xs z-40 border border-slate-700">
        <div className="font-semibold mb-2 text-slate-200">Your Profile Match</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-slate-300">May be eligible (90%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-300">Could be a path (50%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-slate-300">Strengthen skills first</span>
          </div>
        </div>
      </div>

      {/* 上方欄位標題：對應 stage (current/next/future/long_term) */}
      <div className="absolute top-4 left-0 right-0 flex justify-start gap-[140px] px-8 text-xs text-slate-400 font-semibold pointer-events-none">
        <div>Current</div>
        <div>Next Steps</div>
        <div>Future Options</div>
        <div>Long-term Goals</div>
      </div>

      {/* SVG edge canvas */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        {renderConnections()}
      </svg>

      {/* Nodes：往下 offset 一點避免頂到 */}
      <div className="relative w-full h-full pt-16">
        {renderVisaNodes()}
      </div>
    </div>
  );
};

export default VisaMapRedesigned;
