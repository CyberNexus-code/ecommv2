'use client'

import {useState} from 'react'
import ListComponent from '@/components/dashboard/listcomponent'

export default function CategorieDashboard(){
    return <ListComponent props={{type: "categories"}} />
}