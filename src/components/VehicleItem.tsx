// src/components/VehicleItem.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Vehicle {
    id: number;
    code: string;
    vin: string;
    manufacturer: string;
    model: string;
    make_year: number;
    status: string;
    type: string;
}

interface VehicleItemProps {
    vehicle: Vehicle;
    isLastChanged: boolean;
}

// Animation variants for Framer Motion
const itemVariants = {
    initial: { opacity: 0, y: 20 }, // Initial state (hidden below and invisible)
    animate: { opacity: 1, y: 0 },  // Animated state (visible at correct position)
    exit: { opacity: 0, x: -20 },   // Exit state (fades out and slides left)
};

export default function VehicleItem({
    vehicle,
    isLastChanged,
}: VehicleItemProps) {
    const [highlight, setHighlight] = useState(false);

    useEffect(() => {
        if (isLastChanged) {
            setHighlight(true);
            // Remove highlight after 3 seconds
            const timer = setTimeout(() => {
                setHighlight(false);
            }, 3000);
            // Clear timeout if the item is changed again or component unmounts
            return () => clearTimeout(timer);
        }
        // Also clear highlight if the item is no longer the last changed
        if (!isLastChanged && highlight) {
            setHighlight(false);
        }
    }, [isLastChanged, highlight]); // Depend on isLastChanged and highlight state

    // Determine dynamic classes based on highlight state
    const itemClasses = `
        border p-4 rounded-lg shadow-sm transition-colors duration-500
        ${highlight ? 'bg-yellow-100 border-yellow-400' : 'bg-white border-gray-200'}
    `;

    return (
        // Use motion.li for list item animations
        <motion.li
            className={itemClasses}
            variants={itemVariants} // Apply the defined animation variants
            initial="initial"       // Start with the 'initial' state
            animate="animate"       // Animate to the 'animate' state when appearing
            exit="exit"             // Animate to the 'exit' state when removed
            layout                  // Enables layout animations for smoother transitions on list changes
        >
            <h3 className="text-lg font-semibold mb-1 text-gray-800">
                {vehicle.code} - {vehicle.manufacturer} {vehicle.model} {vehicle.make_year}
            </h3>
            <p className="text-sm text-gray-600">
                <span className="font-medium">VIN:</span> {vehicle.vin}
            </p>
            <div className="flex justify-between items-center text-sm text-gray-700 mt-2">
                <span>
                    <span className="font-medium">Status:</span>{' '}
                    <span className="font-bold">{vehicle.status}</span>
                </span>
                <span>
                    <span className="font-medium">Type:</span> {vehicle.type}
                </span>
            </div>
        </motion.li>
    );
}
