import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';


export interface CreateMedicalImageInput {
  entityType: string;
  entityId: string;
  files: File[];
  createdBy: string;
}

export interface DeleteMedicalImagesInput {
  entityType: string;
  entityId: string;
}

export const useCreateMedicalImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entityType, entityId, files }: CreateMedicalImageInput) => {
      await Promise.all(
        files.map(async (file) => {
          const filePath = `${entityType}/${entityId}/${crypto.randomUUID()}-${file.name}`;

          const { error } = await supabase.storage
            .from("medical-images")
            .upload(filePath, file);

          if (error) throw error;
        })
      )
    },

    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["medical_images", vars.entityType, vars.entityId],
      });
    },
  });
};

export const useDeleteMedicalImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entityType, entityId }: DeleteMedicalImagesInput) => {
      const folderPath = `${entityType}/${entityId}`;

      const { data, error } = await supabase.storage
        .from("medical-images")
        .list(folderPath);

      if (error) throw error;
      if (!data || data.length === 0) return;

      const filePaths = data.map(
        (file) => `${folderPath}/${file.name}`
      );

      console.log(filePaths)

      const { error: deleteError } = await supabase.storage
        .from("medical-images")
        .remove(filePaths);

      if (deleteError) throw deleteError;
    },

    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["medical_images", vars.entityType, vars.entityId],
      });
    },
  });
};