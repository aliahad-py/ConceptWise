
"use client";

import React, { useState, useCallback, useRef, useEffect, memo, useMemo } from "react";
import type { Node, Edge } from "@/types";
import { cn } from "@/lib/utils";
import { Trash2, GripVertical, ZoomIn, ZoomOut, Share2, Plus, Minus, XCircle, StickyNote, BookText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";


interface NodeProps {
  node: Node;
  onNodeDrag: (id: string, newPosition: { x: number; y: number }) => void;
  onNodeUpdate: (id: string, data: { label: string; note?: string }) => void;
  onNodeDelete: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  isSelected: boolean;
  isConnectingFrom: boolean;
  onSelectNode: (id: string | null, isConnecting?: boolean) => void;
  onDimensionsChange: (id: string, dimensions: { width: number; height: number }) => void;
  zoom: number;
  hasChildren: boolean;
  readOnly?: boolean;
}

const NodeComponent = memo(function NodeComponent({
  node,
  onNodeDrag,
  onNodeUpdate,
  onNodeDelete,
  onToggleCollapse,
  isSelected,
  isConnectingFrom,
  onSelectNode,
  onDimensionsChange,
  zoom,
  hasChildren,
  readOnly = false,
}: NodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(node.data.label);
  const [note, setNote] = useState(node.data.note || "");
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (nodeRef.current) {
        const { width, height } = nodeRef.current.getBoundingClientRect();
        onDimensionsChange(node.id, { width: width / zoom, height: height / zoom });
    }
  }, [node.id, onDimensionsChange, zoom, label, readOnly, isEditing, node.data.note]);
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    
    if (!readOnly) {
      onSelectNode(node.id);
    }

    const startPos = { x: e.clientX, y: e.clientY };
    const startNodePos = { ...node.position };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startPos.x) / zoom;
      const dy = (moveEvent.clientY - startPos.y) / zoom;
      onNodeDrag(node.id, { x: startNodePos.x + dx, y: startNodePos.y + dy });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleLabelDoubleClick = () => {
    if (readOnly) return;
    setIsEditing(true);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
  };

  const handleLabelBlur = () => {
    setIsEditing(false);
    onNodeUpdate(node.id, { label, note: node.data.note });
  };
  
  const handleNoteSave = () => {
    onNodeUpdate(node.id, { label: node.data.label, note });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLabelBlur();
    }
  };

  return (
    <div
      ref={nodeRef}
      style={{
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
      }}
      className={cn(
        "absolute p-3 rounded-lg shadow-md transition-all duration-200 bg-card border origin-top-left",
        "cursor-pointer",
        isSelected && !readOnly ? "border-primary ring-2 ring-primary shadow-xl" : "hover:shadow-lg",
        isConnectingFrom && "ring-2 ring-accent animate-pulse"
      )}
      onClick={(e) => { if (!readOnly) { e.stopPropagation(); onSelectNode(node.id, true); } }}
      onDoubleClick={handleLabelDoubleClick}
    >
      <div className="flex items-start gap-2">
        <div 
          className={cn("p-1 text-muted-foreground cursor-grab active:cursor-grabbing hover:text-foreground")}
          onMouseDown={handleMouseDown}
        >
            <GripVertical size={16} />
        </div>
        <div className="flex-grow min-w-[120px] max-w-[200px] flex flex-col gap-1">
          {isEditing && !readOnly ? (
            <input
              type="text"
              value={label}
              onChange={handleLabelChange}
              onBlur={handleLabelBlur}
              onKeyDown={handleKeyDown}
              className="w-full p-1 text-sm bg-transparent border rounded-md border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              autoFocus
            />
          ) : (
            <p className="text-sm text-card-foreground">{node.data.label}</p>
          )}
           {(node.data.note || (!readOnly && isSelected)) && !isEditing && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="w-6 h-6 -ml-2">
                    <BookText size={14} className={cn(node.data.note && "text-accent")} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" onClick={(e) => e.stopPropagation()} side="right" align="start">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Node Note</h4>
                    <p className="text-sm text-muted-foreground">
                      {readOnly ? "Details for" : "Add extra details for"} '{node.data.label}'.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="note-text">Note</Label>
                    <Textarea 
                      id="note-text" 
                      value={readOnly ? node.data.note : note} 
                      onChange={(e) => setNote(e.target.value)} 
                      className="min-h-[120px]"
                      readOnly={readOnly}
                    />
                  </div>
                  {!readOnly && <Button onClick={handleNoteSave}>Save Note</Button>}
                </div>
              </PopoverContent>
            </Popover>
           )}
        </div>
        {isSelected && !readOnly && (
          <div className="flex flex-col gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={(e) => {e.stopPropagation(); onNodeDelete(node.id);}}>
                <Trash2 size={14} className="text-destructive"/>
            </Button>
          </div>
        )}
      </div>
       {hasChildren && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse(node.id);
          }}
          className="absolute -bottom-2 -right-2 w-5 h-5 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center border-2 border-background hover:bg-primary"
          title={node.collapsed ? "Expand" : "Collapse"}
        >
          {node.collapsed ? <Plus size={12} /> : <Minus size={12} />}
        </button>
      )}
    </div>
  );
});


