import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCopernicus, fetchCopernicusImage } from '../services/api';
import { Layers, MapPin, Search, Cloud, Calendar, Image as ImageIcon, Loader2, Camera, Check, X } from 'lucide-react';
import { MapContainer, TileLayer, ImageOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useCapture } from '../context/CaptureContext';

const EarthExplorer = () => {
  const navigate = useNavigate();
  const { captures, addCapture, sharedRegion, setSharedRegion } = useCapture();
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [captureFeedback, setCaptureFeedback] = useState(false);

  // Copernicus Search State (synced with shared context)
  const [bbox, setBbox] = useState(sharedRegion.bbox);
  const [dateStart, setDateStart] = useState(sharedRegion.dateStart);
  const [dateEnd, setDateEnd] = useState(sharedRegion.dateEnd);
  const [cloudCover, setCloudCover] = useState(sharedRegion.cloudCover);
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  
  const [imgLoading, setImgLoading] = useState(false);
  const [activeBounds, setActiveBounds] = useState<L.LatLngBoundsExpression>([[-90, -180], [90, 180]]);
  
  const [panelOpen, setPanelOpen] = useState(true);

  // Sync local state to shared state
  useEffect(() => {
    setSharedRegion({ bbox, dateStart, dateEnd, cloudCover });
  }, [bbox, dateStart, dateEnd, cloudCover, setSharedRegion]);

  const MapUpdater = ({ bounds }: { bounds: L.LatLngBoundsExpression }) => {
    const map = useMap();
    useEffect(() => {
      map.fitBounds(bounds);
    }, [bounds, map]);

    useEffect(() => {
      const onMoveEnd = () => {
        const currentBounds = map.getBounds();
        const newBbox = `${currentBounds.getWest().toFixed(3)},${currentBounds.getSouth().toFixed(3)},${currentBounds.getEast().toFixed(3)},${currentBounds.getNorth().toFixed(3)}`;
        setBbox(newBbox);
      };
      map.on('moveend', onMoveEnd);
      return () => {
        map.off('moveend', onMoveEnd);
      };
    }, [map]);

    return null;
  };

  const handleCapture = () => {
    if (!selectedImage) return;
    const dateStr = imageFile?.name.replace('Sentinel2_', '').replace('.jpg', '') || new Date().toISOString().split('T')[0];
    const newId = `capture_${Date.now()}`;
    const [w, s, e, n] = bbox.split(',').map(Number);
    
    addCapture({
      id: newId,
      date: dateStr,
      imageBase64: selectedImage,
      bounds: [w, s, e, n]
    });
    setCaptureFeedback(true);
    setTimeout(() => setCaptureFeedback(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const handleSearch = async () => {
    setSearchLoading(true); setSearchError(''); setSearchResults([]);
    try {
      const fd = new FormData();
      fd.append('bbox', bbox);
      fd.append('date_start', formatDate(dateStart));
      fd.append('date_end', formatDate(dateEnd));
      fd.append('max_cloud_cover', String(cloudCover));
      const res = await searchCopernicus(fd);
      setSearchResults(res.results || []);
      if (!res.results?.length) setSearchError('No imagery found for this criteria.');
    } catch (e: any) {
      setSearchError(e?.response?.data?.detail || e.message || 'Search failed');
    }
    setSearchLoading(false);
  };

  const handleLoadImage = async (date: string) => {
    setImgLoading(true); setSearchError('');
    try {
      const fd = new FormData();
      fd.append('bbox', bbox);
      fd.append('date_start', date.split('T')[0]);
      fd.append('date_end', date.split('T')[0]);
      const res = await fetchCopernicusImage(fd);
      setSelectedImage(`data:image/jpeg;base64,${res.image_b64}`);
      setImageFile(new File([], `Sentinel2_${date.split('T')[0]}.jpg`, { type: 'image/jpeg' }));
      const [w, s, e, n] = bbox.split(',').map(Number);
      setActiveBounds([[s, w], [n, e]]);
    } catch (e: any) {
      setSearchError(e?.response?.data?.detail || e.message || 'Image retrieval failed');
    }
    setImgLoading(false);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Top Context Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface/90 backdrop-blur border-b border-border text-xs shrink-0 z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span className="text-textMuted">Layer:</span>
            <span className="text-textMain">RGB Sentinel-2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-textMuted">Source:</span>
            <span className="text-textMain">{imageFile ? imageFile.name : 'No image loaded'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {captures.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-accentCyan/10 text-accentCyan border border-accentCyan/20 rounded font-medium">
              <Camera className="w-3.5 h-3.5" />
              {captures.length} {captures.length === 1 ? 'Snapshot' : 'Snapshots'} Captured
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 relative bg-black">
        {imgLoading && (
          <div className="absolute inset-0 z-[2000] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm text-white">
            <Loader2 className="w-10 h-10 animate-spin mb-3" />
            <div>Retrieving True-Color Imagery from CDSE...</div>
          </div>
        )}

        <MapContainer center={[40.85, 14.45]} zoom={11} className="w-full h-full z-0" style={{ background: '#0B0F19' }}>
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          />
          {selectedImage && <ImageOverlay url={selectedImage} bounds={activeBounds} />}
          <MapUpdater bounds={activeBounds} />
        </MapContainer>

        {/* Collapsible Panel */}
        <div className={`absolute top-4 right-4 z-[1000] transition-transform duration-300 ${panelOpen ? 'translate-x-0' : 'translate-x-[110%]'}`}>
          <div className="bg-surface/95 backdrop-blur shadow-2xl border border-border rounded-xl w-72 flex flex-col overflow-hidden max-h-[calc(100vh-120px)]">
            <div className="flex items-center justify-between p-3 border-b border-border bg-surfaceHover">
              <h3 className="text-xs font-semibold text-textMain flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-primary" /> Imagery & Region
              </h3>
              <button onClick={() => setPanelOpen(false)} className="text-textMuted hover:text-textMain"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="p-4 space-y-3 overflow-y-auto">
              <div>
                <label className="text-[10px] text-textMuted block mb-1">Bounding Box (W,S,E,N)</label>
                <input type="text" value={bbox} onChange={e => setBbox(e.target.value)} className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:border-primary focus:outline-none transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-textMuted block mb-1">Start Date</label>
                  <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:border-primary focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] text-textMuted block mb-1">End Date</label>
                  <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:border-primary focus:outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-textMuted block mb-1">Max Cloud Cover (%)</label>
                <input type="number" max="100" min="0" value={cloudCover} onChange={e => setCloudCover(Number(e.target.value))} className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:border-primary focus:outline-none transition-colors" />
              </div>
              <button onClick={handleSearch} disabled={searchLoading} className="w-full py-2 bg-primary/20 text-primary border border-primary/30 rounded text-xs font-medium hover:bg-primary/30 transition-colors flex items-center justify-center gap-1.5 mt-2">
                {searchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />} Search Sentinel-2
              </button>
              {searchError && <div className="text-danger text-[10px] mt-1 p-2 bg-danger/10 border border-danger/20 rounded">{searchError}</div>}
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2 pt-2 border-t border-border/50">
                  <div className="text-[10px] font-semibold text-textMuted uppercase tracking-wider mb-2">Available Imagery</div>
                  {searchResults.map((res, idx) => (
                    <div key={idx} className="bg-background border border-border rounded p-2 text-[10px] hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => handleLoadImage(res.date)}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-textMain flex items-center gap-1"><Calendar className="w-3 h-3 text-primary" /> {res.date.split('T')[0]}</span>
                        <span className="text-textMuted flex items-center gap-1"><Cloud className="w-3 h-3" /> {res.cloud_cover}%</span>
                      </div>
                      <div className="text-primary flex items-center gap-1 font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity"><ImageIcon className="w-3 h-3" /> Load to Map</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Toggle Panel Button */}
        {!panelOpen && (
          <button 
            onClick={() => setPanelOpen(true)}
            className="absolute top-4 right-4 z-[1000] bg-surface/95 backdrop-blur p-2 shadow-lg border border-border rounded-lg text-textMuted hover:text-textMain"
          >
            <Search className="w-5 h-5" />
          </button>
        )}

        {/* Action Toolbar for Loaded Images */}
        {selectedImage && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-surface/95 backdrop-blur shadow-xl border border-border rounded-lg px-4 py-2.5 flex items-center gap-4 animate-in slide-in-from-bottom-4">
            <div className="text-xs font-semibold text-textMain border-r border-border pr-4">
              {imageFile?.name}
            </div>
            <button 
              onClick={handleCapture}
              className="flex items-center gap-1.5 text-xs text-textMuted hover:text-primary transition-colors"
            >
              {captureFeedback ? <Check className="w-4 h-4 text-primary" /> : <Camera className="w-4 h-4" />} 
              {captureFeedback ? 'Captured' : 'Capture Snapshot'}
            </button>
            <button 
              onClick={() => navigate('/earth-analysis')}
              className="flex items-center gap-1.5 text-xs bg-primary text-white px-3 py-1.5 rounded font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Analyze Area
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarthExplorer;
