"use client";

import React from 'react'
import { useVehicles } from '@/hooks/queries/use-vehicles';
import VehicleCard from '@/components/cards/vehicle';
import { Skeleton } from '@/components/ui/skeleton';

const ContainerVehicleList = () => {

    const limit = 8;
    const { data, isLoading,isFetching } = useVehicles({ limit, offset: 0 });

    return (
        <div className="layout">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(!isLoading || !isFetching) && data?.data.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />  
                ))}

                {(isLoading || isFetching) && (
                    Array.from({ length: limit }).map((_, index) => (
                        <div key={index}>
                            <Skeleton className="w-full h-[314px] rounded-lg bg-gray-200" />
                        </div>
                    ))
                )}

            </div>
        </div>
    )
}

export default ContainerVehicleList