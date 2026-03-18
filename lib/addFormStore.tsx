import React, { createContext, useContext, useState } from 'react';

export type AddFormState = {
  lat?: number;
  lng?: number;
  name?: string;
  category?: string;
  deity?: string;
  district?: string;
  state?: string;
  photoUris?: string[];
  description?: string;
  timings?: string;
  entryInfo?: string;
  bestTime?: string;
  editPlaceId?: string;
};

const AddFormContext = createContext<{
  form: AddFormState;
  setForm: (patch: Partial<AddFormState>) => void;
  reset: () => void;
}>({ form: {}, setForm: () => {}, reset: () => {} });

export function AddFormProvider({ children }: { children: React.ReactNode }) {
  const [form, setFormState] = useState<AddFormState>({});
  return (
    <AddFormContext.Provider
      value={{
        form,
        setForm: (patch) => setFormState((prev) => ({ ...prev, ...patch })),
        reset: () => setFormState({}),
      }}
    >
      {children}
    </AddFormContext.Provider>
  );
}

export const useAddForm = () => useContext(AddFormContext);
