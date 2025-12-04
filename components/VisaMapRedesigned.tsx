'use client';

import React, { useMemo } from 'react';
import { VISA_KNOWLEDGE_BASE, VisaDefinition } from '@/lib/visa-knowledge-base';
import { UserProfile } from '@/lib/types';
import { getVisaRecommendations } from '@/lib/visa-matching-engine';

interface VisaMapRedesignedProps {
  userProfile: UserProfile;
  selectedVisa?: string | null;
  onVisaSelect: (visaId: string) => void;
  recommendedPathIds?: string[]; // 推薦路徑中的 visa IDs
}

/** 地圖上要顯示的簽證大分類（排除旅遊等） */
const INCLUDED_CATEGORIES = ['student', 'worker', 'immigrant', 'investor'] as const;

/** stage 映射 - 根據 visa tier 決定顯示列位置 */
type StageKey = 'column0' | 'column1' | 'column2' | 'column3';

// Map visa.tier to display columns
const TIER_TO_COLUMN: Record<string, StageKey> = {
  'start': 'column0',
  'entry': 'column1',
  'intermediate': 'column2',
  'advanced': 'column3',
};

const STAGE_ORDER: StageKey[] = ['column0', 'column1', 'column2', 'column3'];

/** difficulty 數值 → Y座標 offset */
const DIFFICULTY_OFFSET: Record<number, number> = {
  1: 0,
  2: 1,
  3: 2,
};

