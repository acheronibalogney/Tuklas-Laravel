import { PANGASINAN_BARANGAYS } from './pangasinanBarangays';

// PSGC-based municipality/city codes for Pangasinan (province code 015500000).
// Barangays are bundled so registration also works without an internet connection.
export const PANGASINAN_LOCATIONS = [
  ['Agno', '015501'], ['Aguilar', '015502'], ['Alaminos City', '015503'], ['Alcala', '015504'], ['Anda', '015505'], ['Asingan', '015506'], ['Balungao', '015507'], ['Bani', '015508'], ['Basista', '015509'], ['Bautista', '015510'], ['Bayambang', '015511'], ['Binalonan', '015512'], ['Binmaley', '015513'], ['Bolinao', '015514'], ['Bugallon', '015515'], ['Burgos', '015516'], ['Calasiao', '015517'], ['Dagupan City', '015518'], ['Dasol', '015519'], ['Infanta', '015520'], ['Labrador', '015521'], ['Lingayen', '015522'], ['Mabini', '015523'], ['Malasiqui', '015524'], ['Manaoag', '015525'], ['Mangaldan', '015526'], ['Mangatarem', '015527'], ['Mapandan', '015528'], ['Natividad', '015529'], ['Pozorrubio', '015530'], ['Rosales', '015531'], ['San Carlos City', '015532'], ['San Fabian', '015533'], ['San Jacinto', '015534'], ['San Manuel', '015535'], ['San Nicolas', '015536'], ['San Quintin', '015537'], ['Santa Barbara', '015538'], ['Santa Maria', '015539'], ['Santo Tomas', '015540'], ['Sison', '015541'], ['Sual', '015542'], ['Tayug', '015543'], ['Umingan', '015544'], ['Urbiztondo', '015545'], ['Urdaneta City', '015546'], ['Villasis', '015547'], ['Laoac', '015548'],
].map(([name, code]) => ({ name, code }));

export async function fetchPangasinanBarangays(municipalityCode) {
  if (!municipalityCode) return [];
  const municipality = PANGASINAN_LOCATIONS.find(item => item.code === municipalityCode);
  return municipality ? (PANGASINAN_BARANGAYS[municipality.name] || []) : [];
}
