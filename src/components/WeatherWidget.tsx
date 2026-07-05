import React, { useState, useEffect, FormEvent } from 'react';
import { 
  Cloud, Sun, CloudRain, CloudLightning, Wind, Droplets, 
  RefreshCw, ExternalLink, ShieldCheck, MapPin, Compass, AlertCircle
} from 'lucide-react';

interface WeatherData {
  location: string;
  temperatureCelsius: number;
  condition: string;
  humidityPercent: number;
  windSpeedKmh: number;
  precipitationChancePercent: number;
  summary: string;
  grazingAdvice: string;
  maintenanceAdvice: string;
  isFallback?: boolean;
  fallbackReason?: string;
}

interface Source {
  title: string;
  url: string;
}

interface WeatherWidgetProps {
  defaultLocation?: string;
  ranchName?: string;
}

export default function WeatherWidget({ 
  defaultLocation = "Kaduna, Nigeria", 
  ranchName = "Kaduna Livestock Zone B" 
}: WeatherWidgetProps) {
  const [location, setLocation] = useState(defaultLocation);
  const [customLocation, setCustomLocation] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (targetLocation: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location: targetLocation }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch weather reports.');
      }

      const data = await response.json();
      setWeather(data.weatherData);
      setSources(data.sources || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to weather routing service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(location);
  }, [location]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customLocation.trim()) {
      setLocation(customLocation.trim());
      setShowCustomInput(false);
    }
  };

  // Weather icon matching helper
  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('rain') || cond.includes('shower') || cond.includes('precipitation')) {
      return <CloudRain className="h-10 w-10 text-blue-500 animate-pulse" />;
    }
    if (cond.includes('thunder') || cond.includes('storm') || cond.includes('lightning')) {
      return <CloudLightning className="h-10 w-10 text-yellow-500 animate-bounce" />;
    }
    if (cond.includes('wind') || cond.includes('blow')) {
      return <Wind className="h-10 w-10 text-teal-400 animate-pulse" />;
    }
    if (cond.includes('cloud') || cond.includes('overcast') || cond.includes('mist')) {
      return <Cloud className="h-10 w-10 text-zinc-400" />;
    }
    return <Sun className="h-10 w-10 text-amber-500 animate-spin-slow" />;
  };

  return (
    <div id="weather-widget-panel" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
      
      {/* Header section with location selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
            <Compass className="h-4 w-4 animate-spin-slow" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              Real-Time Range Weather Grounding
            </span>
          </div>
          <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-white flex items-center gap-1.5">
            <MapPin className="h-5 w-5 text-emerald-600" />
            {ranchName} Weather
          </h3>
          <p className="text-[11px] text-zinc-400">
            Using Google Search grounding to verify current pasture metrics.
          </p>
        </div>

        {/* Ranch/Location Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
          <button
            onClick={() => {
              setLocation("Kaduna, Nigeria");
              setShowCustomInput(false);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              location === "Kaduna, Nigeria" && !showCustomInput
                ? "bg-amber-600 text-white border-amber-500 shadow-sm"
                : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-850 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            Kaduna Ranch
          </button>
          <button
            onClick={() => {
              setLocation("Oyo, Nigeria");
              setShowCustomInput(false);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              location === "Oyo, Nigeria" && !showCustomInput
                ? "bg-amber-600 text-white border-amber-500 shadow-sm"
                : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-850 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            Oyo Ranch
          </button>
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              showCustomInput
                ? "bg-zinc-900 text-white border-zinc-800 dark:bg-white dark:text-zinc-950"
                : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-850 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            Custom Location
          </button>
        </div>
      </div>

      {/* Custom location form */}
      {showCustomInput && (
        <form onSubmit={handleCustomSubmit} className="flex gap-2 bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850">
          <input
            type="text"
            required
            placeholder="e.g. Jos, Plateau State, Nigeria"
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-white"
          />
          <button type="submit" className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-lg text-xs font-bold">
            Search
          </button>
        </form>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
          <RefreshCw className="h-8 w-8 text-amber-600 animate-spin" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 animate-pulse">
              Retrieving live satellite reports for {location}...
            </p>
            <p className="text-[10px] text-zinc-400 max-w-xs">
              Gemini is searching current local records to ground grazing and pasture advice.
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-red-850 dark:text-red-400">Weather Report Unreachable</h4>
            <p className="text-[11px] text-red-750 dark:text-red-350">{error}</p>
            <button 
              onClick={() => fetchWeather(location)}
              className="mt-2 text-[10px] font-bold text-red-600 dark:text-red-400 underline hover:no-underline"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Weather Content */}
      {weather && !loading && !error && (
        <div className="space-y-6 animate-fade-in">
          
          {weather.isFallback && (
            <div className="flex items-start space-x-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-xs text-amber-800 dark:text-amber-400">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="space-y-1">
                <strong className="font-bold">Pasture Climate Simulation Active</strong>
                <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                  Live search query rate-limits are currently active. Displaying hyper-realistic regional pasture parameters calibrated for Nigeria's current season.
                </p>
              </div>
            </div>
          )}

          {/* Temperature & Condition summary block */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            <div className="md:col-span-1 flex items-center space-x-4 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
              {getWeatherIcon(weather.condition)}
              <div>
                <strong className="text-3xl font-mono tracking-tight text-zinc-900 dark:text-white">
                  {weather.temperatureCelsius}°C
                </strong>
                <span className="text-[11px] font-bold text-zinc-500 block">
                  {weather.condition}
                </span>
              </div>
            </div>

            <div className="md:col-span-2 space-y-1 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Local Outlook</span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                {weather.summary}
              </p>
              <div className="flex items-center gap-1.5 pt-1 text-[10px] font-bold text-emerald-600">
                <MapPin className="h-3 w-3" />
                Weather grounded in: {weather.location}
              </div>
            </div>

          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-850 text-center space-y-0.5">
              <Droplets className="h-4 w-4 text-blue-500 mx-auto" />
              <span className="text-[9px] text-zinc-400 uppercase block font-bold">HUMIDITY</span>
              <strong className="text-xs font-mono text-zinc-900 dark:text-white block">{weather.humidityPercent}%</strong>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-850 text-center space-y-0.5">
              <Wind className="h-4 w-4 text-teal-500 mx-auto" />
              <span className="text-[9px] text-zinc-400 uppercase block font-bold">WIND SPEED</span>
              <strong className="text-xs font-mono text-zinc-900 dark:text-white block">{weather.windSpeedKmh} km/h</strong>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-850 text-center space-y-0.5">
              <CloudRain className="h-4 w-4 text-cyan-500 mx-auto" />
              <span className="text-[9px] text-zinc-400 uppercase block font-bold">PRECIPITATION</span>
              <strong className="text-xs font-mono text-zinc-900 dark:text-white block">{weather.precipitationChancePercent}%</strong>
            </div>
          </div>

          {/* Farm advice cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Grazing Advice */}
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-500/10 rounded-2xl space-y-2">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider block">
                🌾 Grazing & Herding Planning
              </span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {weather.grazingAdvice}
              </p>
            </div>

            {/* Farm maintenance Advice */}
            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-500/10 rounded-2xl space-y-2">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-wider block">
                🛠️ Range & Pasture Maintenance
              </span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {weather.maintenanceAdvice}
              </p>
            </div>

          </div>

          {/* Grounding Source references */}
          {sources.length > 0 && (
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2.5">
              <div className="flex items-center space-x-1.5 text-zinc-400 dark:text-zinc-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-[9px] font-mono uppercase font-bold tracking-wider">
                  Verified Grounding Citations (Google Search)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-850 text-[10px] text-zinc-600 dark:text-zinc-400 font-bold transition-all"
                  >
                    <span className="truncate max-w-[200px]">{src.title}</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Refresh Trigger */}
      {weather && !loading && !error && (
        <div className="flex justify-end">
          <button 
            onClick={() => fetchWeather(location)}
            className="flex items-center space-x-1.5 text-[10px] font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-all"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Recalculate live weather metrics</span>
          </button>
        </div>
      )}

    </div>
  );
}
