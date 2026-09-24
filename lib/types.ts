export type ReligionData = {
  religion: string;
  pratique: string;
};

export type PrefData = {
  age: string;
  sexe: string;
  religion: string;
  pratique: string;
  situation: string;
  ville: string;
};

export type FamilleData = {
  enfants: string;
  nombre: string;
  travail: string;
  demenagement: string;
  parents: string;
  importance: string;
};

export type QuizData = Record<number, number>;

export type OnboardingData = {
  religion: ReligionData;
  pref: Partial<PrefData>;
  famille: Partial<FamilleData>;
  quiz: QuizData;
};

export type FmUser = {
  id: string;
  email: string;
  firstName: string;
  age: number;
  city: string;
  country: string;
  createdAt: string;
};

export type RegisterInput = {
  firstName: string;
  age: number;
  city: string;
  country: string;
  email: string;
  password: string;
};