interface EdgeProps {
  edge: Edge;
  sourceNode: Node | undefined;
  targetNode: Node | undefined;
  isSelected: boolean;
  onSelectEdge: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onUpdateEdgeLabel: (id: string, label: string) => void;
  readOnly?: boolean;
}

const EdgeComponent = memo(function EdgeComponent({ 
  edge, 
  sourceNode, 
  targetNode, 
  isSelected, 
  onSelectEdge,
  onDeleteEdge,
  onUpdateEdgeLabel,
  readOnly = false,
}: EdgeProps) {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [label, setLabel] = useState(edge.label || "");
  const labelRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingLabel && labelRef.current) {
      labelRef.current.focus();
    }
  }, [isEditingLabel]);

  useEffect(() => {
    setLabel(edge.label || "");
  }, [edge.label]);

  if (!sourceNode || !targetNode) return null;
  
  const sourceX = sourceNode.position.x + (sourceNode.width ?? 150) / 2;
  const sourceY = sourceNode.position.y + (sourceNode.height ?? 50) / 2;
  const targetX = targetNode.position.x + (targetNode.width ?? 150) / 2;
  const targetY = targetNode.position.y + (targetNode.height ?? 50) / 2;

  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  const d = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

  const handleLabelDoubleClick = (e: React.MouseEvent) => {
    if (readOnly) return;
    e.stopPropagation();
    setIsEditingLabel(true);
  };
  
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
  };

  const handleLabelBlur = () => {
    setIsEditingLabel(false);
    onUpdateEdgeLabel(edge.id, label);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLabelBlur();
    }
    if (e.key === 'Escape') {
      setIsEditingLabel(false);
      setLabel(edge.label || "");
    }
  };

  return (
    <g onClick={() => { if (!readOnly) onSelectEdge(edge.id); }}>
      <path d={d} stroke="hsl(var(--muted-foreground))" strokeWidth={isSelected && !readOnly ? 3 : 1.5} markerEnd="url(#arrowhead)" className={cn(!readOnly && "cursor-pointer")} />
      <path d={d} stroke="transparent" strokeWidth="15" className={cn(!readOnly && "cursor-pointer")} />

      {isSelected && !readOnly && (
         <foreignObject x={midX - 12} y={midY - 12} width="24" height="24">
            <button
                onClick={(e) => { e.stopPropagation(); onDeleteEdge(edge.id); }}
                className="p-1 bg-background rounded-full text-destructive hover:text-destructive-foreground hover:bg-destructive/90 flex items-center justify-center"
            >
                <XCircle size={16} />
            </button>
        </foreignObject>
      )}

      {edge.label && !isEditingLabel && (
        <text
          x={midX}
          y={midY}
          dy="-5"
          textAnchor="middle"
          fontSize="10"
          fill="hsl(var(--muted-foreground))"
          className="bg-background px-1 select-none pointer-events-auto"
          onDoubleClick={handleLabelDoubleClick}
        >
          {edge.label}
        </text>
      )}

       {isEditingLabel && !readOnly && (
        <foreignObject x={midX - 75} y={midY - 15} width="150" height="30">
          <Input
            ref={labelRef}
            type="text"
            value={label}
            onChange={handleLabelChange}
            onBlur={handleLabelBlur}
            onKeyDown={handleLabelKeyDown}
            className="w-full h-full text-xs text-center p-1 bg-card border-primary"
            onClick={(e) => e.stopPropagation()}
          />
        </foreignObject>
      )}
    </g>
  );
});


interface ConceptMapProps {
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  readOnly?: boolean;
  isPanningEnabled?: boolean;
}

