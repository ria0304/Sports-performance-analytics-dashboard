import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Flag, Bike, Trophy, Shield, Award } from 'lucide-react';
import F1Panel from './panels/F1Panel';
import MotoGPPanel from './panels/MotoGPPanel';
import TennisPanel from './panels/TennisPanel';
import FootballPanel from './panels/FootballPanel';
import IceHockeyPanel from './panels/IceHockeyPanel';
import EquestrianPanel from './panels/EquestrianPanel';

const TABS = [
  { value: 'f1', label: 'F1', icon: Flag },
  { value: 'motogp', label: 'MotoGP', icon: Bike },
  { value: 'tennis', label: 'Tennis', icon: Trophy },
  { value: 'football', label: 'Real Madrid', icon: Shield },
  { value: 'icehockey', label: 'Sharks', icon: Shield },
  { value: 'equestrian', label: 'Equestrian', icon: Award },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Sports Analytics Hub</h1>
        <p className="text-slate-400 mt-1">Live scores, standings, and calendars across 6 sports</p>
      </div>

      <Tabs defaultValue="f1" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex items-center gap-1.5 data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 px-3 py-2 rounded-lg"
            >
              <Icon className="w-4 h-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="f1" className="mt-6">
          <F1Panel />
        </TabsContent>
        <TabsContent value="motogp" className="mt-6">
          <MotoGPPanel />
        </TabsContent>
        <TabsContent value="tennis" className="mt-6">
          <TennisPanel />
        </TabsContent>
        <TabsContent value="football" className="mt-6">
          <FootballPanel />
        </TabsContent>
        <TabsContent value="icehockey" className="mt-6">
          <IceHockeyPanel />
        </TabsContent>
        <TabsContent value="equestrian" className="mt-6">
          <EquestrianPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
