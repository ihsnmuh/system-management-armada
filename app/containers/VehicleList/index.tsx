"use client";

import React from 'react'
import { useVehicles } from '@/hooks/queries/use-vehicles';
import { TypographyH1 } from '@/app/components/Typography';

const ContainerVehicleList = () => {

    const { data, isLoading, error } = useVehicles({ limit: 10, offset: 0 });

    return (
        <div className="layout">
            <TypographyH1>List of Vehicles</TypographyH1>
        </div>
    )
}

export default ContainerVehicleList