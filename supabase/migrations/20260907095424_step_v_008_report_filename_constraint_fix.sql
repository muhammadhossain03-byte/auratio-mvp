alter table public.reports drop constraint report_filename_docx;
alter table public.reports add constraint report_filename_docx check (filename ~ '^Auratio_.+_(AI|Human)_Submission-.+_v[0-9]+[.]docx$');
