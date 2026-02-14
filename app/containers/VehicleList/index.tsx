"use client";

import { useVehicles } from '@/hooks/queries/use-vehicles';
import VehicleCard from '@/components/cards/vehicle';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

const ContainerVehicleList = () => {

    const limit = 8;
    const { data, isLoading, isFetching } = useVehicles({ limit, offset: 0 });

    const isRefetching = isFetching && !isLoading;

    return (
        <div className="layout relative">

            {isRefetching && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">{"Memperbarui data..."}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {!isLoading && data?.data.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />  
                ))}

                {isLoading && (
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