const VisaMapRedesigned: React.FC<VisaMapRedesignedProps> = ({
  userProfile,
  selectedVisa,
  onVisaSelect,
  recommendedPathIds = [],
}) => {
  // ========================================================================
  // 1. VISA_KNOWLEDGE_BASE is already a Record, convert to lowercase keys
  // ========================================================================
  const visaById = useMemo(() => {
    const map: Record<string, VisaDefinition> = {};
    Object.entries(VISA_KNOWLEDGE_BASE).forEach(([id, visa]) => {
      map[id.toLowerCase()] = visa;
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

    Object.values(VISA_KNOWLEDGE_BASE).forEach((visa) => {
      // 只圖上顯示特定類別
      if (!INCLUDED_CATEGORIES.includes(visa.category as any)) return;

      const id = visa.id.toLowerCase();
      const nextSteps =
        visa.commonNextSteps
          ?.map((step) => step.visaId.toLowerCase())
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
      Object.values(VISA_KNOWLEDGE_BASE).forEach((visa) => {
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

    Object.values(VISA_KNOWLEDGE_BASE).forEach((visa) => {
      if (!INCLUDED_CATEGORIES.includes(visa.category as any)) return;

      const id = visa.id.toLowerCase();

      // 有 currentVisa 時，只顯示 reachable 的簽證
      if (currentVisaId && !reachableVisaIds.has(id)) return;

      // 根據 visa.tier 映射到顯示欄位
      const stageKey = TIER_TO_COLUMN[visa.tier] || 'column1';
      
      // 如果是當前簽證，強制放在 column0 (override tier)
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
  // 7b. 推薦路徑的 highlight IDs
  // ========================================================================
  const recommendedPathSet = useMemo(() => {
    if (!recommendedPathIds || recommendedPathIds.length === 0) return null;
    return new Set(recommendedPathIds.map(id => id.toLowerCase()));
  }, [recommendedPathIds]);

  // ========================================================================
  // 8. layout：依 stage 排 X (column)，依 index + difficulty 排 Y
  // ========================================================================
  const getVisaPosition = (
    stage: StageKey,
    index: number,
    total: number,
    visa?: VisaDefinition
  ) => {
    const stageIdx = STAGE_ORDER.indexOf(stage);
    const baseX = 160; // 起始 X
    const stageSpacingX = 260;
    const x = baseX + stageIdx * stageSpacingX;

    const baseY = 260; // 整張圖往下移一點，避免貼頂
    const verticalSpacing = 110;

    const difficultyValue = visa?.difficulty ?? 2;
    const difficultyOffset = (DIFFICULTY_OFFSET[difficultyValue] ?? 0) * -12;

    const y =
      baseY +
      (index - (total - 1) / 2) * verticalSpacing +
      difficultyOffset;

    return { x, y };
  };

  const getLineStyle = (status: 'recommended' | 'available' | 'locked') => {
    // 極簡風格 - 統一淺灰色連線
    switch (status) {
      case 'recommended':
        return { stroke: '#d1d5db', strokeWidth: 2, strokeDasharray: 'none' }; // gray-300
      case 'available':
        return { stroke: '#e5e7eb', strokeWidth: 2, strokeDasharray: 'none' }; // gray-200
      case 'locked':
      default:
        return { stroke: '#f3f4f6', strokeWidth: 1, strokeDasharray: '4,4' }; // gray-100
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
          
          // 檢查是否在推薦路徑上
          const isOnRecommendedPath = 
            recommendedPathSet && 
            recommendedPathSet.has(visaId) && 
            recommendedPathSet.has(nextId);
          
          let opacity = isOnPath ? 0.6 : 0.2;
          let strokeColor = style.stroke;
          let strokeWidth = style.strokeWidth;

          // 推薦路徑的連線用黑色實線
          if (isOnRecommendedPath) {
            strokeColor = '#000000'; // 黑色
            strokeWidth = 2.5;
            opacity = 0.8;
          }

          lines.push(
            <line
              key={`line-${lineId++}`}
              x1={fromPos.x + 40}
              y1={fromPos.y}
              x2={toPos.x - 40}
              y2={toPos.y}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={style.strokeDasharray}
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
        const isOnRecommendedPath = recommendedPathSet?.has(visaId) ?? false;

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
            className={`absolute bubble-node flex flex-col items-center justify-center font-black text-center transition-all duration-300 cursor-pointer group
              ${isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-10'}
              ${
                isCurrentVisa
                  ? 'w-32 h-32 ring-3 ring-yellow-400 shadow-2xl'
                  : 'w-24 h-24'
              }
              ${
                isOnRecommendedPath && !isSelected
                  ? 'ring-3 ring-purple-400 animate-pulse'
                  : ''
              }`}
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: 'translate(-50%, -50%)',
              opacity: isDimmed ? 0.3 : 1,
              color: status === 'locked' ? '#999999' : '#000000',
            }}
          >
            {/* Visa code label */}
            <div className="text-sm font-black leading-tight tracking-tight relative z-10">
              {visa.code ?? visa.id.toUpperCase()}
            </div>

            {/* "You are here" 標籤 */}
            {isCurrentVisa && (
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 font-black text-xs whitespace-nowrap text-yellow-600 px-2 py-1 rounded-lg bg-white/80 backdrop-blur">
                YOU ARE HERE
              </div>
            )}

            {/* 推薦路徑標記 */}
            {isOnRecommendedPath && !isCurrentVisa && (
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 font-black text-xs whitespace-nowrap text-purple-600 px-2 py-1 rounded-lg bg-white/80 backdrop-blur">
                RECOMMENDED
              </div>
            )}

            {/* Hover 小浮窗 - 玻璃質感 */}
            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 glass-panel text-black text-xs px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity duration-200">
              <div className="font-black">{visa.name}</div>
              <div className="font-normal text-gray-600 text-[11px]">{statusLabel}</div>
              {isOnRecommendedPath && (
                <div className="text-purple-600 font-bold text-[11px] mt-1">On recommended path</div>
              )}
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
    <div className="relative w-full h-full bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
      {/* Legend 移到右下角 - 極簡玻璃風格 */}
      <div className="absolute right-6 bottom-6 glass-panel p-4 text-xs z-40">
        <div className="font-black mb-3 text-black text-sm">PROFILE MATCH</div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bubble-node"></div>
            <span className="font-semibold text-gray-700">May be eligible (90%+)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bubble-node opacity-70"></div>
            <span className="font-semibold text-gray-700">Could be a path (50%+)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-gray-300"></div>
            <span className="font-semibold text-gray-500">Strengthen skills first</span>
          </div>
        </div>
      </div>

      {/* 上方欄位標題 - 極簡粗體黑字 */}
      <div className="absolute top-8 left-0 right-0 flex justify-start gap-[140px] px-10 text-sm text-black font-black pointer-events-none tracking-tight">
        <div>CURRENT</div>
        <div>NEXT STEPS</div>
        <div>FUTURE OPTIONS</div>
        <div>LONG-TERM GOALS</div>
      </div>

      {/* SVG edge canvas - 淺灰色連線 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        {renderConnections()}
      </svg>

      {/* Nodes：往下 offset 一點避免頂到 */}
      <div className="relative w-full h-full pt-20">
        {renderVisaNodes()}
      </div>
    </div>
  );
};

export default VisaMapRedesigned;
