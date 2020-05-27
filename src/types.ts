export type PageCallback = (path: string, view: string, title: string) =>
  (req: any, res: any) => Promise<any>

// A data structure to hold information about a page of the website
export type Page = {
  view: string,
  title: string,
  navbar: boolean,
  navbarTitle?: string,
  localized?: boolean,
  callback?: PageCallback
};

// Data from the submission form
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

// Data from the submissions table in the database
export type Submission = {
  id: number,
  name: string,
  language: string,
  lecturer_name: string,
  lecturer_display_name: string,
  topics: string,
  subjects: string,
  url: string,
  grade_level: string,
  notes: string,
};
