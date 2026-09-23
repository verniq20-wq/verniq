import { ButtonLink } from '../components/ui/Button';
import { EmptyState } from '../components/ui/States';

export default function NotFound() {
  return (
    <EmptyState
      className="mt-10"
      emoji="🧭"
      title="This page isn't here"
      description="The link may be old. Everything you need is one tap away on the home screen."
      action={<ButtonLink to="/">Go to home</ButtonLink>}
    />
  );
}
