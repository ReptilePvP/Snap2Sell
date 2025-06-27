import { supabase } from './supabaseClient';
import { ScanHistoryItem, ApiProvider } from '../types';

export interface ScanStats {
  totalScans: number;
  savedItems: number;
  thisMonth: number;
}

export interface CreateScanData {
  title: string;
  description?: string;
  value?: string;
  aiExplanation?: string;
  imageUrl?: string;
  apiProvider: ApiProvider;
  visualMatches?: any[];
}

export const scanService = {
  // Create a new scan record
  async createScan(scanData: CreateScanData): Promise<ScanHistoryItem> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('scans')
      .insert({
        user_id: user.id,
        title: scanData.title,
        description: scanData.description,
        value: scanData.value,
        ai_explanation: scanData.aiExplanation,
        image_url: scanData.imageUrl,
        api_provider: scanData.apiProvider,
        visual_matches: scanData.visualMatches || [],
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      value: data.value || '',
      aiExplanation: data.ai_explanation || '',
      imageUrl: data.image_url,
      apiProvider: data.api_provider as ApiProvider,
      timestamp: new Date(data.created_at).getTime(),
      visualMatches: data.visual_matches,
      isFavorite: data.is_saved,
    };
  },

  // Get user's scan history
  async getScanHistory(): Promise<ScanHistoryItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(scan => ({
      id: scan.id,
      title: scan.title,
      description: scan.description || '',
      value: scan.value || '',
      aiExplanation: scan.ai_explanation || '',
      imageUrl: scan.image_url,
      apiProvider: scan.api_provider as ApiProvider,
      timestamp: new Date(scan.created_at).getTime(),
      visualMatches: scan.visual_matches,
      isFavorite: scan.is_saved,
    }));
  },

  // Get saved items
  async getSavedItems(): Promise<ScanHistoryItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('is_saved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(scan => ({
      id: scan.id,
      title: scan.title,
      description: scan.description || '',
      value: scan.value || '',
      aiExplanation: scan.ai_explanation || '',
      imageUrl: scan.image_url,
      apiProvider: scan.api_provider as ApiProvider,
      timestamp: new Date(scan.created_at).getTime(),
      visualMatches: scan.visual_matches,
      isFavorite: scan.is_saved,
    }));
  },

  // Toggle saved status
  async toggleSaved(scanId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First get current saved status
    const { data: currentScan, error: fetchError } = await supabase
      .from('scans')
      .select('is_saved')
      .eq('id', scanId)
      .single();

    if (fetchError) throw fetchError;

    // Toggle the saved status
    const { error } = await supabase
      .from('scans')
      .update({ is_saved: !currentScan.is_saved })
      .eq('id', scanId);

    if (error) throw error;
  },

  // Delete a scan
  async deleteScan(scanId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('scans')
      .delete()
      .eq('id', scanId);

    if (error) throw error;
  },

  // Get user stats
  async getUserStats(): Promise<ScanStats> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error in getUserStats:', authError);
      throw new Error('Authentication failed');
    }
    
    if (!user) {
      console.log('No user found in getUserStats');
      return {
        totalScans: 0,
        savedItems: 0,
        thisMonth: 0,
      };
    }

    try {
      // Get total scans count - let RLS handle user filtering
      const { count: totalScans, error: totalError } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        console.error('Error getting total scans:', totalError);
        throw totalError;
      }

      // Get saved items count - let RLS handle user filtering
      const { count: savedItems, error: savedError } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .eq('is_saved', true);

      if (savedError) {
        console.error('Error getting saved items:', savedError);
        throw savedError;
      }

      // Get this month's scans count - let RLS handle user filtering
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: thisMonth, error: monthError } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      if (monthError) {
        console.error('Error getting this month scans:', monthError);
        throw monthError;
      }

      return {
        totalScans: totalScans || 0,
        savedItems: savedItems || 0,
        thisMonth: thisMonth || 0,
      };
    } catch (error) {
      console.error('Database error in getUserStats:', error);
      throw error;
    }
  },
};
