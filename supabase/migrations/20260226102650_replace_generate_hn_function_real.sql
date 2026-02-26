-- Create function to generate patient HN
CREATE OR REPLACE FUNCTION public.generate_hn()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  year_suffix TEXT;
  seq_num INT;
  new_hn TEXT;
BEGIN
  -- Get last 2 digits of current year
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');

  -- Find next running number for this year
  SELECT COALESCE(MAX(CAST(RIGHT(hn, 4) AS INT)), 0) + 1
  INTO seq_num
  FROM public.patients
  WHERE hn LIKE 'HN' || year_suffix || '%';

  -- Build new HN
  new_hn := 'HN' || year_suffix || LPAD(seq_num::TEXT, 4, '0');

  RETURN new_hn;
END;
$$;
