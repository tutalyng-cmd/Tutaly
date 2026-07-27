import { redirect } from 'next/navigation';

export default function EmployerApplicantsRedirect() {
  redirect('/employer/jobs');
}
