'use client'

import React from "react";  
import PaymentCard from "./payment-card";
import { useQueryUser } from '@/hooks/user-queries';
import { SUBSCRIPTION_PLAN } from '@prisma/client';

type Props = {
    
}

const Billing = (props: Props) => {
    const { data: userData } = useQueryUser();
    const currentPlan = userData?.data?.subscription?.plan || SUBSCRIPTION_PLAN.FREE;

    return (
        <section className="w-full py-6 flex items-center justify-center">
            <div className="flex lg:flex-row flex-col gap-6 w-full container relative">
                <div className="absolute inset-x-0 -top-40 -bottom-40 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 blur-3xl opacity-50" />
                <div className="flex-1 relative">
                    <PaymentCard
                        current={currentPlan}
                        label="FREE"
                    />
                </div>
                <div className="flex-1 relative">
                    <PaymentCard
                        current={currentPlan}
                        label="PRO"
                    />
                </div>
            </div>
        </section>
      )
}

export default Billing