export function ConceptMap({ 
  nodes, 
  setNodes, 
  edges, 
  setEdges, 
  readOnly = false,
  isPanningEnabled = true
}: ConceptMapProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.2));

  const handleSelect = (nodeId: string | null = null, edgeId: string | null = null) => {
    if (readOnly) return;
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(edgeId);
  }

  const handleNodeSelect = useCallback((nodeId: string | null, isNodeClick = false) => {
      if (readOnly) return;
      handleSelect(nodeId, null);

      if (isConnecting && connectionSource && nodeId && connectionSource !== nodeId) {
        setEdges(eds => [
          ...eds,
          {
            id: `e-${connectionSource}-${nodeId}-${Date.now()}`,
            source: connectionSource,
            target: nodeId,
            label: "relates to"
          }
        ]);
        setConnectionSource(null);
        setIsConnecting(false);
        setSelectedNodeId(nodeId);
      } else if (isConnecting && nodeId) {
        setConnectionSource(nodeId);
      } else {
        setSelectedNodeId(nodeId);
      }
  }, [isConnecting, connectionSource, setEdges, readOnly]);
  
  const handleNodeDrag = useCallback((id: string, newPosition: { x: number; y: number }) => {
    if (readOnly && !isPanningEnabled) return;
    setNodes(nds => {
      const draggedNode = nds.find(n => n.id === id);
      if (!draggedNode) return nds;

      const dx = newPosition.x - draggedNode.position.x;
      const dy = newPosition.y - draggedNode.position.y;
      
      const nodesToUpdate = new Set<string>([id]);

      if (draggedNode.collapsed && !readOnly) {
        const descendants = new Set<string>();
        const queue = [id];
        
        while (queue.length > 0) {
          const currentId = queue.shift()!;
          const children = edges.filter(e => e.source === currentId).map(e => e.target);
          for (const childId of children) {
            if (!descendants.has(childId)) {
              descendants.add(childId);
              nodesToUpdate.add(childId);
              queue.push(childId);
            }
          }
        }
      }

      return nds.map(n => {
        if (nodesToUpdate.has(n.id)) {
          if (n.id === id) {
            return { ...n, position: newPosition };
          }
          if (readOnly) return n; // Don't move children in read-only mode
          return { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } };
        }
        return n;
      });
    });
  }, [setNodes, edges, readOnly, isPanningEnabled]);

  const handleNodeUpdate = useCallback((id: string, data: { label: string; note?: string }) => {
    if (readOnly) return;
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n));
  }, [setNodes, readOnly]);

  const handleNodeDelete = useCallback((id: string) => {
    if (readOnly) return;
    const nodesToDelete = new Set<string>([id]);
    const queue = [id];

    // Find all descendant nodes
    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;
      const children = edges.filter(e => e.source === currentNodeId).map(e => e.target);
      for (const childId of children) {
        if (!nodesToDelete.has(childId)) {
          nodesToDelete.add(childId);
          queue.push(childId);
        }
      }
    }

    setNodes(nds => nds.filter(n => !nodesToDelete.has(n.id)));
    setEdges(eds => eds.filter(e => !nodesToDelete.has(e.source) && !nodesToDelete.has(e.target)));

    if (selectedNodeId && nodesToDelete.has(selectedNodeId)) {
        handleSelect(null);
    }
  }, [selectedNodeId, setEdges, setNodes, edges, readOnly]);

  const handleEdgeSelect = useCallback((edgeId: string) => {
    if (readOnly) return;
    handleSelect(null, edgeId);
  }, [readOnly]);

  const handleEdgeDelete = useCallback((edgeId: string) => {
    if (readOnly) return;
    setEdges(eds => eds.filter(e => e.id !== edgeId));
    if (selectedEdgeId === edgeId) {
      handleSelect(null);
    }
  }, [selectedEdgeId, setEdges, readOnly]);
  
  const handleEdgeUpdate = useCallback((edgeId: string, label: string) => {
    if (readOnly) return;
    setEdges(eds => eds.map(e => e.id === edgeId ? { ...e, label } : e));
  }, [setEdges, readOnly]);

  const handleDimensionsChange = useCallback((id: string, dimensions: { width: number, height: number }) => {
    setNodes(nds => {
      return nds.map(n => {
        if (n.id === id && (n.width !== dimensions.width || n.height !== dimensions.height)) {
          return { ...n, width: dimensions.width, height: dimensions.height };
        }
        return n;
      });
    });
  }, [setNodes]);

  const nodesById = useMemo(() => {
    return nodes.reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {} as Record<string, Node>);
  }, [nodes]);

  const handleToggleCollapse = useCallback((nodeId: string) => {
    if (readOnly) return;
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, collapsed: !n.collapsed } : n));
  }, [setNodes, readOnly]);
  
  const { visibleNodes, visibleEdges } = useMemo(() => {
    const hiddenNodeIds = new Set<string>();

    function getChildren(nodeId: string): string[] {
      return edges.filter(e => e.source === nodeId).map(e => e.target);
    }
    
    // Recursively find all children to hide
    function hideChildren(nodeId: string) {
      const children = getChildren(nodeId);
      for (const childId of children) {
        if (!hiddenNodeIds.has(childId)) {
          hiddenNodeIds.add(childId);
          const childNode = nodesById[childId];
          if (childNode?.collapsed) {
             // If child is also collapsed, continue hiding its descendants
          } else if (childNode) {
             hideChildren(childId);
          }
        }
      }
    }

    for (const node of nodes) {
      if (node.collapsed) {
        hideChildren(node.id);
      }
    }
    
    const visibleNodes = nodes.filter(n => !hiddenNodeIds.has(n.id));
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    const visibleEdges = edges.filter(e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));
    
    return { visibleNodes, visibleEdges };
  }, [nodes, edges, nodesById]);

  const nodeChildrenMap = useMemo(() => {
      const map = new Map<string, boolean>();
      edges.forEach(edge => map.set(edge.source, true));
      return map;
  }, [edges]);


  useEffect(() => {
    if (readOnly) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent deleting text in input fields
      if ((e.target as HTMLElement).nodeName === 'INPUT' || (e.target as HTMLElement).nodeName === 'TEXTAREA') return;

      if ((e.key === 'Backspace' || e.key === 'Delete')) {
        if (selectedNodeId) {
            handleNodeDelete(selectedNodeId);
        }
        if (selectedEdgeId) {
            handleEdgeDelete(selectedEdgeId);
        }
      }
       if (e.key === 'Escape') {
        setIsConnecting(false);
        setConnectionSource(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodeId, selectedEdgeId, handleNodeDelete, handleEdgeDelete, readOnly]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 0.1;
      const newZoom = zoom - e.deltaY * zoomFactor * 0.05;
      setZoom(Math.min(Math.max(newZoom, 0.2), 2));
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [zoom]);


  const handleToggleConnectionMode = () => {
    if (readOnly) return;
    const newConnectingState = !isConnecting;
    setIsConnecting(newConnectingState);
    if (!newConnectingState) {
        setConnectionSource(null);
    } else if (selectedNodeId) {
        setConnectionSource(selectedNodeId);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only pan if clicking on the canvas background itself
    if (e.target !== canvasRef.current && !(e.target as HTMLElement).classList.contains('react-flow__viewport')) return;
    if (!isPanningEnabled) return;

    if (!readOnly) {
      handleSelect(null, null);
    }

    const startPos = { x: e.clientX, y: e.clientY };
    const startPanOffset = { ...panOffset };
    setIsPanning(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startPos.x;
      const dy = moveEvent.clientY - startPos.y;
      setPanOffset({
        x: startPanOffset.x + dx,
        y: startPanOffset.y + dy,
      });
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  
  return (
    <div 
        ref={canvasRef} 
        className={cn(
            "w-full h-full relative overflow-hidden bg-dot-pattern",
            isPanning && isPanningEnabled ? "cursor-grabbing" : isPanningEnabled ? "cursor-grab" : ""
        )} 
        onMouseDown={handleCanvasMouseDown}
        style={{
            '--dot-bg': 'hsl(var(--background))',
            '--dot-color': 'hsl(var(--border))',
            backgroundPosition: 'center',
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        }}
    >
      <div className="absolute top-2 right-2 z-10 flex gap-2">
         {!readOnly && (
            <Button variant={isConnecting ? "default" : "secondary"} size="icon" onClick={handleToggleConnectionMode} title="Create Connection (Esc to cancel)">
                <Share2 />
            </Button>
         )}
         <Button variant="secondary" size="icon" onClick={handleZoomIn} title="Zoom In">
             <ZoomIn />
         </Button>
         <Button variant="secondary" size="icon" onClick={handleZoomOut} title="Zoom Out">
             <ZoomOut />
         </Button>
      </div>

      <div 
        className="w-full h-full origin-top-left react-flow__viewport"
        style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`}}
      >
        <svg className="absolute top-0 left-0 w-[9999px] h-[9999px] pointer-events-none">
            <defs>
            <marker
                id="arrowhead"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
            >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--muted-foreground))" />
            </marker>
            </defs>
            <g className="pointer-events-auto">
              {visibleEdges.map(edge => (
                <EdgeComponent 
                    key={edge.id} 
                    edge={edge} 
                    sourceNode={nodesById[edge.source]} 
                    targetNode={nodesById[edge.target]}
                    isSelected={edge.id === selectedEdgeId}
                    onSelectEdge={handleEdgeSelect}
                    onDeleteEdge={handleEdgeDelete}
                    onUpdateEdgeLabel={handleEdgeUpdate}
                    readOnly={readOnly}
                />
              ))}
            </g>
      </svg>
      {visibleNodes.map(node => (
        <NodeComponent
          key={node.id}
          node={node}
          onNodeDrag={handleNodeDrag}
          onNodeUpdate={handleNodeUpdate}
          onNodeDelete={handleNodeDelete}
          onToggleCollapse={handleToggleCollapse}
          isSelected={node.id === selectedNodeId}
          isConnectingFrom={isConnecting && connectionSource === node.id}
          onSelectNode={handleNodeSelect}
          onDimensionsChange={handleDimensionsChange}
          zoom={zoom}
          hasChildren={!readOnly && nodeChildrenMap.has(node.id)}
          readOnly={readOnly}
        />
      ))}
      </div>
    </div>
  );
}

    

    

    