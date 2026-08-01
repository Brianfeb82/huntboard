"use client";

import Link from "next/link";
import { useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { format } from "date-fns";
import { CalendarDays, GripVertical, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BOARD_COLUMNS, formatSalary, type ApplicationStatus, type JobApplication } from "@/types/application";

function ApplicationCard({ application, overlay = false }: { application: JobApplication; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: application.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <Card ref={overlay ? undefined : setNodeRef} style={style} className={cn("transition-shadow", isDragging && "opacity-30", overlay && "rotate-2 shadow-xl")}>
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          <button type="button" aria-label={`Drag ${application.company}`} className="mt-0.5 cursor-grab text-muted-foreground active:cursor-grabbing" {...attributes} {...listeners}>
            <GripVertical className="size-4" />
          </button>
          <Link href={`/applications/${application.id}`} className="min-w-0 flex-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <p className="truncate font-medium">{application.company}</p>
            <p className="mt-1 truncate text-sm text-muted-foreground">{application.role}</p>
            <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              {application.location && <p className="flex items-center gap-1"><MapPin className="size-3" />{application.location}</p>}
              {application.deadline && <p className="flex items-center gap-1"><CalendarDays className="size-3" />Due {format(new Date(application.deadline), "MMM d")}</p>}
              {formatSalary(application) && <p>{formatSalary(application)}</p>}
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function BoardColumn({ status, label, accent, applications }: { status: ApplicationStatus; label: string; accent: string; applications: JobApplication[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section ref={setNodeRef} className={cn("min-h-72 rounded-xl border-t-4 bg-muted/40 p-3", accent, isOver && "bg-primary/10")}>
      <div className="mb-3 flex items-center justify-between px-1"><h2 className="font-medium">{label}</h2><span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">{applications.length}</span></div>
      <div className="space-y-3">{applications.map((application) => <ApplicationCard key={application.id} application={application} />)}</div>
    </section>
  );
}

export function Board({ initialApplications }: { initialApplications: JobApplication[] }) {
  const [applications, setApplications] = useState(initialApplications);
  const [active, setActive] = useState<JobApplication | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function start(event: DragStartEvent) { setActive(applications.find((app) => app.id === event.active.id) ?? null); }
  async function end(event: DragEndEvent) {
    const target = event.over?.id as ApplicationStatus | undefined;
    const id = event.active.id as string;
    const original = applications.find((app) => app.id === id);
    setActive(null);
    if (!target || !original || original.status === target) return;
    setApplications((items) => items.map((item) => item.id === id ? { ...item, status: target } : item));
    const response = await fetch(`/api/applications/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: target }) });
    if (!response.ok) setApplications((items) => items.map((item) => item.id === id ? original : item));
  }

  return <DndContext sensors={sensors} onDragStart={start} onDragEnd={end}><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold">Applications</h1><p className="mt-1 text-muted-foreground">Move cards across stages as your search progresses.</p></div><Button asChild><Link href="/applications/new"><Plus />New application</Link></Button></div><div className="grid gap-4 lg:grid-cols-4">{BOARD_COLUMNS.map((column) => <BoardColumn key={column.status} {...column} applications={applications.filter((application) => application.status === column.status)} />)}</div><DragOverlay>{active ? <ApplicationCard application={active} overlay /> : null}</DragOverlay></DndContext>;
}
