import { supabase } from './supabaseClient';
import { toByteArray } from 'base64-js';
import * as FileSystem from 'expo-file-system';

const getFileExtension = (uri: string): string => {
  const match = /\.([0-9a-z]+)(?:[\?#]|$)/i.exec(uri);
  return match ? match[1] : 'jpg';
};

export const uploadImageDirectly = async (
  imageUri: string
): Promise<string> => {
  const fileExtension = getFileExtension(imageUri);
  const fileName = `${Date.now()}.${fileExtension}`;
  const contentType = `image/${fileExtension}`;

  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, toByteArray(base64), { contentType });

  if (error) {
    console.error('Supabase Upload Error:', error);
    throw new Error('Failed to upload image to Supabase Storage.');
  }

  if (!data) {
    throw new Error('Upload succeeded but no data was returned.');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);

  if (!publicUrl) {
    throw new Error('Failed to get public URL for the uploaded image.');
  }

  return publicUrl;
};
