'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Camera, RotateCcw, CreditCard, CheckCircle2, ShieldCheck, BookOpen } from 'lucide-react'

type Side = 'recto' | 'verso'
type Phase = 'empty' | 'dragging' | 'scanning' | 'done'
export type DocumentType = 'id_card' | 'passport'

interface SlotState {
    phase: Phase
    preview: string | null
    file: File | null
}

interface IdDocumentUploadProps {
    required?: boolean
    onFilesChange?: (front: File | null, back: File | null, docType: DocumentType) => void
}

const EMPTY_SLOT: SlotState = { phase: 'empty', preview: null, file: null }

const SLOT_LABELS: Record<DocumentType, Partial<Record<Side, { title: string; hint: string }>>> = {
    id_card: {
        recto: { title: 'Recto', hint: 'Face avec photo' },
        verso: { title: 'Verso', hint: 'Face arrière' },
    },
    passport: {
        recto: { title: 'Page photo', hint: 'Page principale' },
    },
}

function IdCardSlot({
    side,
    slot,
    docType,
    onFile,
    onReset,
}: {
    side: Side
    slot: SlotState
    docType: DocumentType
    onFile: (file: File) => void
    onReset: () => void
}) {
    const fileRef = useRef<HTMLInputElement>(null)
    const camRef = useRef<HTMLInputElement>(null)
    const [dragging, setDragging] = useState(false)

    const accept = (files: FileList | null) => {
        const f = files?.[0]
        if (f && (f.type === 'image/jpeg' || f.type === 'image/png')) onFile(f)
    }

    const { title, hint } = SLOT_LABELS[docType][side] ?? { title: side, hint: '' }
    const isDone = slot.phase === 'done'
    const isScanning = slot.phase === 'scanning'
    const isEmpty = slot.phase === 'empty' || slot.phase === 'dragging'

    return (
        <div className="flex flex-col gap-2">
            {/* Label row */}
            <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-bold uppercase tracking-widest text-foreground/70">{title}</span>
                <span className="text-[10px] text-muted-foreground">{hint}</span>
                {isDone && (
                    <CheckCircle2 size={12} className="ml-auto text-green-500 shrink-0" />
                )}
            </div>

            {/* Card slot */}
            <div
                className={[
                    'relative overflow-hidden rounded-xl transition-all duration-200 cursor-pointer select-none',
                    isEmpty
                        ? `border-2 border-dashed ${dragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border bg-muted/40 hover:border-primary/50 hover:bg-muted/60'}`
                        : 'border border-border',
                ].join(' ')}
                style={{ aspectRatio: docType === 'passport' ? '1.42 / 1' : '1.586 / 1' }}
                onClick={() => isEmpty && fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); accept(e.dataTransfer.files) }}
            >
                {/* ── Empty state ─────────────────────────────── */}
                {isEmpty && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                            {docType === 'passport'
                                ? <BookOpen size={18} className="text-muted-foreground" />
                                : <CreditCard size={18} className="text-muted-foreground" />
                            }
                        </div>
                        <div className="text-center space-y-0.5">
                            <p className="text-[11px] font-medium text-muted-foreground leading-tight">
                                Glissez ou cliquez
                            </p>
                            <p className="text-[10px] text-muted-foreground/50">JPG · PNG</p>
                        </div>
                        <div className="flex gap-1.5">
                            <button
                                type="button"
                                onClick={e => { e.stopPropagation(); fileRef.current?.click() }}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md bg-background border border-border hover:bg-muted transition-colors"
                            >
                                <Upload size={10} /> Importer
                            </button>
                            <label
                                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md bg-background border border-border hover:bg-muted transition-colors cursor-pointer"
                                onClick={e => e.stopPropagation()}
                            >
                                <Camera size={10} /> Photographier
                                <input
                                    ref={camRef}
                                    type="file"
                                    accept="image/jpeg,image/png"
                                    capture="environment"
                                    className="sr-only"
                                    onChange={e => accept(e.target.files)}
                                />
                            </label>
                        </div>
                    </div>
                )}

                {/* ── Image preview (scan + done) ──────────────── */}
                {(isScanning || isDone) && slot.preview && (
                    <img
                        src={slot.preview}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        draggable={false}
                    />
                )}

                {/* ── Scanning overlay ─────────────────────────── */}
                {isScanning && (
                    <div className="absolute inset-0 bg-black/50">
                        {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
                            <span
                                key={pos}
                                className={[
                                    'absolute w-4 h-4',
                                    pos === 'tl' ? 'top-2.5 left-2.5 border-t-2 border-l-2 rounded-tl-sm' : '',
                                    pos === 'tr' ? 'top-2.5 right-2.5 border-t-2 border-r-2 rounded-tr-sm' : '',
                                    pos === 'bl' ? 'bottom-2.5 left-2.5 border-b-2 border-l-2 rounded-bl-sm' : '',
                                    pos === 'br' ? 'bottom-2.5 right-2.5 border-b-2 border-r-2 rounded-br-sm' : '',
                                    'border-green-400',
                                ].join(' ')}
                            />
                        ))}
                        <div
                            className="absolute inset-x-2 h-px animate-id-scan"
                            style={{
                                background: 'linear-gradient(90deg, transparent, #4ade80, #86efac, #4ade80, transparent)',
                                boxShadow: '0 0 8px 2px rgba(74,222,128,0.7)',
                            }}
                        />
                        <div className="absolute bottom-2 inset-x-0 flex justify-center">
                            <span className="text-[9px] font-mono tracking-[0.25em] text-green-400 animate-pulse">
                                ANALYSE EN COURS
                            </span>
                        </div>
                    </div>
                )}

                {/* ── Done overlay ──────────────────────────────── */}
                {isDone && (
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg ring-2 ring-white/20">
                            <CheckCircle2 size={14} className="text-white" strokeWidth={2.5} />
                        </div>
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); onReset() }}
                            className="absolute bottom-2 right-2 inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-black/55 backdrop-blur-sm rounded-md px-1.5 py-1 hover:bg-black/75 transition-colors"
                        >
                            <RotateCcw size={9} /> Refaire
                        </button>
                    </div>
                )}
            </div>

            {/* Hidden file inputs */}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="sr-only" onChange={e => accept(e.target.files)} />
        </div>
    )
}

