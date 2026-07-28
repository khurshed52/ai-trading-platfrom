"use client";
import React, { useState } from 'react'
import DepositForm from "@/components/funds/deposit-form";
import Button from "@/components/form/button";
export default function Deposit() {
  const [currency, setCurrency] = useState('USD')
  const deposit = ()=> {
     setCurrency('AED')
  }
  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="m-0 text-2xl font-bold tracking-tight text-slate-950">
          Deposit Funds
        </h1>
        {/* <Button 
          onClick={deposit} variant="primary"> 
          Click me
        </Button>
          <h1> {currency}</h1> */}
      </div> 
      <DepositForm />
    </div>
  );
}