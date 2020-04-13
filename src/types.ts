export type Pages = Map<string, {
  view: string,
  title: string,
  navbar: boolean,
  navbarTitle?: string,
  localized?: boolean
}>;

export type SubmissionBody = {
  name: string,
  language: string,
  lecturer_name: string,
  lecturer_display_name: string,
  topics: string,
  subjects: string,
  url: string,
  grade_level: string,
  notes: string,
  phone_number: string
};