export function IdDocumentUpload({ required = false, onFilesChange }: IdDocumentUploadProps) {
    const [docType, setDocType] = useState<DocumentType>('id_card')
    const [recto, setRecto] = useState<SlotState>(EMPTY_SLOT)
    const [verso, setVerso] = useState<SlotState>(EMPTY_SLOT)

    const switchDocType = (type: DocumentType) => {
        if (recto.preview) URL.revokeObjectURL(recto.preview)
        if (verso.preview) URL.revokeObjectURL(verso.preview)
        setRecto(EMPTY_SLOT)
        setVerso(EMPTY_SLOT)
        setDocType(type)
    }

    useEffect(() => {
        onFilesChange?.(recto.file, docType === 'id_card' ? verso.file : null, docType)
    }, [recto.file, verso.file, docType])

    const setSlot = (side: Side, next: SlotState) => {
        if (side === 'recto') setRecto(next)
        else setVerso(next)
    }

    const handleFile = (side: Side, file: File) => {
        const current = side === 'recto' ? recto : verso
        if (current.preview) URL.revokeObjectURL(current.preview)

        const preview = URL.createObjectURL(file)
        setSlot(side, { phase: 'scanning', preview, file })

        setTimeout(() => {
            if (side === 'recto') {
                setRecto(prev => ({ ...prev, phase: 'done' }))
            } else {
                setVerso(prev => ({ ...prev, phase: 'done' }))
            }
        }, 1700)
    }

    const handleReset = (side: Side) => {
        const current = side === 'recto' ? recto : verso
        if (current.preview) URL.revokeObjectURL(current.preview)
        setSlot(side, EMPTY_SLOT)
    }

    const rectoOk = recto.phase === 'done'
    const versoOk = verso.phase === 'done'
    const isComplete = docType === 'passport' ? rectoOk : (rectoOk && versoOk)
    const isPartial = docType === 'id_card' && (rectoOk || versoOk) && !isComplete

    return (
        <div className="bg-card border rounded-2xl p-5 md:p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <ShieldCheck size={16} className="text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold leading-none">Pièce d&apos;identité</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Carte nationale d&apos;identité ou passeport
                        </p>
                    </div>
                </div>
                <span className={[
                    'text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 shrink-0 mt-0.5',
                    required
                        ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                        : 'text-muted-foreground bg-muted',
                ].join(' ')}>
                    {required ? 'Obligatoire' : 'Optionnel'}
                </span>
            </div>

            {/* Type selector */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => switchDocType('id_card')}
                    className={[
                        'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-semibold transition-colors',
                        docType === 'id_card'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border text-muted-foreground hover:bg-muted',
                    ].join(' ')}
                >
                    <CreditCard size={13} /> Carte d&apos;identité
                </button>
                <button
                    type="button"
                    onClick={() => switchDocType('passport')}
                    className={[
                        'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-semibold transition-colors',
                        docType === 'passport'
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border text-muted-foreground hover:bg-muted',
                    ].join(' ')}
                >
                    <BookOpen size={13} /> Passeport
                </button>
            </div>

            {/* Slots */}
            {docType === 'id_card' ? (
                <div className="grid grid-cols-2 gap-3">
                    <IdCardSlot side="recto" slot={recto} docType={docType} onFile={f => handleFile('recto', f)} onReset={() => handleReset('recto')} />
                    <IdCardSlot side="verso" slot={verso} docType={docType} onFile={f => handleFile('verso', f)} onReset={() => handleReset('verso')} />
                </div>
            ) : (
                <div className="max-w-xs">
                    <IdCardSlot side="recto" slot={recto} docType={docType} onFile={f => handleFile('recto', f)} onReset={() => handleReset('recto')} />
                </div>
            )}

            {/* Status banner */}
            {isComplete && (
                <div className="flex items-center gap-2 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
                    <CheckCircle2 size={13} className="shrink-0" />
                    {docType === 'passport'
                        ? 'Passeport capturé — document complet.'
                        : 'Recto et verso capturés — document complet.'
                    }
                </div>
            )}
            {isPartial && (
                <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    {rectoOk ? 'Recto capturé — ajoutez le verso.' : 'Verso capturé — ajoutez le recto.'}
                </div>
            )}
        </div>
    )
}
