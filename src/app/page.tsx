'use client';
import { useState } from 'react';
import EastIcon from '@mui/icons-material/East';
import { redirect } from 'next/navigation';
export default function Home() {
  redirect('chat/1');
}
