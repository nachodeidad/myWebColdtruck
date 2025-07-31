import { Dialog } from "@headlessui/react"
import { X } from "lucide-react"
import React from 'react'
import type { Box } from "../../../../types/Box"

interface Props {
    isOpen: boolean
    boxData: Box
    onClose: () => void
}

const ModalMoreBox: React.FC<Props> = ({ isOpen, onClose, boxData }) => {
    return (
        <div>
            <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" aria-hidden="true" />
                <div className="flex items-center justify-center min-h-screen px-4">
                    <Dialog.Panel className="relative bg-white p-4 md:p-6 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">

                        {/* Botón de cerrar */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Contenido del modal */}
                        <div>

                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    )
}

export default ModalMoreBox