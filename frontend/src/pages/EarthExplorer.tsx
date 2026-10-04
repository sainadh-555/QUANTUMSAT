import { useEffect, useState } from 'react';
import { getSystemStatus, searchCopernicus, fetchCopernicusImage } from '../services/api';
import { Layers, Info, AlertTriangle, Upload, MapPin, Search, Cloud, Calendar, Image as ImageIcon, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, ImageOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';

const SAMPLE_IMG = import.meta.env.BASE_URL + 'sample.svg';

const EarthExplorer = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Use the sample SVG as the default loaded image
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_IMG);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Copernicus Search State
  const [bbox, setBbox] = useState('14.4,40.8,14.5,40.9');
  const [dateStart, setDateStart] = useState('2023-05-01');
  const [dateEnd, setDateEnd] = useState('2023-05-31');
  const [cloudCover, setCloudCover] = useState(20);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  
  // Copernicus Image Retrieval State
  const [imgLoading, setImgLoading] = useState(false);
  
  // Track if we are showing a georeferenced image
  const [activeBounds, setActiveBounds] = useState<L.LatLngBoundsExpression>([[-90, -180], [90, 180]]);

  // Map updater component
  const MapUpdater = ({ bounds }: { bounds: L.LatLngBoundsExpression }) => {
    const map = useMap();
    useEffect(() => {
      map.fitBounds(bounds);
    }, [bounds, map]);
    return null;
  };

  useEffect(() => {
    getSystemStatus()
      .then(setStatus)
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      // Uploaded images are not inherently georeferenced, put them on a dummy bounds
      setActiveBounds([[0, 0], [1, 1]]);
    }
  };

  const handleSearch = async () => {
    setSearchLoading(true); setSearchError(''); setSearchResults([]);
    try {
      const fd = new FormData();
      fd.append('bbox', bbox);
      fd.append('date_start', dateStart);
      fd.append('date_end', dateEnd);
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
      // Fetch specifically for that day
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

  const eurosat = status?.datasets?.eurosat;
  const isSample = selectedImage === 'sample.svg';

  return (
    <div className="flex flex-col h-full">
      {/* Context bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-border text-xs shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span className="text-textMuted">Layer:</span>
            <span className="text-textMain">RGB</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-textMuted">Source:</span>
            <span className="text-textMain">{imageFile ? imageFile.name : (isSample ? 'sample.svg (Default)' : 'No image loaded')}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary/20 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" /> Upload Image
            <input type="file" accept="image/jpeg, image/png" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Main canvas */}
        <div className="flex-1 bg-black relative flex flex-col items-center justify-center overflow-hidden">
          
          {!eurosat?.available && !loading && (
            <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 px-3 py-2 bg-surface/90 backdrop-blur border border-warning/50 rounded shadow-lg">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <div className="text-xs">
                <span className="font-semibold text-warning block">No Dataset Installed</span>
                <span className="text-textMuted">EuroSAT is not loaded on the backend.</span>
              </div>
            </div>
          )}
          
          {imgLoading && (
            <div className="absolute inset-0 z-[2000] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm text-white">
              <Loader2 className="w-10 h-10 animate-spin mb-3" />
              <div>Retrieving True-Color Imagery from CDSE...</div>
            </div>
          )}

          <MapContainer center={[40.85, 14.45]} zoom={11} className="w-full h-full z-0" style={{ background: '#0B0F19' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {isSample ? (
              <ImageOverlay url={selectedImage} bounds={[[40.8, 14.4], [40.9, 14.5]]} />
            ) : (
              <ImageOverlay url={selectedImage} bounds={activeBounds} />
            )}
            <MapUpdater bounds={isSample ? [[40.8, 14.4], [40.9, 14.5]] : activeBounds} />
          </MapContainer>
        </div>

        {/* Right metadata panel */}
        <div className="w-64 bg-surface border-l border-border p-4 shrink-0 overflow-y-auto">
          <h3 className="text-xs font-semibold text-textMain mb-4 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-accentCyan" />
            Image Metadata
          </h3>

          <div className="space-y-4 text-xs">
            {/* Uploaded or Sample Image Info */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">Current Source</h4>
              <div className="bg-background rounded p-2.5 border border-border">
                <div className="text-textMuted mb-0.5">Filename</div>
                <div className="text-textMain truncate">{imageFile ? imageFile.name : 'sample.svg'}</div>
                
                <div className="text-textMuted mt-2 mb-0.5">Format</div>
                <div className="text-textMain uppercase">{imageFile ? imageFile.type.split('/')[1] : 'SVG Vector'}</div>
                
                {imageFile && (
                  <>
                    <div className="text-textMuted mt-2 mb-0.5">File Size</div>
                    <div className="text-textMain">{(imageFile.size / 1024).toFixed(1)} KB</div>
                  </>
                )}
              </div>
            </div>

            {/* Copernicus CDSE Panel */}
            <div className="space-y-2 mt-6">
              <h4 className="text-[10px] font-semibold text-textMuted uppercase tracking-wider flex items-center gap-1.5"><Search className="w-3 h-3" /> Copernicus Data Space</h4>
              <div className="bg-background rounded p-2.5 border border-border space-y-3">
                <div>
                  <label className="text-[10px] text-textMuted block mb-1">Bounding Box (W,S,E,N)</label>
                  <input type="text" value={bbox} onChange={e => setBbox(e.target.value)} className="w-full bg-surface border border-border rounded px-2 py-1 text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-textMuted block mb-1">Start Date</label>
                    <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="w-full bg-surface border border-border rounded px-2 py-1 text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] text-textMuted block mb-1">End Date</label>
                    <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="w-full bg-surface border border-border rounded px-2 py-1 text-xs" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-textMuted block mb-1">Max Cloud Cover (%)</label>
                  <input type="number" max="100" min="0" value={cloudCover} onChange={e => setCloudCover(Number(e.target.value))} className="w-full bg-surface border border-border rounded px-2 py-1 text-xs" />
                </div>
                <button onClick={handleSearch} disabled={searchLoading} className="w-full py-1.5 bg-accent/20 text-accent rounded text-xs font-medium hover:bg-accent/30 transition-colors flex items-center justify-center gap-1.5">
                  {searchLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />} Search Sentinel-2
                </button>
                {searchError && <div className="text-danger text-[10px] mt-1">{searchError}</div>}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                  {searchResults.map((res, idx) => (
                    <div key={idx} className="bg-background border border-border rounded p-2 text-[10px] hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleLoadImage(res.date)}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-textMain flex items-center gap-1"><Calendar className="w-3 h-3 text-primary" /> {res.date.split('T')[0]}</span>
                        <span className="text-textMuted flex items-center gap-1"><Cloud className="w-3 h-3" /> {res.cloud_cover}%</span>
                      </div>
                      <div className="text-textMuted text-[9px] mb-1.5 truncate">{res.id}</div>
                      <div className="text-primary flex items-center gap-1 font-medium"><ImageIcon className="w-3 h-3" /> Load Image</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarthExplorer;
